// server/src/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env");

  try {
    await mongoose.connect(uri); // Mongoose 7+: sensible defaults
    console.log("✓ MongoDB connected");
  } catch (err) {
    console.error("✗ MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = { connectDB };
