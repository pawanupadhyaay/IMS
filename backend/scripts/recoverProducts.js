const mongoose = require("mongoose");
require("dotenv").config();

const checkForRecovery = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    const db = mongoose.connection.db;
    const adminDb = db.admin();
    
    console.log("=".repeat(60));
    console.log("🔍 RECOVERY INVESTIGATION");
    console.log("=".repeat(60));
    
    // Check if oplog is available (for recovery)
    console.log("\n1. Checking Oplog (Operation Log)...");
    try {
      const oplogDb = mongoose.connection.client.db("local");
      const oplogCollection = oplogDb.collection("oplog.rs");
      const oplogCount = await oplogCollection.countDocuments({});
      
      if (oplogCount > 0) {
        console.log(`   ✅ Oplog available! (${oplogCount} operations logged)`);
        
        // Check recent delete operations
        const recentDeletes = await oplogCollection
          .find({ 
            op: "d", // delete operation
            ns: { $regex: /products/ }
          })
          .sort({ ts: -1 })
          .limit(10)
          .toArray();
        
        if (recentDeletes.length > 0) {
          console.log(`   ⚠️  Found ${recentDeletes.length} recent delete operations on products!`);
          console.log("\n   Recent deletes:");
          recentDeletes.forEach((op, i) => {
            console.log(`   ${i + 1}. Timestamp: ${op.ts}`);
            console.log(`      Collection: ${op.ns}`);
            console.log(`      Deleted ID: ${op.o._id || "N/A"}`);
          });
        } else {
          console.log("   ℹ️  No recent delete operations found in oplog");
        }
      } else {
        console.log("   ❌ Oplog not available or empty");
      }
    } catch (err) {
      console.log("   ⚠️  Could not access oplog:", err.message);
    }
    
    // Check for backups or snapshots
    console.log("\n2. Checking for backups...");
    try {
      const { databases } = await adminDb.listDatabases();
      const backupDbs = databases.filter(d => 
        d.name.toLowerCase().includes("backup") ||
        d.name.toLowerCase().includes("archive") ||
        d.name.toLowerCase().includes("snapshot")
      );
      
      if (backupDbs.length > 0) {
        console.log(`   ✅ Found ${backupDbs.length} potential backup database(s):`);
        backupDbs.forEach(db => {
          console.log(`      - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });
      } else {
        console.log("   ❌ No backup databases found");
      }
    } catch (err) {
      console.log("   ⚠️  Could not check backups:", err.message);
    }
    
    // Check products_unique for missing products
    console.log("\n3. Checking products_unique for recovery...");
    const productsCount = await db.collection("products").countDocuments({});
    const productsUniqueCount = await db.collection("products_unique").countDocuments({});
    
    console.log(`   products: ${productsCount}`);
    console.log(`   products_unique: ${productsUniqueCount}`);
    
    if (productsUniqueCount > productsCount) {
      const diff = productsUniqueCount - productsCount;
      console.log(`   ✅ products_unique has ${diff} MORE products!`);
      console.log(`   💡 We can recover ${diff} products from products_unique`);
      
      // Check which products are in unique but not in products
      const productsSKUs = await db.collection("products")
        .find({ sku: { $exists: true, $ne: "" } })
        .project({ sku: 1, _id: 1 })
        .toArray();
      
      const uniqueProducts = await db.collection("products_unique")
        .find({})
        .toArray();
      
      const productsSKUSet = new Set(productsSKUs.map(p => p.sku));
      const missingProducts = uniqueProducts.filter(p => 
        p.sku && !productsSKUSet.has(p.sku)
      );
      
      console.log(`   📦 Found ${missingProducts.length} products in products_unique that are NOT in products`);
      
      if (missingProducts.length > 0) {
        console.log("\n   Sample missing products:");
        missingProducts.slice(0, 5).forEach((p, i) => {
          console.log(`   ${i + 1}. SKU: ${p.sku || "N/A"}, Brand: ${p.brand || "N/A"}`);
        });
      }
    }
    
    // Check for any other collections with product data
    console.log("\n4. Checking other collections...");
    const allCollections = await db.listCollections().toArray();
    const productLikeCollections = allCollections.filter(c => {
      const name = c.name.toLowerCase();
      return (name.includes("product") || name.includes("watch") || name.includes("item")) &&
             c.name !== "products" && 
             c.name !== "products_unique";
    });
    
    if (productLikeCollections.length > 0) {
      console.log(`   Found ${productLikeCollections.length} other product-like collections:`);
      for (const coll of productLikeCollections) {
        const count = await db.collection(coll.name).countDocuments({});
        console.log(`      - ${coll.name}: ${count} documents`);
      }
    } else {
      console.log("   No other product collections found");
    }
    
    // Final recovery recommendations
    console.log("\n" + "=".repeat(60));
    console.log("💡 RECOVERY OPTIONS:");
    console.log("=".repeat(60));
    
    console.log("\n1. From products_unique:");
    console.log("   - If products_unique has more products, we can copy them back");
    
    console.log("\n2. From MongoDB Oplog:");
    console.log("   - If oplog is available, we can recover deleted documents");
    console.log("   - This requires MongoDB replica set");
    
    console.log("\n3. From Backup:");
    console.log("   - If you have MongoDB backups, restore from there");
    console.log("   - Check your backup schedule and latest backup");
    
    console.log("\n4. From Application Logs:");
    console.log("   - Check if your application logs show what was deleted");
    console.log("   - Check MongoDB logs for delete operations");
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkForRecovery();

