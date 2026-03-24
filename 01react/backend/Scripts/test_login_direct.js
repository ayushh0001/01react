import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testLogin() {
  console.log('🧪 Testing Login Endpoint Directly...\n');

  try {
    // Test credentials
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    console.log('📧 Attempting login with:');
    console.log('   Email:', credentials.email);
    console.log('   Password:', credentials.password);
    console.log('   URL:', `${BASE_URL}/auth/login`);
    console.log('');

    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);

    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('');
    
    if (error.response?.status === 401) {
      console.log('💡 This means:');
      console.log('   - User does not exist, OR');
      console.log('   - Password is incorrect');
      console.log('');
      console.log('🔧 Try creating a test user:');
      console.log('   node backend/Scripts/create_test_user.js');
    }
  }
}

testLogin();
