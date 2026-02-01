// src/Earning.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar"; // adjust path if needed

export default function Earning() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const recentTransactions = [
    { id: "#ORD001", date: "2 Jan, 8:39 pm", status: "Completed", amount: "+₹50" },
    { id: "#ORD002", date: "2 Jan, 8:39 pm", status: "Completed", amount: "+₹50" },
    { id: "#ORD003", date: "2 Jan, 8:39 pm", status: "Pending", amount: "+₹43" },
    { id: "#ORD004", date: "1 Jan, 8:39 pm", status: "Completed", amount: "+₹53" },
    { id: "#ORD005", date: "1 Jan, 8:39 pm", status: "Completed", amount: "+₹65" },
  ];

  const weeklyData = [
    { day: "Mon", amount: "₹856" },
    { day: "Tue", amount: "₹1024" },
    { day: "Wed", amount: "₹768" },
    { day: "Thu", amount: "₹1150" },
    { day: "Fri", amount: "₹1340" },
    { day: "Sat", amount: "₹1580" },
    { day: "Sun", amount: "₹920" },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar activeItem="earnings" />
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Top title row */}
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white shadow-sm border"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Earnings Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back! Here&apos;s your activity for this week.
                </p>
              </div>
            </div>
          </div>

          {/* Earnings summary row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mb-6">
            {/* Total earnings card */}
            <div className="lg:col-span-2 bg-[#05051A] rounded-2xl lg:rounded-3xl text-white p-4 lg:p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-44 h-44 bg-black/20 rounded-full" />
              <div className="relative">
                <p className="text-sm text-gray-300 mb-1">Total Earnings</p>
                <p className="text-2xl lg:text-3xl font-bold mb-4">₹7,644</p>
                <div className="flex flex-wrap gap-2 lg:gap-4 text-xs text-gray-300">
                  <span>84 deliveries</span>
                  <span>₹890 tips</span>
                  <span>₹210 bonus</span>
                </div>
              </div>
            </div>

            {/* Payout card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Available for Payout
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">₹7,644</p>
              </div>
              <button
                type="button"
                className="w-full py-3 rounded-xl lg:rounded-2xl bg-emerald-500 text-white text-sm font-semibold shadow hover:bg-emerald-600"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Daily breakdown card */}
          <section className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Daily Breakdown
              </h2>
              <div className="flex text-xs bg-gray-100 rounded-full p-1">
                <button className="px-3 py-1 rounded-full bg-white shadow text-gray-900">
                  This Week
                </button>
                <button className="px-3 py-1 rounded-full text-gray-500">
                  Last Week
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mt-6 text-xs text-gray-600">
              {weeklyData.map((item) => (
                <div key={item.day} className="flex flex-col items-center">
                  <span className="mb-1">{item.day}</span>
                  <span className="font-medium text-center">{item.amount}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent transactions card */}
          <section className="bg-white rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Recent Transactions
              </h2>
              <button className="text-xs text-[#2563EB] font-medium text-left sm:text-right">
                View All
              </button>
            </div>

            {/* Mobile card view */}
            <div className="lg:hidden space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-500 text-xs">
                        📄
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{tx.id}</span>
                    </div>
                    <span className="text-right text-emerald-500 font-semibold text-sm">
                      {tx.amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{tx.date}</span>
                    <span className={`flex items-center gap-1 ${
                      tx.status === "Pending" ? "text-yellow-500" : "text-emerald-500"
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-4 text-[11px] font-semibold text-gray-500 mb-3">
                <span>Order Details</span>
                <span>Date &amp; Time</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
              </div>

              <div className="divide-y divide-gray-100">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="grid grid-cols-4 items-center py-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-500 text-xs">
                        📄
                      </div>
                      <span className="font-medium text-gray-800">{tx.id}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{tx.date}</span>
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        tx.status === "Pending"
                          ? "text-yellow-500"
                          : "text-emerald-500"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {tx.status}
                    </span>
                    <span className="text-right text-emerald-500 font-semibold">
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
