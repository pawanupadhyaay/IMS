const { Product } = require("../models/Product");

// @desc    Export products to CSV
// @route   GET /api/export/csv
// @access  Private
const exportToCSV = async (req, res) => {
  try {
    const { brand, category, search } = req.query;

    // Build filter
    const filter = {};
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (category) filter.category = { $regex: category, $options: "i" };
    if (search) {
      filter.$or = [
        { brand: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).lean();

    // Generate CSV headers
    const headers = [
      "Brand",
      "SKU",
      "Category",
      "Inventory",
      "Price",
      "Total Value",
      "Description",
    ];

    // Generate CSV rows
    const rows = products.map((product) => {
      const totalValue = (product.inventory || 0) * (product.price || 0);
      return [
        product.brand || "",
        product.sku || "",
        product.category || "",
        product.inventory || 0,
        product.price || 0,
        totalValue,
        (product.description || "").replace(/"/g, '""'), // Escape quotes
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Set response headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="inventory-export-${Date.now()}.csv"`
    );

    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportToCSV,
};

