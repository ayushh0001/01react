const express = require('express');
const router = express.Router();
const { getCartItems, addToCart, updateCartItem, removeFromCart, clearCart, getCartCount } = require('../Controller/cartController');

router.get('/', getCartItems)
.get('/count', getCartCount)
.post('/', addToCart)
.put('/:productId', updateCartItem)
.delete('/:productId', removeFromCart)
.delete('/', clearCart);

module.exports = router;