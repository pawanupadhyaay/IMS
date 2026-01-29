const DashboardStats = require("../models/DashboardStats");
const { Product } = require("../models/Product");

/**
 * Recompute dashboard stats from products collection and persist to DashboardStats.
 * Safe to run multiple times.
 */
async function recomputeDashboardStats() {
  // Some legacy docs may have inventory/price stored as strings.
  // Use $convert to safely coerce to numbers (onError/onNull -> 0) to avoid $multiply errors.
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
            // Business rule:
            // Total Store Value = Σ(price of in-stock products)
            // i.e. Σ(price of all) - Σ(price where inventory == 0)
            $cond: [{ $gt: [inv, 0] }, prc, 0],
          },
        },
        outOfStockCount: {
          $sum: {
            $cond: [
              { $eq: [inv, 0] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const result = stats[0] || {
    totalProducts: 0,
    totalStock: 0,
    totalStoreValue: 0,
    outOfStockCount: 0,
  };

  await DashboardStats.updateStats({
    totalProducts: result.totalProducts || 0,
    totalStock: result.totalStock || 0,
    totalStoreValue: Math.round((result.totalStoreValue || 0) * 100) / 100,
    outOfStockCount: result.outOfStockCount || 0,
  });

  return result;
}

module.exports = { recomputeDashboardStats };


