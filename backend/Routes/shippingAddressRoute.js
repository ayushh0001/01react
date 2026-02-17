const express = require('express');
const router = express.Router();
const { createShippingAddress, getShippingAddresses, getShippingAddress, updateShippingAddress, deleteShippingAddress } = require('../Controller/shippingAddressController');
const authenticateToken = require('../Middleware/tokenauth');

// Shipping address routes
router.post('/', authenticateToken, createShippingAddress);
router.get('/', authenticateToken, getShippingAddresses);
router.get('/:id', authenticateToken, getShippingAddress);
router.put('/:id', authenticateToken, updateShippingAddress);
router.delete('/:id', authenticateToken, deleteShippingAddress);

module.exports = router;