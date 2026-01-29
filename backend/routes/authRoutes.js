const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Register route - can be easily commented out later
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;

