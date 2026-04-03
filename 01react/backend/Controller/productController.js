import { pool } from '../config/database.js';
import { minioClient, bucketName } from '../config/minio.js';
import { extractKeywords, generateSearchTags } from '../utils/keywordExtractor.js';

/**
 * Add new product with image upload to MinIO
 */
export const addProduct = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const {
      productName,
      description,
      categoryId,
      deepestCategoryName,
      categoryPath,
      price,
      quantity,
      sizeQuantities
    } = req.body;

    // Validation
    if (!productName || !price || !quantity || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productName, price, quantity, categoryId'
      });
    }

    // Parse sizeQuantities if it's a string
    let parsedSizeQuantities = {};
    if (sizeQuantities) {
      try {
        parsedSizeQuantities = typeof sizeQuantities === 'string' 
          ? JSON.parse(sizeQuantities) 
          : sizeQuantities;
      } catch (e) {
        console.error('[Products] Error parsing sizeQuantities:', e);
      }
    }

    // Extract keywords and generate search tags
    const textToAnalyze = `${productName} ${description || ''}`;
    const extracted = extractKeywords(textToAnalyze, deepestCategoryName || '');
    const searchTags = generateSearchTags(extracted);

    console.log('[Products] Extracted keywords:', extracted);
    console.log('[Products] Generated search tags:', searchTags);

    // Check if size_quantities column exists
    let insertQuery;
    let values;
    
    try {
      // Try with size_quantities and search columns
      insertQuery = `
        INSERT INTO products (
          user_id,
          product_name,
          description,
          category_id,
          deepest_category_name,
          category_path,
          price,
          quantity,
          in_stock,
          size_quantities,
          search_tags,
          extracted_attributes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      values = [
        userId,
        productName,
        description || null,
        categoryId,
        deepestCategoryName || null,
        categoryPath || null,
        parseFloat(price),
        parseInt(quantity),
        parseInt(quantity) > 0,
        JSON.stringify(parsedSizeQuantities),
        searchTags,
        JSON.stringify(extracted)
      ];
    } catch (error) {
      // Fallback: Insert without size_quantities if column doesn't exist
      console.warn('[Products] size_quantities column may not exist, using fallback');
      insertQuery = `
        INSERT INTO products (
          user_id,
          product_name,
          description,
          category_id,
          deepest_category_name,
          category_path,
          price,
          quantity,
          in_stock
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      values = [
        userId,
        productName,
        description || null,
        categoryId,
        deepestCategoryName || null,
        categoryPath || null,
        parseFloat(price),
        parseInt(quantity),
        parseInt(quantity) > 0
      ];
    }

    const result = await pool.query(insertQuery, values);
    const product = result.rows[0];

    console.log(`[Products] Created product: ${product.id} - ${product.product_name}`);

    // Handle image uploads to MinIO
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`[Products] Uploading ${req.files.length} images to MinIO...`);
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const timestamp = Date.now();
        const fileName = `products/${product.id}/${timestamp}-${i}-${file.originalname}`;
        
        try {
          await minioClient.putObject(
            bucketName,
            fileName,
            file.buffer,
            file.size,
            {
              'Content-Type': file.mimetype
            }
          );

          const imageUrl = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${bucketName}/${fileName}`;
          // Rewrite localhost MinIO URLs to go through the backend proxy (avoids mixed-content in production)
          const proxyBase = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
          const finalImageUrl = imageUrl.includes('localhost')
            ? `${proxyBase}/api/v1/images/${bucketName}/${fileName}`
            : imageUrl;
          imageUrls.push(finalImageUrl);

          // Insert image record
          await pool.query(
            'INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3)',
            [product.id, finalImageUrl, i]
          );

          console.log(`[Products] Uploaded image ${i + 1}: ${fileName}`);
        } catch (uploadError) {
          console.error(`[Products] Error uploading image ${i + 1}:`, uploadError);
        }
      }
    }

    console.log(`[Products] Product added successfully with ${imageUrls.length} images`);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: {
        ...product,
        images: imageUrls
      }
    });

  } catch (error) {
    console.error('[Products] Error adding product:', error);
    console.error('[Products] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to add product',
      message: error.message
    });
  }
};

/**
 * Get all products for a seller
 */
export const getSellerProducts = async (req, res) => {
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
        p.*,
        c.name as category_name,
        COALESCE(
          json_agg(
            pi.image_url ORDER BY pi.display_order, pi.created_at
          ) FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) as images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.user_id = $1
      GROUP BY p.id, c.name
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    
    // Process products to build full category path
    const processedProducts = await Promise.all(result.rows.map(async (product) => {
      let categoryDisplay = 'Uncategorized';
      
      // Try to use category_path if it exists and is valid
      if (product.category_path) {
        try {
          const path = typeof product.category_path === 'string' 
            ? JSON.parse(product.category_path) 
            : product.category_path;
          
          if (Array.isArray(path) && path.length > 0) {
            categoryDisplay = path.map(c => c.name).join(' > ');
          }
        } catch (e) {
          console.error('[Products] Error parsing category_path:', e);
        }
      }
      
      // Fallback to deepest_category_name or category_name
      if (categoryDisplay === 'Uncategorized') {
        categoryDisplay = product.deepest_category_name || product.category_name || 'Uncategorized';
      }
      
      return {
        ...product,
        category_display: categoryDisplay
      };
    }));

    res.json({
      success: true,
      count: processedProducts.length,
      products: processedProducts
    });

  } catch (error) {
    console.error('[Products] Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    const query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            pi.image_url ORDER BY pi.display_order, pi.created_at
          ) FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) as images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = $1 AND p.user_id = $2
      GROUP BY p.id
    `;

    const result = await pool.query(query, [productId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: result.rows[0]
    });

  } catch (error) {
    console.error('[Products] Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    const {
      productName,
      description,
      categoryId,
      deepestCategoryName,
      categoryPath,
      price,
      quantity,
      inStock,
      sizeQuantities
    } = req.body;

    // Check if product belongs to user
    const checkQuery = 'SELECT id FROM products WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [productId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or unauthorized'
      });
    }

    // Parse sizeQuantities if it's a string
    let parsedSizeQuantities = {};
    if (sizeQuantities) {
      try {
        parsedSizeQuantities = typeof sizeQuantities === 'string' 
          ? JSON.parse(sizeQuantities) 
          : sizeQuantities;
      } catch (e) {
        console.error('[Products] Error parsing sizeQuantities:', e);
      }
    }

    // Extract keywords and generate search tags
    const textToAnalyze = `${productName} ${description || ''}`;
    const extracted = extractKeywords(textToAnalyze, deepestCategoryName || '');
    const searchTags = generateSearchTags(extracted);

    console.log('[Products] Extracted keywords:', extracted);
    console.log('[Products] Generated search tags:', searchTags);

    // Update product
    const updateQuery = `
      UPDATE products
      SET 
        product_name = $1,
        description = $2,
        category_id = $3,
        deepest_category_name = $4,
        category_path = $5,
        price = $6,
        quantity = $7,
        in_stock = $8,
        size_quantities = $9,
        search_tags = $10,
        extracted_attributes = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND user_id = $13
      RETURNING *
    `;

    const values = [
      productName,
      description || null,
      categoryId,
      deepestCategoryName || null,
      categoryPath || null,
      parseFloat(price),
      parseInt(quantity),
      inStock !== undefined ? inStock : (parseInt(quantity) > 0),
      JSON.stringify(parsedSizeQuantities),
      searchTags,
      JSON.stringify(extracted),
      productId,
      userId
    ];

    const result = await pool.query(updateQuery, values);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('[Products] Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    // Check if product belongs to user
    const checkQuery = 'SELECT id FROM products WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [productId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or unauthorized'
      });
    }

    // Delete product (cascade will delete images)
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('[Products] Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    });
  }
};

/**
 * Delete a specific product image
 */
export const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const userId = req.user?.id;

    // Check if product belongs to user
    const checkQuery = `
      SELECT p.id, pi.image_url 
      FROM products p
      LEFT JOIN product_images pi ON pi.id = $2 AND pi.product_id = p.id
      WHERE p.id = $1 AND p.user_id = $3
    `;
    const checkResult = await pool.query(checkQuery, [productId, imageId, userId]);

    if (checkResult.rows.length === 0 || !checkResult.rows[0].image_url) {
      return res.status(404).json({
        success: false,
        error: 'Image not found or unauthorized'
      });
    }

    // Delete from database
    await pool.query('DELETE FROM product_images WHERE id = $1', [imageId]);

    // Optionally delete from MinIO (extract filename from URL)
    const imageUrl = checkResult.rows[0].image_url;
    const fileName = imageUrl.split(`/${bucketName}/`)[1];
    if (fileName) {
      try {
        await minioClient.removeObject(bucketName, fileName);
        console.log(`[Products] Deleted image from MinIO: ${fileName}`);
      } catch (minioError) {
        console.error('[Products] Error deleting from MinIO:', minioError);
        // Continue even if MinIO delete fails
      }
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('[Products] Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
      message: error.message
    });
  }
};

/**
 * Get all products (public endpoint)
 */
export const getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      search, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let whereConditions = ['p.is_approved = true', 'p.in_stock = true'];
    let queryParams = [];
    let paramCount = 0;

    // Add filters
    if (category) {
      paramCount++;
      whereConditions.push(`c.name ILIKE $${paramCount}`);
      queryParams.push(`%${category}%`);
    }

    if (subcategory) {
      paramCount++;
      whereConditions.push(`p.deepest_category_name ILIKE $${paramCount}`);
      queryParams.push(`%${subcategory}%`);
    }

    if (search) {
      paramCount++;
      whereConditions.push(`(p.product_name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    if (minPrice) {
      paramCount++;
      whereConditions.push(`p.price >= $${paramCount}`);
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      whereConditions.push(`p.price <= $${paramCount}`);
      queryParams.push(parseFloat(maxPrice));
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Valid sort columns
    const validSortColumns = ['created_at', 'price', 'product_name'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const query = `
      SELECT 
        p.id,
        p.product_name,
        p.description,
        p.price,
        p.quantity,
        p.deepest_category_name as category,
        c.name as category_full_name,
        COALESCE(
          json_agg(
            pi.image_url ORDER BY pi.display_order, pi.created_at
          ) FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) as images,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY p.id, c.name
      ORDER BY p.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('[Products] Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
};

/**
 * Get single product by ID (public endpoint)
 */
export const getPublicProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        u.name as seller_name,
        COALESCE(
          json_agg(
            pi.image_url ORDER BY pi.display_order, pi.created_at
          ) FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = $1 AND p.is_approved = true AND p.in_stock = true
      GROUP BY p.id, c.name, u.name
    `;

    const result = await pool.query(query, [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: result.rows[0]
    });

  } catch (error) {
    console.error('[Products] Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
};

/**
 * Advanced search with full-text search and attribute filtering
 */
export const searchProducts = async (req, res) => {
  try {
    const {
      q, // Search query
      category,
      material,
      color,
      fit,
      season,
      occasion,
      style,
      pattern,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.query;

    let whereConditions = ['p.is_approved = true', 'p.in_stock = true'];
    let queryParams = [];
    let paramCount = 0;
    let orderByClause = 'p.created_at DESC';

    // Full-text search
    if (q && q.trim()) {
      paramCount++;
      whereConditions.push(`p.search_vector @@ plainto_tsquery('english', $${paramCount})`);
      queryParams.push(q.trim());
      
      // If sorting by relevance, add ranking
      if (sortBy === 'relevance') {
        orderByClause = `ts_rank(p.search_vector, plainto_tsquery('english', $${paramCount})) DESC, p.created_at DESC`;
      }
    }

    // Category filter
    if (category) {
      paramCount++;
      whereConditions.push(`p.deepest_category_name ILIKE $${paramCount}`);
      queryParams.push(`%${category}%`);
    }

    // Attribute filters
    if (material) {
      paramCount++;
      whereConditions.push(`p.extracted_attributes->'materials' ? $${paramCount}`);
      queryParams.push(material.toLowerCase());
    }

    if (color) {
      paramCount++;
      whereConditions.push(`p.extracted_attributes->'colors' ? $${paramCount}`);
      queryParams.push(color.toLowerCase());
    }

    if (fit) {
      paramCount++;
      whereConditions.push(`p.extracted_attributes->'fits' ? $${paramCount}`);
      queryParams.push(fit.toLowerCase());
    }

    if (season) {
      paramCount++;
      whereConditions.push(`p.extracted_attributes->'seasons' ? $${paramCount}`);
      queryParams.push(season.toLowerCase());
    }

    if (occasion) {
      paramCount++;
      whereConditions.push(`p.extracted_attributes->'occasions' ? $${paramCount}`);
      queryParams.push(occasion.toLowerCase());
    }

    if (style) {
      paramCount++;
      whereConditions.push(`p.extracted_attributes->'styles' ? $${paramCount}`);
      queryParams.push(style.toLowerCase());
    }

    if (pattern) {
      paramCount++;
      whereConditions.push(`p.extracted_attributes->'patterns' ? $${paramCount}`);
      queryParams.push(pattern.toLowerCase());
    }

    // Price filters
    if (minPrice) {
      paramCount++;
      whereConditions.push(`p.price >= $${paramCount}`);
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      whereConditions.push(`p.price <= $${paramCount}`);
      queryParams.push(parseFloat(maxPrice));
    }

    // Handle other sort options
    if (sortBy === 'price_asc') {
      orderByClause = 'p.price ASC';
    } else if (sortBy === 'price_desc') {
      orderByClause = 'p.price DESC';
    } else if (sortBy === 'newest') {
      orderByClause = 'p.created_at DESC';
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `
      SELECT 
        p.id,
        p.product_name,
        p.description,
        p.price,
        p.quantity,
        p.deepest_category_name as category,
        p.search_tags,
        p.extracted_attributes,
        COALESCE(
          json_agg(
            pi.image_url ORDER BY pi.display_order, pi.created_at
          ) FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) as images,
        p.created_at
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY p.id
      ORDER BY ${orderByClause}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      WHERE ${whereConditions.join(' AND ')}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Extract available filters from results
    const availableFilters = {
      materials: new Set(),
      colors: new Set(),
      fits: new Set(),
      seasons: new Set(),
      occasions: new Set(),
      styles: new Set(),
      patterns: new Set()
    };

    result.rows.forEach(product => {
      if (product.extracted_attributes) {
        Object.keys(availableFilters).forEach(key => {
          const attrs = product.extracted_attributes[key];
          if (Array.isArray(attrs)) {
            attrs.forEach(attr => availableFilters[key].add(attr));
          }
        });
      }
    });

    // Convert sets to arrays
    Object.keys(availableFilters).forEach(key => {
      availableFilters[key] = Array.from(availableFilters[key]).sort();
    });

    res.json({
      success: true,
      products: result.rows,
      filters: availableFilters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('[Products] Error searching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search products',
      message: error.message
    });
  }
};
