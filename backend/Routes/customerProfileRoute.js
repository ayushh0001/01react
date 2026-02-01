const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createCustomerProfile, getCustomerProfile, updateCustomerProfile } = require('../Controller/customerProfileController');
const authMiddleware = require('../Middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Customer profile routes
router.post('/profile', authMiddleware, upload.single('profileImage'), createCustomerProfile);
router.get('/profile', authMiddleware, getCustomerProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateCustomerProfile);

module.exports = router;