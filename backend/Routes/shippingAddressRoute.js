const express = require('express');
const router = express.Router();
const { createShippingAddress, getShippingAddresses, getShippingAddress, updateShippingAddress, deleteShippingAddress } = require('../Controller/shippingAddressController');
const authMiddleware = require('../Middleware/authMiddleware');

// Shipping address routes
router.post('/', authMiddleware, createShippingAddress);
router.get('/', authMiddleware, getShippingAddresses);
router.get('/:id', authMiddleware, getShippingAddress);
router.put('/:id', authMiddleware, updateShippingAddress);
router.delete('/:id', authMiddleware, deleteShippingAddress);

module.exports = router;