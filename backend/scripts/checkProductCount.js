const mongoose = require("mongoose");
require("dotenv").config();

const checkProductCount = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const db = mongoose.connection.db;
    
    // Check products collection
    const productsCollection = db.collection("products");
    const totalCount = await productsCollection.countDocuments({});
    
    console.log("=".repeat(60));
    console.log("📊 PRODUCTS COLLECTION ANALYSIS");
    console.log("=".repeat(60));
    console.log(`\nTotal Products: ${totalCount}`);
    
    // Check with different filters
    const withBrand = await productsCollection.countDocuments({ brand: { $exists: true, $ne: "" } });
    const withSKU = await productsCollection.countDocuments({ sku: { $exists: true, $ne: "" } });
    const withPrice = await productsCollection.countDocuments({ price: { $exists: true, $gt: 0 } });
    const withInventory = await productsCollection.countDocuments({ inventory: { $exists: true } });
    
    console.log(`\nProducts with Brand: ${withBrand}`);
    console.log(`Products with SKU: ${withSKU}`);
    console.log(`Products with Price > 0: ${withPrice}`);
    console.log(`Products with Inventory field: ${withInventory}`);
    
    // Get sample products to check structure
    console.log("\n" + "=".repeat(60));
    console.log("📋 SAMPLE PRODUCTS (First 5):");
    console.log("=".repeat(60));
    
    const samples = await productsCollection.find({}).limit(5).toArray();
    samples.forEach((product, index) => {
      console.log(`\n${index + 1}. ID: ${product._id}`);
      console.log(`   Brand: ${product.brand || "N/A"}`);
      console.log(`   SKU: ${product.sku || "N/A"}`);
      console.log(`   Price: ${product.price || "N/A"}`);
      console.log(`   Inventory: ${product.inventory || "N/A"}`);
      console.log(`   Created: ${product.createdAt || "N/A"}`);
      console.log(`   Updated: ${product.updatedAt || "N/A"}`);
    });
    
    // Check for deleted products (check timestamps)
    console.log("\n" + "=".repeat(60));
    console.log("📅 RECENT ACTIVITY:");
    console.log("=".repeat(60));
    
    const recentCreated = await productsCollection
      .find({ createdAt: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    
    const recentUpdated = await productsCollection
      .find({ updatedAt: { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(1)
      .toArray();
    
    if (recentCreated.length > 0) {
      console.log(`\nMost Recent Created: ${recentCreated[0].createdAt}`);
    }
    if (recentUpdated.length > 0) {
      console.log(`Most Recent Updated: ${recentUpdated[0].updatedAt}`);
    }
    
    // Check products_unique collection too
    console.log("\n" + "=".repeat(60));
    console.log("📊 PRODUCTS_UNIQUE COLLECTION:");
    console.log("=".repeat(60));
    
    try {
      const productsUniqueCollection = db.collection("products_unique");
      const uniqueCount = await productsUniqueCollection.countDocuments({});
      console.log(`\nTotal in products_unique: ${uniqueCount}`);
      
      if (uniqueCount > totalCount) {
        console.log(`\n⚠️  products_unique has MORE products (${uniqueCount}) than products (${totalCount})`);
        console.log(`   Difference: ${uniqueCount - totalCount} products`);
      }
    } catch (err) {
      console.log("\n❌ products_unique collection not found or error:", err.message);
    }
    
    // Compare with yesterday's count (if we had it)
    console.log("\n" + "=".repeat(60));
    console.log("💡 SUMMARY:");
    console.log("=".repeat(60));
    console.log(`\nCurrent Products Count: ${totalCount}`);
    console.log(`Expected Count (yesterday): ~4800`);
    console.log(`Difference: ${4800 - totalCount} products`);
    
    if (totalCount < 4800) {
      console.log(`\n⚠️  WARNING: ${4800 - totalCount} products are missing!`);
      console.log("\nPossible reasons:");
      console.log("  1. Products were deleted");
      console.log("  2. Products were moved to another collection");
      console.log("  3. Database cleanup/migration happened");
      console.log("  4. Filter or query issue");
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkProductCount();

