const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createDeliveryProfile, createDeliveryPartnerDetails, updateLocation, updateStatus, getDeliveryProfile } = require('../Controller/deliveryProfileController');
const authenticateToken = require('../Middleware/tokenauth');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Delivery partner profile routes
router.post('/profile', authenticateToken, upload.single('profileImage'), createDeliveryProfile);
router.post('/partner-details', authenticateToken, createDeliveryPartnerDetails);
router.post('/location', authenticateToken, updateLocation);
router.put('/status', authenticateToken, updateStatus);
router.get('/profile', authenticateToken, getDeliveryProfile);

module.exports = router;