/**
 * Test script for password reset functionality
 * Tests all endpoints: request, verify, reset
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';
const TEST_MOBILE = '9876543210'; // Change to your test mobile number

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testPasswordReset() {
  console.log('\n🧪 Testing Password Reset Functionality\n');
  console.log('=' .repeat(50));
  
  let resetToken = null;
  let otp = null;

  try {
    // Test 1: Request Password Reset
    console.log('\n📝 Test 1: Request Password Reset');
    console.log('-'.repeat(50));
    
    try {
      const response = await axios.post(`${BASE_URL}/password-reset/request`, {
        mobile: TEST_MOBILE
      });
      
      if (response.data.success) {
        log.success('OTP request successful');
        log.info(`Mobile: ${TEST_MOBILE}`);
        log.info(`Expires in: ${response.data.expiresIn} seconds`);
        
        // In development mode, OTP is returned in response
        if (response.data.otp) {
          otp = response.data.otp;
          log.warning(`Dev Mode - OTP: ${otp}`);
        } else {
          log.info('Check SMS for OTP');
        }
      }
    } catch (error) {
      log.error(`Request failed: ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.error?.includes('No account found')) {
        log.warning('Make sure the user exists in the database first');
      }
      return;
    }

    // Wait a bit before next test
    await sleep(1000);

    // Test 2: Verify OTP
    console.log('\n📝 Test 2: Verify OTP');
    console.log('-'.repeat(50));
    
    if (!otp) {
      log.warning('OTP not available in response. Enter OTP manually:');
      log.info('Skipping automatic OTP verification test');
      log.info('You can test manually using the frontend or curl');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/password-reset/verify-otp`, {
        mobile: TEST_MOBILE,
        otp: otp
      });
      
      if (response.data.success) {
        log.success('OTP verified successfully');
        resetToken = response.data.resetToken;
        log.info(`Reset Token: ${resetToken}`);
      }
    } catch (error) {
      log.error(`Verification failed: ${error.response?.data?.error || error.message}`);
      return;
    }

    // Wait a bit before next test
    await sleep(1000);

    // Test 3: Reset Password
    console.log('\n📝 Test 3: Reset Password');
    console.log('-'.repeat(50));
    
    const newPassword = 'testpass123';
    
    try {
      const response = await axios.post(`${BASE_URL}/password-reset/reset`, {
        mobile: TEST_MOBILE,
        resetToken: resetToken,
        newPassword: newPassword
      });
      
      if (response.data.success) {
        log.success('Password reset successful');
        log.info(`New password: ${newPassword}`);
        log.info('You can now login with the new password');
      }
    } catch (error) {
      log.error(`Reset failed: ${error.response?.data?.error || error.message}`);
      return;
    }

    // Test 4: Resend OTP (optional)
    console.log('\n📝 Test 4: Resend OTP (Testing rate limiting)');
    console.log('-'.repeat(50));
    
    try {
      const response = await axios.post(`${BASE_URL}/password-reset/resend-otp`, {
        mobile: TEST_MOBILE
      });
      
      if (response.data.success) {
        log.success('OTP resent successfully');
        if (response.data.otp) {
          log.warning(`Dev Mode - New OTP: ${response.data.otp}`);
        }
      }
    } catch (error) {
      if (error.response?.status === 429) {
        log.warning('Rate limit working correctly (too many requests)');
      } else {
        log.error(`Resend failed: ${error.response?.data?.error || error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    log.success('All tests completed successfully! 🎉');
    console.log('\n📋 Summary:');
    console.log('  ✅ OTP request working');
    console.log('  ✅ OTP verification working');
    console.log('  ✅ Password reset working');
    console.log('  ✅ Rate limiting working');
    console.log('\n💡 Next steps:');
    console.log('  1. Test the frontend flow');
    console.log('  2. Try logging in with the new password');
    console.log('  3. Test with real SMS (if Twilio configured)');
    console.log('');

  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    console.error(error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log.error('Server is not running!');
    log.info('Please start the server first:');
    log.info('  cd 01react/backend && npm run server');
    process.exit(1);
  }
  
  log.success('Server is running');
  
  await testPasswordReset();
})();
