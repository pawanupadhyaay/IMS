const { History } = require("../models/History");

// Lightweight async logging - doesn't block main operations
const logHistory = async (req, action, productData, changes = {}) => {
  try {
    // Don't await - fire and forget for performance
    History.create({
      adminId: req.user.id || req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action,
      productId: productData?._id || productData?.id,
      brand: productData?.brand || "",
      sku: productData?.sku || "",
      changes,
      timestamp: new Date(),
    }).catch((err) => {
      // Silent fail - don't break main functionality
      console.error("History logging error:", err.message);
    });
  } catch (error) {
    // Silent fail - don't break main functionality
    console.error("History logging error:", error.message);
  }
};

module.exports = { logHistory };



