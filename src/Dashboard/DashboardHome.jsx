// Import necessary React components and Chart.js library
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import axios from 'axios';

// Register Chart.js components for line chart functionality
Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip);

// Main DashboardHome component - displays business overview and analytics
export default function DashboardHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    avgOrderValue: 0,
    customerSatisfaction: 4.5,
    salesData: [12, 19, 3, 5, 2],
    orders: []
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch orders data
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
      const orders = ordersResponse.data.data || [];

      // Calculate metrics from orders
      const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

      setDashboardData({
        totalSales,
        avgOrderValue,
        customerSatisfaction: 4.5,
        salesData: [12, 19, 3, 5, 2], // Keep sample data for chart
        orders: orders.slice(0, 5) // Show latest 5 orders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  // Chart configuration for sales overview
  const chartData = {
    labels: ['June', 'July', 'August', 'September', 'October'],
    datasets: [{
      label: 'Sales',
      data: dashboardData.salesData,
      borderWidth: 2,
      borderColor: '#ffcf119b',
      backgroundColor: '#ffcf119b',
      tension: 0.5,
      fill: false,
      pointRadius: 4,
      pointBackgroundColor: '#ffcf119b'
    }]
  };

  // Chart display options
  const chartOptions = {
    plugins: { 
      legend: { display: false }  // Hide chart legend
    },
    scales: { 
      y: { beginAtZero: true }    // Start Y-axis from zero
    }
  };





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

      {/* Main dashboard content */}
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
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Dashboard
            </h1>
            <p className="mb-8 text-gray-600">
              Overview of your business performance
            </p>
          </div>
        </div>

        {/* Key metrics cards grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-10">
          
          {/* Total sales metric */}
          <div className="bg-yellow-100 rounded-xl p-4 lg:p-6 font-bold text-base lg:text-lg">
            <div>Total Sales</div>
            <div className="text-xl lg:text-2xl">
              {loading ? '...' : `₹ ${dashboardData.totalSales.toLocaleString()}`}
            </div>
          </div>
          
          {/* Average order value metric */}
          <div className="bg-yellow-100 rounded-xl p-4 lg:p-6 font-bold text-base lg:text-lg">
            <div>Average Order Value</div>
            <div className="text-xl lg:text-2xl">
              {loading ? '...' : `₹ ${Math.round(dashboardData.avgOrderValue).toLocaleString()}`}
            </div>
          </div>
          
          {/* Total orders metric */}
          <div className="bg-yellow-100 rounded-xl p-4 lg:p-6 font-bold text-base lg:text-lg">
            <div>Total Orders</div>
            <div className="text-xl lg:text-2xl">
              {loading ? '...' : dashboardData.orders.length}
            </div>
          </div>
          
          {/* Customer satisfaction metric */}
          <div className="bg-yellow-100 rounded-xl p-4 lg:p-6 font-bold text-base lg:text-lg">
            <div>Customer Satisfaction</div>
            <div className="text-xl lg:text-2xl">{dashboardData.customerSatisfaction}/5</div>
          </div>
          
        </div>

        {/* Recent orders table section */}
        <div className="mb-6 lg:mb-8">
          <h2 className="font-bold text-lg lg:text-xl mb-4">
            Latest Orders
          </h2>
          
          {/* Mobile card view */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl p-4 text-center">Loading orders...</div>
            ) : dashboardData.orders.length > 0 ? (
              dashboardData.orders.map((order, index) => (
                <div key={order._id || index} className="bg-yellow-50 rounded-xl p-4 shadow border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">#{order.orderNumber || order._id?.slice(-4) || `100${index + 1}`}</h3>
                      <p className="text-sm text-gray-600">{order.customerName || order.shippingAddress?.name || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-600' :
                      order.status?.toLowerCase() === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-semibold">₹{order.totalAmount || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-4 text-center text-gray-500">No orders found</div>
            )}
          </div>
          
          {/* Desktop table view */}
          <div className="hidden lg:block overflow-x-auto bg-yellow-50 rounded-xl shadow border">
            <table className="min-w-full text-left">
              
              {/* Table header */}
              <thead>
                <tr className="bg-yellow-200">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Order Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total Amount</th>
                </tr>
              </thead>
              
              {/* Table body with API order data */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center">Loading orders...</td>
                  </tr>
                ) : dashboardData.orders.length > 0 ? (
                  dashboardData.orders.map((order, index) => {
                    const statusColors = {
                      'shipped': 'text-blue-600',
                      'processing': 'text-yellow-700',
                      'delivered': 'text-green-700',
                      'cancelled': 'text-red-700',
                      'pending': 'text-orange-600'
                    };
                    
                    return (
                      <tr key={order._id || index}>
                        <td className="p-3">#{order.orderNumber || order._id?.slice(-4) || `100${index + 1}`}</td>
                        <td className="p-3">{order.customerName || order.shippingAddress?.name || 'N/A'}</td>
                        <td className="p-3">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className={`p-3 ${statusColors[order.status?.toLowerCase()] || 'text-gray-600'}`}>
                          {order.status || 'Pending'}
                        </td>
                        <td className="p-3">₹{order.totalAmount || 0}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-500">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales analytics section */}
        <div>
          <h2 className="font-bold text-lg lg:text-xl mb-2">
            Sales Overview
          </h2>
          <p className="text-gray-500 mb-4">
            Insights into your sales performance
          </p>
          
          {/* Sales chart container */}
          <div className="bg-white rounded-xl py-4 lg:py-6 px-4 lg:px-8 mb-6 lg:mb-8 shadow border">
            
            {/* Chart header information */}
            <div className="font-bold text-base lg:text-lg mb-2 text-left">
              Sale Over Time
            </div>
            <div className="text-xl lg:text-2xl font-bold mb-2 text-left">
              {loading ? '...' : `₹${dashboardData.totalSales.toLocaleString()}`}
            </div>
            <p className="text-green-700 font-semibold text-left mb-4">
              Last 30 days +10%
            </p>
            
            {/* Line chart display area */}
            <div className="h-64 lg:h-96 w-full bg-yellow-100 rounded p-2 lg:p-4 flex items-center">
              <Line
                data={chartData}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false  // Allow chart to fill container
                }}
                height={300}  // Set chart height
              />
            </div>
            
          </div>
        </div>
        
      </main>
    </div>
  );
}
