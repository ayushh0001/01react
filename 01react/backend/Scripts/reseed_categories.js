/**
 * reseed_categories.js
 *
 * Clears all existing categories and re-seeds from categories_data.json.
 * Uses a single bulk INSERT via a temp table to minimise round-trips to
 * the remote Render DB (899 rows in one query instead of 899 queries).
 *
 * Usage (from backend folder):
 *   npm run reseed-categories
 */

import { pool } from '../config/database.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const CATEGORIES = JSON.parse(
  readFileSync(join(__dirname, 'categories_data.json'), 'utf8')
);

// ─── Flatten the tree into rows with a stable numeric key ────────────────────
// Each row: { key, name, parentKey }  (key is just an integer index)
const rows = [];   // { key: number, name: string, parentKey: number|null }

function flatten(node, parentKey) {
  const key = rows.length;
  rows.push({ key, name: node.name, parentKey: parentKey ?? null });
  if (Array.isArray(node.subcategories)) {
    for (const child of node.subcategories) {
      flatten(child, key);
    }
  }
}
for (const root of CATEGORIES) flatten(root, null);

console.log(`📦 Flattened ${rows.length} categories from categories_data.json`);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function reseedCategories() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Clear existing data
    console.log('🗑️  Clearing existing categories…');
    await client.query('UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL');
    await client.query('DELETE FROM categories WHERE parent_id IS NULL');
    console.log('✅ Cleared.');

    // 2. Create a temp table to hold (key, name, parent_key) → then resolve UUIDs in SQL
    await client.query(`
      CREATE TEMP TABLE _cat_seed (
        key        INTEGER PRIMARY KEY,
        name       TEXT NOT NULL,
        parent_key INTEGER,
        new_id     UUID DEFAULT uuid_generate_v4()
      ) ON COMMIT DROP
    `);

    // 3. Bulk insert all rows in one VALUES list (split into chunks of 500 to stay under param limit)
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const values = chunk.map((_, j) => {
        const base = j * 3;
        return `($${base + 1}, $${base + 2}, $${base + 3})`;
      }).join(', ');
      const params = chunk.flatMap(r => [r.key, r.name, r.parentKey]);
      await client.query(
        `INSERT INTO _cat_seed (key, name, parent_key) VALUES ${values}`,
        params
      );
    }
    console.log(`✅ Loaded ${rows.length} rows into temp table.`);

    // 4. Insert roots first (parent_key IS NULL), then children level by level
    //    We do this iteratively until all rows are inserted into categories.
    //    Each pass inserts rows whose parent is already in categories.
    await client.query(`
      INSERT INTO categories (id, name, parent_id, is_active)
      SELECT new_id, name, NULL, true
      FROM _cat_seed
      WHERE parent_key IS NULL
    `);

    let remaining = rows.filter(r => r.parentKey !== null).length;
    let pass = 0;
    while (remaining > 0) {
      pass++;
      const result = await client.query(`
        INSERT INTO categories (id, name, parent_id, is_active)
        SELECT s.new_id, s.name, p.new_id, true
        FROM _cat_seed s
        JOIN _cat_seed p ON p.key = s.parent_key
        WHERE s.parent_key IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM categories c WHERE c.id = s.new_id
          )
          AND EXISTS (
            SELECT 1 FROM categories c WHERE c.id = p.new_id
          )
      `);
      remaining -= result.rowCount;
      console.log(`   Pass ${pass}: inserted ${result.rowCount} rows (${remaining} remaining)`);
      if (result.rowCount === 0) break; // safety — shouldn't happen
    }

    await client.query('COMMIT');
    console.log(`\n✨ Done! Inserted ${rows.length} categories total.`);

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

reseedCategories();
