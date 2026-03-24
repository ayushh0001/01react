import dotenv from 'dotenv';
import { minioClient, bucketName, initializeBucket } from '../config/minio.js';

dotenv.config();

async function testMinIO() {
  try {
    console.log('🔍 Testing MinIO connection...\n');
    
    // Test connection
    console.log('📡 Connecting to MinIO...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ Connected to MinIO successfully!\n');
    
    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (created: ${bucket.creationDate})`);
    });
    
    // Initialize bucket
    console.log('\n🔧 Initializing bucket...');
    await initializeBucket();
    
    // Check if our bucket exists
    const exists = await minioClient.bucketExists(bucketName);
    console.log(`\n✅ Bucket "${bucketName}" exists: ${exists}`);
    
    if (exists) {
      console.log('\n🎉 MinIO setup is complete and working!');
      console.log(`\n📍 Access MinIO Console: http://localhost:9001`);
      console.log(`📍 API Endpoint: http://localhost:9000`);
      console.log(`📍 Bucket: ${bucketName}`);
    }
    
  } catch (error) {
    console.error('\n❌ MinIO connection failed:');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MinIO is running (check the other terminal)');
    console.error('2. Verify MinIO is accessible at http://localhost:9000');
    console.error('3. Check your .env file configuration');
  }
}

testMinIO();
