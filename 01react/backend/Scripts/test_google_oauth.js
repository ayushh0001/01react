import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔍 Google OAuth Configuration Check\n');
console.log('=====================================\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || '❌ Missing');
console.log('');

// Show actual values (partially hidden)
if (process.env.GOOGLE_CLIENT_ID) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  console.log('2️⃣ Client ID (partial):');
  console.log('   ' + clientId.substring(0, 20) + '...' + clientId.substring(clientId.length - 20));
  console.log('');
}

if (process.env.GOOGLE_CLIENT_SECRET) {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  console.log('3️⃣ Client Secret (partial):');
  console.log('   ' + secret.substring(0, 10) + '...' + secret.substring(secret.length - 5));
  console.log('');
}

console.log('4️⃣ Callback URL:');
console.log('   ' + (process.env.GOOGLE_CALLBACK_URL || 'NOT SET'));
console.log('');

console.log('5️⃣ Required Google Console Settings:');
console.log('');
console.log('   📍 Authorized JavaScript origins:');
console.log('      - http://localhost:5173');
console.log('      - http://localhost:5000');
console.log('');
console.log('   📍 Authorized redirect URIs:');
console.log('      - http://localhost:5000/api/v1/auth/google/callback');
console.log('      - http://localhost:5173/auth/callback');
console.log('');

console.log('6️⃣ OAuth Consent Screen:');
console.log('   - Publishing status: Testing');
console.log('   - User type: External');
console.log('   - Test users: Add your email');
console.log('');

console.log('7️⃣ Test URLs:');
console.log('   🌐 Start OAuth flow:');
console.log('      http://localhost:5000/api/v1/auth/google');
console.log('');
console.log('   🌐 Frontend login:');
console.log('      http://localhost:5173/login');
console.log('');

console.log('=====================================');
console.log('');

// Check if backend is running
console.log('8️⃣ Testing Backend Connection...');
import('axios').then(async (axiosModule) => {
  const axios = axiosModule.default;
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('   ✅ Backend is running');
    console.log('   Status:', response.data.status);
  } catch (error) {
    console.log('   ❌ Backend is NOT running');
    console.log('   💡 Start with: npm run server:dev');
  }
  console.log('');
  console.log('✅ Configuration check complete!');
}).catch(() => {
  console.log('   ⚠️  Could not test backend (axios not installed)');
  console.log('');
  console.log('✅ Configuration check complete!');
});
