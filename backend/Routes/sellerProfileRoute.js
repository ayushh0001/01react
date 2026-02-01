const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createSellerProfile, createSellerBusinessDetails, createSellerBankDetails, getSellerProfile } = require('../Controller/sellerProfileController');
const authMiddleware = require('../Middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Seller profile routes
router.post('/profile', authMiddleware, upload.single('profileImage'), createSellerProfile);
router.post('/business-details', authMiddleware, createSellerBusinessDetails);
router.post('/bank-details', authMiddleware, createSellerBankDetails);
router.get('/profile', authMiddleware, getSellerProfile);

module.exports = router;