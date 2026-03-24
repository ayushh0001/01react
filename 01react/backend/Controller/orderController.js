import { pool } from '../config/database.js';

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
        o.estimated_delivery,
        o.created_at,
        o.updated_at,
        u.name as customer_name,
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

    // Get order details
    const orderQuery = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        s.name as seller_name,
        s.email as seller_email,
        s.phone as seller_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users s ON o.seller_id = s.id
      WHERE o.id = $1 AND (o.user_id = $2 OR o.seller_id = $2)
    `;

    const orderResult = await pool.query(orderQuery, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        p.product_name as current_product_name,
        p.price as current_price
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;

    const itemsResult = await pool.query(itemsQuery, [orderId]);

    const order = {
      ...orderResult.rows[0],
      shipping_address: typeof orderResult.rows[0].shipping_address === 'string'
        ? JSON.parse(orderResult.rows[0].shipping_address)
        : orderResult.rows[0].shipping_address,
      items: itemsResult.rows
    };

    res.json({
      success: true,
      order
    });

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

    // Get recent orders
    const recentOrdersQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.final_amount as total_amount,
        o.shipping_address,
        o.created_at,
        u.name as customer_name,
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

    // Get sales over time (last 30 days)
    const salesOverTimeQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(final_amount) as daily_revenue
      FROM orders
      WHERE seller_id = $1 
        AND created_at >= NOW() - INTERVAL '30 days'
        AND payment_status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
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
        avg_order_value: parseFloat(statsResult.rows[0].avg_order_value) || 0
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

    // Verify order belongs to seller
    const verifyQuery = 'SELECT id FROM orders WHERE id = $1 AND seller_id = $2';
    const verifyResult = await pool.query(verifyQuery, [orderId, userId]);

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or unauthorized'
      });
    }

    // Update order status
    const updateQuery = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [status, orderId]);

    // Add to status history
    const historyQuery = `
      INSERT INTO order_status_history (order_id, status, note)
      VALUES ($1, $2, $3)
    `;

    await pool.query(historyQuery, [orderId, status, note || null]);

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
