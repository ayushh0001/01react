const express = require('express');
const router = express.Router();
const { getWishlistItems, addToWishlist, removeFromWishlist, clearWishlist, getWishlistCount } = require('../Controller/wishlistController');

router.get('/', getWishlistItems);
router.get('/count', getWishlistCount);
router.post('/', addToWishlist);
router.delete('/clear', clearWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;