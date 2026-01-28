const mongoose = require("mongoose");
require("dotenv").config();

const findProductsInAllDatabases = async () => {
  try {
    // Connect to MongoDB
    const connectionString = process.env.MONGODB_URI;
    const baseUri = connectionString.split("/").slice(0, -1).join("/").split("?")[0];
    const options = connectionString.includes("?") 
      ? "?" + connectionString.split("?")[1] 
      : "";

    console.log("Connecting to MongoDB...");
    const adminConnection = mongoose.createConnection(connectionString);
    
    await adminConnection.asPromise();
    console.log("Connected!\n");

    // Get admin database
    const adminDb = adminConnection.db.admin();
    const { databases } = await adminDb.listDatabases();

    console.log("Searching for products in all databases...\n");
    console.log("=" .repeat(60));

    const results = [];

    for (const dbInfo of databases) {
      const dbName = dbInfo.name;
      
      // Skip system databases
      if (["admin", "local", "config"].includes(dbName)) {
        continue;
      }

      try {
        console.log(`\nChecking database: ${dbName}`);
        
        // Create connection to this database
        const dbUri = `${baseUri}/${dbName}${options}`;
        const dbConnection = mongoose.createConnection(dbUri);
        await dbConnection.asPromise();
        
        const db = dbConnection.db;
        const collections = await db.listCollections().toArray();
        
        console.log(`  Collections found: ${collections.map(c => c.name).join(", ")}`);

        // Check each collection for products
        for (const coll of collections) {
          const collName = coll.name;
          const count = await db.collection(collName).countDocuments({});
          
          if (count > 0) {
            // Get a sample document to check structure
            const sample = await db.collection(collName).find({}).limit(1).toArray();
            const sampleDoc = sample[0];
            
            // Check if this looks like a product (has brand, sku, price, inventory fields)
            const hasProductFields = 
              (sampleDoc.brand !== undefined || 
               sampleDoc.sku !== undefined || 
               sampleDoc.price !== undefined || 
               sampleDoc.inventory !== undefined);
            
            if (hasProductFields || collName.toLowerCase().includes("product")) {
              results.push({
                database: dbName,
                collection: collName,
                count: count,
                sample: {
                  _id: sampleDoc._id,
                  brand: sampleDoc.brand || "N/A",
                  sku: sampleDoc.sku || "N/A",
                  price: sampleDoc.price || "N/A",
                  inventory: sampleDoc.inventory || "N/A",
                },
              });
              
              console.log(`  ✅ FOUND PRODUCTS in collection "${collName}": ${count} documents`);
            } else {
              console.log(`  📄 Collection "${collName}": ${count} documents (not products)`);
            }
          } else {
            console.log(`  📭 Collection "${collName}": empty`);
          }
        }
        
        await dbConnection.close();
      } catch (err) {
        console.log(`  ❌ Error accessing database ${dbName}: ${err.message}`);
      }
    }

    await adminConnection.close();

    console.log("\n" + "=".repeat(60));
    console.log("\n📊 SUMMARY:\n");
    
    if (results.length === 0) {
      console.log("❌ No products found in any database!");
      console.log("\n💡 Possible reasons:");
      console.log("   1. Products are in a different MongoDB cluster");
      console.log("   2. Products collection name is different");
      console.log("   3. Products haven't been imported yet");
    } else {
      console.log(`✅ Found products in ${results.length} location(s):\n`);
      results.forEach((result, index) => {
        console.log(`${index + 1}. Database: ${result.database}`);
        console.log(`   Collection: ${result.collection}`);
        console.log(`   Total Products: ${result.count}`);
        console.log(`   Sample: Brand="${result.sample.brand}", SKU="${result.sample.sku}"`);
        console.log("");
      });
      
      console.log("💡 To use these products, update your .env file:");
      console.log(`   MONGODB_URI=.../${results[0].database}?...`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

findProductsInAllDatabases();

