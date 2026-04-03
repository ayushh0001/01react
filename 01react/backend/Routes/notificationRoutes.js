import express from 'express';
import { addClient, removeClient, broadcastNewOrder } from '../utils/sseManager.js';
import { pool } from '../config/database.js';

const router = express.Router();
const INTERNAL_SECRET = process.env.INTERNAL_NOTIFY_SECRET || 'zpin-internal-secret';

// ── SSE stream ────────────────────────────────────────────────────────────────
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

// ── New order notification ────────────────────────────────────────────────────
router.post('/new-order', async (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== INTERNAL_SECRET) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const { id, orderNumber, customerName, totalAmount, itemCount, items, productIds } = req.body;
  if (!orderNumber) {
    return res.status(400).json({ success: false, error: 'Invalid order payload' });
  }

  // vendorOrderId = UUID in vendor `orders` table — used by Accept Order button
  let vendorOrderId = null;

  try {
    let sellerId = null;

    // Only try UUID cast if productIds look like UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUuidProductIds = (productIds || []).filter(pid => uuidRegex.test(pid));

    if (validUuidProductIds.length > 0) {
      const r = await pool.query(
        `SELECT user_id FROM products WHERE id = ANY($1::uuid[]) LIMIT 1`,
        [validUuidProductIds]
      );
      sellerId = r.rows[0]?.user_id;
    }
    if (!sellerId) {
      const r = await pool.query(
        `SELECT id FROM users WHERE user_role = 'seller' AND email = 'ayushkumarsingh8595@gmail.com' LIMIT 1`
      );
      sellerId = r.rows[0]?.id;
    }
    if (!sellerId) {
      const r = await pool.query(
        `SELECT id FROM users WHERE user_role = 'seller' ORDER BY created_at DESC LIMIT 1`
      );
      sellerId = r.rows[0]?.id;
    }

    if (sellerId) {
      const shippingAddress = JSON.stringify({ name: customerName });
      const orderResult = await pool.query(
        `INSERT INTO orders
          (order_number, user_id, seller_id, status, payment_status,
           total_amount, shipping_amount, tax_amount, final_amount,
           shipping_address, payment_method)
         VALUES ($1, $2, $3, 'pending', 'pending', $4, 0, 0, $4, $5, 'cod')
         ON CONFLICT (order_number) DO NOTHING
         RETURNING id`,
        [orderNumber, sellerId, sellerId, totalAmount, shippingAddress]
      );

      if (orderResult.rows.length > 0) {
        vendorOrderId = orderResult.rows[0].id;
        const perItem = (totalAmount / (items?.length || 1)).toFixed(2);
        for (const productName of (items || [])) {
          await pool.query(
            `INSERT INTO order_items (order_id, product_name, quantity, price) VALUES ($1, $2, 1, $3)`,
            [vendorOrderId, productName, perItem]
          );
        }
        console.log(`[Notify] Order ${orderNumber} inserted, vendor id: ${vendorOrderId}`);
      } else {
        // Already exists — fetch the vendor order UUID
        const existing = await pool.query(
          `SELECT id FROM orders WHERE order_number = $1 LIMIT 1`, [orderNumber]
        );
        vendorOrderId = existing.rows[0]?.id || null;
      }
    }
  } catch (err) {
    console.error('[Notify] DB insert error:', err.message);
  }

  // Only broadcast if we have a valid vendor UUID — otherwise the Accept button will 500
  if (!vendorOrderId) {
    console.warn(`[Notify] Could not resolve vendor UUID for order ${orderNumber}, skipping broadcast`);
    return res.json({ success: false, error: 'Could not create vendor order record' });
  }

  // Broadcast with vendorOrderId so Accept Order button patches the right row
  broadcastNewOrder({ id: vendorOrderId, orderNumber, customerName, totalAmount, itemCount, items });
  res.json({ success: true });
});

export default router;
