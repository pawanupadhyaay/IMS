const { Product } = require("../models/Product");
const mongoose = require("mongoose");

// @desc    Test database connection and products
// @route   GET /api/test/db
// @access  Public (for testing only)
const testDatabase = async (req, res) => {
  try {
    // Check MongoDB connection
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    // Get database name
    const dbName = mongoose.connection.name;
    const dbHost = mongoose.connection.host;

    // Count products
    const productCount = await Product.countDocuments({});
    
    // Get sample products
    const sampleProducts = await Product.find({}).limit(5).lean();

    // Get collection name
    const collectionName = Product.collection.name;

    // List all collections in current database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Try to find products in other collections
    const allCollectionsData = [];
    for (const collName of collectionNames) {
      try {
        const count = await db.collection(collName).countDocuments({});
        if (count > 0) {
          const sample = await db.collection(collName).find({}).limit(1).toArray();
          allCollectionsData.push({
            name: collName,
            count: count,
            sample: sample[0] || null,
          });
        }
      } catch (err) {
        // Skip if can't read collection
      }
    }

    res.json({
      success: true,
      data: {
        connectionState: connectionStates[connectionState],
        connectionStateCode: connectionState,
        databaseName: dbName,
        databaseHost: dbHost,
        collectionName: collectionName,
        totalProducts: productCount,
        sampleProducts: sampleProducts,
        message: connectionState === 1 
          ? "Database connected successfully" 
          : "Database not connected",
        allCollections: collectionNames,
        collectionsWithData: allCollectionsData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    List all databases
// @route   GET /api/test/databases
// @access  Public (for testing only)
const listDatabases = async (req, res) => {
  try {
    const adminDb = mongoose.connection.db.admin();
    const { databases } = await adminDb.listDatabases();
    
    const dbInfo = [];
    for (const db of databases) {
      try {
        const tempConnection = mongoose.createConnection(
          process.env.MONGODB_URI.replace(/\/[^\/]+(\?|$)/, `/${db.name}$1`)
        );
        const collections = await tempConnection.db.listCollections().toArray();
        
        const collectionsWithCount = [];
        for (const coll of collections) {
          try {
            const count = await tempConnection.db.collection(coll.name).countDocuments({});
            if (count > 0) {
              const sample = await tempConnection.db.collection(coll.name).find({}).limit(1).toArray();
              collectionsWithCount.push({
                name: coll.name,
                count: count,
                hasSample: sample.length > 0,
              });
            }
          } catch (err) {
            // Skip
          }
        }
        
        await tempConnection.close();
        
        dbInfo.push({
          name: db.name,
          size: db.sizeOnDisk,
          collections: collections.map(c => c.name),
          collectionsWithData: collectionsWithCount,
        });
      } catch (err) {
        dbInfo.push({
          name: db.name,
          size: db.sizeOnDisk,
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        databases: dbInfo,
        currentDatabase: mongoose.connection.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  testDatabase,
  listDatabases,
};
