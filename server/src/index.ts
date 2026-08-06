import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db";
import apiRoutes from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend communication
app.use(cors({
  origin: "*", // Adjust in production to frontend domain
  credentials: true
}));

app.use(express.json());

// Serve uploaded salary slips statically
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Direct all API requests to the unified router
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "healthy", timestamp: new Date() });
});

// Start the database and HTTP listener
const bootstrap = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Loan Management Server is running on http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error("✗ Failed to start application server:", err.message);
    process.exit(1);
  }
};

bootstrap();
