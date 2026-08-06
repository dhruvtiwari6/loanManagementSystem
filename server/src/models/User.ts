import { Schema, model, Document } from "mongoose";

export interface IBorrowerProfile {
  pan?: string;
  dob?: Date;
  salary?: number;
  employmentMode?: "Salaried" | "Self-Employed" | "Unemployed";
  salarySlipUrl?: string;
  isEligible?: boolean;
  breRejectionReason?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "Borrower" | "Sales" | "Sanction" | "Disbursement" | "Collection" | "Admin";
  borrowerProfile?: IBorrowerProfile;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowerProfileSchema = new Schema<IBorrowerProfile>({
  pan: { type: String, uppercase: true, trim: true },
  dob: { type: Date },
  salary: { type: Number },
  employmentMode: { type: String, enum: ["Salaried", "Self-Employed", "Unemployed"] },
  salarySlipUrl: { type: String },
  isEligible: { type: Boolean, default: false },
  breRejectionReason: { type: String }
}, { _id: false });

const UserSchema = new Schema<IUser>({
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

export const User = model<IUser>("User", UserSchema);
