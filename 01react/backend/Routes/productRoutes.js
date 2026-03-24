import express from 'express';
import multer from 'multer';
import {
  addProduct,
  getSellerProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getPublicProductById,
  searchProducts
} from '../Controller/productController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// PUBLIC ROUTES (no authentication required)
// Advanced search with full-text search and attribute filtering
router.get('/search', searchProducts);

// Get all products with filtering and pagination
router.get('/public', getAllProducts);

// Get single product by ID (public)
router.get('/public/:productId', getPublicProductById);

// PROTECTED ROUTES (require authentication)
router.use(authenticateToken);

// Add new product with images
router.post('/addProduct', upload.array('images', 10), addProduct);

// Get all products for logged-in seller
router.get('/', getSellerProducts);

// Get single product by ID
router.get('/:productId', getProductById);

// Update product
router.put('/:productId', updateProduct);

// Delete product
router.delete('/:productId', deleteProduct);

// Delete specific product image
router.delete('/:productId/images/:imageId', deleteProductImage);

export default router;
