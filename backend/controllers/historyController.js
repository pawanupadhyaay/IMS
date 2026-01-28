const { History } = require("../models/History");

// @desc    Get history logs with filters and pagination
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      brand,
      action,
      adminId,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build filter
    const filter = {};

    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (action) filter.action = action;
    if (adminId) filter.adminId = adminId;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Search filter (brand or SKU)
    if (search) {
      filter.$or = [
        { brand: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get history with pagination
    const [logs, total] = await Promise.all([
      History.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      History.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unique admins list
// @route   GET /api/history/admins
// @access  Private
const getAdmins = async (req, res) => {
  try {
    const admins = await History.distinct("adminId", {});
    const adminDetails = await History.aggregate([
      { $match: { adminId: { $in: admins } } },
      {
        $group: {
          _id: "$adminId",
          name: { $first: "$adminName" },
          email: { $first: "$adminEmail" },
          lastActivity: { $max: "$timestamp" },
        },
      },
      { $sort: { lastActivity: -1 } },
    ]);

    res.json({
      success: true,
      data: adminDetails,
    });
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHistory,
  getAdmins,
};



