const ActivityLog = require('../models/ActivityLog')

// @desc    Create activity log (internal use - called by product controllers)
// @route   POST /api/activity-logs
// @access  Private
const createActivityLog = async (req, res) => {
  try {
    const {
      actionType,
      entityType = 'PRODUCT',
      brand,
      sku,
      productId,
      adminId,
      adminName,
      adminEmail,
      metadata = {},
    } = req.body

    // Validate required fields
    if (!actionType || !productId || !adminId || !adminName || !adminEmail) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const log = await ActivityLog.create({
      actionType,
      entityType,
      brand: brand || '',
      sku: sku || '',
      productId,
      adminId,
      adminName,
      adminEmail,
      metadata,
    })

    res.status(201).json({ success: true, data: log })
  } catch (error) {
    console.error('Error creating activity log:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get activity logs with filters and pagination
// @route   GET /api/activity-logs
// @access  Private
const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      brand,
      sku,
      actionType,
      adminId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query

    // Build filter
    const filter = {}

    if (brand) {
      filter.brand = new RegExp(`^${brand}$`, 'i')
    }

    if (sku) {
      filter.sku = new RegExp(`^${sku}$`, 'i')
    }

    if (actionType) {
      filter.actionType = actionType
    }

    if (adminId) {
      filter.adminId = adminId
    }

    // Search across brand and SKU
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      filter.$or = [
        { brand: searchRegex },
        { sku: searchRegex },
      ]
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Get logs with projection (only needed fields)
    const projection = 'actionType entityType brand sku productId adminId adminName adminEmail createdAt'
    const logs = await ActivityLog.find(filter)
      .select(projection)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    // Get total count
    const total = await ActivityLog.countDocuments(filter)

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get unique admins for filter dropdown
// @route   GET /api/activity-logs/admins
// @access  Private
const getAdmins = async (req, res) => {
  try {
    const admins = await ActivityLog.distinct('adminId', {})
    const adminDetails = await ActivityLog.find({ adminId: { $in: admins } })
      .select('adminId adminName adminEmail')
      .lean()

    // Get unique admin details
    const uniqueAdmins = []
    const seen = new Set()
    adminDetails.forEach((log) => {
      if (!seen.has(log.adminId.toString())) {
        seen.add(log.adminId.toString())
        uniqueAdmins.push({
          _id: log.adminId,
          name: log.adminName,
          email: log.adminEmail,
        })
      }
    })

    res.json({ success: true, data: uniqueAdmins })
  } catch (error) {
    console.error('Error fetching admins:', error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createActivityLog,
  getActivityLogs,
  getAdmins,
}

