import React, { useState } from 'react';
import Sidebar from './Sidebar';

const initialOrders = [
  { number: '#12345', date: '2023-08-15', customer: 'Ava Bennett', items: 2, total: 150, status: 'Pending' },
  { number: '#12346', date: '2023-08-14', customer: 'Owen Carter', items: 3, total: 220, status: 'Processing' },
  { number: '#12347', date: '2023-08-13', customer: 'Chloe Davis', items: 1, total: 80, status: 'Shipped' },
  { number: '#12348', date: '2023-08-12', customer: 'Ethan Foster', items: 2, total: 180, status: 'Delivered' },
  { number: '#12349', date: '2023-08-11', customer: 'Mia Green', items: 4, total: 300, status: 'Cancelled' }
];

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-green-100 text-green-800',
  Delivered: 'bg-green-200 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {
  const [filter, setFilter] = useState('All');

  const filteredOrders = filter === 'All'
    ? initialOrders
    : initialOrders.filter(order => order.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>

        {/* Status filters */}
        <div className="flex space-x-3 mb-4">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded transition border ${filter === status ? 'bg-yellow-400 border-yellow-500 text-white font-bold' : 'bg-white border-gray-300 text-gray-700'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <table className="min-w-full text-left">
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
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.number}>
                  <td className="p-3">{order.number}</td>
                  <td className="p-3">{order.date}</td>
                  <td className="p-3">{order.customer}</td>
                  <td className="p-3">{order.items}</td>
                  <td className="p-3">₹{order.total}.00</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={6}>No orders found for this status.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
