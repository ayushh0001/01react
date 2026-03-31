/**
 * Run pending migrations on startup.
 * Safe to run multiple times — all statements use IF NOT EXISTS / IF EXISTS.
 */
import { pool } from '../config/database.js';

export async function runMigrations() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
      ALTER TABLE users ALTER COLUMN mobile DROP NOT NULL;
    `);
    console.log('✅ Migrations applied');
  } catch (err) {
    console.error('⚠️  Migration error (non-fatal):', err.message);
  }
}
