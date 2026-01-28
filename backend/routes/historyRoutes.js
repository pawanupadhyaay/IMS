const express = require("express");
const router = express.Router();
const {
  getHistory,
  getAdmins,
} = require("../controllers/historyController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.get("/", getHistory);
router.get("/admins", getAdmins);

module.exports = router;



