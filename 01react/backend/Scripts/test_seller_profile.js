import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const API_URL = 'http://localhost:5000/api/v1';

async function testSellerProfile() {
  console.log('\n🧪 Testing Seller Profile Endpoint\n');
  console.log('=' .repeat(50));

  try {
    // First, login to get a token
    console.log('\n1️⃣ Logging in to get authentication token...');
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      mobile: '1234567890', // Use a test user mobile
      password: 'Test@123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed. Please create a test user first.');
      console.log('Run: node Scripts/create_test_user.js');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...');

    // Test the seller profile endpoint
    console.log('\n2️⃣ Fetching seller profile...');
    
    const profileResponse = await axios.get(`${API_URL}/users/seller/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n✅ Profile fetched successfully!\n');
    console.log('Response structure:');
    console.log(JSON.stringify(profileResponse.data, null, 2));

    // Display formatted data
    const data = profileResponse.data.data;
    
    console.log('\n📋 User Information:');
    console.log('  Name:', data.user?.name || 'N/A');
    console.log('  Mobile:', data.user?.mobile || 'N/A');
    console.log('  Email:', data.user?.email || 'N/A');
    console.log('  Role:', data.user?.userRole || 'N/A');

    console.log('\n🏪 Business Details:');
    if (data.businessDetails) {
      console.log('  Business Name:', data.businessDetails.businessName || 'N/A');
      console.log('  Address:', data.businessDetails.address || 'N/A');
      console.log('  City:', data.businessDetails.city || 'N/A');
      console.log('  State:', data.businessDetails.state || 'N/A');
      console.log('  Pincode:', data.businessDetails.pincode || 'N/A');
      console.log('  GST No:', data.businessDetails.gstNo || 'N/A');
      console.log('  PAN No:', data.businessDetails.panNo || 'N/A');
    } else {
      console.log('  ⚠️  No business details found');
    }

    console.log('\n💳 Bank Details:');
    if (data.bankDetails) {
      console.log('  Account Holder:', data.bankDetails.accountHolderName || 'N/A');
      console.log('  Bank Name:', data.bankDetails.bankName || 'N/A');
      console.log('  Account Number:', data.bankDetails.accountNumber || 'N/A');
      console.log('  IFSC Code:', data.bankDetails.ifscCode || 'N/A');
    } else {
      console.log('  ⚠️  No bank details found');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n💡 Make sure:');
    console.log('  1. Backend server is running (npm run dev)');
    console.log('  2. Database is running and connected');
    console.log('  3. Test user exists (run: node Scripts/create_test_user.js)');
    console.log('  4. User has completed business and bank details\n');
  }
}

testSellerProfile();
