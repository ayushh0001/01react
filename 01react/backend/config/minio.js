import * as Minio from 'minio';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, '..', '.env') });

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  region: process.env.MINIO_REGION || 'us-east-1'
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'zpin-ecommerce';

// Initialize bucket
const initializeBucket = async () => {
  try {
    // Check if bucket exists
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      // Create bucket
      await minioClient.makeBucket(bucketName, process.env.MINIO_REGION || 'us-east-1');
      console.log(`✅ Bucket "${bucketName}" created successfully`);
      
      // Set bucket policy to public read for product images
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/products/*`, `arn:aws:s3:::${bucketName}/profiles/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`✅ Bucket policy set for public access`);
    } else {
      console.log(`✅ Bucket "${bucketName}" already exists`);
    }
  } catch (error) {
    console.error('❌ Error initializing MinIO bucket:', error);
    throw error;
  }
};

// Upload file to MinIO
const uploadFile = async (file, folder = 'uploads') => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const metaData = {
      'Content-Type': file.mimetype
    };

    await minioClient.putObject(
      bucketName,
      fileName,
      file.buffer,
      file.size,
      metaData
    );

    // Generate public URL
    const publicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${fileName}`;
    
    return {
      success: true,
      fileName,
      url: publicUrl,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('❌ Error uploading file to MinIO:', error);
    throw error;
  }
};

// Upload multiple files
const uploadMultipleFiles = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('❌ Error uploading multiple files:', error);
    throw error;
  }
};

// Delete file from MinIO
const deleteFile = async (fileName) => {
  try {
    await minioClient.removeObject(bucketName, fileName);
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting file from MinIO:', error);
    throw error;
  }
};

// Delete multiple files
const deleteMultipleFiles = async (fileNames) => {
  try {
    await minioClient.removeObjects(bucketName, fileNames);
    return { success: true, message: 'Files deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting multiple files:', error);
    throw error;
  }
};

// Get file URL (for private files with expiry)
const getFileUrl = async (fileName, expirySeconds = 3600) => {
  try {
    const url = await minioClient.presignedGetObject(bucketName, fileName, expirySeconds);
    return url;
  } catch (error) {
    console.error('❌ Error generating file URL:', error);
    throw error;
  }
};

// List files in a folder
const listFiles = async (prefix = '') => {
  try {
    const stream = minioClient.listObjects(bucketName, prefix, true);
    const files = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj));
      stream.on('error', reject);
      stream.on('end', () => resolve(files));
    });
  } catch (error) {
    console.error('❌ Error listing files:', error);
    throw error;
  }
};

// Get file stats
const getFileStats = async (fileName) => {
  try {
    const stats = await minioClient.statObject(bucketName, fileName);
    return stats;
  } catch (error) {
    console.error('❌ Error getting file stats:', error);
    throw error;
  }
};

export {
  minioClient,
  bucketName,
  initializeBucket,
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  getFileUrl,
  listFiles,
  getFileStats
};
