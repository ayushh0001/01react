require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas connection...');
  console.log('Connection string:', process.env.ZIPIN_MONGODBURL.replace(/:[^:@]*@/, ':****@'));
  
  try {
    // Test with modern connection options only
    const connection = await mongoose.connect(process.env.ZIPIN_MONGODBURL, {
      serverSelectionTimeoutMS: 10000, // Shorter timeout for testing
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000
    });
    
    console.log('✅ Connection successful!');
    console.log('Connected to:', connection.connection.name);
    console.log('Host:', connection.connection.host);
    console.log('Port:', connection.connection.port);
    
    // Test a simple operation
    const admin = connection.connection.db.admin();
    const result = await admin.ping();
    console.log('✅ Ping successful:', result);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.reason) {
      console.error('Topology:', error.reason.type);
      console.error('Servers:', Array.from(error.reason.servers.keys()));
    }
    
    // Additional network diagnostics
    console.log('\n🔍 Network Diagnostics:');
    console.log('Your current IP might be different from what Atlas expects.');
    console.log('Try these steps:');
    console.log('1. Go to https://whatismyipaddress.com/ to check your current IP');
    console.log('2. Add that specific IP to MongoDB Atlas Network Access');
    console.log('3. Or ensure 0.0.0.0/0 is properly configured');
  }
}

testConnection();