"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    loanId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Loan", required: true },
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    utrNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true, default: Date.now }
}, {
    timestamps: true
});
exports.Payment = (0, mongoose_1.model)("Payment", PaymentSchema);
