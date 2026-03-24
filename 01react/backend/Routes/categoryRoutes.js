import express from 'express';
import {
  getRootCategories,
  getChildCategories,
  getAllCategories,
  getCategoryTree
} from '../Controller/categoryController.js';

const router = express.Router();

// Public routes (no authentication required for browsing categories)

// Get root categories
router.get('/root', getRootCategories);

// Get all categories
router.get('/', getAllCategories);

// Get category tree
router.get('/tree', getCategoryTree);

// Get child categories of a specific category
router.get('/:categoryId/children', getChildCategories);

export default router;
