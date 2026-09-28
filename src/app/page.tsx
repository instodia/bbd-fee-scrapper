"use client";

import React, { useState } from "react";
import { ScrapedStudentDetails, MultiCollegeSearchResult } from "@/lib/types";

export default function FeeScraperApp() {
  const [studentName, setStudentName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<MultiCollegeSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !mobile.trim()) {
      setError("Please enter student name and 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const res = await fetch("/api/scrape-fee-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentName,
          mobile: mobile,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to fetch student details.");
      } else {
        setSearchResult(data);
      }
    } catch {
      setError("Unable to connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setStudentName("");
    setMobile("");
    setSearchResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            BBD Student Fee & Details
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Check student details and fee payment status directly from mybbd.in
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Search Form Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Search Student
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Student Name */}
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                Student Full Name
              </label>
              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student full name"
                required
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Registered Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 10-digit mobile number"
                required
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? "Searching all 5 colleges..." : "Search Details"}
              </button>

              {(studentName || mobile || searchResult || error) && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-md transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
            <div className="font-medium mb-1">Search Error</div>
            <div>{error}</div>
          </div>
        )}

        {/* Results */}
        {searchResult && (
          <div className="space-y-6">
            {searchResult.records.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 text-center">
                <div className="text-base font-semibold text-gray-900 mb-1">No Student Record Found</div>
                <p className="text-sm text-gray-600">
                  Searched across all 5 institutions (BBDU, BBDITM, BBDNIIT, BBDEC, VIROHAN) for &quot;{searchResult.studentName}&quot; with mobile number {searchResult.mobile}, but no matching student was found.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Please verify that the spelling matches the college register and the registered 10-digit mobile number is correct.
                </div>
              </div>
            ) : (
              searchResult.records.map((record: ScrapedStudentDetails, rIdx: number) => (
                <div key={rIdx} className="space-y-6">
                  {/* 1. Student Academic & Profile Details List */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-gray-900">
                        Student Details
                      </h2>
                      <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded">
                        {record.organizationCode}
                      </span>
                    </div>

                    <dl className="divide-y divide-gray-200 text-sm">
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Student Name</dt>
                        <dd className="mt-1 text-gray-900 font-semibold sm:mt-0 sm:col-span-2">
                          {record.academicDetails.fullName}
                        </dd>
                      </div>

                      {record.academicDetails.guardianName && (
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-gray-500 font-medium">Father / Guardian Name</dt>
                          <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                            {record.academicDetails.guardianName}
                          </dd>
                        </div>
                      )}

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">College / Institution</dt>
                        <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                          {record.organizationName} ({record.organizationCode})
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Program / Branch</dt>
                        <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                          {record.academicDetails.program}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">University Roll Number</dt>
                        <dd className="mt-1 text-gray-900 font-mono font-medium sm:mt-0 sm:col-span-2">
                          {record.academicDetails.univRollNo}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Registration Number</dt>
                        <dd className="mt-1 text-gray-900 font-mono sm:mt-0 sm:col-span-2">
                          {record.academicDetails.regnNo}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Student ID</dt>
                        <dd className="mt-1 text-gray-900 font-mono sm:mt-0 sm:col-span-2">
                          {record.studentId}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Admission Type</dt>
                        <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                          {record.academicDetails.type}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Status</dt>
                        <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                          {record.academicDetails.status}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Seat Type</dt>
                        <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                          {record.academicDetails.seat}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Category</dt>
                        <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                          {record.academicDetails.category}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Mobile Number</dt>
                        <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                          {record.mobile}
                        </dd>
                      </div>

                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Email Address</dt>
                        <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                          {record.email || "Not Available"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* 2. Fee Dues List */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h2 className="text-base font-semibold text-gray-900">
                        Fee Payment Details
                      </h2>
                    </div>

                    {record.fees.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        No pending fee records found for this student.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {record.fees.map((fee, idx) => (
                          <dl key={idx} className="divide-y divide-gray-100 text-sm">
                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-gray-500 font-medium">Fee Description</dt>
                              <dd className="mt-1 text-gray-900 font-semibold sm:mt-0 sm:col-span-2">
                                {fee.label}
                              </dd>
                            </div>

                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-gray-500 font-medium">Payable Amount</dt>
                              <dd className="mt-1 text-gray-900 font-bold text-base sm:mt-0 sm:col-span-2">
                                {fee.formattedAmount}
                              </dd>
                            </div>

                            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-gray-500 font-medium">Fee Type</dt>
                              <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                                {fee.name}
                              </dd>
                            </div>

                            {fee.organizationName && (
                              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-gray-500 font-medium">Organization</dt>
                                <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                                  {fee.organizationName}
                                </dd>
                              </div>
                            )}

                            {fee.sfsId && (
                              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-gray-500 font-medium">SFS ID / Due ID</dt>
                                <dd className="mt-1 text-gray-900 font-mono sm:mt-0 sm:col-span-2">
                                  {fee.sfsId}
                                </dd>
                              </div>
                            )}

                            {fee.mid && (
                              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-gray-500 font-medium">Merchant ID (MID)</dt>
                                <dd className="mt-1 text-gray-900 font-mono sm:mt-0 sm:col-span-2">
                                  {fee.mid}
                                </dd>
                              </div>
                            )}
                          </dl>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Portal Meta Details List */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h2 className="text-base font-semibold text-gray-900">
                        System Reference
                      </h2>
                    </div>
                    <dl className="divide-y divide-gray-200 text-sm">
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Source URL</dt>
                        <dd className="mt-1 text-gray-700 sm:mt-0 sm:col-span-2 break-all font-mono text-xs">
                          {record.sourceUrl}
                        </dd>
                      </div>
                      <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-gray-500 font-medium">Scraped At</dt>
                        <dd className="mt-1 text-gray-700 sm:mt-0 sm:col-span-2 text-xs">
                          {new Date(record.timestamp).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
