import { pool } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function addMoreCategories() {
  try {
    console.log('📦 Adding more root categories...\n');
    
    // Comprehensive list of e-commerce categories
    const newRootCategories = [
      'Beauty & Personal Care',
      'Toys & Games',
      'Baby Products',
      'Automotive',
      'Grocery & Gourmet Foods',
      'Health & Wellness',
      'Pet Supplies',
      'Office Products',
      'Garden & Outdoor',
      'Tools & Hardware',
      'Music & Instruments',
      'Movies & Entertainment',
      'Video Games',
      'Jewelry & Accessories',
      'Bags & Luggage',
      'Watches',
      'Shoes',
      'Furniture',
      'Art & Crafts',
      'Industrial & Scientific'
    ];
    
    let addedCount = 0;
    
    for (const categoryName of newRootCategories) {
      // Check if already exists
      const existing = await pool.query(
        'SELECT id FROM categories WHERE name = $1 AND parent_id IS NULL',
        [categoryName]
      );
      
      if (existing.rows.length > 0) {
        console.log(`⏭️  ${categoryName} already exists`);
        continue;
      }
      
      const id = uuidv4();
      await pool.query(
        'INSERT INTO categories (id, name, parent_id, is_active) VALUES ($1, $2, $3, $4)',
        [id, categoryName, null, true]
      );
      console.log(`✅ Added: ${categoryName}`);
      addedCount++;
    }
    
    console.log(`\n✅ Added ${addedCount} new categories!\n`);
    
    // Show all root categories
    const roots = await pool.query(
      'SELECT id, name FROM categories WHERE parent_id IS NULL ORDER BY name'
    );
    console.log(`Total root categories: ${roots.rows.length}`);
    console.log('\nAll root categories:');
    roots.rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.name}`));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMoreCategories();
