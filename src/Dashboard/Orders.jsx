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
      <Sidebar />
      
      {/* Main orders content */}
      <main className="flex-1 p-8">
        
        {/* Page header */}
        <h1 className="text-3xl font-bold mb-6">
          Orders
        </h1>

        {/* Status filter buttons */}
        <div className="flex space-x-3 mb-4">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded transition border ${
                filter === status 
                  ? 'bg-yellow-400 border-yellow-500 text-white font-bold'  // Active filter styling
                  : 'bg-white border-gray-300 text-gray-700'                // Inactive filter styling
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow border">
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
