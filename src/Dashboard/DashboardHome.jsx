import React from 'react';
import Sidebar from './Sidebar';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip } from 'chart.js';

// Register Chart.js components
Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip);


export default function DashboardHome() {



 // Chart data and options
  const chartData = {
    labels: ['June', 'July', 'August', 'September', 'October'],
    datasets: [{
      label: '# of Votes',
      data: [12, 19, 3, 5, 2],
      borderWidth: 2,
      borderColor: '#ffcf119b',
      backgroundColor: '#ffcf119b',
      tension: 0.5,
      fill: false,
      pointRadius: 4,
      pointBackgroundColor: '#ffcf119b'
    }]
  };

  const chartOptions = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };





  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />


    

      <main className="flex-1 p-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="mb-8 text-gray-600">Overview of your business performance</p>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-yellow-100 rounded-xl p-6 font-bold text-lg">
            <div>Total Sales</div>
            <div className="text-2xl">₹ 10,000</div>
          </div>
          <div className="bg-yellow-100 rounded-xl p-6 font-bold text-lg">
            <div>Average Order Value</div>
            <div className="text-2xl">₹ 2,500</div>
          </div>
          <div className="bg-yellow-100 rounded-xl p-6 font-bold text-lg">
            <div>Average Order Value</div>
            <div className="text-2xl">₹ 2,500</div>
          </div>
          <div className="bg-yellow-100 rounded-xl p-6 font-bold text-lg">
            <div>Customer Satisfaction</div>
            <div className="text-2xl">4.5/5</div>
          </div>
        </div>

        {/* Sales Overview */}
        <div>
          <h2 className="font-bold text-xl mb-2">Sales Overview</h2>
          <p className="text-gray-500 mb-4">Insights into your sales performance</p>
          {/* Sales chart placeholder */}
         <div className="bg-white rounded-xl py-6 px-8 mb-8 shadow border" style={{ marginLeft: '0.5rem' /* or use ml-2 */ }}>
  <div className="font-bold text-lg mb-2 text-left">Sale Over Time</div>
  <div className="text-2xl font-bold mb-2 text-left">₹10,000</div>
  <p className="text-green-700 font-semibold text-left">Last 30 days +10%</p>
<div className="h-96 w-full bg-yellow-100 rounded p-4 flex items-center">
  <Line
    data={chartData}
    options={{
      ...chartOptions,
      maintainAspectRatio: false // makes chart fill the div
    }}
    height={300} // increases the chart height
  />
</div>

</div>
        </div>

        {/* Latest Orders Table */}
        <div>
          <h2 className="font-bold text-xl mb-4">Latest Orders</h2>
          <div className="overflow-x-auto bg-yellow-50 rounded-xl shadow border">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-yellow-200">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Order Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3">#1001</td>
                  <td className="p-3">Liam Harper</td>
                  <td className="p-3">5-08-2025</td>
                  <td className="p-3 text-blue-600">Shipped</td>
                  <td className="p-3">150</td>
                </tr>
                <tr>
                  <td className="p-3">#1002</td>
                  <td className="p-3">Olivia Bennett</td>
                  <td className="p-3">4-08-2025</td>
                  <td className="p-3 text-yellow-700">Processing</td>
                  <td className="p-3">200</td>
                </tr>
                <tr>
                  <td className="p-3">#1003</td>
                  <td className="p-3">Noah Carter</td>
                  <td className="p-3">4-08-2025</td>
                  <td className="p-3 text-green-700">Delivered</td>
                  <td className="p-3">100</td>
                </tr>
                <tr>
                  <td className="p-3">#1004</td>
                  <td className="p-3">Emma Hayes</td>
                  <td className="p-3">4-08-2025</td>
                  <td className="p-3 text-blue-600">Shipped</td>
                  <td className="p-3">300</td>
                </tr>
                <tr>
                  <td className="p-3">#1005</td>
                  <td className="p-3">Ethan Foster</td>
                  <td className="p-3">4-08-2025</td>
                  <td className="p-3 text-red-700">Cancelled</td>
                  <td className="p-3">50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
