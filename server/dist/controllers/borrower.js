"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoanStatus = exports.applyLoan = exports.uploadSalarySlip = exports.checkEligibility = void 0;
const User_1 = require("../models/User");
const Loan_1 = require("../models/Loan");
const bre_1 = require("../utils/bre");
const loanMath_1 = require("../utils/loanMath");
const checkEligibility = async (req, res) => {
    const { dob, salary, pan, employmentMode } = req.body;
    const userId = req.user?.id;
    if (!dob || salary === undefined || !pan || !employmentMode) {
        return res.status(400).json({
            ok: false,
            error: "Please provide all details: Date of Birth, Salary, PAN, and Employment Mode"
        });
    }
    try {
        const breResult = (0, bre_1.runBRE)({ dob, salary: Number(salary), pan, employmentMode });
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        user.borrowerProfile = {
            ...user.borrowerProfile,
            pan: pan.toUpperCase(),
            dob: new Date(dob),
            salary: Number(salary),
            employmentMode,
            isEligible: breResult.isEligible,
            breRejectionReason: breResult.rejectionReason
        };
        await user.save();
        if (!breResult.isEligible) {
            return res.status(400).json({
                ok: false,
                isEligible: false,
                error: breResult.rejectionReason
            });
        }
        return res.json({ ok: true, isEligible: true });
    }
    catch (err) {
        console.error("Eligibility check error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error checking eligibility" });
    }
};
exports.checkEligibility = checkEligibility;
const uploadSalarySlip = async (req, res) => {
    const userId = req.user?.id;
    if (!req.file) {
        return res.status(400).json({ ok: false, error: "Please upload a salary slip file" });
    }
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        if (!user.borrowerProfile) {
            user.borrowerProfile = {};
        }
        // Save filename or path
        user.borrowerProfile.salarySlipUrl = `/uploads/${req.file.filename}`;
        await user.save();
        return res.json({
            ok: true,
            salarySlipUrl: user.borrowerProfile.salarySlipUrl
        });
    }
    catch (err) {
        console.error("Salary slip upload error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error uploading file" });
    }
};
exports.uploadSalarySlip = uploadSalarySlip;
const applyLoan = async (req, res) => {
    const { loanAmount, tenureDays } = req.body;
    const userId = req.user?.id;
    if (loanAmount === undefined || tenureDays === undefined) {
        return res.status(400).json({ ok: false, error: "Please specify loan amount and tenure days" });
    }
    const amount = Number(loanAmount);
    const tenure = Number(tenureDays);
    if (amount < 50000 || amount > 500000) {
        return res.status(400).json({ ok: false, error: "Loan Amount must be between ₹50,000 and ₹500,000" });
    }
    if (tenure < 30 || tenure > 365) {
        return res.status(400).json({ ok: false, error: "Tenure must be between 30 and 365 days" });
    }
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        // Ensure they ran BRE and are eligible
        if (!user.borrowerProfile || !user.borrowerProfile.isEligible) {
            return res.status(400).json({
                ok: false,
                error: "You must complete the eligibility check and be marked as eligible before applying."
            });
        }
        // Ensure they uploaded a salary slip
        if (!user.borrowerProfile.salarySlipUrl) {
            return res.status(400).json({
                ok: false,
                error: "Please upload your salary slip first."
            });
        }
        // Check if there is an active/pending loan application
        const existingLoan = await Loan_1.Loan.findOne({
            borrowerId: userId,
            status: { $in: ["Pending", "Sanctioned", "Disbursed"] }
        });
        if (existingLoan) {
            return res.status(400).json({
                ok: false,
                error: `You already have a loan application in status: ${existingLoan.status}`
            });
        }
        // Calculate loan terms using simple interest
        const terms = (0, loanMath_1.calculateLoanTerms)(amount, tenure);
        const loan = new Loan_1.Loan({
            borrowerId: userId,
            loanAmount: terms.principal,
            tenureDays: terms.tenureDays,
            interestRate: terms.interestRate,
            simpleInterest: terms.simpleInterest,
            totalRepayment: terms.totalRepayment,
            outstandingBalance: terms.totalRepayment,
            status: "Pending"
        });
        await loan.save();
        return res.status(210).json({ ok: true, loan });
    }
    catch (err) {
        console.error("Apply loan error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error submitting loan application" });
    }
};
exports.applyLoan = applyLoan;
const getLoanStatus = async (req, res) => {
    const userId = req.user?.id;
    try {
        const loans = await Loan_1.Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
        return res.json({ ok: true, loans });
    }
    catch (err) {
        console.error("Get loan status error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error fetching loan status" });
    }
};
exports.getLoanStatus = getLoanStatus;
