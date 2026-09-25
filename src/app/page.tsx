"use client";

import React, { useState } from "react";
import {
  ORGANIZATIONS,
  ScrapedStudentDetails,
  Organization,
} from "@/lib/types";
import {
  Search,
  Sparkles,
  GraduationCap,
  Building2,
  User,
  Phone,
  Mail,
  CreditCard,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  IdCard,
  FileText,
  Printer,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function FeeScraperApp() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("2"); // Default BBDITM
  const [studentName, setStudentName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScrapedStudentDetails | null>(null);
  const [error, setError] = useState<{ message: string; isNotFound?: boolean } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"card" | "json" | "curl">("card");

  // Sample data quick-fill handler
  const fillSample = (orgId: string, name: string, phone: string) => {
    setSelectedOrgId(orgId);
    setStudentName(name);
    setMobile(phone);
    setError(null);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentName.trim() || !mobile.trim()) {
      setError({ message: "Please fill in student name and phone number." });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const selectedOrg = ORGANIZATIONS.find((o) => o.id === selectedOrgId);
      const res = await fetch("/api/scrape-fee-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college: selectedOrg?.code || selectedOrgId,
          name: studentName,
          mobile: mobile,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError({
          message: data.message || "Failed to fetch student details.",
          isNotFound: data.isNotFound,
        });
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error occurred";
      setError({ message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bbd-fee-${result.customerName.replace(/\s+/g, "_")}-${result.academicDetails.univRollNo}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalFeePayable =
    result?.fees?.reduce((acc, f) => acc + (f.amount || 0), 0) || 0;

  const currentOrg = ORGANIZATIONS.find((o) => o.id === selectedOrgId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  BBD Fee Scraper
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                  Live Portal Scraper
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct real-time extraction from{" "}
                <code className="text-slate-300 font-mono">mybbd.in/fee-payment</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://mybbd.in/fee-payment"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
            >
              <span>Original Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Portal Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Scrape & Verify Details from{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              mybbd.in
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Automates the Laravel CSRF handshake, authenticates session cookies, extracts student identity, registration numbers, academic status, and fee breakdowns.
          </p>

          {/* Quick Preset Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1">
              Try Example:
            </span>
            <button
              type="button"
              onClick={() => fillSample("2", "Shivanshu Shukla", "6306808581")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 rounded-lg transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>BBDITM: Shivanshu Shukla (6306808581)</span>
            </button>
          </div>
        </div>

        {/* Input Form & Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Scraper Form */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Search Parameters</h2>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                Step 1 of 2
              </span>
            </div>

            <form onSubmit={handleSearch} className="space-y-5">
              {/* College Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  1. College / Institution
                </label>
                <div className="relative">
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-10 cursor-pointer"
                  >
                    {ORGANIZATIONS.map((org) => (
                      <option key={org.id} value={org.id} className="bg-slate-900 text-white">
                        {org.code} — {org.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                {currentOrg && (
                  <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {currentOrg.subtitle} (Code: {currentOrg.code})
                  </p>
                )}
              </div>

              {/* Student Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  2. Student Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Shivanshu Shukla"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600 pl-11"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Case-insensitive; matches college admission register.
                </p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  3. Registered Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile, e.g. 6306808581"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600 pl-11 tracking-wider font-mono"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Mobile number registered during fee enrollment or counseling.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Querying mybbd.in Portal...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Scrape Fee & Academic Details</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Supported Colleges List */}
            <div className="mt-8 pt-5 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>All Supported Institutions</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {ORGANIZATIONS.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`p-2 rounded-lg text-left border transition-all ${
                      selectedOrgId === org.id
                        ? "bg-indigo-950/80 border-indigo-500/60 text-indigo-200"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold">{org.code}</div>
                    <div className="text-[11px] truncate opacity-75">{org.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Output & Result View */}
          <div className="lg:col-span-7 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-rose-950/50 border border-rose-800/60 rounded-2xl p-5 text-rose-200 flex items-start gap-3 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-rose-300">
                    {error.isNotFound ? "Record Not Found" : "Scraping Failed"}
                  </h3>
                  <p className="text-sm mt-1 text-rose-200/90">{error.message}</p>
                  <p className="text-xs mt-2 text-rose-300/70">
                    Tip: Verify that the student name and 10-digit mobile number match the official college database records.
                  </p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Result Header & Actions */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("card")}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                        activeTab === "card"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-white bg-slate-800/50"
                      }`}
                    >
                      <IdCard className="w-3.5 h-3.5" />
                      <span>Student Card & Fees</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("json")}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                        activeTab === "json"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-white bg-slate-800/50"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>JSON Response</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("curl")}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                        activeTab === "curl"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-white bg-slate-800/50"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>API Curl</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1 transition-all"
                      title="Copy full JSON"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1 transition-all"
                      title="Download JSON File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1 transition-all"
                      title="Print Summary"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {activeTab === "card" && (
                  <div className="space-y-6 print:m-0 print:p-0">
                    {/* Student Identity Card */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                      {/* Watermark Logo/Emblem */}
                      <div className="absolute right-3 -bottom-8 opacity-5 text-indigo-400 pointer-events-none">
                        <GraduationCap className="w-64 h-64" />
                      </div>

                      {/* Header of Student Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                              {result.academicDetails.fullName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Verified
                            </span>
                          </div>
                          {result.academicDetails.guardianName && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              c/o <span className="text-slate-200">{result.academicDetails.guardianName}</span>
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="px-3 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold border border-indigo-500/30">
                            ID: {result.studentId}
                          </span>
                        </div>
                      </div>

                      {/* Academic Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                            Program / Branch
                          </span>
                          <span className="text-sm font-semibold text-white mt-1 block">
                            {result.academicDetails.program}
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                            College / Institution
                          </span>
                          <span className="text-sm font-semibold text-white mt-1 block">
                            {result.organizationName} ({result.organizationCode})
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                            University Roll Number
                          </span>
                          <span className="text-sm font-mono font-bold text-indigo-300 mt-1 block select-all">
                            {result.academicDetails.univRollNo}
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                            Registration Number
                          </span>
                          <span className="text-sm font-mono font-bold text-slate-200 mt-1 block select-all">
                            {result.academicDetails.regnNo}
                          </span>
                        </div>
                      </div>

                      {/* Badges / Enrollment Status */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          Type: <strong>{result.academicDetails.type}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          Status: <strong>{result.academicDetails.status}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          Seat: <strong>{result.academicDetails.seat}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          Category: <strong>{result.academicDetails.category}</strong>
                        </span>
                      </div>

                      {/* Contact Info Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Mobile:</span>
                          <span className="text-slate-200 font-mono font-medium">
                            {result.mobile}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Email:</span>
                          <span className="text-slate-200 font-medium truncate">
                            {result.email || "Not Provided"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fee Details Breakdown Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-emerald-400" />
                          <h3 className="text-lg font-bold text-white">Fee Breakdown</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Total Due Amount</span>
                          <span className="text-xl font-black text-emerald-400">
                            ₹ {totalFeePayable.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {result.fees.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">
                          No pending fee dues reported on the portal for this student.
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {result.fees.map((fee, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white text-base">
                                    {fee.label}
                                  </span>
                                  <span className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 text-slate-300 rounded">
                                    {fee.name}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                                  {fee.organizationName && (
                                    <span>Inst: <span className="text-slate-300">{fee.organizationName}</span></span>
                                  )}
                                  {fee.sfsId && (
                                    <span>SFS ID: <span className="text-slate-300 font-mono">{fee.sfsId}</span></span>
                                  )}
                                  {fee.mid && (
                                    <span>Merchant: <span className="text-slate-300 font-mono">{fee.mid}</span></span>
                                  )}
                                </div>
                              </div>

                              <div className="sm:text-right shrink-0">
                                <span className="text-2xl font-black text-emerald-400 font-mono">
                                  {fee.formattedAmount}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Payment Options on Official Portal */}
                      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                        <span>
                          Payment gateway integration on official site: <strong>Worldline / Paynimo</strong> or Offline Challan (PNB / RTGS).
                        </span>
                        <a
                          href="https://mybbd.in/fee-payment"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          <span>Proceed on mybbd.in</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Academic Sessions Available */}
                    {result.academicYears.length > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <h4 className="text-sm font-semibold text-slate-200">
                            Available Academic Sessions ({result.academicYears.length})
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-2">
                          {result.academicYears.map((yr) => (
                            <span
                              key={yr.value}
                              className="px-2 py-0.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded font-mono"
                            >
                              {yr.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* JSON View */}
                {activeTab === "json" && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
                      <span>Live JSON Output ({new Date(result.timestamp).toLocaleTimeString()})</span>
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        {copied ? "Copied to clipboard" : "Click to copy"}
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-400 max-h-[500px] overflow-auto p-3 bg-black/60 rounded-xl leading-relaxed select-all">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}

                {/* cURL & Code Integration View */}
                {activeTab === "curl" && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 mb-2">
                        cURL API Request
                      </h4>
                      <pre className="text-xs font-mono text-indigo-300 p-4 bg-black/70 rounded-xl overflow-x-auto select-all">
{`curl -X POST "${typeof window !== "undefined" ? window.location.origin : ""}/api/scrape-fee-details" \\
  -H "Content-Type: application/json" \\
  -d '{
    "college": "${result.organizationCode}",
    "name": "${result.customerName}",
    "mobile": "${result.mobile}"
  }'`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 mb-2">
                        GET Request with Query Parameters
                      </h4>
                      <pre className="text-xs font-mono text-indigo-300 p-4 bg-black/70 rounded-xl overflow-x-auto select-all">
{`curl "${typeof window !== "undefined" ? window.location.origin : ""}/api/scrape-fee-details?college=${encodeURIComponent(result.organizationCode)}&name=${encodeURIComponent(result.customerName)}&mobile=${result.mobile}"`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-slate-900/60 border border-slate-800/80 border-dashed rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-inner">
                  <IdCard className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Ready to Extract Student Data
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                  Select a college, provide the student's name and 10-digit mobile number, or click the sample button above to run a live demonstration.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <span>Connects securely with live CSRF token handshake to mybbd.in</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Architecture Overview */}
        <section className="mt-16 pt-12 border-t border-slate-800/80">
          <h2 className="text-xl font-bold text-white mb-2">
            How the Scraper Works
          </h2>
          <p className="text-sm text-slate-400 mb-8 max-w-3xl">
            The target system (<code className="text-slate-300">mybbd.in/fee-payment</code>) is a server-side rendered Laravel application protected by CSRF tokens and HTTP-only session cookies. This scraper implements the full authentication handshake.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-semibold text-white mb-1 text-base">CSRF & Session Bootstrap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fetches <code className="text-slate-300">GET /fee-payment</code>, captures the Laravel session cookie (<code className="text-slate-300">bbd_mycampus_session</code>), and extracts the hidden <code className="text-slate-300">_token</code> value using Cheerio HTML parser.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h3 className="font-semibold text-white mb-1 text-base">Form Emulation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Issues <code className="text-slate-300">POST /fee-payment/details</code> with <code className="text-slate-300">application/x-www-form-urlencoded</code> format, passing the resolved organization ID, sanitized student name, and mobile number.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-semibold text-white mb-1 text-base">Structured Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parses the response DOM to pull Roll No, Regn No, Program, Fee due attributes (<code className="text-slate-300">data-fee_amount</code>, <code className="text-slate-300">sfs_id</code>, <code className="text-slate-300">mid</code>), and academic sessions into typed JSON.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>BBD Student Fee & Details Scraper • Powered by Next.js & Cheerio</p>
        <p className="mt-1">For educational and administrative inquiry purposes.</p>
      </footer>
    </div>
  );
}
