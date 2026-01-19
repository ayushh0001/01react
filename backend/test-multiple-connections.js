require('dotenv').config();
const mongoose = require('mongoose');

// Alternative connection strings to try
const connectionStrings = [
  // Original
  process.env.ZIPIN_MONGODBURL,
  
  // Without query parameters
  "mongodb+srv://zipinpvtltd:pggp8vOYgZw4aTAA@cluster0.c5xczc9.mongodb.net/ZipinDB",
  
  // With different options
  "mongodb+srv://zipinpvtltd:pggp8vOYgZw4aTAA@cluster0.c5xczc9.mongodb.net/ZipinDB?retryWrites=true&w=majority&appName=ZipinApp",
  
  // Standard MongoDB connection (if SRV fails)
  "mongodb://zipinpvtltd:pggp8vOYgZw4aTAA@ac-e4v5jzb-shard-00-00.c5xczc9.mongodb.net:27017,ac-e4v5jzb-shard-00-01.c5xczc9.mongodb.net:27017,ac-e4v5jzb-shard-00-02.c5xczc9.mongodb.net:27017/ZipinDB?ssl=true&replicaSet=atlas-13eolb-shard-0&authSource=admin&retryWrites=true&w=majority"
];

async function testMultipleConnections() {
  for (let i = 0; i < connectionStrings.length; i++) {
    console.log(`\n🔍 Testing connection ${i + 1}/${connectionStrings.length}`);
    console.log('Connection string:', connectionStrings[i].replace(/:[^:@]*@/, ':****@'));
    
    try {
      const connection = await mongoose.connect(connectionStrings[i], {
        serverSelectionTimeoutMS: 5000, // Quick timeout for testing
        socketTimeoutMS: 45000,
        family: 4
      });
      
      console.log('✅ Connection successful!');
      console.log('Connected to:', connection.connection.name);
      
      await mongoose.disconnect();
      console.log('✅ This connection string works!');
      console.log('Use this in your .env file:');
      console.log(`ZIPIN_MONGODBURL = "${connectionStrings[i]}"`);
      return;
      
    } catch (error) {
      console.error('❌ Failed:', error.message.split('.')[0]);
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('Please check:');
  console.log('1. MongoDB Atlas Network Access settings');
  console.log('2. Database user permissions');
  console.log('3. Cluster status (not paused)');
}

testMultipleConnections();