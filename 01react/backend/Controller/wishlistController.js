import { pool } from '../config/database.js';

/**
 * Get user's wishlist with product details
 */
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const query = `
      SELECT 
        w.id as wishlist_id,
        w.created_at as added_at,
        p.id as product_id,
        p.product_name,
        p.description,
        p.price,
        p.quantity,
        p.in_stock,
        p.deepest_category_name as category,
        COALESCE(
          json_agg(
            pi.image_url ORDER BY pi.display_order, pi.created_at
          ) FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) as images
      FROM wishlists w
      INNER JOIN products p ON w.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE w.user_id = $1 AND p.is_approved = true
      GROUP BY w.id, w.created_at, p.id
      ORDER BY w.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      count: result.rows.length,
      wishlist: result.rows
    });

  } catch (error) {
    console.error('[Wishlist] Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist',
      message: error.message
    });
  }
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    // Check if product exists and is available
    const productCheck = await pool.query(
      'SELECT id, product_name FROM products WHERE id = $1 AND is_approved = true',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or not available'
      });
    }

    // Check if already in wishlist
    const existingCheck = await pool.query(
      'SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const insertQuery = `
      INSERT INTO wishlists (user_id, product_id)
      VALUES ($1, $2)
      RETURNING id, created_at
    `;

    const result = await pool.query(insertQuery, [userId, productId]);

    console.log(`[Wishlist] Added product ${productId} to wishlist for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      wishlistItem: {
        id: result.rows[0].id,
        productId,
        productName: productCheck.rows[0].product_name,
        addedAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('[Wishlist] Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to wishlist',
      message: error.message
    });
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Delete from wishlist
    const deleteQuery = `
      DELETE FROM wishlists 
      WHERE user_id = $1 AND product_id = $2
      RETURNING id
    `;

    const result = await pool.query(deleteQuery, [userId, productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in wishlist'
      });
    }

    console.log(`[Wishlist] Removed product ${productId} from wishlist for user ${userId}`);

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });

  } catch (error) {
    console.error('[Wishlist] Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from wishlist',
      message: error.message
    });
  }
};

/**
 * Check if product is in wishlist
 */
export const checkWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const query = `
      SELECT id FROM wishlists 
      WHERE user_id = $1 AND product_id = $2
    `;

    const result = await pool.query(query, [userId, productId]);

    res.json({
      success: true,
      inWishlist: result.rows.length > 0
    });

  } catch (error) {
    console.error('[Wishlist] Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check wishlist',
      message: error.message
    });
  }
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const deleteQuery = `
      DELETE FROM wishlists 
      WHERE user_id = $1
      RETURNING id
    `;

    const result = await pool.query(deleteQuery, [userId]);

    console.log(`[Wishlist] Cleared wishlist for user ${userId} (${result.rows.length} items)`);

    res.json({
      success: true,
      message: 'Wishlist cleared',
      removedCount: result.rows.length
    });

  } catch (error) {
    console.error('[Wishlist] Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear wishlist',
      message: error.message
    });
  }
};
