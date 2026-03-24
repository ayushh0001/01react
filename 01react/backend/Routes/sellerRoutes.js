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

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile route - get complete seller profile
router.get('/seller/profile', getSellerProfile);

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
