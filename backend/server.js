const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const DashboardStats = require("./models/DashboardStats");
const { Product } = require("./models/Product");
const { recomputeDashboardStats } = require("./utils/recomputeDashboardStats");

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// Middleware
// Allow multiple origins (development and production)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://inventory.samaywatch.in",
].filter(Boolean) // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all origins for now (can be restricted later)
    }
  },
  credentials: true,
}));

// Enable response compression for faster API responses
const compression = require("compression");
app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api/activity-logs", require("./routes/activityLogRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Test database connection (for debugging)
const testController = require("./controllers/testController");
app.get("/api/test/db", testController.testDatabase);
app.get("/api/test/databases", testController.listDatabases);

// Error handler
app.use(errorHandler);

async function startServer() {
  // Connect to database first (so bootstrap queries are safe)
  await connectDB();

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);

    // One-time bootstrap (non-blocking):
    // If stats doc is default zeros but products exist, recompute in background.
    setImmediate(async () => {
      try {
        const stats = await DashboardStats.getStats();
        const isAllZero =
          (stats.totalProducts || 0) === 0 &&
          (stats.totalStock || 0) === 0 &&
          (stats.totalStoreValue || 0) === 0 &&
          (stats.outOfStockCount || 0) === 0;

        if (!isAllZero) return;

        const productsCount = await Product.estimatedDocumentCount();
        if (productsCount === 0) return;

        console.log("🔄 Bootstrapping dashboard stats from existing products...");
        await recomputeDashboardStats();
        console.log("✅ Dashboard stats bootstrapped.");
      } catch (e) {
        console.error("❌ Dashboard stats bootstrap failed:", e);
      }
    });
  });
}

startServer().catch((e) => {
  console.error("❌ Failed to start server:", e);
  process.exit(1);
});

