const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log("Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Attempting to connect to MongoDB Atlas...");
    cached.promise = mongoose.connect(process.env.ZIPIN_MONGODBURL, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000
    }).then(mongoose => {
      console.log("✅ Database connected successfully!");
      return mongoose;
    }).catch(error => {
      console.error("❌ Database connection failed:", error.message);
      throw error;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on failure
    throw error;
  }
}

module.exports = { connectDB };
