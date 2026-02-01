const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createDeliveryProfile, createDeliveryPartnerDetails, updateLocation, updateStatus, getDeliveryProfile } = require('../Controller/deliveryProfileController');
const authMiddleware = require('../Middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Delivery partner profile routes
router.post('/profile', authMiddleware, upload.single('profileImage'), createDeliveryProfile);
router.post('/partner-details', authMiddleware, createDeliveryPartnerDetails);
router.post('/location', authMiddleware, updateLocation);
router.put('/status', authMiddleware, updateStatus);
router.get('/profile', authMiddleware, getDeliveryProfile);

module.exports = router;