const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is not set in .env file');
      console.error('💡 Please create a .env file in the backend folder with:');
      console.error('   MONGODB_URI=your-mongodb-connection-string');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    // Removed deprecated options: useNewUrlParser and useUnifiedTopology
    // These are no longer needed in mongoose 6+

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Please check:');
    console.error('   1. MongoDB is running');
    console.error('   2. MONGODB_URI in .env is correct');
    console.error('   3. Network connection is available');
    process.exit(1);
  }
};

module.exports = connectDB;

