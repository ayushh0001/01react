// Import necessary React hooks and components
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';

// Status color mapping - defines styling for different order statuses
const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',      // Yellow for pending orders
  Processing: 'bg-blue-100 text-blue-800',      // Blue for processing orders
  Shipped: 'bg-green-100 text-green-800',       // Green for shipped orders
  Delivered: 'bg-green-200 text-green-800',     // Darker green for delivered orders
  Cancelled: 'bg-red-100 text-red-800'          // Red for cancelled orders
};

// Available status filters - includes 'All' option
const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// Main Orders component - displays and manages order list
export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}/orders`, { headers });
      const ordersData = response.data.data || [];
      
      // Transform API data to match component structure
      const transformedOrders = ordersData.map(order => ({
        number: order.orderNumber || `#${order._id?.slice(-6)}`,
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
        customer: order.shippingAddress?.name || order.customerName || 'N/A',
        items: order.items?.length || 0,
        total: order.totalAmount || 0,
        status: order.status || 'Pending'
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on selected status
  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(order => order.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar navigation */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar />
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main orders content */}
      <main className="flex-1 p-4 lg:p-8">
        
        {/* Page header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-white shadow-sm border"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Orders
          </h1>
        </div>

        {/* Status filter buttons */}
        <div className="flex flex-wrap gap-2 lg:gap-3 mb-4">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 lg:px-4 py-2 rounded transition border text-sm lg:text-base ${
                filter === status 
                  ? 'bg-yellow-400 border-yellow-500 text-white font-bold'  // Active filter styling
                  : 'bg-white border-gray-300 text-gray-700'                // Inactive filter styling
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Mobile card view */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl p-4 text-center">Loading orders...</div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <div key={order.number || index} className="bg-white rounded-xl p-4 shadow border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{order.number}</h3>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span>{order.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Items:</span>
                    <span>{order.items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-semibold">₹{order.total}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-4 text-center text-gray-500">
              {filter === 'All' ? 'No orders found.' : `No orders found for status: ${filter}`}
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow border">
          <table className="min-w-full text-left">
            
            {/* Table header */}
            <thead>
              <tr className="bg-yellow-200">
                <th className="p-3">Order Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            
            {/* Table body with filtered orders */}
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-3 text-center" colSpan={6}>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={order.number || index}>
                    <td className="p-3">{order.number}</td>
                    <td className="p-3">{order.date}</td>
                    <td className="p-3">{order.customer}</td>
                    <td className="p-3">{order.items}</td>
                    <td className="p-3">₹{order.total}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-500 text-center" colSpan={6}>
                    {filter === 'All' ? 'No orders found.' : `No orders found for status: ${filter}`}
                  </td>
                </tr>
              )}
            </tbody>
            
          </table>
        </div>
        
      </main>
    </div>
  );
}
