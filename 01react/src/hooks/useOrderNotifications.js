import { useState, useEffect, useCallback } from 'react';
import * as store from './notificationStore.js';

/**
 * All instances of this hook share the same singleton SSE connection and state.
 * Setting incomingOrder in one place (the SSE event) triggers re-renders everywhere.
 */
export function useOrderNotifications() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Subscribe to store changes — any update re-renders this component
    const unsub = store.subscribe(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  const { notifications, incomingOrder, unreadCount } = store.getSnapshot();

  return {
    notifications,
    incomingOrder,
    unreadCount,
    dismissIncoming: useCallback(() => store.dismissIncoming(), []),
    markAllRead:     useCallback(() => store.markAllRead(), []),
    clearAll:        useCallback(() => store.clearAll(), []),
  };
}
