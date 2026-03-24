import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function checkUser() {
  try {
    const email = 'test@example.com';
    const password = 'password123';

    console.log('🔍 Checking user in database...\n');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');

    // Check if user exists
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      console.log('❌ User NOT FOUND in database!');
      console.log('');
      console.log('💡 Create user with:');
      console.log('   node backend/Scripts/create_test_user.js');
    } else {
      const user = result.rows[0];
      console.log('✅ User FOUND in database!');
      console.log('');
      console.log('User details:');
      console.log('   ID:', user.id);
      console.log('   Username:', user.user_name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.user_role);
      console.log('   Verified:', user.is_verified);
      console.log('   Active:', user.is_active);
      console.log('   Has password:', user.password_hash ? 'Yes' : 'No');
      console.log('   Has Google ID:', user.google_id ? 'Yes' : 'No');
      console.log('');

      // Test password
      if (user.password_hash) {
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log('🔐 Password test:');
        console.log('   Password matches:', isValid ? '✅ YES' : '❌ NO');
        
        if (!isValid) {
          console.log('');
          console.log('💡 Password does not match!');
          console.log('   The user exists but the password is wrong.');
          console.log('   Try resetting the password or create a new test user.');
        }
      } else {
        console.log('⚠️  User has no password (OAuth-only user)');
        console.log('   This user can only login with Google.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();
