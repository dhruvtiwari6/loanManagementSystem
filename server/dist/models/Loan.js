"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loan = void 0;
const mongoose_1 = require("mongoose");
const LoanSchema = new mongoose_1.Schema({
    borrowerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    loanAmount: { type: Number, required: true },
    tenureDays: { type: Number, required: true },
    interestRate: { type: Number, required: true, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    outstandingBalance: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Sanctioned", "Disbursed", "Rejected", "Closed"],
        default: "Pending"
    },
    rejectionReason: { type: String },
    sanctionedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date }
}, {
    timestamps: true
});
exports.Loan = (0, mongoose_1.model)("Loan", LoanSchema);
