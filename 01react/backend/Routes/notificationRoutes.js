import express from 'express';
import { addClient, removeClient, broadcastNewOrder } from '../utils/sseManager.js';
import { pool } from '../config/database.js';

const router = express.Router();

const INTERNAL_SECRET = process.env.INTERNAL_NOTIFY_SECRET || 'zpin-internal-secret';

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000);
  addClient(res);
  req.on('close', () => { clearInterval(heartbeat); removeClient(res); });
});

/**
 * POST /api/v1/notifications/new-order
 * Called by zpin-website backend after order creation.
 * 1. Inserts the order into the vendor Render DB so it appears in Orders/Dashboard
 * 2. Broadcasts SSE event to all connected vendor dashboard clients
 */
router.post('/new-order', async (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== INTERNAL_SECRET) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const { id, orderNumber, customerName, totalAmount, itemCount, items } = req.body;
  if (!orderNumber) {
    return res.status(400).json({ success: false, error: 'Invalid order payload' });
  }

  try {
    // ── Find the seller — use the verified seller account ────────────────
    const sellerResult = await pool.query(
      `SELECT id FROM users WHERE user_role = 'seller' AND email = 'ayushkumarsingh8595@gmail.com' LIMIT 1`
    );
    // Fallback to any seller if email not found
    const fallback = sellerResult.rows.length === 0
      ? await pool.query(`SELECT id FROM users WHERE user_role = 'seller' ORDER BY created_at DESC LIMIT 1`)
      : sellerResult;
    const sellerId = fallback.rows[0]?.id;

    if (sellerId) {
      const shippingAddress = JSON.stringify({ name: customerName });
      const orderResult = await pool.query(
        `INSERT INTO orders
          (order_number, user_id, seller_id, status, payment_status,
           total_amount, shipping_amount, tax_amount, final_amount,
           shipping_address, payment_method)
         VALUES ($1,$2,$2,'pending','pending',$3,0,0,$3,$4,'cod')
         ON CONFLICT (order_number) DO NOTHING
         RETURNING id`,
        [orderNumber, sellerId, totalAmount, shippingAddress]
      );

      if (orderResult.rows.length > 0) {
        const orderId = orderResult.rows[0].id;
        const perItem = (totalAmount / (items?.length || 1)).toFixed(2);
        for (const productName of (items || [])) {
          await pool.query(
            `INSERT INTO order_items (order_id, product_name, quantity, price)
             VALUES ($1, $2, 1, $3)`,
            [orderId, productName, perItem]
          );
        }
        console.log(`[Notify] Order ${orderNumber} inserted into vendor DB`);
      }
    }
  } catch (err) {
    console.error('[Notify] DB insert error:', err.message);
  }

  // Always broadcast SSE regardless of DB result
  broadcastNewOrder({ id, orderNumber, customerName, totalAmount, itemCount, items });
  res.json({ success: true });
});

export default router;
