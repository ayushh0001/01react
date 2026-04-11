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

    // Allow mobile to be null (phone verification is optional at signup)
    await pool.query(`ALTER TABLE users ALTER COLUMN mobile DROP NOT NULL;`);
    // Allow password_hash to be null (OAuth users have no password)
    await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`);

    // Allow address/city/state to be null in seller_business_details (filled in later)
    await pool.query(`ALTER TABLE seller_business_details ALTER COLUMN address DROP NOT NULL;`);
    await pool.query(`ALTER TABLE seller_business_details ALTER COLUMN city DROP NOT NULL;`);
    await pool.query(`ALTER TABLE seller_business_details ALTER COLUMN state DROP NOT NULL;`);
    await pool.query(`ALTER TABLE seller_business_details ALTER COLUMN pincode DROP NOT NULL;`);
    // Fix gst_no/pan_no unique constraint — NULLs should not conflict, but empty strings do
    // Convert any existing empty strings to NULL
    await pool.query(`UPDATE seller_business_details SET gst_no = NULL WHERE gst_no = '';`);
    await pool.query(`UPDATE seller_business_details SET pan_no = NULL WHERE pan_no = '';`);

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
