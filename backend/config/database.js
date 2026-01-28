const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      console.log('⚠️  Server will start but database operations will fail');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will continue running, but database operations will fail');
    console.log('💡 Make sure MongoDB is running and MONGODB_URI is correct in .env');
    // Don't exit - let server start anyway for development
  }
};

module.exports = connectDB;

