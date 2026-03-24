import { pool } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function addMissingCategories() {
  try {
    console.log('📦 Adding missing root categories...\n');
    
    const missingCategories = [
      { name: 'Books', parent_id: null },
      { name: 'Home & Kitchen', parent_id: null },
      { name: 'Sports', parent_id: null }
    ];
    
    for (const cat of missingCategories) {
      // Check if already exists
      const existing = await pool.query(
        'SELECT id FROM categories WHERE name = $1 AND parent_id IS NULL',
        [cat.name]
      );
      
      if (existing.rows.length > 0) {
        console.log(`✓ ${cat.name} already exists`);
        continue;
      }
      
      const id = uuidv4();
      await pool.query(
        'INSERT INTO categories (id, name, parent_id, is_active) VALUES ($1, $2, $3, $4)',
        [id, cat.name, cat.parent_id, true]
      );
      console.log(`✅ Added: ${cat.name} (${id})`);
    }
    
    console.log('\n✅ Done!\n');
    
    // Show all root categories
    const roots = await pool.query(
      'SELECT id, name FROM categories WHERE parent_id IS NULL ORDER BY name'
    );
    console.log('Root categories:');
    roots.rows.forEach(r => console.log(`  - ${r.name} (${r.id})`));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMissingCategories();
