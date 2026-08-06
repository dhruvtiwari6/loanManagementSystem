import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/loan-mgmt";
  
  try {
    await mongoose.connect(uri);
    console.log("✓ MongoDB connected successfully");
  } catch (err: any) {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  }
};
