const mongoose = require("mongoose");
require("dotenv").config();

const compareCollections = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const db = mongoose.connection.db;
    
    console.log("=".repeat(60));
    console.log("📊 COMPARING ALL PRODUCT COLLECTIONS");
    console.log("=".repeat(60));
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const productCollections = collections.filter(c => 
      c.name.toLowerCase().includes("product") || 
      c.name.toLowerCase().includes("watch") ||
      c.name.toLowerCase().includes("item")
    );
    
    console.log("\nFound product-related collections:\n");
    
    const results = [];
    
    for (const coll of productCollections) {
      const count = await db.collection(coll.name).countDocuments({});
      const sample = await db.collection(coll.name).find({}).limit(1).toArray();
      
      results.push({
        name: coll.name,
        count: count,
        hasSample: sample.length > 0,
        sample: sample[0] || null,
      });
      
      console.log(`📦 ${coll.name}: ${count} documents`);
    }
    
    // Also check if there are any backup or archive collections
    console.log("\n" + "=".repeat(60));
    console.log("🔍 CHECKING FOR BACKUP/ARCHIVE COLLECTIONS:");
    console.log("=".repeat(60));
    
    const allCollections = await db.listCollections().toArray();
    const backupCollections = allCollections.filter(c => 
      c.name.toLowerCase().includes("backup") ||
      c.name.toLowerCase().includes("archive") ||
      c.name.toLowerCase().includes("old") ||
      c.name.toLowerCase().includes("deleted") ||
      c.name.toLowerCase().includes("temp")
    );
    
    if (backupCollections.length > 0) {
      console.log("\nFound potential backup collections:\n");
      for (const coll of backupCollections) {
        const count = await db.collection(coll.name).countDocuments({});
        console.log(`📦 ${coll.name}: ${count} documents`);
      }
    } else {
      console.log("\nNo backup/archive collections found.");
    }
    
    // Check products_unique vs products
    console.log("\n" + "=".repeat(60));
    console.log("📊 DETAILED COMPARISON:");
    console.log("=".repeat(60));
    
    const productsCount = await db.collection("products").countDocuments({});
    const productsUniqueCount = await db.collection("products_unique").countDocuments({});
    
    console.log(`\nproducts collection: ${productsCount}`);
    console.log(`products_unique collection: ${productsUniqueCount}`);
    console.log(`Difference: ${Math.abs(productsCount - productsUniqueCount)}`);
    
    if (productsCount !== productsUniqueCount) {
      console.log("\n⚠️  Collections have different counts!");
      
      // Check if products_unique has products that products doesn't
      const productsSKUs = await db.collection("products")
        .find({ sku: { $exists: true, $ne: "" } })
        .project({ sku: 1 })
        .toArray();
      
      const uniqueSKUs = await db.collection("products_unique")
        .find({ sku: { $exists: true, $ne: "" } })
        .project({ sku: 1 })
        .toArray();
      
      const productsSKUSet = new Set(productsSKUs.map(p => p.sku));
      const uniqueSKUSet = new Set(uniqueSKUs.map(p => p.sku));
      
      const inUniqueNotInProducts = uniqueSKUs.filter(p => !productsSKUSet.has(p.sku));
      const inProductsNotInUnique = productsSKUs.filter(p => !uniqueSKUSet.has(p.sku));
      
      console.log(`\nSKUs in products_unique but NOT in products: ${inUniqueNotInProducts.length}`);
      console.log(`SKUs in products but NOT in products_unique: ${inProductsNotInUnique.length}`);
      
      if (inUniqueNotInProducts.length > 0) {
        console.log("\n💡 Some products might be in products_unique but not in products!");
        console.log("   Sample SKUs:", inUniqueNotInProducts.slice(0, 5).map(p => p.sku).join(", "));
      }
    }
    
    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("💡 SUMMARY:");
    console.log("=".repeat(60));
    console.log(`\nCurrent products count: ${productsCount}`);
    console.log(`Expected count (yesterday): ~4800`);
    console.log(`Missing: ~${4800 - productsCount} products`);
    
    if (productsCount < 4800) {
      console.log("\n🔍 Investigation needed:");
      console.log("   1. Check if products were deleted from database");
      console.log("   2. Check if products moved to products_unique");
      console.log("   3. Check MongoDB logs for deletion operations");
      console.log("   4. Check if there's a backup/archive collection");
      console.log("   5. Verify if you were looking at a different database yesterday");
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

compareCollections();

