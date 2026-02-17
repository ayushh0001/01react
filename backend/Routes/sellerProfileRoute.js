const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createSellerProfile, createSellerBusinessDetails, createSellerBankDetails, getSellerProfile } = require('../Controller/sellerProfileController');
const authenticateToken = require('../Middleware/tokenauth');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Seller profile routes
router.post('/profile', authenticateToken, upload.single('profileImage'), createSellerProfile);
router.post('/business-details', authenticateToken, createSellerBusinessDetails);
router.post('/bank-details', authenticateToken, createSellerBankDetails);
router.get('/profile', authenticateToken, getSellerProfile);

module.exports = router;