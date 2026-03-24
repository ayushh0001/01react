import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test data
const testUser = {
  userName: 'testuser_' + Date.now(),
  name: 'Test User',
  mobile: '9876543210',
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123!',
  userRole: 'customer'
};

let authToken = null;

// Test signup
async function testSignup() {
  try {
    console.log('\n🧪 Testing Signup...');
    console.log('Data:', testUser);
    
    const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    
    console.log('✅ Signup successful!');
    console.log('User:', response.data.data.user);
    console.log('Token:', response.data.data.token.substring(0, 20) + '...');
    
    authToken = response.data.data.token;
    return response.data.data;
  } catch (error) {
    console.error('❌ Signup failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test login
async function testLogin() {
  try {
    console.log('\n🧪 Testing Login...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.data.user);
    
    authToken = response.data.data.token;
    return response.data.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test get profile (protected route)
async function testGetProfile() {
  try {
    console.log('\n🧪 Testing Get Profile (Protected Route)...');
    
    const response = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Get profile successful!');
    console.log('Profile:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test without token (should fail)
async function testUnauthorized() {
  try {
    console.log('\n🧪 Testing Unauthorized Access...');
    
    await axios.get(`${BASE_URL}/auth/profile`);
    console.log('❌ Should have failed but succeeded!');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected unauthorized access');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Authentication Tests...');
  console.log('=====================================\n');
  
  try {
    // Test 1: Signup
    await testSignup();
    
    // Test 2: Login
    await testLogin();
    
    // Test 3: Get Profile (with token)
    await testGetProfile();
    
    // Test 4: Unauthorized access
    await testUnauthorized();
    
    console.log('\n=====================================');
    console.log('✅ All tests passed!');
    console.log('\n📝 Summary:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
    console.log(`   Token: ${authToken.substring(0, 30)}...`);
    
  } catch (error) {
    console.log('\n=====================================');
    console.log('❌ Tests failed!');
    process.exit(1);
  }
}

// Run tests
runTests();
