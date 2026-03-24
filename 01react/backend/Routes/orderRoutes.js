import express from 'express';
import { 
  getSellerOrders, 
  getCustomerOrders, 
  getOrderById,
  getSellerDashboardStats,
  updateOrderStatus
} from '../Controller/orderController.js';
import { authenticateToken } from '../Middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard statistics (seller)
router.get('/dashboard/stats', getSellerDashboardStats);

// Get orders based on user role
router.get('/seller/orders', getSellerOrders);
router.get('/customer/orders', getCustomerOrders);

// Backward compatibility - tries seller first, then customer
router.get('/orders', async (req, res, next) => {
  try {
    // Try to get seller orders first
    const sellerQuery = `
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE seller_id = $1
    `;
    const result = await pool.query(sellerQuery, [req.user.id]);
    
    if (parseInt(result.rows[0].count) > 0) {
      // User has seller orders
      return getSellerOrders(req, res);
    } else {
      // Try customer orders
      return getCustomerOrders(req, res);
    }
  } catch (error) {
    console.error('Error in /orders route:', error);
    // Default to seller orders on error (since this is a seller platform)
    return getSellerOrders(req, res);
  }
});

// Get single order details
router.get('/:orderId', getOrderById);

// Update order status (seller only)
router.patch('/:orderId/status', updateOrderStatus);

export default router;
