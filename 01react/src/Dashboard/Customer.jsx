// src/Customer.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from "../utils/api";

const statusColors = {
  pending:    'bg-orange-100 text-orange-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-green-100 text-green-700',
  delivered:  'bg-green-200 text-green-800',
  cancelled:  'bg-red-100 text-red-600',
  returned:   'bg-red-100 text-red-600',
};

const statusStyles = {
  Active: "bg-green-50 text-green-600",
  New: "bg-blue-50 text-blue-600",
  Blocked: "bg-red-50 text-red-500",
};

// ── Customer Orders Modal ─────────────────────────────────────────────────────
function OrderCard({ order, fmt }) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  const addr = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address) : (order.shipping_address || {});

  const toggle = async () => {
    if (!expanded && items === null) {
      setLoadingItems(true);
      try {
        const res = await API.get(`/orders/${order.id}`);
        setItems(res.data.order?.items || []);
      } catch { setItems([]); }
      finally { setLoadingItems(false); }
    }
    setExpanded(v => !v);
  };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden transition hover:shadow-sm">
      {/* Summary row — always visible, click to expand */}
      <div className="p-4 cursor-pointer select-none" onClick={toggle}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{order.order_number}</p>
            <p className="text-xs text-gray-500">
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
              {order.status}
            </span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div><span className="text-gray-400 block">Items</span><span className="font-medium text-gray-800">{order.item_count}</span></div>
          <div><span className="text-gray-400 block">Total</span><span className="font-semibold text-gray-900">{fmt(order.final_amount || order.total_amount)}</span></div>
          <div><span className="text-gray-400 block">Payment</span><span className="font-medium text-gray-800 capitalize">{order.payment_method || '—'}</span></div>
        </div>

        {(addr.city || addr.state) && (
          <p className="text-xs text-gray-400 mt-2">
            📍 {[addr.address, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {/* Expanded item details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          {loadingItems ? (
            <p className="text-xs text-gray-400 text-center py-2">Loading items...</p>
          ) : items && items.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items Ordered</p>
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-gray-100">
                  {item.image && (
                    <img src={item.image} alt={item.product_name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {fmt(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                    {fmt(Number(item.price) * Number(item.quantity))}
                  </p>
                </div>
              ))}
              {/* Price breakdown */}
              <div className="pt-2 border-t border-gray-200 space-y-1">
                {Number(order.shipping_amount) > 0 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Shipping</span><span>{fmt(order.shipping_amount)}</span>
                  </div>
                )}
                {Number(order.tax_amount) > 0 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tax</span><span>{fmt(order.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                  <span>Total</span><span>{fmt(order.final_amount || order.total_amount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">No item details available</p>
          )}
        </div>
      )}
    </div>
  );
}

function CustomerModal({ customer, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/customer/${customer.id}/orders`)
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [customer.id]);

  const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>
            <p className="text-sm text-gray-500">{customer.phone} · {customer.orders} orders · {customer.totalSpent} spent</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Orders list */}
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order History</p>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No orders found</div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} fmt={fmt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Customer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
      {selectedCustomer && <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
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
              className="self-start sm:self-auto px-4 py-2 text-sm font-medium bg-brand hover:bg-brand text-black rounded-lg border border-brand disabled:opacity-50 disabled:cursor-wait transition"
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
                <div key={c.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition" onClick={() => setSelectedCustomer(c)}>
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
                    className="grid grid-cols-7 px-6 py-4 text-sm items-center border-b border-amber-100 last:border-b-0 hover:bg-orange-50/60 cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
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
