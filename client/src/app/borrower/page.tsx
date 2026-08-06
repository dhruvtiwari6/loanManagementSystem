"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Landmark, User, Calendar, DollarSign, Briefcase, FileText, 
  Upload, ShieldAlert, CheckCircle, ChevronRight, ChevronLeft, 
  LogOut, Clock, LandmarkIcon, CheckCircle2, XCircle, FileSpreadsheet,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/utils/api";

interface ILoan {
  _id: string;
  loanAmount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  outstandingBalance: number;
  status: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function BorrowerPortal() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLoans, setActiveLoans] = useState<ILoan[]>([]);
  
  // Wizard state: 'status' (view existing) | 'personal' | 'upload' | 'configure' | 'success'
  const [step, setStep] = useState<"status" | "personal" | "upload" | "configure" | "success">("status");
  
  // Step 2 Form: Personal Info
  const [dob, setDob] = useState("");
  const [salary, setSalary] = useState("");
  const [pan, setPan] = useState("");
  const [employmentMode, setEmploymentMode] = useState("Salaried");
  const [eligibilityError, setEligibilityError] = useState("");
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  
  // Step 3 Form: Salary Slip
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  
  // Step 4 Form: Loan config
  const [loanAmount, setLoanAmount] = useState(100000);
  const [tenureDays, setTenureDays] = useState(180);
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [createdLoan, setCreatedLoan] = useState<ILoan | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("creditsea_token");
    const storedUser = localStorage.getItem("creditsea_user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "Borrower") {
      router.push("/dashboard");
      return;
    }

    setSessionUser(parsedUser);
    fetchLoanStatus();
  }, []);

  const fetchLoanStatus = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/borrower/loan-status");
      if (data.ok) {
        setActiveLoans(data.loans);
        if (data.loans.length > 0) {
          setStep("status");
        } else {
          setStep("personal");
        }
      }
    } catch (err) {
      console.error("Error fetching loan status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("creditsea_token");
    localStorage.removeItem("creditsea_user");
    router.push("/login");
  };

  // Step 2: Submit eligibility check
  const handleEligibilityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob || !salary || !pan || !employmentMode) return;

    setEligibilityError("");
    setEligibilityLoading(true);

    try {
      const data = await apiRequest("/api/borrower/eligibility", {
        method: "POST",
        body: { dob, salary: Number(salary), pan: pan.toUpperCase(), employmentMode }
      });

      if (data.ok) {
        setStep("upload");
      }
    } catch (err: any) {
      setEligibilityError(err.message || "Failed eligibility check.");
    } finally {
      setEligibilityLoading(false);
    }
  };

  // Step 3: Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError("File size exceeds 5MB limit");
        return;
      }
      setFile(selectedFile);
      setUploadError("");
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please select a file to upload");
      return;
    }

    setUploadError("");
    setUploadLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await apiRequest("/api/borrower/upload-slip", {
        method: "POST",
        body: formData
      });

      if (data.ok) {
        setUploadedUrl(data.salarySlipUrl);
        setStep("configure");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload salary slip");
    } finally {
      setUploadLoading(false);
    }
  };

  // Step 4: Submit Loan Application
  const handleApplyLoan = async () => {
    setSubmitError("");
    setSubmitLoading(true);

    try {
      const data = await apiRequest("/api/borrower/apply", {
        method: "POST",
        body: { loanAmount, tenureDays }
      });

      if (data.ok) {
        setCreatedLoan(data.loan);
        setStep("success");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit loan application");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Simple Interest calculations
  const interestRate = 12; // 12% p.a.
  const simpleInterest = Math.round(((loanAmount * (interestRate / 100) * tenureDays) / 365) * 100) / 100;
  const totalRepayment = Math.round((loanAmount + simpleInterest) * 100) / 100;
  const monthlyEmi = Math.round((totalRepayment / (tenureDays / 30)) * 100) / 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const activeLoan = activeLoans.find(l => ["Pending", "Sanctioned", "Disbursed"].includes(l.status));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/15 via-slate-950 to-slate-950 -z-10" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
              <Landmark className="w-5.5 h-5.5 text-slate-950 font-bold" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              CreditSea
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">{sessionUser?.name}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Borrower Portal</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full flex flex-col justify-center">
        {/* Wizard Steps indicator (Hidden if viewing existing active loan or on success screen) */}
        {step !== "status" && step !== "success" && (
          <div className="mb-10">
            <div className="flex justify-between items-center max-w-md mx-auto relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-10" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-400 -z-10 transition-all duration-350"
                style={{
                  width: step === "personal" ? "0%" : step === "upload" ? "50%" : "100%"
                }}
              />

              {[
                { label: "Eligibility", id: "personal" },
                { label: "Salary Slip", id: "upload" },
                { label: "Loan Config", id: "configure" }
              ].map((s, index) => {
                const isActive = step === s.id;
                const isCompleted = 
                  (step === "upload" && index === 0) || 
                  (step === "configure" && index <= 1);
                
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-350 ${
                      isActive 
                        ? "bg-teal-500 border-teal-500 text-slate-950 ring-4 ring-teal-500/20" 
                        : isCompleted 
                        ? "bg-slate-900 border-teal-500 text-teal-400" 
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? "text-teal-400" : isCompleted ? "text-slate-350" : "text-slate-550"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Wizard views */}

        {/* 1. Status View: Existing applications */}
        {step === "status" && (
          <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl backdrop-blur-sm shadow-xl space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-850 pb-6 gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Your Loan Application Status</h2>
                <p className="text-sm text-slate-400 mt-1">Review the status of your current loan applications.</p>
              </div>
              {!activeLoan && (
                <button
                  onClick={() => setStep("personal")}
                  className="px-5 h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold transition-all active:scale-98 text-sm"
                >
                  Apply for New Loan
                </button>
              )}
            </div>

            <div className="space-y-6">
              {activeLoans.map((loan) => (
                <div 
                  key={loan._id}
                  className="bg-slate-950/60 border border-slate-850 rounded-2xl p-6 grid md:grid-cols-12 gap-6 items-center hover:border-slate-800 transition-all"
                >
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-xs text-slate-550 uppercase font-semibold">Applied on {new Date(loan.createdAt).toLocaleDateString()}</span>
                    <h3 className="text-2xl font-extrabold text-white">₹{loan.loanAmount.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400">Tenure: {loan.tenureDays} Days @ 12% p.a.</p>
                  </div>

                  <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Interest:</span>
                      <strong className="text-slate-200">₹{loan.simpleInterest.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Repayment:</span>
                      <strong className="text-slate-200">₹{loan.totalRepayment.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Outstanding:</span>
                      <strong className="text-slate-200">₹{loan.outstandingBalance.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Maturity EMI:</span>
                      <strong className="text-slate-200">₹{loan.totalRepayment.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-col items-start md:items-end gap-2">
                    <span className="text-xs text-slate-550 font-semibold uppercase">Current Status</span>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      loan.status === "Pending" 
                        ? "bg-amber-500/10 border-amber-500/25 text-amber-400" 
                        : loan.status === "Sanctioned" 
                        ? "bg-sky-500/10 border-sky-500/25 text-sky-400" 
                        : loan.status === "Disbursed" 
                        ? "bg-teal-500/10 border-teal-500/25 text-teal-400" 
                        : loan.status === "Closed" 
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/25 text-rose-450"
                    }`}>
                      {loan.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
                      {loan.status === "Sanctioned" && <CheckCircle className="w-3.5 h-3.5" />}
                      {loan.status === "Disbursed" && <LandmarkIcon className="w-3.5 h-3.5" />}
                      {loan.status === "Closed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {loan.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                      {loan.status}
                    </div>

                    {loan.status === "Rejected" && loan.rejectionReason && (
                      <p className="text-xs text-rose-400 text-left mt-2 italic bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 w-full">
                        Reason: {loan.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Step 2: Personal Details & Eligibility Check */}
        {step === "personal" && (
          <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl backdrop-blur-sm shadow-xl space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Step 1: Check Your Eligibility</h2>
              <p className="text-sm text-slate-400 mt-1">We run an instant Business Rule Engine (BRE) check to pre-qualify your loan application.</p>
            </div>

            {eligibilityError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex gap-2 items-start">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <strong className="block text-rose-350">Eligibility Rejected:</strong>
                  {eligibilityError}
                </div>
              </div>
            )}

            <form onSubmit={handleEligibilityCheck} className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-350">PAN Number</label>
                <div className="mt-1.5 relative">
                  <input
                    type="text"
                    required
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-teal-500 text-slate-200 placeholder-slate-650 focus:outline-none transition-all text-sm font-semibold tracking-wider"
                  />
                  <FileSpreadsheet className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-350">Date of Birth</label>
                <div className="mt-1.5 relative">
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-teal-500 text-slate-200 focus:outline-none transition-all text-sm"
                  />
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-350">Monthly Salary (₹)</label>
                <div className="mt-1.5 relative">
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="30000"
                    min={0}
                    className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-teal-500 text-slate-200 placeholder-slate-650 focus:outline-none transition-all text-sm"
                  />
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-350">Employment Mode</label>
                <div className="mt-1.5 relative">
                  <select
                    value={employmentMode}
                    onChange={(e) => setEmploymentMode(e.target.value)}
                    className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-teal-500 text-slate-200 focus:outline-none transition-all text-sm appearance-none"
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-between pt-4 gap-4">
                {activeLoans.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep("status")}
                    className="flex items-center gap-2 px-5 h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 transition-all text-sm font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4" /> Cancel
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={eligibilityLoading}
                  className="flex items-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all disabled:opacity-50 text-sm ml-auto"
                >
                  {eligibilityLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Running BRE Checks...
                    </>
                  ) : (
                    <>
                      Verify Eligibility <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. Step 3: Salary Slip Upload */}
        {step === "upload" && (
          <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl backdrop-blur-sm shadow-xl space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Step 2: Upload Salary Slip</h2>
              <p className="text-sm text-slate-400 mt-1">Please upload your latest salary slip. Accepted formats: PDF, JPG, PNG (Max size: 5MB).</p>
            </div>

            {uploadError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-6">
              <div className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-2xl p-8 text-center bg-slate-950/40 cursor-pointer transition-all relative group">
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-teal-400 transition-colors" />
                  </div>
                  <div>
                    <span className="text-sm text-slate-200 font-bold block">
                      {file ? file.name : "Select or drag & drop salary slip"}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, PNG, or JPG up to 5 MB"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep("personal")}
                  className="flex items-center gap-2 px-5 h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 transition-all text-sm font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={uploadLoading || !file}
                  className="flex items-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all disabled:opacity-50 text-sm"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Uploading...
                    </>
                  ) : (
                    <>
                      Upload & Continue <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Step 4: Loan terms config */}
        {step === "configure" && (
          <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl backdrop-blur-sm shadow-xl space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Step 3: Configure Your Loan</h2>
              <p className="text-sm text-slate-400 mt-1">Adjust the sliders below to configure your requested amount and repayment tenure.</p>
            </div>

            {submitError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                {submitError}
              </div>
            )}

            <div className="grid md:grid-cols-12 gap-8">
              {/* Sliders */}
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-350">Loan Amount</span>
                    <span className="text-teal-400 text-lg font-bold">₹{loanAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={500000}
                    step={10000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-teal-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-550">
                    <span>Min: ₹50,000</span>
                    <span>Max: ₹5,000,000</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-350">Tenure</span>
                    <span className="text-teal-400 text-lg font-bold">{tenureDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={365}
                    step={1}
                    value={tenureDays}
                    onChange={(e) => setTenureDays(Number(e.target.value))}
                    className="w-full accent-teal-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-550">
                    <span>Min: 30 Days</span>
                    <span>Max: 365 Days</span>
                  </div>
                </div>
              </div>

              {/* Repayment Card Panel */}
              <div className="md:col-span-5 bg-slate-950/70 border border-slate-850 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs uppercase text-slate-500 tracking-wider font-semibold">Calculation Breakdown</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Principal Requested:</span>
                    <strong className="text-slate-200">₹{loanAmount.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest Rate:</span>
                    <strong className="text-emerald-400">12.00% p.a.</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Simple Interest:</span>
                    <strong className="text-slate-200">₹{simpleInterest.toLocaleString()}</strong>
                  </div>
                  <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-base">
                    <span className="text-slate-200 font-bold">Total Repayment:</span>
                    <strong className="text-teal-400 font-extrabold text-lg">₹{totalRepayment.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-900 bg-slate-900/20 p-3 rounded-xl border border-slate-900 text-center">
                  <span className="text-xs text-slate-500 block font-semibold uppercase">Maturity Repayment Due</span>
                  <span className="text-sm font-extrabold text-slate-300 mt-1 block">Full amount due after {tenureDays} days</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="flex items-center gap-2 px-5 h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 transition-all text-sm font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={handleApplyLoan}
                disabled={submitLoading}
                className="flex items-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all disabled:opacity-50 text-sm"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Processing Application...
                  </>
                ) : (
                  <>
                    Apply For Loan <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 5. Success screen */}
        {step === "success" && createdLoan && (
          <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl backdrop-blur-sm shadow-xl text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Application Submitted!</h2>
              <p className="text-slate-450 text-sm">Your application has been received and is pending verification by our Operations team.</p>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 p-6 rounded-2xl text-left space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Loan Reference ID:</span>
                <span className="text-slate-350 font-mono">{createdLoan._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loan Amount:</span>
                <strong className="text-slate-200">₹{createdLoan.loanAmount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interest (12%):</span>
                <strong className="text-slate-200">₹{createdLoan.simpleInterest.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-900 pt-3">
                <span className="text-slate-200 font-bold">Total Repayment:</span>
                <strong className="text-teal-400 font-bold">₹{createdLoan.totalRepayment.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                  {createdLoan.status}
                </span>
              </div>
            </div>

            <button
              onClick={fetchLoanStatus}
              className="w-full h-12 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-800 hover:border-slate-700 transition-all text-sm"
            >
              Go to Portal Status Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
