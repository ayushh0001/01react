/**
 * OrderNotificationPopup
 * Always-mounted SSE popup — survives page navigation.
 * Matches the "INCOMING ALERT" design with Accept Order + View Details.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import API from '../utils/api';

const fmt   = (n) => `₹ ${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const inits = (name = '') => name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

// Two rising tones — played on successful accept
function playConfirmSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[600, 0], [900, 0.18]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.35);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
  } catch {}
}

export default function OrderNotificationPopup() {
  const navigate = useNavigate();
  const { incomingOrder, dismissIncoming } = useOrderNotifications();
  const [accepting, setAccepting] = useState(false);

  // Play sound when popup appears
  if (incomingOrder) playBeep();

  if (!incomingOrder) return null;

  const customerName = incomingOrder.customerName || 'Customer';

  const handleAccept = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      if (incomingOrder.id) {
        await API.patch(`/orders/${incomingOrder.id}/status`, { status: 'confirmed' });
      }
      playConfirmSound();
    } catch {
      // Accept failed silently — seller can accept from the Orders page
    } finally {
      setAccepting(false);
      dismissIncoming();
      navigate('/dashboard/orders');
    }
  };

  const handleViewDetails = () => {
    dismissIncoming();
    navigate('/dashboard/orders');
  };

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="fixed top-4 right-4 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Incoming Alert</span>
          </div>
          <button onClick={dismissIncoming} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">New Order Received!</h2>

          <div className="space-y-4 mb-6">
            {/* Order number */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order detail</span>
              <span className="text-sm font-medium text-gray-900">
                #{incomingOrder.orderNumber?.slice(-6) || 'N/A'}
              </span>
            </div>

            {/* Customer */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Customer</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-900"
                  style={{ background: '#FF9800' }}>
                  {inits(customerName)}
                </div>
                <span className="text-sm font-medium text-gray-900">{customerName}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order Amount</span>
              <span className="text-xl font-bold text-gray-900">{fmt(incomingOrder.totalAmount)}</span>
            </div>
          </div>

          {/* Items — one pill per product with size */}
          {incomingOrder.items?.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {incomingOrder.items.slice(0, 4).map((item, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold text-yellow-800"
                  style={{ background: '#FFF8E1', border: '1px solid #FFE082' }}>
                  {item}
                </span>
              ))}
              {incomingOrder.items.length > 4 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-500"
                  style={{ background: '#f3f4f6' }}>
                  +{incomingOrder.items.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 font-semibold rounded-xl transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FFB300, #FF9800)', color: '#1a1a00' }}
            >
              {accepting ? 'Accepting…' : 'Accept Order'}
            </button>
            <button
              onClick={handleViewDetails}
              className="w-full py-3 font-medium rounded-xl transition-colors text-gray-700"
              style={{ background: '#f3f4f6' }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16,1,0.3,1); }
      `}</style>
    </div>
  );
}
