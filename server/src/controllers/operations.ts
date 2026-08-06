import { Response } from "express";
import { IAuthRequest } from "../middlewares/auth";
import { User } from "../models/User";
import { Loan } from "../models/Loan";
import { Payment } from "../models/Payment";

// SALES MODULE: Get all borrowers who have registered but haven't applied for a loan yet
export const getLeads = async (req: IAuthRequest, res: Response) => {
  try {
    // 1. Get all borrower IDs who have at least one loan record
    const loans = await Loan.find({}).select("borrowerId").lean();
    const appliedBorrowerIds = loans.map((l) => l.borrowerId.toString());

    // 2. Find all users with role 'Borrower' whose id is NOT in that list
    const leads = await User.find({
      role: "Borrower",
      _id: { $nin: appliedBorrowerIds }
    }).select("-password").sort({ createdAt: -1 });

    return res.json({ ok: true, leads });
  } catch (err: any) {
    console.error("Get leads error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error fetching leads" });
  }
};

// SANCTION MODULE: Get all loans in 'Pending' state
export const getSanctions = async (req: IAuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ status: "Pending" })
      .populate("borrowerId", "name email borrowerProfile")
      .sort({ createdAt: -1 });

    return res.json({ ok: true, loans });
  } catch (err: any) {
    console.error("Get sanctions error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error fetching pending loans" });
  }
};

// SANCTION ACTION: Approve or Reject a pending loan
export const processSanction = async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;
  const { action, reason } = req.body; // action: 'approve' | 'reject'

  if (!action || !["approve", "reject"].includes(action)) {
    return res.status(400).json({ ok: false, error: "Invalid action. Must be 'approve' or 'reject'" });
  }

  if (action === "reject" && !reason) {
    return res.status(400).json({ ok: false, error: "A rejection reason is required to reject a loan" });
  }

  try {
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ ok: false, error: "Loan not found" });
    }

    if (loan.status !== "Pending") {
      return res.status(400).json({ ok: false, error: `Loan is already processed (Status: ${loan.status})` });
    }

    if (action === "approve") {
      loan.status = "Sanctioned";
      loan.sanctionedAt = new Date();
    } else {
      loan.status = "Rejected";
      loan.rejectionReason = reason;
    }

    await loan.save();
    return res.json({ ok: true, loan });
  } catch (err: any) {
    console.error("Process sanction error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error processing sanction decision" });
  }
};

// DISBURSEMENT MODULE: Get all loans in 'Sanctioned' state
export const getDisbursements = async (req: IAuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ status: "Sanctioned" })
      .populate("borrowerId", "name email borrowerProfile")
      .sort({ createdAt: -1 });

    return res.json({ ok: true, loans });
  } catch (err: any) {
    console.error("Get disbursements error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error fetching sanctioned loans" });
  }
};

// DISBURSEMENT ACTION: Mark a sanctioned loan as 'Disbursed'
export const processDisbursement = async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const loan = await Loan.findById(id);
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
  } catch (err: any) {
    console.error("Process disbursement error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error processing disbursement" });
  }
};

// COLLECTION MODULE: Get all loans in 'Disbursed' state (active loans)
export const getCollections = async (req: IAuthRequest, res: Response) => {
  try {
    const loans = await Loan.find({ status: "Disbursed" })
      .populate("borrowerId", "name email borrowerProfile")
      .sort({ createdAt: -1 });

    return res.json({ ok: true, loans });
  } catch (err: any) {
    console.error("Get collections error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error fetching active collections" });
  }
};

// COLLECTION ACTION: Record a payment transaction on a disbursed loan
export const recordPayment = async (req: IAuthRequest, res: Response) => {
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
    const loan = await Loan.findById(id);
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
    const existingPayment = await Payment.findOne({ utrNumber: utrNumber.toUpperCase() });
    if (existingPayment) {
      return res.status(400).json({ ok: false, error: `A payment with UTR '${utrNumber.toUpperCase()}' already exists` });
    }

    // 4. Create payment transaction
    const payment = new Payment({
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
  } catch (err: any) {
    console.error("Record payment error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error recording payment transaction" });
  }
};

// ADMIN MODULE: Overview dashboard data (all loans, active collections, logs, metrics)
export const getAdminOverview = async (req: IAuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalLoans = await Loan.countDocuments({});
    const activeLoans = await Loan.countDocuments({ status: "Disbursed" });
    const pendingLoans = await Loan.countDocuments({ status: "Pending" });
    const closedLoans = await Loan.countDocuments({ status: "Closed" });

    const allLoans = await Loan.find({})
      .populate("borrowerId", "name email")
      .sort({ updatedAt: -1 });

    const recentPayments = await Payment.find({})
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
  } catch (err: any) {
    console.error("Get admin overview error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error getting admin overview metrics" });
  }
};
