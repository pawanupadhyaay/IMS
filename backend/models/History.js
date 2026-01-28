const mongoose = require("mongoose");

// History/Audit Log Schema
const historySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    brand: {
      type: String,
      default: "",
      index: true,
    },
    sku: {
      type: String,
      default: "",
      index: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
historySchema.index({ timestamp: -1 });
historySchema.index({ adminId: 1, timestamp: -1 });
historySchema.index({ brand: 1, timestamp: -1 });
historySchema.index({ action: 1, timestamp: -1 });

const History = mongoose.model("History", historySchema);

module.exports = { History };



