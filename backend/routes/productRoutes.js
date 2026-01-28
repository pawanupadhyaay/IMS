const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  uploadImages,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const upload = require("../config/multer");

// All routes are protected
router.use(protect);

router.get("/brands/list", getBrands);
router.get("/", getProducts);
router.get("/:id", getProduct);

// Image upload route
router.post("/upload-images", upload.array('images', 10), uploadImages);

// Product CRUD routes (images are uploaded separately)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;

