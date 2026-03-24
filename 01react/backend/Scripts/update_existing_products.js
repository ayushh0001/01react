import { pool } from '../config/database.js';
import { extractKeywords, generateSearchTags } from '../utils/keywordExtractor.js';

async function updateExistingProducts() {
  try {
    console.log('Updating existing products with search features...\n');

    // Get all products
    const result = await pool.query(`
      SELECT id, product_name, description, deepest_category_name
      FROM products
      WHERE search_tags IS NULL OR search_tags = '{}'
    `);

    const products = result.rows;
    console.log(`Found ${products.length} products to update\n`);

    let updated = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const textToAnalyze = `${product.product_name} ${product.description || ''}`;
        const extracted = extractKeywords(textToAnalyze, product.deepest_category_name || '');
        const searchTags = generateSearchTags(extracted);

        await pool.query(`
          UPDATE products
          SET 
            search_tags = $1,
            extracted_attributes = $2
          WHERE id = $3
        `, [searchTags, JSON.stringify(extracted), product.id]);

        updated++;
        console.log(`✓ Updated product ${product.id}: ${product.product_name}`);
        console.log(`  Tags: ${searchTags.slice(0, 5).join(', ')}${searchTags.length > 5 ? '...' : ''}`);
      } catch (error) {
        failed++;
        console.error(`✗ Failed to update product ${product.id}:`, error.message);
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total products: ${products.length}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
}

updateExistingProducts();
