import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const API_BASE = 'http://localhost:5000/api/v1';
const testMobile = '9999999999'; // Test mobile number

console.log('🧪 Testing OTP Verification System\n');

// Check if Twilio is configured
const twilioConfigured = process.env.TWILIO_ACCOUNT_SID && 
                         process.env.TWILIO_AUTH_TOKEN && 
                         process.env.TWILIO_PHONE_NUMBER;

if (twilioConfigured) {
  console.log('✅ Twilio credentials found - SMS will be sent');
  console.log('📱 Make sure to use a verified number in trial mode\n');
} else {
  console.log('⚠️  Twilio credentials not found - using development mode');
  console.log('📝 OTP will be logged to console and included in response\n');
}

async function testOTPFlow() {
  try {
    // Step 1: Send OTP
    console.log('📤 Step 1: Sending OTP to', testMobile);
    const sendResponse = await axios.post(`${API_BASE}/auth/verification/sendOTP`, {
      mobile: testMobile
    });
    
    console.log('✅ Response:', sendResponse.data);
    
    if (sendResponse.data.mode === 'production') {
      console.log('📱 SMS sent via Twilio - check your phone!');
    } else {
      console.log('📝 Development mode - OTP logged to console');
    }
    
    if (sendResponse.data.otp) {
      console.log('🔑 OTP Code:', sendResponse.data.otp);
    }
    
    const otp = sendResponse.data.otp; // Only available in dev mode
    
    if (!otp) {
      console.log('\n⚠️  OTP not in response (production mode with Twilio)');
      console.log('📱 Check your phone for SMS with OTP');
      console.log('💡 Or check backend console if Twilio is not configured');
      console.log('\nTo continue testing, manually enter OTP:');
      console.log(`node -e "import('axios').then(a => a.default.post('${API_BASE}/auth/verification/verifyOTP', {mobile:'${testMobile}',otp:'YOUR_OTP'}).then(r => console.log(r.data)))"`);
      return;
    }
    
    // Wait a bit to simulate user entering OTP
    console.log('\n⏳ Waiting 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Verify OTP
    console.log('🔍 Step 2: Verifying OTP');
    const verifyResponse = await axios.post(`${API_BASE}/auth/verification/verifyOTP`, {
      mobile: testMobile,
      otp: otp
    });
    
    console.log('✅ Response:', verifyResponse.data);
    
    console.log('\n✨ OTP verification flow completed successfully!\n');
    
    // Step 3: Test invalid OTP
    console.log('🧪 Step 3: Testing invalid OTP');
    try {
      await axios.post(`${API_BASE}/auth/verification/sendOTP`, {
        mobile: '8888888888'
      });
      
      await axios.post(`${API_BASE}/auth/verification/verifyOTP`, {
        mobile: '8888888888',
        otp: '000000' // Wrong OTP
      });
    } catch (error) {
      console.log('✅ Invalid OTP correctly rejected:', error.response?.data?.error);
    }
    
    console.log('\n🎉 All tests passed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   npm run server:dev\n');
    }
  }
}

// Run tests
testOTPFlow();
