// src/Customer.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar"; // adjust path if needed

const customers = [
  {
    id: "#1001",
    name: "Jane Cooper",
    phone: "+1 •••• •••• 4567",
    area: "North America",
    orders: 12,
    lastOrder: "Oct 24, 2023",
    status: "Active",
  },
  {
    id: "#1002",
    name: "Cody Fisher",
    phone: "+1 •••• •••• 1234",
    area: "Europe",
    orders: 8,
    lastOrder: "Oct 22, 2023",
    status: "New",
  },
  {
    id: "#1003",
    name: "Esther Howard",
    phone: "+1 •••• •••• 8890",
    area: "Asia",
    orders: 24,
    lastOrder: "Oct 19, 2023",
    status: "Active",
  },
  {
    id: "#1004",
    name: "Jenny Wilson",
    phone: "+1 •••• •••• 5543",
    area: "North America",
    orders: 2,
    lastOrder: "Oct 15, 2023",
    status: "Blocked",
  },
  {
    id: "#1005",
    name: "Guy Hawkins",
    phone: "+1 •••• •••• 0092",
    area: "Australia",
    orders: 15,
    lastOrder: "Oct 10, 2023",
    status: "Active",
  },
];

const statusStyles = {
  Active: "bg-green-50 text-green-600",
  New: "bg-blue-50 text-blue-600",
  Blocked: "bg-red-50 text-red-500",
};

export default function Customer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar activeItem="customers" />
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
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
                  Customer Directory
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and view your e-commerce customers efficiently.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden space-y-4">
            {customers.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    <p className="text-sm text-gray-500">{c.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-700">{c.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Area:</span>
                    <span className="text-gray-700">{c.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orders:</span>
                    <span className="text-gray-700">{c.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Order:</span>
                    <span className="text-gray-700">{c.lastOrder}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block bg-white rounded-3xl shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-7 px-6 py-3 text-[11px] font-semibold text-gray-500 border-b border-gray-100">
              <span>CUSTOMER ID</span>
              <span>NAME</span>
              <span>PHONE</span>
              <span>AREA</span>
              <span>ORDERS</span>
              <span>LAST ORDER</span>
              <span className="text-right">STATUS</span>
            </div>

            {/* Rows */}
            <div>
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-7 px-6 py-4 text-sm items-center border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60"
                >
                  <span className="text-gray-600">{c.id}</span>
                  <button
                    type="button"
                    className="text-[#2563EB] font-semibold text-left"
                  >
                    {c.name}
                  </button>
                  <span className="text-gray-500 text-xs">{c.phone}</span>
                  <span className="text-gray-600 text-xs">{c.area}</span>
                  <span className="text-gray-700 text-xs">{c.orders}</span>
                  <span className="text-gray-500 text-xs">{c.lastOrder}</span>
                  <div className="flex justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                        statusStyles[c.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 text-xs text-gray-500 border-t border-gray-100 gap-4">
              <span>Showing 1 to 5 of 48 customers</span>

              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  ‹
                </button>
                <button className="w-8 h-8 rounded-full bg-[#2563EB] text-white text-xs font-semibold flex items-center justify-center">
                  1
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-50">
                  2
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-50">
                  3
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
