import { pool } from '../config/database.js';
import { generateId } from '../utils/generateId.js';

/**
 * Get all orders for a seller
 * Returns orders where the seller_id matches the authenticated user
 */
export const getSellerOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    console.log(`[Orders] Fetching orders for seller: ${userId}`);

    const query = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.total_amount,
        o.shipping_amount,
        o.tax_amount,
        o.final_amount,
        o.shipping_address,
        o.payment_method,
        (o.estimated_delivery AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS estimated_delivery,
        o.created_at::timestamptz AS created_at,
        (o.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS updated_at,
        COALESCE(NULLIF(o.shipping_address->>'name',''), u.name, 'Customer') as customer_name,
        u.email as customer_email,
        u.mobile as customer_phone,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.seller_id = $1
      GROUP BY o.id, u.name, u.email, u.mobile
      ORDER BY o.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    console.log(`[Orders] Found ${result.rows.length} orders`);

    // Parse shipping_address JSON
    const orders = result.rows.map(order => ({
      ...order,
      shipping_address: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address
    }));

    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('[Orders] Error fetching seller orders:', error);
    console.error('[Orders] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

/**
 * Get all orders for a customer
 * Returns orders where the user_id matches the authenticated user
 */
export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.total_amount,
        o.shipping_amount,
        o.tax_amount,
        o.final_amount,
        o.shipping_address,
        o.payment_method,
        o.estimated_delivery,
        o.created_at,
        o.updated_at,
        s.name as seller_name,
        s.email as seller_email,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users s ON o.seller_id = s.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, s.name, s.email
      ORDER BY o.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    // Parse shipping_address JSON
    const orders = result.rows.map(order => ({
      ...order,
      shipping_address: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address
    }));

    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

/**
 * Get single order details by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(orderId);

    // Support lookup by UUID id or order_number
    const orderQuery = isUuid
      ? `SELECT o.*,
           COALESCE(NULLIF(o.shipping_address->>'name',''), u.name, 'Customer') as customer_name,
           u.email as customer_email, u.mobile as customer_phone,
           s.name as seller_name, s.email as seller_email, s.mobile as seller_phone
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         LEFT JOIN users s ON o.seller_id = s.id
         WHERE o.id = $1 AND (o.user_id = $2 OR o.seller_id = $2)`
      : `SELECT o.*,
           COALESCE(NULLIF(o.shipping_address->>'name',''), u.name, 'Customer') as customer_name,
           u.email as customer_email, u.mobile as customer_phone,
           s.name as seller_name, s.email as seller_email, s.mobile as seller_phone
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         LEFT JOIN users s ON o.seller_id = s.id
         WHERE o.order_number = $1 AND (o.user_id = $2 OR o.seller_id = $2)`;

    const orderResult = await pool.query(orderQuery, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const realId = orderResult.rows[0].id;

    const itemsResult = await pool.query(
      `SELECT oi.*, p.product_name as current_product_name, p.price as current_price
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [realId]
    );

    const order = {
      ...orderResult.rows[0],
      shipping_address: typeof orderResult.rows[0].shipping_address === 'string'
        ? JSON.parse(orderResult.rows[0].shipping_address)
        : orderResult.rows[0].shipping_address,
      items: itemsResult.rows
    };

    res.json({ success: true, order });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details',
      message: error.message
    });
  }
};

/**
 * Get dashboard statistics for seller
 */
export const getSellerDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    console.log(`[Dashboard] Fetching stats for seller: ${userId}`);

    // Get order statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN payment_status = 'paid' THEN final_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN payment_status = 'paid' THEN final_amount ELSE NULL END) as avg_order_value
      FROM orders
      WHERE seller_id = $1
    `;

    const statsResult = await pool.query(statsQuery, [userId]);

    // Get total products count for this seller
    const productsResult = await pool.query(
      'SELECT COUNT(*) as total_products FROM products WHERE user_id = $1',
      [userId]
    );

    // Get recent orders
    const recentOrdersQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.final_amount as total_amount,
        o.shipping_address,
        (o.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS created_at,
        COALESCE(NULLIF(o.shipping_address->>'name',''), u.name, 'Customer') as customer_name,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.seller_id = $1
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
      LIMIT 5
    `;

    const recentOrdersResult = await pool.query(recentOrdersQuery, [userId]);

    // Get sales over time (last 30 days) — fill every day even if no orders
    const salesOverTimeQuery = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS date
      )
      SELECT 
        ds.date,
        COALESCE(COUNT(o.id), 0) as order_count,
        COALESCE(SUM(o.final_amount), 0) as daily_revenue
      FROM date_series ds
      LEFT JOIN orders o 
        ON DATE(o.created_at) = ds.date
        AND o.seller_id = $1
        AND o.payment_status = 'paid'
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `;

    const salesOverTimeResult = await pool.query(salesOverTimeQuery, [userId]);

    // Parse shipping addresses
    const recentOrders = recentOrdersResult.rows.map(order => ({
      ...order,
      shipping_address: typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address
    }));

    console.log(`[Dashboard] Stats: ${statsResult.rows[0].total_orders} orders, Revenue: ${statsResult.rows[0].total_revenue}`);

    res.json({
      success: true,
      stats: {
        total_orders: parseInt(statsResult.rows[0].total_orders) || 0,
        delivered_orders: parseInt(statsResult.rows[0].delivered_orders) || 0,
        pending_orders: parseInt(statsResult.rows[0].pending_orders) || 0,
        cancelled_orders: parseInt(statsResult.rows[0].cancelled_orders) || 0,
        total_revenue: parseFloat(statsResult.rows[0].total_revenue) || 0,
        avg_order_value: parseFloat(statsResult.rows[0].avg_order_value) || 0,
        total_products: parseInt(productsResult.rows[0].total_products) || 0,
      },
      recent_orders: recentOrders,
      sales_over_time: salesOverTimeResult.rows
    });

  } catch (error) {
    console.error('[Dashboard] Error fetching stats:', error);
    console.error('[Dashboard] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
};

/**
 * Update order status (seller only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    const userId = req.user.id;

    // orderId may be a UUID (id) or an order_number string — handle both
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(orderId);

    // Verify order belongs to seller — look up by id (UUID) or order_number
    const verifyQuery = isUuid
      ? 'SELECT id FROM orders WHERE id = $1 AND seller_id = $2'
      : 'SELECT id FROM orders WHERE order_number = $1 AND seller_id = $2';

    const verifyResult = await pool.query(verifyQuery, [orderId, userId]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or unauthorized'
      });
    }

    // Always use the real UUID id for subsequent queries
    const realId = verifyResult.rows[0].id;

    // Update order status
    const updateResult = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = NOW() AT TIME ZONE 'Asia/Kolkata'
       WHERE id = $2
       RETURNING *`,
      [status, realId]
    );

    // Add to status history
    try {
      await pool.query(
        `INSERT INTO order_status_history (id, order_id, status, note, created_at)
         VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'Asia/Kolkata')`,
        [generateId(), realId, status, note || null]
      );
    } catch (historyErr) {
      console.warn('[Orders] Could not insert status history:', historyErr.message);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      message: error.message
    });
  }
};
