import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
} from '../Controller/wishlistController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticateToken);

// Get user's wishlist
router.get('/', getWishlist);

// Add product to wishlist
router.post('/', addToWishlist);

// Check if product is in wishlist
router.get('/check/:productId', checkWishlist);

// Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

// Clear entire wishlist
router.delete('/', clearWishlist);

export default router;
