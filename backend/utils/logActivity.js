const ActivityLog = require('../models/ActivityLog')

/**
 * Log activity asynchronously (non-blocking)
 * @param {Object} params - Activity log parameters
 * @param {string} params.actionType - CREATE | UPDATE | DELETE
 * @param {string} params.brand - Product brand
 * @param {string} params.sku - Product SKU
 * @param {string} params.productId - Product ID
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.adminName - Admin name
 * @param {string} params.adminEmail - Admin email
 * @param {Object} params.metadata - Optional metadata
 */
const logActivity = (params) => {
  // Debug log
  console.log('Activity log triggered:', params.actionType, params.sku || 'N/A')
  
  // Validate required params
  if (!params.actionType || !params.productId || !params.adminId) {
    console.error('Activity log missing required params:', {
      actionType: params.actionType,
      productId: params.productId,
      adminId: params.adminId,
    })
    return
  }
  
  // Run in background without blocking the response
  setImmediate(() => {
    // Use IIFE to properly handle async
    ;(async () => {
      try {
        const logData = {
          actionType: params.actionType,
          entityType: 'PRODUCT',
          brand: params.brand || '',
          sku: params.sku || '',
          productId: params.productId,
          adminId: params.adminId,
          adminName: params.adminName || 'Unknown',
          adminEmail: params.adminEmail || '',
          metadata: params.metadata || {},
        }
        
        console.log('Creating activity log:', logData.actionType, logData.sku, logData.productId)
        
        const log = await ActivityLog.create(logData)
        console.log('Activity log created successfully:', log._id, log.actionType, log.sku)
      } catch (error) {
        console.error('Error logging activity:', error.message)
        console.error('Error stack:', error.stack)
        console.error('Error details:', {
          actionType: params.actionType,
          sku: params.sku,
          productId: params.productId,
          adminId: params.adminId,
          error: error.message,
        })
        // Don't throw - this is background operation
      }
    })()
  })
}

module.exports = { logActivity }

