"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS for frontend communication
app.use((0, cors_1.default)({
    origin: "*", // Adjust in production to frontend domain
    credentials: true
}));
app.use(express_1.default.json());
// Serve uploaded salary slips statically
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../../uploads")));
// Direct all API requests to the unified router
app.use("/api", routes_1.default);
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ ok: true, status: "healthy", timestamp: new Date() });
});
// Start the database and HTTP listener
const bootstrap = async () => {
    try {
        await (0, db_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`🚀 Loan Management Server is running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error("✗ Failed to start application server:", err.message);
        process.exit(1);
    }
};
bootstrap();
