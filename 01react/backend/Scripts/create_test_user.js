import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...\n');

    // Test user credentials
    const testUser = {
      userName: 'testuser',
      name: 'Test User',
      mobile: '9876543210',
      email: 'test@example.com',
      password: 'password123',
      userRole: 'customer'
    };

    // Check if user already exists by email
    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const existing = await pool.query(checkQuery, [testUser.email]);

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      console.log('⚠️  User already exists!');
      console.log('\n👤 Existing User:');
      console.log('   ID:', user.id);
      console.log('   Username:', user.user_name);
      console.log('   Email:', user.email);
      console.log('   Mobile:', user.mobile);
      console.log('   Role:', user.user_role);
      console.log('   Has Password:', user.password_hash ? 'Yes' : 'No (OAuth only)');
      
      console.log('\n📧 Login Credentials:');
      console.log('   Email:', testUser.email);
      console.log('   Password:', testUser.password);
      console.log('\n🌐 Login at: http://localhost:5173/login');
      
      // Test if password matches
      if (user.password_hash) {
        const bcrypt = (await import('bcryptjs')).default;
        const isMatch = await bcrypt.compare(testUser.password, user.password_hash);
        
        if (isMatch) {
          console.log('\n✅ Password matches! You can login now.');
        } else {
          console.log('\n⚠️  Password does NOT match!');
          console.log('💡 The user exists but has a different password.');
          console.log('   Either:');
          console.log('   1. Use the correct password, OR');
          console.log('   2. Delete and recreate the user:');
          console.log('      DELETE FROM users WHERE email = \'test@example.com\';');
        }
      }
      
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testUser.password, salt);

    // Insert user
    const insertQuery = `
      INSERT INTO users (user_name, name, mobile, email, password_hash, user_role, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_name, name, email, user_role
    `;

    const values = [
      testUser.userName,
      testUser.name,
      testUser.mobile,
      testUser.email,
      passwordHash,
      testUser.userRole,
      true // is_verified
    ];

    const result = await pool.query(insertQuery, values);
    const user = result.rows[0];

    console.log('✅ Test user created successfully!\n');
    console.log('👤 User Details:');
    console.log('   ID:', user.id);
    console.log('   Username:', user.user_name);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.user_role);
    
    console.log('\n📧 Login Credentials:');
    console.log('   Email:', testUser.email);
    console.log('   Password:', testUser.password);
    
    console.log('\n🌐 Login at: http://localhost:5173/login');
    console.log('\n💡 You can now login using these credentials!');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    
    if (error.code === '23505') {
      console.log('\n💡 User with this email or mobile already exists.');
      console.log('   Run: node backend/Scripts/check_user.js');
      console.log('   To see existing user details.');
    }
  } finally {
    await pool.end();
  }
}

createTestUser();
