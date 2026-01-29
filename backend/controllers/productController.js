const { Product, validateProduct } = require("../models/Product");
const DashboardStats = require("../models/DashboardStats");
const { logActivity } = require("../utils/logActivity");
const { migrateLegacyImages, migrateLegacyImagesInline } = require("../utils/migrateLegacyImages");

// @desc    Get all products with filters and pagination
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      brand,
      category,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    // Use exact match for brand if possible (much faster than regex)
    if (brand) {
      // Try exact match first, fallback to case-insensitive if needed
      filter.brand = new RegExp(`^${brand}$`, "i");
    }
    if (category) {
      filter.category = new RegExp(`^${category}$`, "i");
    }
    if (search) {
      // Optimize search: use text index if available, otherwise regex
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { brand: searchRegex },
        { sku: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with projection - only fetch fields needed for list view
    // Include legacy fields for migration: imageUrl, image.url
    // This reduces payload size significantly (especially for 10k+ products)
    const projection = "brand sku category inventory price images imageUrl image.url createdAt";
    const products = await Product.find(filter)
      .select(projection)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Lazy migration: Migrate legacy images to product.images[] (non-blocking)
    // This ensures old products show images without breaking unified pipeline
    products.forEach(product => {
      // Inline migration for immediate response
      const migrated = migrateLegacyImagesInline(product)
      Object.assign(product, migrated)
      
      // Background persistence (non-blocking)
      migrateLegacyImages(product)
    })
    
    // Debug: Log to verify images are included
    if (products.length > 0) {
      console.log('GET /api/products - Sample product images:', products[0].images);
    }

    // Get total count
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res) => {
  try {
    // Include legacy fields for migration: imageUrl, image.url
    const product = await Product.findById(req.params.id)
      .select('brand sku category inventory price images imageUrl image.url description metafields createdAt updatedAt')
      .lean();
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Lazy migration: Migrate legacy images to product.images[] (non-blocking)
    // This ensures old products show images without breaking unified pipeline
    const migrated = migrateLegacyImagesInline(product)
    Object.assign(product, migrated)
    
    // Background persistence (non-blocking)
    migrateLegacyImages(product)

    // Debug: Log to verify images are included
    console.log('GET /api/products/:id - Product images:', product.images);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.create({
      ...req.body,
      user: req.user.id,
    });

    // Debug: Log to verify images are saved and returned
    console.log('POST /api/products - Created product images:', product.images);

    // Clear brands cache when new product is created
    clearBrandsCache();

    // Trigger background stats update
    updateDashboardStatsInBackground();

    // Log activity (non-blocking)
    console.log('Activity log triggered: CREATE', product.sku || 'N/A')
    logActivity({
      actionType: 'CREATE',
      brand: product.brand || '',
      sku: product.sku || '',
      productId: product._id,
      adminId: req.user.id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || '',
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product (full update)
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Clear brands cache if brand was updated
    if (req.body.brand !== undefined) {
      clearBrandsCache();
    }

    // Trigger background stats update
    updateDashboardStatsInBackground();

    // Debug: Log to verify images are updated and returned
    console.log('PUT /api/products/:id - Updated product images:', product.images);

    // Log activity (non-blocking)
    console.log('Activity log triggered: UPDATE', product.sku || 'N/A')
    logActivity({
      actionType: 'UPDATE',
      brand: product.brand || '',
      sku: product.sku || '',
      productId: product._id,
      adminId: req.user.id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || '',
    });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Partially update product (optimized for minimal payload)
// @route   PATCH /api/products/:id
// @access  Private
const patchProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate only provided fields
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Build update object with $set for partial updates
    const updateObj = {};
    const allowedFields = [
      "brand",
      "sku",
      "category",
      "inventory",
      "price",
      "description",
      "metafields",
      "images",
      "image",
    ];

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        updateObj[key] = updates[key];
      }
    }

    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Perform partial update
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateObj },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Clear brands cache if brand was updated
    if (updates.brand !== undefined) {
      clearBrandsCache();
    }

    // Trigger background stats update
    updateDashboardStatsInBackground();

    // Debug: Log to verify images are updated
    console.log('PATCH /api/products/:id - Updated images:', product.images);
    console.log('PATCH /api/products/:id - Update object:', updateObj);

    // Log activity (non-blocking)
    console.log('Activity log triggered: UPDATE', product.sku || 'N/A')
    logActivity({
      actionType: 'UPDATE',
      brand: product.brand || '',
      sku: product.sku || '',
      productId: product._id,
      adminId: req.user.id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || '',
    });

    // Return full product (not just updated fields) to ensure images are included
    res.json({ success: true, data: product });
  } catch (error) {
    // Handle duplicate SKU error
    if (error.code === 11000) {
      return res.status(400).json({ message: "SKU already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Clear brands cache when product is deleted
    clearBrandsCache();

    // Trigger background stats update
    updateDashboardStatsInBackground();

    // Log activity (non-blocking) - log before product is deleted
    console.log('Activity log triggered: DELETE', product.sku || 'N/A')
    logActivity({
      actionType: 'DELETE',
      brand: product.brand || '',
      sku: product.sku || '',
      productId: product._id,
      adminId: req.user.id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || '',
    });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Simple in-memory cache for brands (cleared on product create/update/delete)
let brandsCache = null;
let brandsCacheTime = null;
const BRANDS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// @desc    Get unique brands
// @route   GET /api/products/brands/list
// @access  Private
const getBrands = async (req, res) => {
  try {
    // Return cached brands if available and not expired
    const now = Date.now();
    if (brandsCache && brandsCacheTime && (now - brandsCacheTime) < BRANDS_CACHE_TTL) {
      return res.json({ success: true, data: brandsCache });
    }

    // Fetch brands from database (using index for faster query)
    const brands = await Product.distinct("brand", { brand: { $ne: "" } });
    const sortedBrands = brands.sort();

    // Cache the result
    brandsCache = sortedBrands;
    brandsCacheTime = now;

    res.json({ success: true, data: sortedBrands });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to clear brands cache (call after product create/update/delete)
const clearBrandsCache = () => {
  brandsCache = null;
  brandsCacheTime = null;
};

// Background function to update dashboard stats (non-blocking)
const updateDashboardStatsInBackground = async () => {
  // Run in background without blocking the response
  setImmediate(async () => {
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

      await DashboardStats.updateStats({
        totalProducts: result.totalProducts || 0,
        totalStock: result.totalStock || 0,
        totalStoreValue: Math.round((result.totalStoreValue || 0) * 100) / 100,
        outOfStockCount: result.outOfStockCount || 0,
      });
    } catch (error) {
      console.error("Background stats update failed:", error);
      // Don't throw - this is background operation
    }
  });
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
  getBrands,
};

