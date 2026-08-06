// server/src/models/Report.js
const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    lender: String,
    type: String,
    status: String,
    openedOn: String,
    closedOn: String,
    creditLimit: Number,
    currentBalance: Number,
    overdue: Number,
    emi: Number,
    portfolioType: String,
  },
  { _id: false }
);

const EnquirySchema = new mongoose.Schema(
  {
    date: String,
    purpose: String,
    amount: Number,
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema(
  {
    rootKey: String,
    file: {
      fileName: String,
      fileSize: Number,
      mimeType: String,
    },
    basic: {
      name: String,
      phone: String,       // store as string for consistency
      pan: String,
      bureauScore: Number,
    },
    summary: {
      totalAccounts: Number,
      activeAccounts: Number,
      closedAccounts: Number,
      securedAmount: Number,
      unsecuredAmount: Number,
      enquiriesLast7Days: Number,
    },
    accounts: [AccountSchema],
    enquiries: [EnquirySchema],
  },
  { timestamps: true }
);

// helpful index to fetch latest report per PAN quickly
ReportSchema.index({ "basic.pan": 1, createdAt: -1 });

module.exports = mongoose.model("Report", ReportSchema);
