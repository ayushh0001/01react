const express = require('express');
const router = express.Router();
const {
  getUserAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  checkPincode
} = require('../Controller/locationController');

// Get all addresses for user
router.get('/', getUserAddresses);

// Get specific address by ID
router.get('/:id', getAddressById);

// Add new address
router.post('/', addAddress);

// Update existing address
router.put('/:id', updateAddress);

// Delete address
router.delete('/:id', deleteAddress);

// Set default address
router.patch('/:id/default', setDefaultAddress);

// Check pincode serviceability (public endpoint)
router.get('/pincode/:pincode/check', checkPincode);

module.exports = router;