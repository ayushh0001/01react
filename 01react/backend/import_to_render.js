import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://zpin_user:yORsQ5NRnUc9kPUNpvG13sZxo7Kg2PEm@dpg-d6v588f5r7bs73ekbmag-a.oregon-postgres.render.com/zpin_ecommerce',
  ssl: { rejectUnauthorized: false }
});

const UUID_MAP = {
  '87bc0bd7-9dd3-4eb8-b6a3-2655d7930938': '5b6e1984-efbe-4838-90fe-47a5c54f2b7c',
};

const TABLE_ORDER = [
  'users', 'categories', 'seller_business_details', 'seller_bank_details',
  'products', 'product_images', 'orders', 'order_items', 'seller_earnings',
];

function remapUUIDs(sql) {
  let result = sql;
  for (const [localId, renderId] of Object.entries(UUID_MAP)) {
    result = result.replaceAll(localId, renderId);
  }
  return result;
}

function parseStatements(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (escape) { current += ch; escape = false; continue; }
    if (ch === '\\' && inString) { current += ch; escape = true; continue; }
    if (ch === "'") { inString = !inString; current += ch; continue; }
    if (ch === ';' && !inString) {
      const stmt = current.trim();
      if (stmt.length > 0) statements.push(stmt);
      current = '';
    } else {
      current += ch;
    }
  }
  const last = current.trim();
  if (last.length > 0) statements.push(last);
  return statements;
}

function getTableName(stmt) {
  const match = stmt.match(/INSERT INTO public\.(\w+)/i);
  return match ? match[1] : null;
}

// Rewrite product inserts to use explicit column names
function rewriteProductInsert(stmt) {
  return stmt.replace(
    /INSERT INTO public\.products VALUES/i,
    `INSERT INTO public.products (id, user_id, product_name, description, category_id, deepest_category_name, category_path, price, quantity, in_stock, is_approved, approval_notes, created_at, updated_at, size_quantities, search_tags, search_vector, extracted_attributes) VALUES`
  );
}

// Parse VALUES(...) into individual value tokens, respecting nested parens/quotes
function parseValues(valuesStr) {
  const values = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < valuesStr.length; i++) {
    const ch = valuesStr[i];
    if (escape) { current += ch; escape = false; continue; }
    if (ch === '\\' && inString) { current += ch; escape = true; continue; }
    if (ch === "'" && !inString) { inString = true; current += ch; continue; }
    if (ch === "'" && inString) { inString = false; current += ch; continue; }
    if (!inString && ch === '(') { depth++; current += ch; continue; }
    if (!inString && ch === ')') {
      if (depth > 0) { depth--; current += ch; continue; }
      // end of values
      values.push(current.trim());
      break;
    }
    if (!inString && depth === 0 && ch === ',') {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  return values;
}

// Rewrite orders inserts - local has 31 cols, Render has 25
// Take only first 25 values
function rewriteOrderInsert(stmt) {
  const match = stmt.match(/INSERT INTO public\.orders VALUES \(([\s\S]+)\)$/i);
  if (!match) return stmt;
  
  const values = parseValues(match[1]);
  const first25 = values.slice(0, 25);
  
  return `INSERT INTO public.orders (id, order_number, user_id, seller_id, status, payment_status, total_amount, shipping_amount, tax_amount, final_amount, shipping_address, payment_method, payment_id, delivery_boy_id, delivery_status, delivery_fee, partner_earning, distance, estimated_time, otp, estimated_delivery, tracking_number, notes, created_at, updated_at) VALUES (${first25.join(', ')})`;
}

async function run() {
  const sqlFile = path.join(__dirname, '../../local_data_export.sql');
  let sql = fs.readFileSync(sqlFile, 'utf8');
  sql = remapUUIDs(sql);

  const statements = parseStatements(sql);
  const insertStmts = statements.filter(s => /^INSERT/i.test(s));
  console.log(`Total INSERT statements: ${insertStmts.length}`);

  const byTable = {};
  for (const stmt of insertStmts) {
    const tbl = getTableName(stmt);
    if (!tbl) continue;
    if (!byTable[tbl]) byTable[tbl] = [];
    byTable[tbl].push(stmt);
  }

  const orderedTables = [
    ...TABLE_ORDER.filter(t => byTable[t]),
    ...Object.keys(byTable).filter(t => !TABLE_ORDER.includes(t))
  ];

  console.log('Import order:', orderedTables.join(' -> '));

  const client = await pool.connect();
  try {
    let totalSuccess = 0, totalErrors = 0;

    for (const tbl of orderedTables) {
      let stmts = byTable[tbl];
      
      // Rewrite product inserts to use explicit column names
      if (tbl === 'products') {
        stmts = stmts.map(rewriteProductInsert);
      }
      // Rewrite order inserts to truncate extra columns
      if (tbl === 'orders') {
        stmts = stmts.map(rewriteOrderInsert);
      }

      let success = 0, errors = 0;
      await client.query('BEGIN');
      for (const stmt of stmts) {
        try {
          await client.query(stmt + ' ON CONFLICT DO NOTHING');
          success++;
        } catch (err) {
          // Rollback this statement's effect and continue
          await client.query('ROLLBACK');
          await client.query('BEGIN');
          if (errors < 3) {
            console.error(`  [${tbl}] Error: ${err.message}`);
            console.error(`  Statement: ${stmt.substring(0, 150)}`);
          }
          errors++;
        }
      }
      await client.query('COMMIT');
      console.log(`  ${tbl}: ${success} inserted, ${errors} errors`);
      totalSuccess += success;
      totalErrors += errors;
    }

    console.log(`\nTotal: ${totalSuccess} inserted, ${totalErrors} errors`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Fatal error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
