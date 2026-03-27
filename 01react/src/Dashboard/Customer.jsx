// src/Customer.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from "../utils/api"; // shared axios instance — auth interceptor + withCredentials

const statusStyles = {
  Active: "bg-green-50 text-green-600",
  New: "bg-blue-50 text-blue-600",
  Blocked: "bg-red-50 text-red-500",
};

// Derive a display status from the user object fields
const deriveStatus = (user) => {
  if (user.isBlocked || user.status === 'blocked') return 'Blocked';
  if (user.isVerified || user.isActive) return 'Active';
  return 'New';
};

export default function Customer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      // Correct endpoint: GET /api/v1/customers
      const res = await API.get('/users/customers');
      const allUsers = res.data.data || [];

      const mapped = allUsers.map((u) => ({
        id: u.id,
        name: u.name || u.user_name || 'N/A',
        phone: u.mobile ? `+91 ••••••${String(u.mobile).slice(-4)}` : 'N/A',
        area: '—',
        orders: u.total_orders || 0,
        totalSpent: u.total_spent ? `₹${Number(u.total_spent).toLocaleString('en-IN')}` : '₹0',
        lastOrder: u.last_order_date
          ? new Date(u.last_order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
        status: !u.is_active ? 'Blocked' : u.is_verified ? 'Active' : 'New',
      }));

      setCustomers(mapped);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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

            {/* Refresh button */}
            <button
              onClick={fetchCustomers}
              disabled={loading}
              className="self-start sm:self-auto px-4 py-2 text-sm font-medium bg-amber-400 hover:bg-amber-500 text-black rounded-lg border border-amber-300 disabled:opacity-50 disabled:cursor-wait transition"
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-300 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* ── MOBILE card view ── */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl p-4 text-center text-amber-700 border border-amber-200">
                Loading customers...
              </div>
            ) : customers.length > 0 ? (
              customers.map((c) => (
                <div key={c.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-xs text-gray-400">{String(c.id).slice(-6)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[c.status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-700">{c.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Orders:</span>
                      <span className="text-gray-700">{c.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Spent:</span>
                      <span className="font-semibold text-gray-900">{c.totalSpent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Order:</span>
                      <span className="text-gray-700">{c.lastOrder}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-4 text-center text-gray-500 border border-amber-200">
                No customers found.
              </div>
            )}
          </div>

          {/* ── DESKTOP table view ── */}
          <div className="hidden lg:block bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm overflow-hidden">

            {/* Header row */}
            <div className="grid grid-cols-7 px-6 py-3 text-[11px] font-bold text-black bg-white border-b border-amber-200">
              <span>CUSTOMER ID</span>
              <span>NAME</span>
              <span>PHONE</span>
              <span>TOTAL SPENT</span>
              <span>ORDERS</span>
              <span>LAST ORDER</span>
              <span className="text-right">STATUS</span>
            </div>

            {/* Rows */}
            <div>
              {loading ? (
                <div className="px-6 py-8 text-center text-amber-700 text-sm">
                  Loading customers...
                </div>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-7 px-6 py-4 text-sm items-center border-b border-amber-100 last:border-b-0 hover:bg-amber-50/60"
                  >
                    <span className="text-gray-600 font-mono text-xs">{String(c.id).slice(-6)}</span>
                    <span className="text-blue-600 font-semibold">{c.name}</span>
                    <span className="text-gray-500 text-xs">{c.phone}</span>
                    <span className="text-gray-700 text-xs font-semibold">{c.totalSpent}</span>
                    <span className="text-gray-700 text-xs">{c.orders}</span>
                    <span className="text-gray-500 text-xs">{c.lastOrder}</span>
                    <div className="flex justify-end">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-medium ${statusStyles[c.status] || 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  No customers found.
                </div>
              )}
            </div>

            {/* Footer / count */}
            <div className="flex items-center justify-between px-6 py-4 text-xs font-bold text-black bg-white border-t border-amber-200">
              <span>
                {loading ? 'Loading...' : `Showing ${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
