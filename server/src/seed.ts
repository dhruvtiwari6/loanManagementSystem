import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "./models/User";
import { Loan } from "./models/Loan";
import { Payment } from "./models/Payment";

dotenv.config();

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
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing users, loans, and payments...");
    await User.deleteMany({});
    await Loan.deleteMany({});
    await Payment.deleteMany({});
    console.log("✓ Database cleared");

    // Seed users
    for (const r of rolesToSeed) {
      const hashedPassword = await bcrypt.hash(r.password, 10);
      const user = new User({
        name: r.name,
        email: r.email,
        password: hashedPassword,
        role: r.role
      });
      await user.save();
      console.log(`✓ Seeded user: ${r.email} with role ${r.role}`);
    }

    console.log("Seeding complete! Closing connection...");
    await mongoose.connection.close();
    console.log("✓ Connection closed");
  } catch (err: any) {
    console.error("✗ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
