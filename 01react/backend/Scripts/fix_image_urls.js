/**
 * fix_image_urls.js
 * One-time migration: rewrites localhost:9000 MinIO URLs in product_images
 * to go through the backend image proxy instead.
 *
 * Run once: node Scripts/fix_image_urls.js
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const BASE_URL = process.env.BASE_URL || 'https://zpin-backend.onrender.com';
const BUCKET   = process.env.MINIO_BUCKET_NAME || 'zpin-ecommerce';
const OLD_PREFIX = `http://localhost:9000/${BUCKET}/`;
const NEW_PREFIX = `${BASE_URL}/api/v1/images/${BUCKET}/`;

async function run() {
  const { rows } = await pool.query(
    `SELECT id, image_url FROM product_images WHERE image_url LIKE $1`,
    [`${OLD_PREFIX}%`]
  );

  console.log(`Found ${rows.length} image(s) with localhost URLs`);
  if (rows.length === 0) { await pool.end(); return; }

  for (const row of rows) {
    const newUrl = row.image_url.replace(OLD_PREFIX, NEW_PREFIX);
    await pool.query(`UPDATE product_images SET image_url = $1 WHERE id = $2`, [newUrl, row.id]);
    console.log(`  Updated: ${row.image_url.split('/').pop()}`);
  }

  console.log('Done.');
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
