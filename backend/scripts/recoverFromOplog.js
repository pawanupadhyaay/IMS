const mongoose = require("mongoose");
require("dotenv").config();

const recoverFromOplog = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    console.log("=".repeat(60));
    console.log("🔄 RECOVERING DELETED PRODUCTS FROM OPLOG");
    console.log("=".repeat(60));
    
    try {
      const localDb = mongoose.connection.client.db("local");
      const oplogCollection = localDb.collection("oplog.rs");
      const productsCollection = mongoose.connection.db.collection("products");
      
      // Get all delete operations
      const deleteOps = await oplogCollection
        .find({ 
          op: "d",
          ns: "test.products"
        })
        .sort({ ts: -1 })
        .toArray();
      
      console.log(`\nFound ${deleteOps.length} delete operations in oplog`);
      
      if (deleteOps.length === 0) {
        console.log("\n✅ No delete operations found. Nothing to recover.");
        await mongoose.connection.close();
        process.exit(0);
      }
      
      // For each delete, we need to find the insert operation before it
      console.log("\n🔍 Finding products to recover...");
      
      let recoverable = 0;
      let recovered = 0;
      let errors = 0;
      const recoveredIds = [];
      
      for (const deleteOp of deleteOps) {
        try {
          const deletedId = deleteOp.o._id || deleteOp.o;
          
          // Find the insert operation for this ID (before the delete)
          const insertOp = await oplogCollection
            .findOne({
              op: "i",
              ns: "test.products",
              "o._id": deletedId,
              ts: { $lt: deleteOp.ts } // Insert happened before delete
            });
          
          if (insertOp && insertOp.o) {
            recoverable++;
            
            // Check if product already exists
            const exists = await productsCollection.findOne({ _id: deletedId });
            
            if (!exists) {
              // Recover the product
              if (process.argv.includes("--execute")) {
                try {
                  await productsCollection.insertOne(insertOp.o);
                  recovered++;
                  recoveredIds.push(deletedId);
                  
                  if (recovered % 10 === 0) {
                    console.log(`   Recovered ${recovered}/${recoverable}...`);
                  }
                } catch (err) {
                  errors++;
                  if (errors <= 5) {
                    console.log(`   Error recovering ${deletedId}: ${err.message}`);
                  }
                }
              } else {
                recoverable++;
              }
            }
          }
        } catch (err) {
          errors++;
        }
      }
      
      if (!process.argv.includes("--execute")) {
        console.log("\n" + "=".repeat(60));
        console.log("📊 RECOVERY PREVIEW");
        console.log("=".repeat(60));
        console.log(`\nProducts that can be recovered: ${recoverable}`);
        console.log(`\n⚠️  This is a DRY RUN. No products were actually recovered.`);
        console.log("\nTo actually recover, run:");
        console.log("   node scripts/recoverFromOplog.js --execute");
      } else {
        console.log("\n" + "=".repeat(60));
        console.log("✅ RECOVERY COMPLETE!");
        console.log("=".repeat(60));
        console.log(`\nRecovered: ${recovered} products`);
        console.log(`Errors: ${errors}`);
        
        // Verify new count
        const newCount = await productsCollection.countDocuments({});
        console.log(`\nNew products count: ${newCount}`);
      }
      
    } catch (err) {
      console.log("❌ Error:", err.message);
      console.log("\n💡 Oplog recovery might not be possible.");
      console.log("   Try checking MongoDB backups or products_unique collection.");
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

recoverFromOplog();

