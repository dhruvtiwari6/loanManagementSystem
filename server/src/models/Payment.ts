import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  loanId: Types.ObjectId;
  recordedBy: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
  recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  utrNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true, default: Date.now }
}, {
  timestamps: true
});

export const Payment = model<IPayment>("Payment", PaymentSchema);
