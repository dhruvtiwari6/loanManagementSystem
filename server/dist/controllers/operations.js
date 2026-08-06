"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOverview = exports.recordPayment = exports.getCollections = exports.processDisbursement = exports.getDisbursements = exports.processSanction = exports.getSanctions = exports.getLeads = void 0;
const User_1 = require("../models/User");
const Loan_1 = require("../models/Loan");
const Payment_1 = require("../models/Payment");
// SALES MODULE: Get all borrowers who have registered but haven't applied for a loan yet
const getLeads = async (req, res) => {
    try {
        // 1. Get all borrower IDs who have at least one loan record
        const loans = await Loan_1.Loan.find({}).select("borrowerId").lean();
        const appliedBorrowerIds = loans.map((l) => l.borrowerId.toString());
        // 2. Find all users with role 'Borrower' whose id is NOT in that list
        const leads = await User_1.User.find({
            role: "Borrower",
            _id: { $nin: appliedBorrowerIds }
        }).select("-password").sort({ createdAt: -1 });
        return res.json({ ok: true, leads });
    }
    catch (err) {
        console.error("Get leads error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error fetching leads" });
    }
};
exports.getLeads = getLeads;
// SANCTION MODULE: Get all loans in 'Pending' state
const getSanctions = async (req, res) => {
    try {
        const loans = await Loan_1.Loan.find({ status: "Pending" })
            .populate("borrowerId", "name email borrowerProfile")
            .sort({ createdAt: -1 });
        return res.json({ ok: true, loans });
    }
    catch (err) {
        console.error("Get sanctions error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error fetching pending loans" });
    }
};
exports.getSanctions = getSanctions;
// SANCTION ACTION: Approve or Reject a pending loan
const processSanction = async (req, res) => {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    if (!action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ ok: false, error: "Invalid action. Must be 'approve' or 'reject'" });
    }
    if (action === "reject" && !reason) {
        return res.status(400).json({ ok: false, error: "A rejection reason is required to reject a loan" });
    }
    try {
        const loan = await Loan_1.Loan.findById(id);
        if (!loan) {
            return res.status(404).json({ ok: false, error: "Loan not found" });
        }
        if (loan.status !== "Pending") {
            return res.status(400).json({ ok: false, error: `Loan is already processed (Status: ${loan.status})` });
        }
        if (action === "approve") {
            loan.status = "Sanctioned";
            loan.sanctionedAt = new Date();
        }
        else {
            loan.status = "Rejected";
            loan.rejectionReason = reason;
        }
        await loan.save();
        return res.json({ ok: true, loan });
    }
    catch (err) {
        console.error("Process sanction error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error processing sanction decision" });
    }
};
exports.processSanction = processSanction;
// DISBURSEMENT MODULE: Get all loans in 'Sanctioned' state
const getDisbursements = async (req, res) => {
    try {
        const loans = await Loan_1.Loan.find({ status: "Sanctioned" })
            .populate("borrowerId", "name email borrowerProfile")
            .sort({ createdAt: -1 });
        return res.json({ ok: true, loans });
    }
    catch (err) {
        console.error("Get disbursements error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error fetching sanctioned loans" });
    }
};
exports.getDisbursements = getDisbursements;
// DISBURSEMENT ACTION: Mark a sanctioned loan as 'Disbursed'
const processDisbursement = async (req, res) => {
    const { id } = req.params;
    try {
        const loan = await Loan_1.Loan.findById(id);
        if (!loan) {
            return res.status(404).json({ ok: false, error: "Loan not found" });
        }
        if (loan.status !== "Sanctioned") {
            return res.status(400).json({ ok: false, error: `Loan is not in Sanctioned state (Status: ${loan.status})` });
        }
        loan.status = "Disbursed";
        loan.disbursedAt = new Date();
        await loan.save();
        return res.json({ ok: true, loan });
    }
    catch (err) {
        console.error("Process disbursement error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error processing disbursement" });
    }
};
exports.processDisbursement = processDisbursement;
// COLLECTION MODULE: Get all loans in 'Disbursed' state (active loans)
const getCollections = async (req, res) => {
    try {
        const loans = await Loan_1.Loan.find({ status: "Disbursed" })
            .populate("borrowerId", "name email borrowerProfile")
            .sort({ createdAt: -1 });
        return res.json({ ok: true, loans });
    }
    catch (err) {
        console.error("Get collections error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error fetching active collections" });
    }
};
exports.getCollections = getCollections;
// COLLECTION ACTION: Record a payment transaction on a disbursed loan
const recordPayment = async (req, res) => {
    const { id } = req.params; // Loan ID
    const { utrNumber, amount, paymentDate } = req.body;
    const executiveId = req.user?.id;
    if (!utrNumber || amount === undefined || !paymentDate) {
        return res.status(400).json({ ok: false, error: "Please provide UTR Number, Amount, and Payment Date" });
    }
    const payAmount = Number(amount);
    if (payAmount <= 0) {
        return res.status(400).json({ ok: false, error: "Payment amount must be greater than 0" });
    }
    try {
        // 1. Verify loan exists and is in Disbursed state
        const loan = await Loan_1.Loan.findById(id);
        if (!loan) {
            return res.status(404).json({ ok: false, error: "Loan not found" });
        }
        if (loan.status !== "Disbursed") {
            return res.status(400).json({ ok: false, error: `Payments can only be recorded on Disbursed loans (Current status: ${loan.status})` });
        }
        // 2. Validate payment does not exceed outstanding balance
        if (payAmount > loan.outstandingBalance) {
            return res.status(400).json({
                ok: false,
                error: `Payment amount (₹${payAmount}) exceeds the remaining outstanding balance (₹${loan.outstandingBalance})`
            });
        }
        // 3. Verify UTR is unique across the entire system
        const existingPayment = await Payment_1.Payment.findOne({ utrNumber: utrNumber.toUpperCase() });
        if (existingPayment) {
            return res.status(400).json({ ok: false, error: `A payment with UTR '${utrNumber.toUpperCase()}' already exists` });
        }
        // 4. Create payment transaction
        const payment = new Payment_1.Payment({
            loanId: loan._id,
            recordedBy: executiveId,
            utrNumber: utrNumber.toUpperCase(),
            amount: payAmount,
            paymentDate: new Date(paymentDate)
        });
        await payment.save();
        // 5. Update loan outstanding balance and close if paid in full
        loan.outstandingBalance = Math.round((loan.outstandingBalance - payAmount) * 100) / 100;
        if (loan.outstandingBalance <= 0) {
            loan.status = "Closed";
            loan.closedAt = new Date();
        }
        await loan.save();
        return res.json({
            ok: true,
            message: loan.status === "Closed" ? "Payment recorded. Loan is now Closed!" : "Payment recorded successfully",
            payment,
            loan
        });
    }
    catch (err) {
        console.error("Record payment error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error recording payment transaction" });
    }
};
exports.recordPayment = recordPayment;
// ADMIN MODULE: Overview dashboard data (all loans, active collections, logs, metrics)
const getAdminOverview = async (req, res) => {
    try {
        const totalUsers = await User_1.User.countDocuments({});
        const totalLoans = await Loan_1.Loan.countDocuments({});
        const activeLoans = await Loan_1.Loan.countDocuments({ status: "Disbursed" });
        const pendingLoans = await Loan_1.Loan.countDocuments({ status: "Pending" });
        const closedLoans = await Loan_1.Loan.countDocuments({ status: "Closed" });
        const allLoans = await Loan_1.Loan.find({})
            .populate("borrowerId", "name email")
            .sort({ updatedAt: -1 });
        const recentPayments = await Payment_1.Payment.find({})
            .populate("loanId", "loanAmount")
            .populate("recordedBy", "name")
            .sort({ createdAt: -1 })
            .limit(10);
        return res.json({
            ok: true,
            metrics: {
                totalUsers,
                totalLoans,
                activeLoans,
                pendingLoans,
                closedLoans
            },
            allLoans,
            recentPayments
        });
    }
    catch (err) {
        console.error("Get admin overview error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error getting admin overview metrics" });
    }
};
exports.getAdminOverview = getAdminOverview;
