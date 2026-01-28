const { Product } = require("../models/Product");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Use aggregation to avoid reading all products into Node (big perf win).
    const [agg] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: { $ifNull: ["$inventory", 0] } },
          outOfStockCount: {
            $sum: {
              $cond: [{ $eq: [{ $ifNull: ["$inventory", 0] }, 0] }, 1, 0],
            },
          },
          // Sum of prices ONLY for products that are NOT out of stock and have valid numeric price >= 0
          sumOfPricesWithStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [{ $ifNull: ["$inventory", 0] }, 0] },
                    { $gte: ["$price", 0] },
                    { $ne: ["$price", null] },
                  ],
                },
                "$price",
                0,
              ],
            },
          },
        },
      },
    ]);

    const totalProducts = agg?.totalProducts || 0;
    const totalStock = agg?.totalStock || 0;
    const outOfStockCount = agg?.outOfStockCount || 0;
    const sumOfPricesWithStock = agg?.sumOfPricesWithStock || 0;

    // Formula: total no. of watches in IMS * sum of prices of watches excluding out-of-stock items
    const totalStoreValue = totalStock * sumOfPricesWithStock;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStock,
        totalStoreValue: Math.round(totalStoreValue * 100) / 100,
        outOfStockCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};

