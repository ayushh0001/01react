const express = require('express');
const router = express.Router();
const {
    getSellerEarnings,
    getEarningsSummary,
    getOrderEarnings,
    getPayouts,
    getWalletSummary,
    requestPayout,
    createMockEarnings
} = require('../Controller/sellerEarningsController');

// 54. GET /api/v1/sellers/earnings - Returns seller's earnings history with filtering options
router.get('/earnings', getSellerEarnings);

// 55. GET /api/v1/sellers/earnings/summary - Returns earnings summary for different time periods
router.get('/earnings/summary', getEarningsSummary);

// 56. GET /api/v1/sellers/earnings/:orderId - Returns earnings details for a specific order
router.get('/earnings/:orderId', getOrderEarnings);

// 57. GET /api/v1/sellers/payouts - Returns seller's payout history
router.get('/payouts', getPayouts);

// 58. GET /api/v1/sellers/wallet - Returns seller's wallet summary
router.get('/wallet', getWalletSummary);

// 59. POST /api/v1/sellers/payouts/request - Requests payout for withdrawable earnings
router.post('/payouts/request', requestPayout);

// Helper route for testing - Create mock earnings data
router.post('/earnings/mock', createMockEarnings);

module.exports = router;