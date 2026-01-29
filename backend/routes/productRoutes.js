const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
  getBrands,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.get("/brands/list", getBrands);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.patch("/:id", patchProduct); // Optimized partial update endpoint
router.delete("/:id", deleteProduct);

module.exports = router;

