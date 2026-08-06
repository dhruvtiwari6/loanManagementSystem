// server/src/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./db");
const mongoose = require("mongoose");
const uploadRoutes = require("../routes/uploadRoutes"); // adjust path if needed

const reportRoutes = require("../routes/reportRoutes");



const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", uploadRoutes);
app.use("/api", reportRoutes);
dotenv.config();

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "server", env: process.env.NODE_ENV || "dev" });
});

// DB health route
app.get("/api/db/health", (req, res) => {
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const state = mongoose.connection.readyState;
  res.json({ connected: state === 1, state });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("Server not started due to DB error.");
    process.exit(1);
  }
};

start();
