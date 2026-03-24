import { pool } from '../config/database.js';

async function cleanupDuplicates() {
  try {
    console.log('🧹 Cleaning up duplicate categories...\n');
    
    // Find duplicates
    const duplicatesQuery = `
      SELECT name, COUNT(*) as count, ARRAY_AGG(id) as ids
      FROM categories
      WHERE parent_id IS NULL
      GROUP BY name
      HAVING COUNT(*) > 1
    `;
    
    const duplicates = await pool.query(duplicatesQuery);
    
    console.log(`Found ${duplicates.rows.length} duplicate category names\n`);
    
    for (const dup of duplicates.rows) {
      console.log(`\n📋 Processing: ${dup.name} (${dup.count} duplicates)`);
      
      // For each duplicate, check which one has children
      const idsWithChildren = [];
      const idsWithoutChildren = [];
      
      for (const id of dup.ids) {
        const childCheck = await pool.query(
          'SELECT COUNT(*) as count FROM categories WHERE parent_id = $1',
          [id]
        );
        
        if (parseInt(childCheck.rows[0].count) > 0) {
          idsWithChildren.push(id);
          console.log(`  ✓ ${id} has children - KEEP`);
        } else {
          idsWithoutChildren.push(id);
          console.log(`  ✗ ${id} has no children - DELETE`);
        }
      }
      
      // Delete the ones without children
      if (idsWithoutChildren.length > 0) {
        for (const id of idsWithoutChildren) {
          await pool.query('DELETE FROM categories WHERE id = $1', [id]);
          console.log(`  🗑️  Deleted: ${id}`);
        }
      }
      
      // If all have children or none have children, keep the first one
      if (idsWithChildren.length === 0 && idsWithoutChildren.length > 1) {
        const keepId = idsWithoutChildren[0];
        const deleteIds = idsWithoutChildren.slice(1);
        console.log(`  ⚠️  None have children, keeping first: ${keepId}`);
        for (const id of deleteIds) {
          await pool.query('DELETE FROM categories WHERE id = $1', [id]);
          console.log(`  🗑️  Deleted: ${id}`);
        }
      }
      
      if (idsWithChildren.length > 1) {
        const keepId = idsWithChildren[0];
        const deleteIds = idsWithChildren.slice(1);
        console.log(`  ⚠️  Multiple have children, keeping first: ${keepId}`);
        
        // Move children to the kept category
        for (const id of deleteIds) {
          await pool.query(
            'UPDATE categories SET parent_id = $1 WHERE parent_id = $2',
            [keepId, id]
          );
          console.log(`  📦 Moved children from ${id} to ${keepId}`);
          
          await pool.query('DELETE FROM categories WHERE id = $1', [id]);
          console.log(`  🗑️  Deleted: ${id}`);
        }
      }
    }
    
    console.log('\n✅ Cleanup complete!\n');
    
    // Show final category count
    const finalCount = await pool.query('SELECT COUNT(*) FROM categories');
    console.log(`Final category count: ${finalCount.rows[0].count}`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupDuplicates();
