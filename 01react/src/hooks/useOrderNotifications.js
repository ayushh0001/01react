import { useState, useEffect, useRef, useCallback } from 'react';

const VENDOR_BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useOrderNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('orderNotifications') || '[]');
    } catch {
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  // The latest incoming order — shown in the popup modal
  const [incomingOrder, setIncomingOrder] = useState(null);
  const esRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('orderNotifications', JSON.stringify(notifications.slice(0, 50)));
    const stored = parseInt(localStorage.getItem('notificationsReadAt') || '0', 10);
    setUnreadCount(notifications.filter(n => n.timestamp > stored).length);
  }, [notifications]);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();
    const es = new EventSource(`${VENDOR_BACKEND}/api/v1/notifications/stream`);
    esRef.current = es;

    es.addEventListener('new_order', (e) => {
      try {
        const order = JSON.parse(e.data);
        const notification = {
          id: order.id || Date.now(),
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalAmount: order.totalAmount,
          itemCount: order.itemCount,
          items: order.items || [],
          timestamp: Date.now(),
        };
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        // Trigger the popup modal
        setIncomingOrder(notification);
      } catch (err) {
        console.error('[SSE] Failed to parse order event', err);
      }
    });

    es.onerror = () => { es.close(); setTimeout(connect, 5000); };
  }, []);

  useEffect(() => {
    connect();
    return () => esRef.current?.close();
  }, [connect]);

  const markAllRead = useCallback(() => {
    localStorage.setItem('notificationsReadAt', Date.now().toString());
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('orderNotifications');
    setUnreadCount(0);
  }, []);

  const dismissIncoming = useCallback(() => setIncomingOrder(null), []);

  return { notifications, unreadCount, markAllRead, clearAll, incomingOrder, dismissIncoming };
}
