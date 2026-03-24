import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Starting search features migration...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../migrations/add_search_features.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the migration
    await pool.query(sql);

    console.log('✓ Migration completed successfully!');
    console.log('\nNew columns added:');
    console.log('  - search_tags (TEXT[])');
    console.log('  - search_vector (TSVECTOR)');
    console.log('  - extracted_attributes (JSONB)');
    console.log('\nIndexes created:');
    console.log('  - idx_products_search_tags (GIN)');
    console.log('  - idx_products_search_vector (GIN)');
    console.log('  - idx_products_extracted_attributes (GIN)');
    console.log('\nTrigger created:');
    console.log('  - products_search_vector_trigger');
    console.log('\nYou can now use the advanced search API!');

    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
