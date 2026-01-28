const mongoose = require("mongoose");
require("dotenv").config();

const checkOplog = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    console.log("=".repeat(60));
    console.log("🔍 CHECKING OPLOG FOR DELETE OPERATIONS");
    console.log("=".repeat(60));
    
    try {
      // Access local database for oplog
      const localDb = mongoose.connection.client.db("local");
      const oplogCollection = localDb.collection("oplog.rs");
      
      const totalOps = await oplogCollection.countDocuments({});
      console.log(`\nTotal operations in oplog: ${totalOps}`);
      
      // Check for delete operations on products collection
      const deleteOps = await oplogCollection
        .find({ 
          op: "d", // delete operation
          ns: "test.products" // namespace for products collection
        })
        .sort({ ts: -1 })
        .limit(50)
        .toArray();
      
      console.log(`\nDelete operations on 'products' collection: ${deleteOps.length}`);
      
      if (deleteOps.length > 0) {
        console.log("\n⚠️  RECENT DELETE OPERATIONS FOUND!\n");
        
        // Group by timestamp to see deletion patterns
        const deletionsByTime = {};
        deleteOps.forEach(op => {
          const time = new Date(op.ts.getHighBits() * 1000).toISOString();
          const date = time.split('T')[0];
          if (!deletionsByTime[date]) {
            deletionsByTime[date] = 0;
          }
          deletionsByTime[date]++;
        });
        
        console.log("Deletions by date:");
        Object.entries(deletionsByTime)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .forEach(([date, count]) => {
            console.log(`   ${date}: ${count} deletions`);
          });
        
        console.log("\nMost recent deletions:");
        deleteOps.slice(0, 10).forEach((op, i) => {
          const time = new Date(op.ts.getHighBits() * 1000);
          console.log(`\n   ${i + 1}. Time: ${time.toLocaleString()}`);
          console.log(`      Collection: ${op.ns}`);
          console.log(`      Deleted ID: ${op.o._id || JSON.stringify(op.o)}`);
        });
        
        console.log("\n" + "=".repeat(60));
        console.log("💡 RECOVERY POSSIBLE!");
        console.log("=".repeat(60));
        console.log("\n✅ Oplog has delete operations recorded");
        console.log("   We can recover deleted products from oplog!");
        console.log("\nNext step: Run recovery script to restore deleted products");
        
      } else {
        console.log("\n✅ No delete operations found in oplog for 'products' collection");
        console.log("\n💡 This means:");
        console.log("   1. Products might not have been deleted via MongoDB");
        console.log("   2. They might have been deleted before oplog was enabled");
        console.log("   3. They might be in a different collection");
        console.log("   4. Count difference might be due to other reasons");
      }
      
      // Also check for any operations on products collection
      const allProductOps = await oplogCollection
        .find({ ns: "test.products" })
        .sort({ ts: -1 })
        .limit(20)
        .toArray();
      
      console.log("\n" + "=".repeat(60));
      console.log("📊 ALL RECENT OPERATIONS ON PRODUCTS:");
      console.log("=".repeat(60));
      
      const opsByType = {};
      allProductOps.forEach(op => {
        const opType = op.op; // 'i' = insert, 'u' = update, 'd' = delete
        if (!opsByType[opType]) {
          opsByType[opType] = 0;
        }
        opsByType[opType]++;
      });
      
      console.log("\nOperations by type:");
      Object.entries(opsByType).forEach(([type, count]) => {
        const typeName = {
          'i': 'Insert',
          'u': 'Update',
          'd': 'Delete'
        }[type] || type;
        console.log(`   ${typeName}: ${count}`);
      });
      
    } catch (err) {
      console.log("❌ Error accessing oplog:", err.message);
      console.log("\n💡 Oplog might not be accessible or replica set not configured");
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkOplog();

