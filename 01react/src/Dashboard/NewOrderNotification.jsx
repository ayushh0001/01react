import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function NewOrderNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [newOrder, setNewOrder] = useState(null);
  const [lastCheckedOrderId, setLastCheckedOrderId] = useState(null);

  // Add test mode - check URL for test parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('testNotification') === 'true') {
      // Show test notification
      setNewOrder({
        id: 'test-123',
        order_number: 'ORD-TEST-8932',
        customer_name: 'Priya Sharma',
        total_amount: 3240,
        created_at: new Date().toISOString(),
        status: 'pending',
        shipping_address: { name: 'Priya Sharma' }
      });
      setShowNotification(true);
    }
  }, []);

  useEffect(() => {
    // Check for new orders every 10 seconds
    const interval = setInterval(() => {
      checkForNewOrders();
    }, 10000);

    // Initial check
    checkForNewOrders();

    return () => clearInterval(interval);
  }, [lastCheckedOrderId]);

  const checkForNewOrders = async () => {
    try {
      const response = await API.get('/orders/dashboard/stats');
      if (response.data.success && response.data.recent_orders?.length > 0) {
        const latestOrder = response.data.recent_orders[0];
        
        // Check if this is a new order we haven't seen before
        if (latestOrder.status === 'pending' && 
            (!lastCheckedOrderId || latestOrder.id !== lastCheckedOrderId)) {
          
          // Check if order is less than 1 minute old
          const orderTime = new Date(latestOrder.created_at);
          const now = new Date();
          const diffMinutes = (now - orderTime) / 1000 / 60;
          
          if (diffMinutes < 1) {
            setNewOrder(latestOrder);
            setShowNotification(true);
            setLastCheckedOrderId(latestOrder.id);
            
            // Play notification sound (optional)
            playNotificationSound();
          }
        }
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleAcceptOrder = async () => {
    try {
      await API.patch(`/orders/${newOrder.id}/status`, { status: 'confirmed' });
      setShowNotification(false);
      setNewOrder(null);
      // Reload page to show updated order
      window.location.reload();
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order');
    }
  };

  const handleViewDetails = () => {
    setShowNotification(false);
    // Navigate to orders page
    window.location.href = '/dashboard/orders';
  };

  const handleClose = () => {
    setShowNotification(false);
    setNewOrder(null);
  };

  if (!showNotification || !newOrder) return null;

  const customerName = newOrder.customer_name || newOrder.shipping_address?.name || 'Customer';
  const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div 
      className="fixed inset-0 z-[9999]" 
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="fixed top-4 right-4 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Incoming Alert</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">New Order Received!</h2>

          <div className="space-y-4 mb-6">
            {/* Order Detail Label */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order detail</span>
              <span className="text-sm font-medium text-gray-900">
                #{newOrder.order_number?.slice(-4) || 'N/A'}
              </span>
            </div>

            {/* Customer */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Customer</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">{initials}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{customerName}</span>
              </div>
            </div>

            {/* Order Amount */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order Amount</span>
              <span className="text-xl font-bold text-gray-900">
                ₹ {newOrder.total_amount?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAcceptOrder}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl transition-colors"
            >
              Accept Order
            </button>
            <button
              onClick={handleViewDetails}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
