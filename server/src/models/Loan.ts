import { Schema, model, Document, Types } from "mongoose";

export interface ILoan extends Document {
  borrowerId: Types.ObjectId;
  loanAmount: number;
  tenureDays: number;
  interestRate: number; // e.g. 12 (represents 12% p.a.)
  simpleInterest: number;
  totalRepayment: number;
  outstandingBalance: number;
  status: "Pending" | "Sanctioned" | "Disbursed" | "Rejected" | "Closed";
  rejectionReason?: string;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>({
  borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

export const Loan = model<ILoan>("Loan", LoanSchema);
