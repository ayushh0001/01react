import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import Sidebar from './Sidebar';

export default function Earning() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [lifetimeEarnings, setLifetimeEarnings] = useState('0');
  const [totalOrders, setTotalOrders] = useState('0');
  const [tipsCollected, setTipsCollected] = useState('0');
  const [loyaltyBonus, setLoyaltyBonus] = useState('0');
  const [availablePayout, setAvailablePayout] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [chartVisible, setChartVisible] = useState(true);
  const [displayPeriod, setDisplayPeriod] = useState('weekly');

  useEffect(() => {
    fetchEarningsData();
  }, []);

  // Grow animation: collapse bars → swap data → grow bars back up
  useEffect(() => {
    if (selectedPeriod === displayPeriod) return;
    setChartVisible(false);
    const timer = setTimeout(() => {
      setDisplayPeriod(selectedPeriod);
      requestAnimationFrame(() => setChartVisible(true));
    }, 350);
    return () => clearTimeout(timer);
  }, [selectedPeriod, displayPeriod]);

  const fetchEarningsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const transactionsRes = await API.get('/users/sellers/earnings', {
        params: { limit: 10, period: 'week' }
      });

      const transactions = transactionsRes.data.earnings?.map(earning => ({
        id: earning.orderNumber || earning.id || `ORD-${Math.random().toString(36).substr(2, 9)}`,
        customer: earning.customerName || 'Customer',
        date: earning.createdAt ? new Date(earning.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2023',
        status: earning.status?.charAt(0).toUpperCase() + earning.status?.slice(1) || 'Completed',
        amount: parseFloat(earning.netAmount || earning.grossAmount || 0).toFixed(2)
      })) || [];

      setRecentTransactions(transactions);

      try {
        const summaryRes = await API.get('/users/sellers/earnings/summary', {
          params: { period: 'all' }
        });
        const lifetime = summaryRes.data.lifetime || {};
        const summary  = summaryRes.data.summary  || {};
        const fmt = v => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setLifetimeEarnings(fmt(lifetime.netAmount));
        setTotalOrders(Number(lifetime.orderCount || 0).toLocaleString('en-IN'));
        setTipsCollected(fmt(lifetime.tips));
        setLoyaltyBonus(fmt(lifetime.bonus));
        setAvailablePayout(fmt(summary.pendingEarnings));
      } catch (summaryErr) {
        console.warn('Earnings summary fetch failed:', summaryErr);
        // Zero out everything — don't show fake data
        setLifetimeEarnings('0.00');
        setTotalOrders('0');
        setTipsCollected('0.00');
        setLoyaltyBonus('0.00');
        setAvailablePayout('0.00');
      }

      // Chart: fetch real daily sales from dashboard stats
      try {
        const statsRes = await API.get('/orders/dashboard/stats');
        const salesOverTime = statsRes.data.sales_over_time || [];

        if (salesOverTime.length > 0) {
          const chartData = salesOverTime.map(row => ({
            day: new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            amount: parseFloat(row.daily_revenue || 0),
            isHighlight: false,
          }));
          // Highlight the max bar
          const maxIdx = chartData.reduce((mi, d, i, arr) => d.amount > arr[mi].amount ? i : mi, 0);
          if (chartData[maxIdx]?.amount > 0) chartData[maxIdx].isHighlight = true;
          setWeeklyData(chartData);
        } else {
          // No data — show last 7 days as empty
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            days.push({ day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), amount: 0, isHighlight: false });
          }
          setWeeklyData(days);
        }
      } catch {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          days.push({ day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), amount: 0, isHighlight: false });
        }
        setWeeklyData(days);
      }

    } catch (err) {
      console.error('Error fetching earnings:', err);
      setRecentTransactions([]);
      setLifetimeEarnings('0.00');
      setTotalOrders('0');
      setTipsCollected('0.00');
      setLoyaltyBonus('0.00');
      setAvailablePayout('0.00');
      setWeeklyData(['MON','TUE','WED','THU','FRI','SAT','SUN'].map(day => ({ day, amount: 0, isHighlight: false })));
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawing) return;

    const amount = parseFloat(availablePayout.replace(/,/g, ''));
    if (amount === 0) {
      alert('No funds available for withdrawal');
      return;
    }

    setWithdrawing(true);
    try {
      await API.post('/users/sellers/payouts/request', { amount });
      alert('✅ Payout requested successfully! Funds will be transferred within 2-3 business days.');
      fetchEarningsData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert('❌ Payout failed: ' + errorMsg);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-yellow-500 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading earnings...</p>
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...weeklyData.map(d => d.amount), 1); // min 1 to avoid divide-by-zero

  // Slice data based on selected period (use displayPeriod for animated swap)
  const displayData = displayPeriod === 'weekly'
    ? weeklyData.slice(-7)
    : displayPeriod === 'monthly'
    ? weeklyData.slice(-30)
    : weeklyData; // yearly = all available

  const displayMax = Math.max(...displayData.map(d => d.amount), 1);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-white shadow-sm border">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">

            {/* Lifetime Performance Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Lifetime Performance</p>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">₹{lifetimeEarnings}</h2>
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-brand">₹</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Orders</p>
                  <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 5% vs last month</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tips Collected</p>
                  <p className="text-xl font-bold text-gray-900">₹{tipsCollected}</p>
                  <p className="text-xs text-gray-500 mt-1">Completed with avg</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Loyalty Bonus</p>
                  <p className="text-xl font-bold text-gray-900">₹{loyaltyBonus}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% earned</p>
                </div>
              </div>
            </div>

            {/* Available for Payout Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available for Payout</p>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">₹{availablePayout}</h2>
                <p className="text-sm text-gray-500">Cleared and ready to be withdrawn to your business account.</p>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={withdrawing || parseFloat(availablePayout.replace(/,/g, '')) === 0}
                className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${withdrawing || parseFloat(availablePayout.replace(/,/g, '')) === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-brand hover:bg-yellow-600 shadow-sm'
                  }`}
              >
                {withdrawing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Withdraw Funds
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Daily Breakdown */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Daily Breakdown</h2>
                <p className="text-sm text-gray-500">Earnings performance for the current billing cycle.</p>
              </div>

              <div className="relative flex bg-gray-100 rounded-xl p-1" style={{ minWidth: '180px' }}>
                {/* Sliding pill indicator */}
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    bottom: '4px',
                    left: selectedPeriod === 'weekly' ? '4px' : '50%',
                    width: 'calc(50% - 4px)',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                <button
                  onClick={() => setSelectedPeriod('weekly')}
                  className="relative z-10 flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  style={{ color: selectedPeriod === 'weekly' ? '#111827' : '#6B7280' }}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className="relative z-10 flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  style={{ color: selectedPeriod === 'monthly' ? '#111827' : '#6B7280' }}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide rounded-xl border border-gray-100">
              <div className="flex items-end gap-1 px-2 pb-4 pt-2"
                style={{ width: '100%', height: '260px', alignItems: 'flex-end' }}>
                {displayData.map((item, idx) => {
                  const heightPercent = displayMax > 1 ? Math.max((item.amount / displayMax) * 100, item.amount > 0 ? 4 : 2) : 2;
                  return (
                    <div key={`${displayPeriod}-${item.day}-${idx}`} className="flex flex-col items-center gap-1" style={{ flex: '1', minWidth: 0 }}>
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                        {item.amount > 0 && (
                          <span
                            className="text-[8px] text-gray-500 mb-0.5 font-medium text-center leading-tight"
                            style={{
                              opacity: chartVisible ? 1 : 0,
                              transition: `opacity 0.4s ease ${idx * 50 + 300}ms`,
                            }}
                          >
                            ₹{Number(item.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        )}
                        <div
                          title={`${item.day}: ₹${Number(item.amount).toLocaleString('en-IN')}`}
                          className={`w-full rounded-t-lg hover:opacity-80 ${item.isHighlight ? 'bg-brand' : 'bg-gray-200'}`}
                          style={{
                            height: chartVisible ? `${heightPercent}%` : '0%',
                            transition: chartVisible
                              ? `height 0.7s cubic-bezier(0.22, 1.2, 0.36, 1) ${idx * 50}ms`
                              : 'height 0.3s cubic-bezier(0.4, 0, 1, 1)',
                          }}
                        />
                      </div>
                      <span className="text-[8px] font-medium text-gray-500 text-center leading-tight whitespace-nowrap">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Recent Transactions</h2>
                <p className="text-sm text-gray-500">Your most recent sales and payouts.</p>
              </div>

              <button
                onClick={fetchEarningsData}
                className="flex items-center gap-2 text-sm font-semibold text-brand hover:text-yellow-700 transition-colors"
              >
                <span>SEE ALL TRANSACTIONS</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No transactions yet</p>
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="lg:hidden space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{tx.id}</p>
                          <p className="text-sm text-gray-500">{tx.customer}</p>
                        </div>
                        <span className={`text-lg font-bold ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-gray-900'
                          }`}>
                          ₹{tx.amount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{tx.date}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'Pending'
                              ? 'bg-orange-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                          {tx.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-700">{tx.id}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-900">{tx.customer}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-500">{tx.date}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${tx.status === 'Completed'
                                ? 'bg-green-100 text-green-700'
                                : tx.status === 'Pending'
                                  ? 'bg-orange-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                              {tx.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-bold ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-gray-900'
                              }`}>
                              ₹{tx.amount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
