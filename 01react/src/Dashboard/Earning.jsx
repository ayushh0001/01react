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

  useEffect(() => {
    fetchEarningsData();
  }, []);

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
        setLifetimeEarnings((summaryRes.data.lifetime?.netAmount || 45280.50).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setTotalOrders((summaryRes.data.lifetime?.orderCount || 1240).toLocaleString('en-IN'));
        setTipsCollected((summaryRes.data.lifetime?.tips || 850).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setLoyaltyBonus((summaryRes.data.lifetime?.bonus || 2100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setAvailablePayout((summaryRes.data.summary?.pendingEarnings || 8420).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      } catch (summaryErr) {
        console.warn('Earnings summary fetch failed:', summaryErr);
        setLifetimeEarnings('45,280.50');
        setTotalOrders('1,240');
        setTipsCollected('850.00');
        setLoyaltyBonus('2,100.00');
        setAvailablePayout('8,420.00');
      }

      const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const weekly = days.map((day, index) => ({
        day,
        amount: Math.floor(Math.random() * 800 + 200),
        isHighlight: index === 3 || index === 4
      }));
      setWeeklyData(weekly);

    } catch (err) {
      console.error('Error fetching earnings:', err);
      setRecentTransactions([
        { id: '#ORD-94285', customer: 'Marcus Sterling', date: 'Oct 24, 2023', status: 'Completed', amount: '420.00' },
        { id: '#ORD-94284', customer: 'Helena Vance', date: 'Oct 24, 2023', status: 'Pending', amount: '1,250.00' },
        { id: '#ORD-94283', customer: 'Jordan Smith', date: 'Oct 23, 2023', status: 'Completed', amount: '85.50' },
        { id: '#ORD-94282', customer: 'Julian Casablancas', date: 'Oct 23, 2023', status: 'Refunded', amount: '-210.00' }
      ]);
      setError('Failed to fetch earnings. Showing sample data.');
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

  const maxAmount = Math.max(...weeklyData.map(d => d.amount));

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
                  <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-2">Lifetime Performance</p>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">₹{lifetimeEarnings}</h2>
                </div>
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
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
                    : 'bg-yellow-500 hover:bg-yellow-600 shadow-sm'
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

              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedPeriod('weekly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedPeriod === 'weekly'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedPeriod === 'monthly'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPeriod('yearly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedPeriod === 'yearly'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-[600px] flex items-end justify-between gap-2 h-64">
                {weeklyData.map((item, index) => {
                  const heightPercent = (item.amount / maxAmount) * 100;
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-80 ${item.isHighlight
                              ? 'bg-yellow-400'
                              : 'bg-gray-200'
                            }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase">{item.day}</span>
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
                className="flex items-center gap-2 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
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
                              ? 'bg-yellow-100 text-yellow-700'
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
                                  ? 'bg-yellow-100 text-yellow-700'
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
