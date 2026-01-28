const { Product, validateProduct } = require("../models/Product");
const { logHistory } = require("../utils/historyLogger");
const upload = require("../config/multer");

// @desc    Upload product images
// @route   POST /api/products/upload-images
// @access  Private
const uploadImages = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Files in request:', req.files ? req.files.length : 0);

    if (!req.files || req.files.length === 0) {
      console.log('No files found in request');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Performance optimization: Process files efficiently
    const uploadedImages = req.files.map(file => {
      // Log file sizes for monitoring
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`Uploaded: ${file.originalname} (${fileSizeMB}MB) -> ${file.filename}`);

      return {
        url: `http://localhost:5000/uploads/${file.filename}`,
        altText: file.originalname,
        filename: file.filename,
      };
    });

    console.log('Upload successful, returning:', uploadedImages.length, 'images');

    res.json({
      success: true,
      data: uploadedImages,
      message: `${req.files.length} image(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

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
    
    // Search has priority - if search is provided, use it instead of individual filters
    if (search && search.trim()) {
      const searchTerm = search.trim();
      filter.$or = [
        { brand: { $regex: searchTerm, $options: "i" } },
        { sku: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    } else {
      // Apply individual filters only if search is not provided
      if (brand && brand.trim()) {
        filter.brand = { $regex: brand.trim(), $options: "i" };
      }
      if (category && category.trim()) {
        filter.category = { $regex: category.trim(), $options: "i" };
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products
    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
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
    console.log('Create product request:', req.body);

    const productData = req.body;

    // Validate product data
    const { error } = validateProduct(productData);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.create({
      ...productData,
      user: req.user.id,
    });

    // Log history (non-blocking)
    logHistory(req, "CREATE", product);

    console.log('Product created successfully:', product._id);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    console.log('Update product request:', req.params.id, req.body);

    const productData = req.body;

    // Validate product data
    const { error } = validateProduct(productData);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    // Get old product for comparison
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      {
        new: true,
        runValidators: true,
      }
    );

    // Track changes
    const changes = {};
    if (oldProduct.brand !== product.brand) changes.brand = { from: oldProduct.brand, to: product.brand };
    if (oldProduct.sku !== product.sku) changes.sku = { from: oldProduct.sku, to: product.sku };
    if (oldProduct.inventory !== product.inventory) changes.inventory = { from: oldProduct.inventory, to: product.inventory };
    if (oldProduct.price !== product.price) changes.price = { from: oldProduct.price, to: product.price };

    // Log history (non-blocking)
    logHistory(req, "UPDATE", product, changes);

    console.log('Product updated successfully:', product._id);
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Log history before deletion (non-blocking)
    logHistory(req, "DELETE", product);

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unique brands
// @route   GET /api/products/brands/list
// @access  Private
const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand", { brand: { $ne: "" } });
    res.json({ success: true, data: brands.sort() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  uploadImages,
};

