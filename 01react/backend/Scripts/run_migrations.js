/**
 * Run pending migrations on startup.
 * Safe to run multiple times — all statements use IF NOT EXISTS / IF EXISTS.
 */
import { pool } from '../config/database.js';

export async function runMigrations() {
  try {
    // Add google_id if missing
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`);

    // Fix order_status_history.order_id type to match orders.id (VARCHAR(36))
    await pool.query(`
      ALTER TABLE order_status_history 
        ALTER COLUMN order_id TYPE VARCHAR(36) USING order_id::text,
        ALTER COLUMN id TYPE VARCHAR(36) USING id::text;
    `);

    console.log('✅ Migrations applied');
  } catch (err) {
    console.error('⚠️  Migration error (non-fatal):', err.message);
  }
}
