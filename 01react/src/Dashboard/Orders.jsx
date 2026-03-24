// Import necessary React hooks and components
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import API from '../utils/api';

// Status color mapping - defines styling for different order statuses
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-red-100 text-red-800'
};

// Available status filters - includes 'All' option
const statuses = ['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

// Main Orders component - displays and manages order list
export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 9;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Direct call to seller orders endpoint
      const response = await API.get('/orders/seller/orders');
      
      console.log('Orders API Response:', response.data);
      
      const ordersData = response.data.orders || [];

      const transformedOrders = ordersData.map(order => ({
        id: order.id,
        number: order.order_number,
        date: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A',
        dateTime: order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', ', ') : 'N/A',
        customer: order.customer_name || order.shipping_address?.name || 'N/A',
        items: parseInt(order.item_count) || 0,
        total: parseFloat(order.final_amount || order.total_amount || 0),
        status: order.status || 'pending',
        shipping_address: order.shipping_address
      }));

      console.log('Transformed Orders:', transformedOrders);
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      // Don't set error message, just keep empty orders array
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      await API.patch(`/orders/${orderId}/status`, { status: 'confirmed' });
      fetchOrders(); // Refresh data
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
      fetchOrders(); // Refresh data
    } catch (error) {
      console.error('Error marking order as ready:', error);
      alert('Failed to mark order as ready');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Separate active orders (pending, confirmed, processing) from history
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'processing'].includes(order.status?.toLowerCase())
  );

  // Filter orders for history based on selected filter
  const filteredHistoryOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status?.toLowerCase() === filter.toLowerCase());

  // Calculate pagination
  const totalPages = Math.ceil(filteredHistoryOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const historyOrders = filteredHistoryOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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

        {/* Active Orders Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Active Orders</h2>
            <span className="text-sm text-gray-500">{activeOrders.length} active</span>
          </div>

          {/* Desktop table view for Active Orders */}
          <div className="hidden lg:block overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
            <table className="min-w-full text-left">
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
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">Loading orders...</td>
                  </tr>
                ) : activeOrders.length > 0 ? (
                  activeOrders.map((order, index) => {
                    const customerName = order.customer;
                    const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const colors = ['bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600'];
                    const colorClass = colors[index % colors.length];
                    
                    const statusMap = {
                      'pending': { label: 'New', class: 'bg-blue-100 text-blue-600' },
                      'confirmed': { label: 'Processing', class: 'bg-yellow-100 text-yellow-700' },
                      'processing': { label: 'Accepted', class: 'bg-green-100 text-green-700' }
                    };
                    
                    const status = statusMap[order.status?.toLowerCase()] || { label: order.status || 'New', class: 'bg-gray-100 text-gray-600' };

                    return (
                      <tr key={order.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">#{order.number?.slice(-4) || order.id?.slice(-4)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-xs font-semibold`}>
                              {initials}
                            </div>
                            <span className="text-gray-900">{customerName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">{order.dateTime}</td>
                        <td className="p-4 font-semibold text-gray-900">₹ {order.total?.toLocaleString('en-IN') || '0'}</td>
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

          {/* Mobile card view for Active Orders */}
          <div className="lg:hidden space-y-4 mb-8">
            {loading ? (
              <div className="bg-white rounded-xl p-4 text-center">Loading orders...</div>
            ) : activeOrders.length > 0 ? (
              activeOrders.map((order, index) => {
                const customerName = order.customer;
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
                        <h3 className="font-semibold text-gray-900">#{order.number?.slice(-4)}</h3>
                        <p className="text-sm text-gray-600">{customerName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{order.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-semibold">₹{order.total?.toLocaleString('en-IN') || '0'}</span>
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

        {/* Order History Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Order History</h2>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mb-4 bg-white p-2 rounded-lg border border-gray-200">
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition text-sm font-medium capitalize ${
                  filter === status
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Desktop table view for Order History */}
          <div className="hidden lg:block overflow-hidden bg-white rounded-xl shadow border border-gray-200">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-gray-700 font-semibold text-sm">Order Number</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Date</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Customer</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Items</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Total</th>
                  <th className="p-4 text-gray-700 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-4 text-center" colSpan={6}>
                      Loading orders...
                    </td>
                  </tr>
                ) : historyOrders.length > 0 ? (
                  historyOrders.map((order, index) => (
                    <tr key={order.number || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-gray-900">{order.number}</td>
                      <td className="p-4 text-gray-600">{order.date}</td>
                      <td className="p-4 text-gray-900">{order.customer}</td>
                      <td className="p-4 text-gray-600">{order.items}</td>
                      <td className="p-4 text-gray-900 font-semibold">₹{order.total?.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-gray-500 text-center" colSpan={6}>
                      {filter === 'all' ? 'No orders found.' : `No orders found for status: ${filter}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {!loading && filteredHistoryOrders.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredHistoryOrders.length)} of {filteredHistoryOrders.length} orders
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile card view for Order History */}
          <div className="lg:hidden">
            <div className="space-y-4 mb-4">
              {loading ? (
                <div className="bg-white rounded-xl p-4 text-center">Loading orders...</div>
              ) : historyOrders.length > 0 ? (
                historyOrders.map((order, index) => (
                  <div key={order.number || index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{order.number}</h3>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
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
                        <span className="font-semibold">₹{order.total?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-4 text-center text-gray-500">
                  {filter === 'all' ? 'No orders found.' : `No orders found for status: ${filter}`}
                </div>
              )}
            </div>

            {/* Mobile Pagination Controls */}
            {!loading && filteredHistoryOrders.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-600 text-center mb-3">
                  Page {currentPage} of {totalPages} ({filteredHistoryOrders.length} orders)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
