const DashboardStats = require("../models/DashboardStats");
const { Product } = require("../models/Product");
const { recomputeDashboardStats } = require("../utils/recomputeDashboardStats");

// @desc    Get dashboard statistics (from precomputed stats - ultra fast)
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Use precomputed stats for instant response (no aggregation needed)
    // Stats are updated in background on product create/update/delete
    let stats = await DashboardStats.getStats();

    // Bootstrap/auto-heal: if stats are still default zeros but products exist,
    // recompute once and persist. This fixes the "existing data but stats=0" case.
    const isAllZero =
      (stats.totalProducts || 0) === 0 &&
      (stats.totalStock || 0) === 0 &&
      (stats.totalStoreValue || 0) === 0 &&
      (stats.outOfStockCount || 0) === 0;

    if (isAllZero) {
      const productsCount = await Product.estimatedDocumentCount();
      if (productsCount > 0) {
        // Recompute once and return exact values (still not "heavy" after this one-time bootstrap)
        const recomputed = await recomputeDashboardStats();
        return res.json({
          success: true,
          data: {
            totalProducts: recomputed.totalProducts || 0,
            totalStock: recomputed.totalStock || 0,
            totalStoreValue: Math.round((recomputed.totalStoreValue || 0) * 100) / 100,
            outOfStockCount: recomputed.outOfStockCount || 0,
          },
        });
      }
    }

    res.json({
      success: true,
      data: {
        totalProducts: stats.totalProducts || 0,
        totalStock: stats.totalStock || 0,
        totalStoreValue: stats.totalStoreValue || 0,
        outOfStockCount: stats.outOfStockCount || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    
    // Fallback to aggregation if precomputed stats fail
    try {
      const inv = {
        $convert: { input: "$inventory", to: "double", onError: 0, onNull: 0 },
      };
      const prc = {
        $convert: { input: "$price", to: "double", onError: 0, onNull: 0 },
      };

      const stats = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: inv },
            totalStoreValue: {
              $sum: {
                $multiply: [
                  // Business rule: Σ(price of in-stock products)
                  { $cond: [{ $gt: [inv, 0] }, prc, 0] },
                  1
                ]
              }
            },
            outOfStockCount: {
              $sum: {
                $cond: [
                  { $eq: [inv, 0] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalProducts: 0,
        totalStock: 0,
        totalStoreValue: 0,
        outOfStockCount: 0
      };

      res.json({
        success: true,
        data: {
          totalProducts: result.totalProducts || 0,
          totalStock: result.totalStock || 0,
          totalStoreValue: Math.round((result.totalStoreValue || 0) * 100) / 100,
          outOfStockCount: result.outOfStockCount || 0,
        },
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: "Failed to load dashboard stats",
        error: process.env.NODE_ENV === "development" ? fallbackError.message : undefined,
      });
    }
  }
};

// @desc    Recompute dashboard stats (admin/debug utility)
// @route   POST /api/dashboard/stats/recompute
// @access  Private
const recomputeStats = async (req, res) => {
  try {
    const result = await recomputeDashboardStats();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Recompute Stats Error:", error);
    res.status(500).json({ success: false, message: "Failed to recompute stats", error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  recomputeStats,
};

