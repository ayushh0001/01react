import express from 'express';
import { addClient, removeClient, broadcastNewOrder } from '../utils/sseManager.js';

const router = express.Router();

// Internal secret so only the website backend can call /notify
const INTERNAL_SECRET = process.env.INTERNAL_NOTIFY_SECRET || 'zpin-internal-secret';

/**
 * GET /api/v1/notifications/stream
 * Vendor dashboard connects here to receive real-time order events via SSE.
 * No auth required — the vendor is already authenticated in the browser session.
 */
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send a heartbeat every 25s to keep the connection alive through proxies
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  addClient(res);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(res);
  });
});

/**
 * POST /api/v1/notifications/new-order
 * Called by the zpin-website backend after a successful order creation.
 * Protected by a shared internal secret header.
 */
router.post('/new-order', (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== INTERNAL_SECRET) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const order = req.body;
  if (!order || !order.orderNumber) {
    return res.status(400).json({ success: false, error: 'Invalid order payload' });
  }

  broadcastNewOrder(order);
  res.json({ success: true });
});

export default router;
