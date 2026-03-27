// Import necessary React components and Chart.js library
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import API from '../utils/api';

// Register Chart.js components for line chart functionality
Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip);

// Main DashboardHome component - displays business overview and analytics
export default function DashboardHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    avgOrderValue: 0,
    totalOrders: 0,
    totalProducts: 0,
    chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    salesData: [0, 0, 0, 0, 0, 0, 0],
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchSellerProfile();
    fetchAllOrders();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      await API.patch(`/orders/${orderId}/status`, { status: 'confirmed' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleMarkAsReady = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      await API.patch(`/orders/${orderId}/status`, { status: 'processing' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error marking order as ready:', error);
      alert('Failed to mark order as ready');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const fetchSellerProfile = async () => {
    try {
      const response = await API.get('/users/seller/profile');
      if (response.data.success) {
        const name = response.data.data.user.name || response.data.data.user.user_name || 'Seller';
        setSellerName(name);
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      setSellerName('Seller');
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await API.get('/orders');
      if (response.data.success) {
        setAllOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching all orders:', error);
      setAllOrders([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics from backend
      const response = await API.get('/orders/dashboard/stats');
      
      if (response.data.success) {
        const { stats, recent_orders, sales_over_time } = response.data;

        // Prepare chart data from sales_over_time
        let chartLabels = [];
        let chartValues = [];

        if (sales_over_time && sales_over_time.length > 0) {
          chartLabels = sales_over_time.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          chartValues = sales_over_time.map(item => parseFloat(item.daily_revenue) || 0);
        } else {
          // Default chart data if no sales
          chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          chartValues = [0, 0, 0, 0, 0, 0, 0];
        }

        setDashboardData({
          totalSales: stats.total_revenue || 0,
          avgOrderValue: stats.avg_order_value || 0,
          totalOrders: stats.delivered_orders || 0,
          totalProducts: stats.total_products || 0,
          chartLabels,
          salesData: chartValues,
          orders: recent_orders || []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Response:', error.response?.data);
      // Keep default zero values — dashboard still renders cleanly
      setDashboardData({
        totalSales: 0,
        avgOrderValue: 0,
        totalOrders: 0,
        totalProducts: 0,
        chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        salesData: [0, 0, 0, 0, 0, 0, 0],
        orders: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart configuration for sales overview
  const chartData = {
    labels: dashboardData.chartLabels || ['June', 'July', 'August', 'September', 'October'],
    datasets: [{
      label: 'Sales',
      data: dashboardData.salesData,
      borderWidth: 3,
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointBackgroundColor: '#8B5CF6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#8B5CF6',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3
    }]
  };

  // Chart display options
  const chartOptions = {
    plugins: {
      legend: { display: false },  // Hide chart legend
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleColor: '#fff',
        bodyColor: '#fff',
        displayColors: false,
        callbacks: {
          label: function(context) {
            return '₹' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
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
              Welcome back, {sellerName || 'Seller'}
            </h1>
            <p className="text-gray-600">
              Here&apos;s a summary of your business performance today.
            </p>
          </div>
        </div>

        {/* Key metrics cards grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-10">

          {/* Total sales metric */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <text x="4" y="18" fontSize="16" fontFamily="sans-serif" fill="white" stroke="none">₹</text>
                </svg>
              </div>
            </div>
            <div className="text-blue-600 text-sm font-medium mb-1">Total Sales</div>
            <div className="text-2xl lg:text-3xl font-bold text-blue-900">
              {loading ? '...' : `₹${Number(dashboardData.totalSales).toLocaleString('en-IN')}`}
            </div>
          </div>

          {/* Average order value metric */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-purple-600 text-sm font-medium mb-1">Average Order Value</div>
            <div className="text-2xl lg:text-3xl font-bold text-purple-900">
              {loading ? '...' : `₹${Math.round(dashboardData.avgOrderValue).toLocaleString('en-IN')}`}
            </div>
          </div>

          {/* Total orders metric */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-green-600 text-sm font-medium mb-1">Total Orders Delivered</div>
            <div className="text-2xl lg:text-3xl font-bold text-green-900">
              {loading ? '...' : dashboardData.totalOrders}
            </div>
          </div>

          {/* Total products metric */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
            </div>
            <div className="text-orange-600 text-sm font-medium mb-1">Total Products</div>
            <div className="text-2xl lg:text-3xl font-bold text-orange-900">
              {loading ? '...' : dashboardData.totalProducts}
            </div>
          </div>

        </div>


        {/* Recent orders table section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg lg:text-xl">
              Active Orders
            </h2>
            <button 
              onClick={() => window.location.href = '/dashboard/orders'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all orders
            </button>
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full text-left">

              {/* Table header */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-gray-700 font-semibold text-sm">Order ID</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Customer</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Date</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Amount</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Status</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Actions</th>
                </tr>
              </thead>

              {/* Table body with API order data */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">Loading orders...</td>
                  </tr>
                ) : dashboardData.orders.length > 0 ? (
                  dashboardData.orders.slice(0, 5).map((order, index) => {
                    const customerName = order.customer_name || order.shipping_address?.name || 'Customer';
                    const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const colors = ['bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600'];
                    const colorClass = colors[index % colors.length];
                    
                    const statusMap = {
                      'pending': { label: 'New', class: 'bg-blue-100 text-blue-600' },
                      'confirmed': { label: 'Processing', class: 'bg-yellow-100 text-yellow-700' },
                      'processing': { label: 'Accepted', class: 'bg-green-100 text-green-700' },
                      'shipped': { label: 'Shipped', class: 'bg-purple-100 text-purple-700' },
                      'delivered': { label: 'Delivered', class: 'bg-green-100 text-green-700' }
                    };
                    
                    const status = statusMap[order.status?.toLowerCase()] || { label: order.status || 'New', class: 'bg-gray-100 text-gray-600' };

                    return (
                      <tr key={order.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">#{order.order_number?.slice(-4) || order.id?.slice(-4)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-xs font-semibold`}>
                              {initials}
                            </div>
                            <span className="text-gray-900">{customerName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }).replace(',', ', ') : 'N/A'}
                        </td>
                        <td className="p-4 font-semibold text-gray-900">₹ {order.total_amount?.toLocaleString('en-IN') || 0}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {order.status?.toLowerCase() === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAcceptOrder(order.id)}
                                  disabled={updatingOrder === order.id}
                                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold rounded-lg transition disabled:opacity-50"
                                >
                                  Accept Order
                                </button>
                                <button
                                  onClick={() => handleMarkAsReady(order.id)}
                                  disabled={updatingOrder === order.id}
                                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition disabled:opacity-50"
                                >
                                  Mark as Ready
                                </button>
                              </>
                            )}
                            {order.status?.toLowerCase() === 'confirmed' && (
                              <>
                                <button
                                  disabled
                                  className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg cursor-not-allowed"
                                >
                                  Accepted
                                </button>
                                <button
                                  onClick={() => handleMarkAsReady(order.id)}
                                  disabled={updatingOrder === order.id}
                                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                                >
                                  Mark as Ready
                                </button>
                              </>
                            )}
                            {order.status?.toLowerCase() === 'processing' && (
                              <button
                                disabled
                                className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg cursor-not-allowed"
                              >
                                Accepted
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No active orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl p-4 text-center">Loading orders...</div>
            ) : dashboardData.orders.length > 0 ? (
              dashboardData.orders.slice(0, 5).map((order, index) => {
                const customerName = order.customer_name || order.shipping_address?.name || 'Customer';
                const statusMap = {
                  'pending': { label: 'New', class: 'bg-blue-100 text-blue-600' },
                  'confirmed': { label: 'Processing', class: 'bg-yellow-100 text-yellow-700' },
                  'processing': { label: 'Accepted', class: 'bg-green-100 text-green-700' }
                };
                const status = statusMap[order.status?.toLowerCase()] || { label: order.status || 'New', class: 'bg-gray-100 text-gray-600' };

                return (
                  <div key={order.id || index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">#{order.order_number?.slice(-4)}</h3>
                        <p className="text-sm text-gray-600">{customerName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-semibold">₹{order.total_amount?.toLocaleString('en-IN') || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {order.status?.toLowerCase() === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            disabled={updatingOrder === order.id}
                            className="flex-1 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold rounded-lg transition disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleMarkAsReady(order.id)}
                            disabled={updatingOrder === order.id}
                            className="flex-1 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition disabled:opacity-50"
                          >
                            Mark Ready
                          </button>
                        </>
                      )}
                      {order.status?.toLowerCase() === 'confirmed' && (
                        <button
                          onClick={() => handleMarkAsReady(order.id)}
                          disabled={updatingOrder === order.id}
                          className="w-full px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          Mark as Ready
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-4 text-center text-gray-500">No active orders found</div>
            )}
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
          <div className="bg-white rounded-2xl py-6 lg:py-8 px-6 lg:px-8 shadow-lg border border-gray-200">

            {/* Chart header information */}
            <div className="mb-6">
              <div className="text-gray-600 text-sm font-medium mb-1">
                Sale Over Time
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900">
                {loading ? '...' : `₹${dashboardData.totalSales.toLocaleString()}`}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-green-700 font-semibold text-sm">+10% from last 30 days</span>
              </div>
            </div>

            {/* Line chart display area */}
            <div className="h-64 lg:h-96 w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 lg:p-6 flex items-center border border-blue-100">
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
