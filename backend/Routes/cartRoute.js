const express = require('express');
const router = express.Router();
const { getCartItems, addToCart, updateCartItem, removeFromCart, clearCart } = require('../Controller/cartController');

router.get('/cart', getCartItems)
.post('/cart', addToCart)
.put('/cart/:productId', updateCartItem)
.delete('/cart/:productId', removeFromCart)
.delete('/cart', clearCart);

module.exports = router;