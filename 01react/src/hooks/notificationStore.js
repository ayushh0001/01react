/**
 * notificationStore.js — Singleton SSE connection + shared state.
 * One EventSource for the whole app. All hook instances share state.
 */

const listeners    = new Set();
const orderListeners = new Set();

let notifications = (() => {
  try { return JSON.parse(localStorage.getItem('orderNotifications') || '[]'); } catch { return []; }
})();
let incomingOrder = null;
let unreadCount   = 0;
let es            = null;
let retryTimer    = null;
let started       = false;   // only connect once

function notify() {
  listeners.forEach(fn => fn());
}

function computeUnread() {
  const stored = parseInt(localStorage.getItem('notificationsReadAt') || '0', 10);
  unreadCount = notifications.filter(n => n.timestamp > stored).length;
}

function connect() {
  if (es) { es.close(); es = null; }
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }

  es = new EventSource('/api/v1/notifications/stream');

  es.addEventListener('new_order', (e) => {
    try {
      const order = JSON.parse(e.data);
      const notification = {
        id:           order.id || Date.now(),
        orderNumber:  order.orderNumber,
        customerName: order.customerName,
        totalAmount:  order.totalAmount,
        itemCount:    order.itemCount,
        items:        order.items || [],
        timestamp:    Date.now(),
      };
      notifications = [notification, ...notifications].slice(0, 50);
      localStorage.setItem('orderNotifications', JSON.stringify(notifications));
      incomingOrder = notification;
      computeUnread();
      notify();
      // Notify order-refresh subscribers (dashboard, orders page)
      orderListeners.forEach(fn => { try { fn(notification); } catch {} });
    } catch (err) {
      console.error('[SSE] parse error', err);
    }
  });

  es.onerror = () => {
    es.close();
    es = null;
    // Retry after 5s — don't call notify() on error to avoid re-render loops
    retryTimer = setTimeout(connect, 5000);
  };
}

/** Call once when the app mounts (from a top-level component, not module load) */
export function startSSE() {
  if (started) return;
  started = true;
  connect();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Subscribe to new-order events for auto-refresh. Returns unsubscribe fn. */
export function onNewOrder(fn) {
  orderListeners.add(fn);
  return () => orderListeners.delete(fn);
}

export function getSnapshot() {
  return { notifications, incomingOrder, unreadCount };
}

export function dismissIncoming() {
  incomingOrder = null;
  notify();
}

export function markAllRead() {
  localStorage.setItem('notificationsReadAt', Date.now().toString());
  computeUnread();
  notify();
}

export function clearAll() {
  notifications = [];
  localStorage.removeItem('orderNotifications');
  computeUnread();
  notify();
}
