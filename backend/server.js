const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));

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

// Start server
const PORT = process.env.PORT || 5000;

// Start server even if MongoDB connection fails (for development)
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}/api`);
  console.log(`\n⚠️  Make sure MongoDB is running and MONGODB_URI is set in .env`);
});

// Handle port already in use error gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.log(`\n💡 Solutions:`);
    console.log(`   1. Kill the process using port ${PORT}:`);
    console.log(`      Windows: netstat -ano | findstr :${PORT}`);
    console.log(`      Then: taskkill /PID <PID> /F`);
    console.log(`   2. Or change PORT in .env file to a different port`);
    console.log(`\n🔄 Trying to find and kill the process...`);
    
    // Try to find and suggest killing the process
    const { exec } = require('child_process');
    exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
      if (stdout) {
        const lines = stdout.trim().split('\n');
        const pids = new Set();
        lines.forEach(line => {
          const match = line.match(/\s+(\d+)\s*$/);
          if (match) pids.add(match[1]);
        });
        if (pids.size > 0) {
          console.log(`\n📋 Found processes using port ${PORT}:`);
          Array.from(pids).forEach(pid => {
            console.log(`   PID: ${pid}`);
            console.log(`   Kill command: taskkill /PID ${pid} /F`);
          });
        }
      }
    });
  } else {
    console.error(`\n❌ Server error:`, err);
  }
});

