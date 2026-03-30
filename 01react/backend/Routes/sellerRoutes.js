import express from 'express';
import {
  saveBusinessDetails,
  getBusinessDetails,
  saveBankDetails,
  getBankDetails,
  getSellerProfile,
  getCustomers,
  getEarnings,
  getEarningsSummary,
  requestPayout
} from '../Controller/sellerController.js';
import { authenticateToken } from '../Middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile route - get complete seller profile
router.get('/seller/profile', getSellerProfile);

// Update basic user fields (name, mobile, email)
router.put('/seller/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mobile, email } = req.body;
    const fields = [];
    const values = [];
    let i = 1;
    if (name   !== undefined) { fields.push(`name = $${i++}`);   values.push(name); }
    if (mobile !== undefined) { fields.push(`mobile = $${i++}`); values.push(mobile); }
    if (email  !== undefined) { fields.push(`email = $${i++}`);  values.push(email); }
    if (fields.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(userId);
    await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i}`,
      values
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Business details routes
router.post('/seller/business-details', saveBusinessDetails);
router.get('/seller/business-details', getBusinessDetails);

// Bank details routes
router.post('/seller/bank-details', saveBankDetails);
router.get('/seller/bank-details', getBankDetails);

// Customers route
router.get('/customers', getCustomers);

// Earnings routes - note: these will be accessed as /api/v1/users/sellers/earnings
router.get('/sellers/earnings', getEarnings);
router.get('/sellers/earnings/summary', getEarningsSummary);
router.post('/sellers/payouts/request', requestPayout);

export default router;
