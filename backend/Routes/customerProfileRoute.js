const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createCustomerProfile, getCustomerProfile, updateCustomerProfile } = require('../Controller/customerProfileController');
const authenticateToken = require('../Middleware/tokenauth');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Customer profile routes
router.post('/profile', authenticateToken, upload.single('profileImage'), createCustomerProfile);
router.get('/profile', authenticateToken, getCustomerProfile);
router.put('/profile', authenticateToken, upload.single('profileImage'), updateCustomerProfile);

module.exports = router;