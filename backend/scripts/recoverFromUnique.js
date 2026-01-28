const mongoose = require("mongoose");
require("dotenv").config();

const recoverFromUnique = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const db = mongoose.connection.db;
    
    console.log("=".repeat(60));
    console.log("🔄 RECOVERING PRODUCTS FROM products_unique");
    console.log("=".repeat(60));
    
    // Get all products from products collection
    const products = await db.collection("products")
      .find({ sku: { $exists: true, $ne: "" } })
      .project({ sku: 1, _id: 1 })
      .toArray();
    
    const productsSKUSet = new Set(products.map(p => p.sku));
    console.log(`\nCurrent products count: ${products.length}`);
    console.log(`Products with SKU: ${productsSKUSet.size}`);
    
    // Get all products from products_unique
    const uniqueProducts = await db.collection("products_unique")
      .find({})
      .toArray();
    
    console.log(`products_unique count: ${uniqueProducts.length}`);
    
    // Find products in unique that are NOT in products
    const missingProducts = uniqueProducts.filter(p => 
      p.sku && !productsSKUSet.has(p.sku)
    );
    
    console.log(`\n📦 Products in products_unique but NOT in products: ${missingProducts.length}`);
    
    if (missingProducts.length === 0) {
      console.log("\n✅ No products to recover from products_unique!");
      console.log("   All products_unique products already exist in products.");
      await mongoose.connection.close();
      process.exit(0);
    }
    
    console.log("\nSample products to recover:");
    missingProducts.slice(0, 5).forEach((p, i) => {
      console.log(`   ${i + 1}. SKU: ${p.sku || "N/A"}, Brand: ${p.brand || "N/A"}`);
    });
    
    // Ask for confirmation (in real scenario)
    console.log("\n" + "=".repeat(60));
    console.log("⚠️  RECOVERY PREVIEW");
    console.log("=".repeat(60));
    console.log(`\nWill recover ${missingProducts.length} products from products_unique to products`);
    console.log("\nTo actually recover, run with --execute flag:");
    console.log("   node scripts/recoverFromUnique.js --execute");
    
    // If --execute flag is provided, actually recover
    if (process.argv.includes("--execute")) {
      console.log("\n🔄 Starting recovery...");
      
      let recovered = 0;
      let errors = 0;
      
      for (const product of missingProducts) {
        try {
          // Remove _id to create new document
          const { _id, ...productData } = product;
          
          // Insert into products collection
          await db.collection("products").insertOne(productData);
          recovered++;
          
          if (recovered % 100 === 0) {
            console.log(`   Recovered ${recovered}/${missingProducts.length}...`);
          }
        } catch (err) {
          errors++;
          if (errors <= 5) {
            console.log(`   Error recovering SKU ${product.sku}: ${err.message}`);
          }
        }
      }
      
      console.log("\n" + "=".repeat(60));
      console.log("✅ RECOVERY COMPLETE!");
      console.log("=".repeat(60));
      console.log(`\nRecovered: ${recovered} products`);
      console.log(`Errors: ${errors} products`);
      
      // Verify new count
      const newCount = await db.collection("products").countDocuments({});
      console.log(`\nNew products count: ${newCount}`);
      console.log(`Previous count: ${products.length}`);
      console.log(`Increase: ${newCount - products.length}`);
    } else {
      console.log("\n💡 This is a DRY RUN. No products were actually recovered.");
      console.log("   Add --execute flag to perform the recovery.");
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

recoverFromUnique();

