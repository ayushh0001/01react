import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import API from '../utils/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart, LineElement, BarElement, PointElement, LineController, BarController,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
} from 'chart.js';

Chart.register(LineElement, BarElement, PointElement, LineController, BarController, CategoryScale, LinearScale, Tooltip, Legend, Filler);

const PERIODS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/orders/dashboard/stats'),
      API.get('/orders/seller/orders'),
    ]).then(([statsRes, ordersRes]) => {
      const stats = statsRes.data.stats || {};
      const salesOverTime = statsRes.data.sales_over_time || [];
      const orders = ordersRes.data.orders || [];

      // Filter by period
      const cutoff = Date.now() - period * 86400000;
      const filtered = orders.filter(o => new Date(o.created_at).getTime() > cutoff);

      // Status breakdown
      const statusCount = {};
      filtered.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });

      // Revenue by day (last period)
      const revenueMap = {};
      salesOverTime.slice(-period).forEach(d => {
        const label = new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        revenueMap[label] = (revenueMap[label] || 0) + parseFloat(d.daily_revenue || 0);
      });

      // Top products
      const productMap = {};
      filtered.forEach(o => {
        (o.items || []).forEach(item => {
          const name = item.product_name || 'Unknown';
          productMap[name] = (productMap[name] || 0) + (item.quantity || 1);
        });
      });
      const topProducts = Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      setData({
        stats,
        revenueLabels: Object.keys(revenueMap),
        revenueValues: Object.values(revenueMap),
        statusCount,
        topProducts,
        totalRevenue: filtered.reduce((s, o) => s + parseFloat(o.final_amount || o.total_amount || 0), 0),
        totalOrders: filtered.length,
        avgOrderValue: filtered.length > 0
          ? filtered.reduce((s, o) => s + parseFloat(o.final_amount || o.total_amount || 0), 0) / filtered.length
          : 0,
        deliveredCount: filtered.filter(o => o.status === 'delivered').length,
        cancelledCount: filtered.filter(o => o.status === 'cancelled').length,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, [period]);

  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const STATUS_COLORS = {
    pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#06b6d4', delivered: '#10b981', cancelled: '#ef4444', returned: '#f97316',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar />
      </div>
      {sidebarOpen && <div className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0 overflow-x-hidden p-4 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-white shadow-sm border">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold">Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">Detailed performance insights</p>
          </div>
          {/* Period selector */}
          <div className="flex gap-2">
            {PERIODS.map(p => (
              <button key={p.days} onClick={() => setPeriod(p.days)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${period === p.days ? 'text-black' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                style={period === p.days ? { background: '#FF9800' } : {}}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">Loading analytics...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: `Revenue (${period}d)`, value: fmt(data.totalRevenue), color: 'from-green-50 to-green-100 border-green-200', textColor: 'text-green-900', subColor: 'text-green-600' },
                { label: `Orders (${period}d)`, value: data.totalOrders, color: 'from-blue-50 to-blue-100 border-blue-200', textColor: 'text-blue-900', subColor: 'text-blue-600' },
                { label: 'Avg Order Value', value: fmt(data.avgOrderValue), color: 'from-purple-50 to-purple-100 border-purple-200', textColor: 'text-purple-900', subColor: 'text-purple-600' },
                { label: 'Delivered', value: data.deliveredCount, color: 'from-orange-50 to-orange-100 border-orange-200', textColor: 'text-orange-900', subColor: 'text-orange-600' },
              ].map((card, i) => (
                <div key={i} className={`bg-gradient-to-br ${card.color} border rounded-2xl p-5 shadow-sm`}>
                  <div className={`text-sm font-medium mb-1 ${card.subColor}`}>{card.label}</div>
                  <div className={`text-2xl lg:text-3xl font-bold ${card.textColor}`}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            {data.revenueLabels.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-1">Revenue Trend</h3>
                <p className="text-xs text-gray-400 mb-4">Last {period} days</p>
                <Line
                  data={{
                    labels: data.revenueLabels,
                    datasets: [{
                      label: 'Revenue',
                      data: data.revenueValues,
                      borderColor: '#FF9800',
                      backgroundColor: 'rgba(255,152,0,0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 4,
                      pointBackgroundColor: '#FF9800',
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `₹${ctx.parsed.y.toLocaleString()}` } } },
                    scales: { y: { beginAtZero: true, ticks: { callback: v => `₹${Number(v).toLocaleString()}` } }, x: { grid: { display: false } } },
                    interaction: { mode: 'index', intersect: false },
                  }}
                  height={80}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Order Status Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Order Status Breakdown</h3>
                {Object.keys(data.statusCount).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No orders in this period</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(data.statusCount).map(([status, count]) => {
                      const total = Object.values(data.statusCount).reduce((a, b) => a + b, 0);
                      const pct = ((count / total) * 100).toFixed(1);
                      return (
                        <div key={status}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 capitalize">{status}</span>
                            <span className="text-gray-500">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] || '#9ca3af' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Top Products by Units Sold</h3>
                {data.topProducts.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No product data</p>
                ) : (
                  <div className="space-y-3">
                    {data.topProducts.map(([name, qty], i) => {
                      const maxQty = data.topProducts[0][1];
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 truncate max-w-[200px]">{name}</span>
                            <span className="text-gray-500 ml-2">{qty} sold</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(qty / maxQty) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Delivery vs Cancellation */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Delivery Performance</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Delivered', value: data.deliveredCount, color: '#10b981' },
                  { label: 'Cancelled', value: data.cancelledCount, color: '#ef4444' },
                  { label: 'Delivery Rate', value: data.totalOrders > 0 ? `${((data.deliveredCount / data.totalOrders) * 100).toFixed(1)}%` : '—', color: '#FF9800' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
