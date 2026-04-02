import { useEffect } from 'react';
import OrderNotificationPopup from './OrderNotificationPopup';
import { startSSE } from '../hooks/notificationStore.js';

export default function DashboardLayout({ children }) {
  useEffect(() => {
    // Start the singleton SSE connection once when any dashboard page mounts
    startSSE();
  }, []);

  return (
    <>
      {/* Always-mounted popup — survives page navigation */}
      <OrderNotificationPopup />
      {children}
    </>
  );
}
