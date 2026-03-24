import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const API_URL = process.env.BASE_URL || 'http://localhost:5000';

async function testCustomersAPI() {
  try {
    console.log('🧪 Testing Customers API...\n');

    // Step 1: Login as seller
    console.log('1️⃣ Logging in as seller...');
    const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'ayush@gmail.com',
      password: 'ayush0001@'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Fetch customers
    console.log('2️⃣ Fetching customers...');
    const customersResponse = await axios.get(`${API_URL}/api/v1/users/customers`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Customers fetched successfully');
    console.log(`📊 Total customers: ${customersResponse.data.count}`);
    console.log('\n👥 Customer List:');
    customersResponse.data.data.forEach((customer, index) => {
      console.log(`\n${index + 1}. ${customer.name}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Mobile: ${customer.mobile}`);
      console.log(`   Status: ${customer.is_active ? 'Active' : 'Inactive'}`);
      console.log(`   Verified: ${customer.is_verified ? 'Yes' : 'No'}`);
    });

    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCustomersAPI();
