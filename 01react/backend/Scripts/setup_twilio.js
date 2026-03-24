import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🔧 Twilio SMS Setup Wizard\n');
console.log('This wizard will help you configure Twilio for OTP SMS.\n');

async function setupTwilio() {
  try {
    console.log('📋 You will need:');
    console.log('   1. Twilio Account SID (starts with AC...)');
    console.log('   2. Twilio Auth Token');
    console.log('   3. Twilio Phone Number (with country code, e.g., +12345678900)\n');
    console.log('Get these from: https://console.twilio.com\n');

    const proceed = await question('Do you have your Twilio credentials ready? (yes/no): ');
    
    if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
      console.log('\n📚 Setup Instructions:');
      console.log('   1. Go to https://console.twilio.com');
      console.log('   2. Sign up or log in');
      console.log('   3. Copy Account SID and Auth Token from dashboard');
      console.log('   4. Get a phone number from Phone Numbers → Manage → Active Numbers');
      console.log('   5. Run this script again\n');
      rl.close();
      return;
    }

    console.log('\n');
    const accountSid = await question('Enter Twilio Account SID: ');
    const authToken = await question('Enter Twilio Auth Token: ');
    const phoneNumber = await question('Enter Twilio Phone Number (with +): ');

    // Validate inputs
    if (!accountSid.startsWith('AC')) {
      console.log('\n❌ Invalid Account SID. It should start with "AC"');
      rl.close();
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      console.log('\n❌ Invalid phone number. It should start with "+" (e.g., +12345678900)');
      rl.close();
      return;
    }

    // Read current .env file
    const envPath = join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update Twilio credentials
    envContent = envContent.replace(
      /TWILIO_ACCOUNT_SID=.*/,
      `TWILIO_ACCOUNT_SID=${accountSid}`
    );
    envContent = envContent.replace(
      /TWILIO_AUTH_TOKEN=.*/,
      `TWILIO_AUTH_TOKEN=${authToken}`
    );
    envContent = envContent.replace(
      /TWILIO_PHONE_NUMBER=.*/,
      `TWILIO_PHONE_NUMBER=${phoneNumber}`
    );

    // Write back to .env
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Twilio credentials saved to .env file!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your backend server:');
    console.log('      npm run server:dev');
    console.log('   2. Test OTP sending:');
    console.log('      node backend/Scripts/test_otp.js');
    console.log('   3. Or test in browser:');
    console.log('      http://localhost:5173/phone\n');

    console.log('⚠️  Trial Account Notes:');
    console.log('   - You can only send SMS to verified phone numbers');
    console.log('   - Verify numbers at: https://console.twilio.com/phone-numbers/verified');
    console.log('   - Messages will include "Sent from your Twilio trial account"');
    console.log('   - Upgrade account to remove restrictions\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

setupTwilio();
