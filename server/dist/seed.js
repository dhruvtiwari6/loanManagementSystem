"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./models/User");
const Loan_1 = require("./models/Loan");
const Payment_1 = require("./models/Payment");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/loan-mgmt";
const rolesToSeed = [
    { name: "Admin Executive", email: "admin@creditsea.com", password: "Admin@123", role: "Admin" },
    { name: "Sales Executive", email: "sales@creditsea.com", password: "Sales@123", role: "Sales" },
    { name: "Sanction Executive", email: "sanction@creditsea.com", password: "Sanction@123", role: "Sanction" },
    { name: "Disbursement Executive", email: "disburse@creditsea.com", password: "Disburse@123", role: "Disbursement" },
    { name: "Collection Executive", email: "collect@creditsea.com", password: "Collect@123", role: "Collection" },
    { name: "Borrower User", email: "borrower@creditsea.com", password: "Borrower@123", role: "Borrower" }
];
async function seed() {
    try {
        console.log("Connecting to database at:", MONGODB_URI);
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("✓ Connected to MongoDB");
        // Clear existing data
        console.log("Clearing existing users, loans, and payments...");
        await User_1.User.deleteMany({});
        await Loan_1.Loan.deleteMany({});
        await Payment_1.Payment.deleteMany({});
        console.log("✓ Database cleared");
        // Seed users
        for (const r of rolesToSeed) {
            const hashedPassword = await bcrypt_1.default.hash(r.password, 10);
            const user = new User_1.User({
                name: r.name,
                email: r.email,
                password: hashedPassword,
                role: r.role
            });
            await user.save();
            console.log(`✓ Seeded user: ${r.email} with role ${r.role}`);
        }
        console.log("Seeding complete! Closing connection...");
        await mongoose_1.default.connection.close();
        console.log("✓ Connection closed");
    }
    catch (err) {
        console.error("✗ Seeding failed:", err.message);
        process.exit(1);
    }
}
seed();
