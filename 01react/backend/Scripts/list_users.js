import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function listUsers() {
  try {
    console.log('👥 Listing all users in database...\n');

    const query = `
      SELECT 
        id, 
        user_name, 
        name, 
        email, 
        mobile, 
        user_role, 
        is_verified,
        is_active,
        CASE WHEN password_hash IS NOT NULL THEN 'Yes' ELSE 'No' END as has_password,
        CASE WHEN google_id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_google,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\n💡 Create a test user:');
      console.log('   node backend/Scripts/create_test_user.js');
    } else {
      console.log(`✅ Found ${result.rows.length} user(s):\n`);
      
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.user_role})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Mobile: ${user.mobile}`);
        console.log(`   Username: ${user.user_name}`);
        console.log(`   Password: ${user.has_password}`);
        console.log(`   Google: ${user.has_google}`);
        console.log(`   Verified: ${user.is_verified ? 'Yes' : 'No'}`);
        console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });

      console.log('💡 To login with any of these users:');
      console.log('   - Use their email and password');
      console.log('   - Or use Google OAuth if they have Google linked');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

listUsers();
