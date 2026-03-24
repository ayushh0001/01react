import { minioClient, bucketName, listFiles, getFileStats } from '../config/minio.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('═══════════════════════════════════════════════════════════');
console.log('           MinIO Image Checker & Browser');
console.log('═══════════════════════════════════════════════════════════\n');

// Function to format bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Check MinIO connection
const checkConnection = async () => {
  try {
    console.log('🔍 Checking MinIO connection...\n');
    
    const exists = await minioClient.bucketExists(bucketName);
    
    if (exists) {
      console.log(`✅ Connected to MinIO successfully!`);
      console.log(`✅ Bucket "${bucketName}" exists\n`);
      return true;
    } else {
      console.log(`❌ Bucket "${bucketName}" does not exist`);
      console.log(`💡 Run the server to create the bucket automatically\n`);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to MinIO:', error.message);
    console.log('\n💡 Make sure MinIO is running on port 9000');
    console.log('💡 Check your .env file for correct credentials\n');
    return false;
  }
};

// List all files in bucket
const listAllFiles = async () => {
  try {
    console.log('📂 Listing all files in bucket...\n');
    
    const files = await listFiles();
    
    if (files.length === 0) {
      console.log('📭 No files found in the bucket\n');
      return [];
    }
    
    console.log(`📊 Found ${files.length} file(s):\n`);
    
    // Group files by folder
    const filesByFolder = {};
    
    files.forEach(file => {
      const folder = file.name.split('/')[0];
      if (!filesByFolder[folder]) {
        filesByFolder[folder] = [];
      }
      filesByFolder[folder].push(file);
    });
    
    // Display files grouped by folder
    for (const [folder, folderFiles] of Object.entries(filesByFolder)) {
      console.log(`\n📁 ${folder}/ (${folderFiles.length} files)`);
      console.log('─'.repeat(80));
      
      folderFiles.forEach((file, index) => {
        const fileName = file.name.split('/').pop();
        console.log(`  ${index + 1}. ${fileName}`);
        console.log(`     Size: ${formatBytes(file.size)}`);
        console.log(`     Modified: ${formatDate(file.lastModified)}`);
        console.log(`     URL: ${process.env.MINIO_PUBLIC_URL}/${bucketName}/${file.name}`);
        console.log('');
      });
    }
    
    return files;
  } catch (error) {
    console.error('❌ Error listing files:', error.message);
    return [];
  }
};

// List product images only
const listProductImages = async () => {
  try {
    console.log('\n🖼️  Product Images:\n');
    console.log('═'.repeat(80));
    
    const productFiles = await listFiles('products/');
    
    if (productFiles.length === 0) {
      console.log('📭 No product images found\n');
      return [];
    }
    
    console.log(`Found ${productFiles.length} product image(s):\n`);
    
    productFiles.forEach((file, index) => {
      const fileName = file.name.split('/').pop();
      console.log(`${index + 1}. ${fileName}`);
      console.log(`   Size: ${formatBytes(file.size)}`);
      console.log(`   Uploaded: ${formatDate(file.lastModified)}`);
      console.log(`   URL: ${process.env.MINIO_PUBLIC_URL}/${bucketName}/${file.name}`);
      console.log('');
    });
    
    return productFiles;
  } catch (error) {
    console.error('❌ Error listing product images:', error.message);
    return [];
  }
};

// Get bucket statistics
const getBucketStats = async () => {
  try {
    console.log('\n📊 Bucket Statistics:\n');
    console.log('═'.repeat(80));
    
    const files = await listFiles();
    
    if (files.length === 0) {
      console.log('No files in bucket\n');
      return;
    }
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name));
    const productImages = files.filter(f => f.name.startsWith('products/'));
    const profileImages = files.filter(f => f.name.startsWith('profiles/'));
    
    console.log(`Total Files: ${files.length}`);
    console.log(`Total Size: ${formatBytes(totalSize)}`);
    console.log(`Image Files: ${imageFiles.length}`);
    console.log(`Product Images: ${productImages.length}`);
    console.log(`Profile Images: ${profileImages.length}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error getting bucket stats:', error.message);
  }
};

// Display MinIO web console info
const displayWebConsoleInfo = () => {
  console.log('\n🌐 MinIO Web Console Access:\n');
  console.log('═'.repeat(80));
  console.log(`URL: http://localhost:9001`);
  console.log(`Username: ${process.env.MINIO_ACCESS_KEY || 'minioadmin'}`);
  console.log(`Password: ${process.env.MINIO_SECRET_KEY || 'minioadmin'}`);
  console.log('\n💡 Open this URL in your browser to browse files visually\n');
};

// Display direct image URLs
const displayImageUrls = async () => {
  try {
    console.log('\n🔗 Direct Image URLs:\n');
    console.log('═'.repeat(80));
    
    const productFiles = await listFiles('products/');
    
    if (productFiles.length === 0) {
      console.log('No product images to display\n');
      return;
    }
    
    console.log('Copy these URLs to test in your browser:\n');
    
    productFiles.forEach((file, index) => {
      const url = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${file.name}`;
      console.log(`${index + 1}. ${url}`);
    });
    
    console.log('\n💡 Paste any URL in your browser to view the image\n');
  } catch (error) {
    console.error('❌ Error displaying image URLs:', error.message);
  }
};

// Main function
const main = async () => {
  try {
    // Check connection
    const connected = await checkConnection();
    
    if (!connected) {
      console.log('❌ Cannot proceed without MinIO connection\n');
      console.log('═'.repeat(80));
      console.log('TROUBLESHOOTING STEPS:');
      console.log('═'.repeat(80));
      console.log('1. Make sure MinIO is running:');
      console.log('   - Check if MinIO server is started');
      console.log('   - Default port: 9000 (API), 9001 (Console)');
      console.log('');
      console.log('2. Verify .env configuration:');
      console.log(`   MINIO_ENDPOINT=${process.env.MINIO_ENDPOINT}`);
      console.log(`   MINIO_PORT=${process.env.MINIO_PORT}`);
      console.log(`   MINIO_ACCESS_KEY=${process.env.MINIO_ACCESS_KEY}`);
      console.log(`   MINIO_BUCKET_NAME=${process.env.MINIO_BUCKET_NAME}`);
      console.log('');
      console.log('3. Start MinIO if not running:');
      console.log('   - Windows: Run MinIO executable');
      console.log('   - Linux/Mac: minio server /data');
      console.log('');
      process.exit(1);
    }
    
    // Get bucket statistics
    await getBucketStats();
    
    // List all files
    await listAllFiles();
    
    // List product images specifically
    await listProductImages();
    
    // Display image URLs
    await displayImageUrls();
    
    // Display web console info
    displayWebConsoleInfo();
    
    console.log('═'.repeat(80));
    console.log('✅ MinIO check completed successfully!');
    console.log('═'.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
};

// Run the script
main();
