/**
 * Script to run password reset table migration
 * This creates the password_reset_tokens table and related functions
 */

import { pool } from '../config/database.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runMigration = async () => {
  try {
    console.log('🔍 Reading migration file...');
    
    // Read the SQL migration file
    const sqlFile = join(__dirname, 'add_password_reset_table.sql');
    const sql = readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Running migration...');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Verifying table creation...');
    
    // Verify the table was created
    const result = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'password_reset_tokens'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length > 0) {
      console.log('\n✅ Table "password_reset_tokens" created with columns:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('⚠️  Warning: Could not verify table creation');
    }
    
    console.log('\n🎉 Password reset functionality is ready to use!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the migration
console.log('🚀 Starting password reset table migration...\n');
runMigration();
