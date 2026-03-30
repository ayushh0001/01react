/**
 * SSE Manager — keeps track of all connected vendor dashboard clients.
 * When a new order arrives from the website, we broadcast it to every
 * connected client so the notification bell lights up instantly.
 */

const clients = new Set();

/**
 * Register a new SSE response object.
 * Call this when a vendor opens the dashboard and connects to /stream.
 */
export function addClient(res) {
  clients.add(res);
}

/**
 * Remove a client when they disconnect.
 */
export function removeClient(res) {
  clients.delete(res);
}

/**
 * Push a new-order event to every connected vendor client.
 * @param {object} order  - { id, orderNumber, customerName, totalAmount, items }
 */
export function broadcastNewOrder(order) {
  const payload = JSON.stringify(order);
  for (const res of clients) {
    try {
      res.write(`event: new_order\ndata: ${payload}\n\n`);
    } catch {
      clients.delete(res);
    }
  }
  console.log(`[SSE] Broadcasted new_order to ${clients.size} client(s)`);
}
