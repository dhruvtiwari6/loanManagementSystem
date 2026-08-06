"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Landmark, User, Briefcase, FileText, CheckCircle, Clock, 
  LandmarkIcon, CheckCircle2, XCircle, Search, DollarSign, 
  Calendar, Layers, ShieldAlert, LogOut, ArrowRight, Check, X,
  Plus, Users, ListFilter, Percent, Loader2, Award
} from "lucide-react";
import { apiRequest } from "@/utils/api";

export default function OperationsDashboard() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "sanctions" | "disbursements" | "collections">("overview");
  const [loading, setLoading] = useState(true);

  // Data states
  const [leads, setLeads] = useState<any[]>([]);
  const [sanctions, setSanctions] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  
  // Admin overview states
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [adminLoans, setAdminLoans] = useState<any[]>([]);
  const [adminPayments, setAdminPayments] = useState<any[]>([]);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  // Rejection Modal
  const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Payment Recording Modal
  const [payingLoan, setPayingLoan] = useState<any | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("creditsea_token");
    const storedUser = localStorage.getItem("creditsea_user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role === "Borrower") {
      router.push("/borrower");
      return;
    }

    setSessionUser(parsedUser);
    
    // Set default active tab based on role
    const role = parsedUser.role;
    if (role === "Sales") setActiveTab("leads");
    else if (role === "Sanction") setActiveTab("sanctions");
    else if (role === "Disbursement") setActiveTab("disbursements");
    else if (role === "Collection") setActiveTab("collections");
    else setActiveTab("overview");

    loadTabData(role, parsedUser.role === "Admin" ? "overview" : (role === "Sales" ? "leads" : role === "Sanction" ? "sanctions" : role === "Disbursement" ? "disbursements" : "collections"));
  }, []);

  const loadTabData = async (role: string, tab: string) => {
    setLoading(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      if (tab === "overview" && (role === "Admin")) {
        const data = await apiRequest("/api/operations/overview");
        if (data.ok) {
          setAdminMetrics(data.metrics);
          setAdminLoans(data.allLoans);
          setAdminPayments(data.recentPayments);
        }
      } else if (tab === "leads" && (role === "Admin" || role === "Sales")) {
        const data = await apiRequest("/api/operations/leads");
        if (data.ok) setLeads(data.leads);
      } else if (tab === "sanctions" && (role === "Admin" || role === "Sanction")) {
        const data = await apiRequest("/api/operations/sanctions");
        if (data.ok) setSanctions(data.loans);
      } else if (tab === "disbursements" && (role === "Admin" || role === "Disbursement")) {
        const data = await apiRequest("/api/operations/disbursements");
        if (data.ok) setDisbursements(data.loans);
      } else if (tab === "collections" && (role === "Admin" || role === "Collection")) {
        const data = await apiRequest("/api/operations/collections");
        if (data.ok) setCollections(data.loans);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to load tab data" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    loadTabData(sessionUser.role, tab);
  };

  const handleLogout = () => {
    localStorage.removeItem("creditsea_token");
    localStorage.removeItem("creditsea_user");
    router.push("/login");
  };

  // Action: Sanction Approval
  const handleApproveLoan = async (loanId: string) => {
    setActionLoading(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      const data = await apiRequest(`/api/operations/sanctions/${loanId}`, {
        method: "POST",
        body: { action: "approve" }
      });
      if (data.ok) {
        setFeedbackMsg({ type: "success", text: "Loan successfully sanctioned!" });
        loadTabData(sessionUser.role, "sanctions");
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to approve loan" });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Sanction Rejection
  const handleRejectLoan = async () => {
    if (!rejectingLoanId || !rejectionReason) return;
    setActionLoading(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      const data = await apiRequest(`/api/operations/sanctions/${rejectingLoanId}`, {
        method: "POST",
        body: { action: "reject", reason: rejectionReason }
      });
      if (data.ok) {
        setFeedbackMsg({ type: "success", text: "Loan rejected successfully." });
        setRejectingLoanId(null);
        setRejectionReason("");
        loadTabData(sessionUser.role, "sanctions");
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to reject loan" });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Disburse Loan
  const handleDisburseLoan = async (loanId: string) => {
    setActionLoading(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      const data = await apiRequest(`/api/operations/disbursements/${loanId}`, {
        method: "POST"
      });
      if (data.ok) {
        setFeedbackMsg({ type: "success", text: "Loan successfully marked as Disbursed!" });
        loadTabData(sessionUser.role, "disbursements");
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to disburse loan" });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingLoan || !utrNumber || !paymentAmount || !paymentDate) return;

    setActionLoading(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      const data = await apiRequest(`/api/operations/collections/${payingLoan._id}/payment`, {
        method: "POST",
        body: {
          utrNumber,
          amount: Number(paymentAmount),
          paymentDate
        }
      });
      if (data.ok) {
        setFeedbackMsg({ type: "success", text: data.message || "Payment recorded successfully!" });
        setPayingLoan(null);
        setUtrNumber("");
        setPaymentAmount("");
        setPaymentDate("");
        loadTabData(sessionUser.role, "collections");
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to record payment" });
    } finally {
      setActionLoading(false);
    }
  };

  const isRole = (roles: string[]) => {
    if (!sessionUser) return false;
    return roles.includes(sessionUser.role) || sessionUser.role === "Admin";
  };

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Radial Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/10 via-slate-950 to-slate-950 -z-10" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
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
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">{sessionUser.name}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{sessionUser.role} Portal</span>
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

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative">
        {/* Sidebar */}
        <aside className="md:col-span-3 space-y-2">
          <h2 className="text-xs font-semibold text-slate-550 uppercase tracking-wider px-3 mb-4">Operations Modules</h2>
          
          <nav className="space-y-1">
            {sessionUser.role === "Admin" && (
              <button
                onClick={() => handleTabChange("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "overview" 
                    ? "bg-slate-900 text-teal-400 border border-slate-800" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Layers className="w-4.5 h-4.5" />
                Admin Overview
              </button>
            )}

            {isRole(["Sales"]) && (
              <button
                onClick={() => handleTabChange("leads")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "leads" 
                    ? "bg-slate-900 text-teal-400 border border-slate-800" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Users className="w-4.5 h-4.5" />
                Leads Tracking (Sales)
              </button>
            )}

            {isRole(["Sanction"]) && (
              <button
                onClick={() => handleTabChange("sanctions")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "sanctions" 
                    ? "bg-slate-900 text-teal-400 border border-slate-800" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Clock className="w-4.5 h-4.5" />
                Applied Loans (Sanctions)
              </button>
            )}

            {isRole(["Disbursement"]) && (
              <button
                onClick={() => handleTabChange("disbursements")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "disbursements" 
                    ? "bg-slate-900 text-teal-400 border border-slate-800" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <LandmarkIcon className="w-4.5 h-4.5" />
                Sanctioned (Disbursing)
              </button>
            )}

            {isRole(["Collection"]) && (
              <button
                onClick={() => handleTabChange("collections")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "collections" 
                    ? "bg-slate-900 text-teal-400 border border-slate-800" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <DollarSign className="w-4.5 h-4.5" />
                Collections (Payments)
              </button>
            )}
          </nav>
        </aside>

        {/* Dynamic Main Dashboard Container */}
        <main className="md:col-span-9 space-y-6">
          {/* Feedback alerts */}
          {feedbackMsg.text && (
            <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
              feedbackMsg.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-450"
            }`}>
              {feedbackMsg.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
              {feedbackMsg.text}
            </div>
          )}

          {loading ? (
            <div className="bg-slate-900/40 border border-slate-850 p-12 rounded-3xl backdrop-blur-sm flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl backdrop-blur-sm shadow-xl min-h-[400px]">
              
              {/* VIEW 1: ADMIN OVERVIEW */}
              {activeTab === "overview" && adminMetrics && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">System Operations Overview</h2>
                    <p className="text-sm text-slate-400">Total snapshot metric data of the CreditSea portfolio.</p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Users", val: adminMetrics.totalUsers, color: "text-slate-300" },
                      { label: "Loans Applied", val: adminMetrics.totalLoans, color: "text-amber-400" },
                      { label: "Active Loans", val: adminMetrics.activeLoans, color: "text-teal-400" },
                      { label: "Closed Loans", val: adminMetrics.closedLoans, color: "text-emerald-400" }
                    ].map((m, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl">
                        <span className="text-xs text-slate-500 font-semibold block uppercase">{m.label}</span>
                        <span className={`text-3xl font-extrabold block mt-2 ${m.color}`}>{m.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity Table */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Recent Portfolio Loans</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-slate-850 text-slate-500 text-xs uppercase font-bold">
                            <th className="pb-3">Borrower</th>
                            <th className="pb-3">Principal</th>
                            <th className="pb-3">Tenure</th>
                            <th className="pb-3">Repayment</th>
                            <th className="pb-3">Outstanding</th>
                            <th className="pb-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminLoans.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-slate-550 italic">No loan applications recorded.</td>
                            </tr>
                          ) : (
                            adminLoans.map((l) => (
                              <tr key={l._id} className="border-b border-slate-900 hover:bg-slate-900/10">
                                <td className="py-3.5 font-medium text-slate-200">
                                  {l.borrowerId?.name}
                                </td>
                                <td className="py-3.5 text-slate-350">₹{l.loanAmount.toLocaleString()}</td>
                                <td className="py-3.5 text-slate-450">{l.tenureDays} Days</td>
                                <td className="py-3.5 text-slate-350">₹{l.totalRepayment.toLocaleString()}</td>
                                <td className="py-3.5 font-semibold text-teal-400">₹{l.outstandingBalance.toLocaleString()}</td>
                                <td className="py-3.5 text-right">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    l.status === "Pending" 
                                      ? "bg-amber-500/10 text-amber-400" 
                                      : l.status === "Sanctioned" 
                                      ? "bg-sky-500/10 text-sky-400" 
                                      : l.status === "Disbursed" 
                                      ? "bg-teal-500/10 text-teal-400" 
                                      : l.status === "Closed" 
                                      ? "bg-emerald-500/10 text-emerald-400" 
                                      : "bg-rose-500/10 text-rose-450"
                                  }`}>
                                    {l.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: LEADS (SALES) */}
              {activeTab === "leads" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Registered Leads</h2>
                    <p className="text-sm text-slate-400">Users who registered but have not completed a loan application.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-500 text-xs uppercase font-bold">
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Salary Slips</th>
                          <th className="pb-3">BRE Status</th>
                          <th className="pb-3 text-right">Registered On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-550 italic">No registered leads found.</td>
                          </tr>
                        ) : (
                          leads.map((l) => (
                            <tr key={l._id} className="border-b border-slate-900 hover:bg-slate-900/10">
                              <td className="py-3.5 font-medium text-slate-200">{l.name}</td>
                              <td className="py-3.5 text-slate-350">{l.email}</td>
                              <td className="py-3.5 text-slate-450">
                                {l.borrowerProfile?.salarySlipUrl ? (
                                  <a 
                                    href={`http://localhost:5000${l.borrowerProfile.salarySlipUrl}`} 
                                    target="_blank" 
                                    className="text-teal-400 hover:underline inline-flex items-center gap-1 font-semibold"
                                  >
                                    View Slip <FileText className="w-3.5 h-3.5" />
                                  </a>
                                ) : (
                                  <span className="text-slate-650">Not uploaded</span>
                                )}
                              </td>
                              <td className="py-3.5">
                                {l.borrowerProfile?.isEligible ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold">Eligible</span>
                                ) : l.borrowerProfile?.pan ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/20 text-rose-450 text-xs font-bold">Ineligible</span>
                                ) : (
                                  <span className="text-slate-650">No run yet</span>
                                )}
                              </td>
                              <td className="py-3.5 text-right text-slate-450">
                                {new Date(l.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 3: SANCTIONS */}
              {activeTab === "sanctions" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Pending Loan Sanctions</h2>
                    <p className="text-sm text-slate-400">Review, approve, or reject incoming loan applications.</p>
                  </div>

                  <div className="space-y-4">
                    {sanctions.length === 0 ? (
                      <div className="py-12 text-center text-slate-550 italic">No loan applications pending sanction.</div>
                    ) : (
                      sanctions.map((l) => (
                        <div 
                          key={l._id}
                          className="bg-slate-950/65 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-800 transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-white">{l.borrowerId?.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">BRE Passed</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-450">
                              <div>Email: <strong className="text-slate-300">{l.borrowerId?.email}</strong></div>
                              <div>PAN: <strong className="text-slate-350">{l.borrowerId?.borrowerProfile?.pan}</strong></div>
                              <div>Salary: <strong className="text-slate-300">₹{l.borrowerId?.borrowerProfile?.salary?.toLocaleString()}</strong></div>
                              <div>
                                Salary Slip: {" "}
                                <a 
                                  href={`http://localhost:5000${l.borrowerId?.borrowerProfile?.salarySlipUrl}`} 
                                  target="_blank" 
                                  className="text-teal-400 hover:underline font-semibold inline-flex items-center gap-0.5"
                                >
                                  View <FileText className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-900 flex gap-6 text-sm">
                              <div>Requested: <strong className="text-white font-extrabold">₹{l.loanAmount.toLocaleString()}</strong></div>
                              <div>Tenure: <strong className="text-slate-300">{l.tenureDays} Days</strong></div>
                              <div>Repayment: <strong className="text-teal-400 font-extrabold">₹{l.totalRepayment.toLocaleString()}</strong></div>
                            </div>
                          </div>

                          <div className="flex md:flex-col lg:flex-row gap-3">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleApproveLoan(l._id)}
                              className="h-10 px-5 rounded-xl bg-teal-500 hover:bg-teal-450 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-4.5 h-4.5 font-bold" /> Sanction
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => setRejectingLoanId(l._id)}
                              className="h-10 px-5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-450 font-bold text-sm transition-all active:scale-98 flex items-center justify-center gap-1.5"
                            >
                              <X className="w-4.5 h-4.5 font-bold" /> Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 4: DISBURSEMENTS */}
              {activeTab === "disbursements" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Disbursements Pipeline</h2>
                    <p className="text-sm text-slate-400">Release funds for sanctioned loans and mark them as active.</p>
                  </div>

                  <div className="space-y-4">
                    {disbursements.length === 0 ? (
                      <div className="py-12 text-center text-slate-550 italic">No sanctioned loans awaiting disbursement.</div>
                    ) : (
                      disbursements.map((l) => (
                        <div 
                          key={l._id}
                          className="bg-slate-950/65 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-800 transition-all"
                        >
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white">{l.borrowerId?.name}</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-450">
                              <div>PAN: <strong className="text-slate-355">{l.borrowerId?.borrowerProfile?.pan}</strong></div>
                              <div>Email: <strong className="text-slate-300">{l.borrowerId?.email}</strong></div>
                              <div>Sanctioned Date: <strong className="text-slate-300">{l.sanctionedAt ? new Date(l.sanctionedAt).toLocaleDateString() : "N/A"}</strong></div>
                            </div>

                            <div className="pt-2 border-t border-slate-900 flex gap-6 text-sm">
                              <div>Disburse Amount: <strong className="text-white font-extrabold">₹{l.loanAmount.toLocaleString()}</strong></div>
                              <div>Repayment Due: <strong className="text-teal-400 font-extrabold">₹{l.totalRepayment.toLocaleString()}</strong></div>
                              <div>Tenure: <strong className="text-slate-300">{l.tenureDays} Days</strong></div>
                            </div>
                          </div>

                          <button
                            disabled={actionLoading}
                            onClick={() => handleDisburseLoan(l._id)}
                            className="h-11 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-extrabold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                          >
                            <LandmarkIcon className="w-4 h-4" /> Disburse Payment
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 5: COLLECTIONS */}
              {activeTab === "collections" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Active Loan Collections</h2>
                    <p className="text-sm text-slate-400">Track outstanding balances and record borrower payment transactions.</p>
                  </div>

                  <div className="space-y-4">
                    {collections.length === 0 ? (
                      <div className="py-12 text-center text-slate-550 italic">No active disbursed loans to collect.</div>
                    ) : (
                      collections.map((l) => {
                        const paidAmount = Math.round((l.totalRepayment - l.outstandingBalance) * 100) / 100;
                        const percentPaid = Math.round((paidAmount / l.totalRepayment) * 100);
                        
                        return (
                          <div 
                            key={l._id}
                            className="bg-slate-950/65 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <h3 className="text-lg font-bold text-white">{l.borrowerId?.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Disbursed on: {l.disbursedAt ? new Date(l.disbursedAt).toLocaleDateString() : "N/A"}</p>
                              </div>

                              <button
                                onClick={() => setPayingLoan(l)}
                                className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-teal-400 hover:text-teal-350 transition-all text-xs font-bold flex items-center gap-1.5"
                              >
                                <Plus className="w-4 h-4" /> Record Repayment
                              </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-slate-900 py-4 text-sm">
                              <div>
                                <span className="text-slate-500 block text-xs">Total Repayment:</span>
                                <strong className="text-slate-300">₹{l.totalRepayment.toLocaleString()}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-xs">Amount Paid:</span>
                                <strong className="text-emerald-400">₹{paidAmount.toLocaleString()}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-xs">Outstanding Balance:</span>
                                <strong className="text-teal-400 font-extrabold text-base">₹{l.outstandingBalance.toLocaleString()}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-xs">Collection progress:</span>
                                <strong className="text-slate-300">{percentPaid}%</strong>
                              </div>
                            </div>

                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${percentPaid}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: REJECTION MODAL */}
      {rejectingLoanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Reject Loan Application</h3>
              <button 
                onClick={() => { setRejectingLoanId(null); setRejectionReason(""); }}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300">Reason for Rejection</label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Applicant details mismatch, duplicate application, salary slip verification failed, etc."
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-slate-200 placeholder-slate-600 focus:outline-none transition-all text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setRejectingLoanId(null); setRejectionReason(""); }}
                  className="px-4 h-10 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectionReason || actionLoading}
                  onClick={handleRejectLoan}
                  className="px-5 h-10 rounded-xl bg-rose-500 hover:bg-rose-450 text-slate-950 font-bold text-sm disabled:opacity-50 transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT MODAL */}
      {payingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Record Payment</h3>
              <button 
                onClick={() => setPayingLoan(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300">Borrower</label>
                <input
                  type="text"
                  disabled
                  value={payingLoan.borrowerId?.name || ""}
                  className="w-full mt-1.5 h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300">Outstanding Balance</label>
                <div className="w-full mt-1.5 h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center text-teal-400 font-extrabold text-sm">
                  ₹{payingLoan.outstandingBalance.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300">Payment Amount (₹)</label>
                  <input
                    type="number"
                    required
                    max={payingLoan.outstandingBalance}
                    min={1}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full mt-1.5 h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-slate-200 placeholder-slate-600 focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full mt-1.5 h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-slate-200 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300">UTR / Reference Number</label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                  placeholder="UTR1234567890"
                  className="w-full mt-1.5 h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-slate-200 placeholder-slate-650 focus:outline-none transition-all text-sm font-mono uppercase tracking-wider"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPayingLoan(null)}
                  className="px-4 h-10 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !utrNumber || !paymentAmount || !paymentDate}
                  className="px-5 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-sm disabled:opacity-50 transition-all shadow-md shadow-teal-500/10"
                >
                  {actionLoading ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} CreditSea Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
