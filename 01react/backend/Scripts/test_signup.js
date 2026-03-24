import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const API_BASE = 'http://localhost:5000/api/v1';

console.log('🧪 Testing Signup Flow\n');

async function testSignup() {
  try {
    const testUser = {
      userName: 'testuser_' + Date.now(),
      name: 'Test User',
      mobile: '8888888888',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      userRole: 'seller'
    };

    console.log('📤 Creating account...');
    console.log('User data:', {
      ...testUser,
      password: '***hidden***'
    });

    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, testUser);
    
    console.log('\n✅ Signup successful!');
    console.log('Response:', JSON.stringify(signupResponse.data, null, 2));

    const userData = signupResponse.data.data;
    console.log('\n📊 User created:');
    console.log('  - ID:', userData.user.id);
    console.log('  - Username:', userData.user.userName);
    console.log('  - Email:', userData.user.email);
    console.log('  - Role:', userData.user.userRole);
    console.log('  - Mobile:', userData.user.mobile);
    console.log('  - Token:', userData.token ? '✅ Generated' : '❌ Missing');

    // Test login
    console.log('\n🔐 Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    console.log('✅ Login successful!');
    console.log('  - Token:', loginResponse.data.data.token ? '✅ Generated' : '❌ Missing');

    console.log('\n🎉 All tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   npm run server:dev\n');
    }
  }
}

testSignup();
