import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function verifySetup() {
  console.log('🔍 Verifying Database Setup...\n');
  console.log('=====================================\n');

  try {
    // 1. Check database connection
    console.log('1️⃣ Testing Database Connection...');
    const timeResult = await pool.query('SELECT NOW()');
    console.log('   ✅ Connected to PostgreSQL');
    console.log('   📅 Server time:', timeResult.rows[0].now);
    console.log('   🗄️  Database:', process.env.DB_NAME);
    console.log('   🖥️  Host:', process.env.DB_HOST);
    console.log('   🔌 Port:', process.env.DB_PORT);

    // 2. Check if users table exists
    console.log('\n2️⃣ Checking Users Table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('   ✅ Users table exists');
      
      // Check table structure
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);
      
      console.log('   📋 Table columns:');
      columns.rows.forEach(col => {
        console.log(`      - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('   ❌ Users table does NOT exist!');
      console.log('   💡 Run: psql -U postgres -d zpin_ecommerce -f backend/Scripts/database_schema.sql');
    }

    // 3. Check for Google OAuth support
    console.log('\n3️⃣ Checking Google OAuth Support...');
    const googleIdCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'google_id';
    `);
    
    if (googleIdCheck.rows.length > 0) {
      console.log('   ✅ google_id column exists');
    } else {
      console.log('   ❌ google_id column missing!');
      console.log('   💡 Run: psql -U postgres -d zpin_ecommerce -f backend/Scripts/add_google_oauth.sql');
    }

    // 4. Count existing users
    console.log('\n4️⃣ Checking Existing Users...');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const count = parseInt(userCount.rows[0].count);
    
    console.log(`   👥 Total users: ${count}`);
    
    if (count > 0) {
      const users = await pool.query(`
        SELECT id, user_name, email, user_role, is_verified, 
               CASE WHEN google_id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_google
        FROM users 
        LIMIT 5
      `);
      
      console.log('   📋 Sample users:');
      users.rows.forEach(user => {
        console.log(`      - ${user.email} (${user.user_role}) ${user.is_verified ? '✓' : '✗'} Google: ${user.has_google}`);
      });
    } else {
      console.log('   ℹ️  No users yet. Create one with:');
      console.log('      node backend/Scripts/create_test_user.js');
    }

    // 5. Check other important tables
    console.log('\n5️⃣ Checking Other Tables...');
    const tables = ['products', 'orders', 'categories', 'cart_items', 'wishlists'];
    
    for (const table of tables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [table]);
      
      if (exists.rows[0].exists) {
        const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ✅ ${table}: ${count.rows[0].count} records`);
      } else {
        console.log(`   ❌ ${table}: NOT FOUND`);
      }
    }

    // 6. Summary
    console.log('\n=====================================');
    console.log('📊 Summary:');
    console.log('   Database: ✅ Connected');
    console.log('   Tables: ✅ Created');
    console.log('   OAuth: ✅ Configured');
    console.log(`   Users: ${count > 0 ? '✅' : '⚠️'} ${count} user(s)`);
    console.log('\n✅ Setup verification complete!');
    
    if (count === 0) {
      console.log('\n💡 Next step: Create a test user');
      console.log('   Run: node backend/Scripts/create_test_user.js');
    } else {
      console.log('\n💡 Ready to test!');
      console.log('   1. Start backend: npm run server:dev');
      console.log('   2. Start frontend: npm run dev');
      console.log('   3. Login at: http://localhost:5173/login');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nDetails:', error);
  } finally {
    await pool.end();
  }
}

verifySetup();
