"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const BorrowerProfileSchema = new mongoose_1.Schema({
    pan: { type: String, uppercase: true, trim: true },
    dob: { type: Date },
    salary: { type: Number },
    employmentMode: { type: String, enum: ["Salaried", "Self-Employed", "Unemployed"] },
    salarySlipUrl: { type: String },
    isEligible: { type: Boolean, default: false },
    breRejectionReason: { type: String }
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ["Borrower", "Sales", "Sanction", "Disbursement", "Collection", "Admin"]
    },
    borrowerProfile: { type: BorrowerProfileSchema, required: false }
}, {
    timestamps: true
});
exports.User = (0, mongoose_1.model)("User", UserSchema);
