import { pool } from '../config/database.js';

/**
 * Get root categories (categories with no parent)
 */
export const getRootCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        id as _id,
        name,
        parent_id,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM categories c2 WHERE c2.parent_id = categories.id
          ) THEN true
          ELSE false
        END as "hasChildren"
      FROM categories
      WHERE parent_id IS NULL AND is_active = true
      ORDER BY name ASC
    `;

    const result = await pool.query(query);

    // Return array directly as per API contract
    res.json(result.rows);

  } catch (error) {
    console.error('[Categories] Error fetching root categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
};

/**
 * Get child categories of a parent category
 */
export const getChildCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const query = `
      SELECT 
        id as _id,
        name,
        parent_id,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM categories c2 WHERE c2.parent_id = categories.id
          ) THEN true
          ELSE false
        END as "hasChildren"
      FROM categories
      WHERE parent_id = $1 AND is_active = true
      ORDER BY name ASC
    `;

    const result = await pool.query(query, [categoryId]);

    // Return array directly as per API contract
    res.json(result.rows);

  } catch (error) {
    console.error('[Categories] Error fetching child categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch child categories',
      message: error.message
    });
  }
};

/**
 * Get all categories (flat list)
 */
export const getAllCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        id as _id,
        name,
        parent_id,
        is_active
      FROM categories
      WHERE is_active = true
      ORDER BY name ASC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('[Categories] Error fetching all categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
};

/**
 * Get category tree (hierarchical structure)
 */
export const getCategoryTree = async (req, res) => {
  try {
    // Get all categories
    const query = `
      SELECT 
        id as _id,
        name,
        parent_id,
        is_active
      FROM categories
      WHERE is_active = true
      ORDER BY name ASC
    `;

    const result = await pool.query(query);
    const categories = result.rows;

    // Build tree structure
    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          _id: cat._id,
          name: cat.name,
          parent_id: cat.parent_id,
          children: buildTree(cat._id)
        }));
    };

    const tree = buildTree(null);

    // Return array directly as per API contract
    res.json(tree);

  } catch (error) {
    console.error('[Categories] Error fetching category tree:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category tree',
      message: error.message
    });
  }
};

