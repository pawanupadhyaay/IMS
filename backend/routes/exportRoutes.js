const express = require("express");
const router = express.Router();
const { exportToCSV } = require("../controllers/exportController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/csv", exportToCSV);

module.exports = router;

