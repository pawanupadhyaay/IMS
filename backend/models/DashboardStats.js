const mongoose = require("mongoose");

const dashboardStatsSchema = new mongoose.Schema(
  {
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalStock: {
      type: Number,
      default: 0,
    },
    totalStoreValue: {
      type: Number,
      default: 0,
    },
    outOfStockCount: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one stats document exists
dashboardStatsSchema.statics.getStats = async function () {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({
      totalProducts: 0,
      totalStock: 0,
      totalStoreValue: 0,
      outOfStockCount: 0,
    });
  }
  return stats;
};

dashboardStatsSchema.statics.updateStats = async function (newStats) {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create(newStats);
  } else {
    Object.assign(stats, newStats);
    stats.updatedAt = new Date();
    await stats.save();
  }
  return stats;
};

const DashboardStats = mongoose.model("DashboardStats", dashboardStatsSchema);

module.exports = DashboardStats;


