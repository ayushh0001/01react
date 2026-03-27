import * as Minio from 'minio';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET = process.env.MINIO_BUCKET_NAME || 'zpin-ecommerce';

// Public read policy — allows anyone to GET objects
const publicPolicy = JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: { AWS: ['*'] },
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${BUCKET}/*`],
    },
  ],
});

async function run() {
  try {
    const exists = await client.bucketExists(BUCKET);
    if (!exists) {
      await client.makeBucket(BUCKET, 'us-east-1');
      console.log(`✅ Bucket '${BUCKET}' created`);
    } else {
      console.log(`ℹ️  Bucket '${BUCKET}' already exists`);
    }

    await client.setBucketPolicy(BUCKET, publicPolicy);
    console.log(`✅ Bucket '${BUCKET}' is now PUBLIC — images will load correctly`);

    // Test by listing a few objects
    const stream = client.listObjects(BUCKET, '', false);
    let count = 0;
    stream.on('data', (obj) => { if (++count <= 3) console.log('  Sample object:', obj.name); });
    stream.on('end', () => console.log(`  Total objects visible: ${count}+`));
    stream.on('error', (e) => console.error('List error:', e.message));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
