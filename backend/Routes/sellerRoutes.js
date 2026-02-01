const express = require('express')
const router = express.Router();
const {businessDetails} = require("../Controller/businessDetailController")
const {
    getSellerEarnings,
    getEarningsSummary,
    getOrderEarnings,
    getPayouts,
    requestPayout,
    createMockEarnings
} = require('../Controller/sellerEarningsController');
const authenticateToken = require('../Middleware/tokenauth');

// Business Details
router.post("/sellerDetails", authenticateToken, businessDetails)

// Seller Earnings
router.get('/earnings', getSellerEarnings);
router.get('/earnings/summary', getEarningsSummary);
router.get('/earnings/:orderId', getOrderEarnings);
router.get('/payouts', getPayouts);
router.post('/payouts/request', requestPayout);
router.post('/earnings/mock', createMockEarnings); // For testing

module.exports = router