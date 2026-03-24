import { pool } from '../config/database.js';

async function checkCategories() {
  try {
    console.log('📋 Checking categories in database...\n');
    
    const result = await pool.query(`
      SELECT id, name, parent_id, is_active 
      FROM categories 
      ORDER BY parent_id NULLS FIRST, name
    `);
    
    console.log(`Total categories: ${result.rows.length}\n`);
    
    // Group by parent
    const rootCategories = result.rows.filter(c => c.parent_id === null);
    const childCategories = result.rows.filter(c => c.parent_id !== null);
    
    console.log('ROOT CATEGORIES:');
    rootCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.id})`);
    });
    
    console.log('\nCHILD CATEGORIES:');
    childCategories.forEach(cat => {
      const parent = result.rows.find(p => p.id === cat.parent_id);
      console.log(`  - ${cat.name} (parent: ${parent?.name || 'unknown'})`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCategories();
