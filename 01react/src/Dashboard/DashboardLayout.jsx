import NewOrderNotification from './NewOrderNotification';

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <NewOrderNotification />
    </>
  );
}
