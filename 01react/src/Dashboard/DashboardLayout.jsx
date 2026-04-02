import OrderNotificationPopup from './OrderNotificationPopup';

export default function DashboardLayout({ children }) {
  return (
    <>
      {/* Always-mounted SSE popup — survives page navigation */}
      <OrderNotificationPopup />
      {children}
    </>
  );
}
