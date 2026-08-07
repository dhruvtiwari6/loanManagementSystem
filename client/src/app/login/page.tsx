"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Landmark, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/utils/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (data.ok) {
        localStorage.setItem("creditsea_token", data.token);
        localStorage.setItem("creditsea_user", JSON.stringify(data.user));

        if (data.user.role === "Borrower") {
          router.push("/borrower");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "Failed to log in");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center py-12 px-6 lg:px-8 relative font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950 -z-10" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 group mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
            <Landmark className="w-6 h-6 text-slate-950" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            CreditSea
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{" "}
          <Link href="/register" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
            create a new borrower account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/50 border border-slate-800/80 p-8 rounded-2xl shadow-xl backdrop-blur-sm space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-teal-500 text-slate-200 placeholder-slate-500 focus:outline-none transition-all text-sm"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-teal-500 text-slate-200 placeholder-slate-500 focus:outline-none transition-all text-sm"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Authenticating...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick seed credentials section */}
          <div className="border-t border-slate-800/80 pt-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              Seed Accounts (For Testing)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleSeedFill("borrower@creditsea.com", "Borrower@123")}
                className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-left transition-all hover:border-slate-700"
              >
                <strong className="block text-teal-400">Borrower</strong>
                <span className="block text-[11px] text-slate-400">borrower@creditsea.com</span>
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Pass: Borrower@123</span>
              </button>
              <button
                onClick={() => handleSeedFill("admin@creditsea.com", "Admin@123")}
                className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-left transition-all hover:border-slate-700"
              >
                <strong className="block text-teal-400">Admin</strong>
                <span className="block text-[11px] text-slate-400">admin@creditsea.com</span>
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Pass: Admin@123</span>
              </button>
              <button
                onClick={() => handleSeedFill("sales@creditsea.com", "Sales@123")}
                className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-left transition-all hover:border-slate-700"
              >
                <strong className="block text-teal-400">Sales</strong>
                <span className="block text-[11px] text-slate-400">sales@creditsea.com</span>
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Pass: Sales@123</span>
              </button>
              <button
                onClick={() => handleSeedFill("sanction@creditsea.com", "Sanction@123")}
                className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-left transition-all hover:border-slate-700"
              >
                <strong className="block text-teal-400">Sanction</strong>
                <span className="block text-[11px] text-slate-400">sanction@creditsea.com</span>
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Pass: Sanction@123</span>
              </button>
              <button
                onClick={() => handleSeedFill("disburse@creditsea.com", "Disburse@123")}
                className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-left transition-all hover:border-slate-700"
              >
                <strong className="block text-teal-400">Disbursement</strong>
                <span className="block text-[11px] text-slate-400">disburse@creditsea.com</span>
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Pass: Disburse@123</span>
              </button>
              <button
                onClick={() => handleSeedFill("collect@creditsea.com", "Collect@123")}
                className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-left transition-all hover:border-slate-700"
              >
                <strong className="block text-teal-400">Collection</strong>
                <span className="block text-[11px] text-slate-400">collect@creditsea.com</span>
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Pass: Collect@123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
