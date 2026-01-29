const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      default: 'PRODUCT',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      trim: true,
      required: true,
    },
    adminEmail: {
      type: String,
      trim: true,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Creates createdAt and updatedAt
  }
)

// Compound indexes for common queries
activityLogSchema.index({ brand: 1, createdAt: -1 })
activityLogSchema.index({ sku: 1, createdAt: -1 })
activityLogSchema.index({ actionType: 1, createdAt: -1 })
activityLogSchema.index({ adminId: 1, createdAt: -1 })
activityLogSchema.index({ createdAt: -1 }) // Default sort

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)

module.exports = ActivityLog

