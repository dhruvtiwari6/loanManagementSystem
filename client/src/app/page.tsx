"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Shield, Award, Landmark, User, LayoutDashboard, ChevronRight } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("creditsea_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/25 via-slate-950 to-slate-950 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
              <Landmark className="w-5.5 h-5.5 text-slate-950 font-bold" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              CreditSea
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400 hidden sm:inline">
                  Welcome back, <strong className="text-slate-200">{user.name}</strong>
                </span>
                <Link
                  href={user.role === "Borrower" ? "/borrower" : "/dashboard"}
                  className="flex items-center gap-2 px-5 h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-semibold shadow-lg shadow-teal-500/15 hover:shadow-teal-500/25 transition-all active:scale-98 text-sm"
                >
                  Go to {user.role === "Borrower" ? "Portal" : "Dashboard"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 h-11 rounded-xl text-slate-300 hover:text-white font-medium hover:bg-slate-900 transition-all text-sm flex items-center"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 h-11 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-medium shadow-md transition-all text-sm flex items-center gap-1"
                >
                  Apply Now
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-wide uppercase">
              <Award className="w-4 h-4" /> Leading Edge Lending Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Instant Credit, <br />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Simplified Lifecycles.
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Empowering borrowers with instant application checks, flexible tenure terms, and transparent calculations. Built for teams with robust role-based monitoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold shadow-xl shadow-teal-500/10 hover:shadow-teal-500/25 hover:translate-y-[-1px] transition-all active:translate-y-0 active:scale-98"
              >
                Apply as Borrower
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-semibold transition-all active:scale-98"
              >
                Executive Portal
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-900 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-bold text-white">12%</p>
                <p className="text-xs text-slate-500 uppercase font-semibold mt-1">Fixed p.a. Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">₹50K+</p>
                <p className="text-xs text-slate-500 uppercase font-semibold mt-1">Flexible limits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-500 uppercase font-semibold mt-1">Secure & Online</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual preview card */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-slate-900/50 border border-slate-850 p-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                  <Shield className="w-6 h-6 text-teal-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  BRE Verified
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase text-slate-500 tracking-wider font-semibold">Active Application</span>
                  <h3 className="text-3xl font-extrabold text-white">₹2,50,000</h3>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" />
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Tenure: 180 Days</span>
                  <span>Outstanding: ₹2,64,794</span>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
                  BU
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Borrower User</h4>
                  <p className="text-xs text-slate-500">Pending executive sanction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} CreditSea Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
