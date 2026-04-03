import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './config/database.js';
import { initializeBucket } from './config/minio.js';
import passport from './config/passport.js';
import authRoutes from './Routes/authRoutes.js';
import sellerRoutes from './Routes/sellerRoutes.js';
import orderRoutes from './Routes/orderRoutes.js';
import productRoutes from './Routes/productRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import passwordResetRoutes from './Routes/passwordResetRoutes.js';
import notificationRoutes from './Routes/notificationRoutes.js';
import { runMigrations } from './Scripts/run_migrations.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env for local development (no-op on Render)
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for passport)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'disconnected',
      error: error.message
    });
  }
});

// MinIO health check
app.get('/health/storage', async (req, res) => {
  try {
    const { minioClient, bucketName } = await import('./config/minio.js');
    const exists = await minioClient.bucketExists(bucketName);
    res.json({
      status: 'OK',
      storage: 'connected',
      bucket: bucketName,
      bucketExists: exists
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      storage: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', sellerRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/password-reset', passwordResetRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// ── Image proxy — serves MinIO objects through the backend so localhost URLs
//    stored in the DB work in production (avoids mixed-content / CORS errors)
app.get('/api/v1/images/*path', async (req, res) => {
  try {
    const { minioClient, bucketName } = await import('./config/minio.js');
    // Strip /api/v1/images/<bucketName>/ prefix to get the object key
    const fullPath = req.params.path; // everything after /api/v1/images/
    const prefix = `${bucketName}/`;
    const objectKey = fullPath.startsWith(prefix) ? fullPath.slice(prefix.length) : fullPath;

    const stat = await minioClient.statObject(bucketName, objectKey);
    res.setHeader('Content-Type', stat.metaData?.['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    const stream = await minioClient.getObject(bucketName, objectKey);
    stream.pipe(res);
  } catch (err) {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Make pool available to routes
app.locals.pool = pool;

// API info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Zpin E-Commerce API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      database: '/health/db',
      storage: '/health/storage',
      auth: {
        signup: 'POST /api/v1/auth/signup',
        login: 'POST /api/v1/auth/login',
        googleLogin: 'GET /api/v1/auth/google',
        profile: 'GET /api/v1/auth/profile',
        logout: 'POST /api/v1/auth/logout',
        refreshToken: 'POST /api/v1/auth/refresh-token'
      },
      seller: {
        businessDetails: 'POST /api/v1/users/seller/business-details',
        getBusinessDetails: 'GET /api/v1/users/seller/business-details',
        bankDetails: 'POST /api/v1/users/seller/bank-details',
        getBankDetails: 'GET /api/v1/users/seller/bank-details'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize services and start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const dbResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', dbResult.rows[0].now);

    // Run schema migrations
    await runMigrations();

    // Initialize MinIO bucket (non-fatal — skip if not configured)
    if (process.env.MINIO_ENDPOINT && process.env.MINIO_ENDPOINT !== 'localhost') {
      console.log('🔍 Initializing MinIO bucket...');
      try {
        await initializeBucket();
        console.log('✅ MinIO initialized');
      } catch (minioErr) {
        console.warn('⚠️  MinIO unavailable, file uploads disabled:', minioErr.message);
      }
    } else {
      console.warn('⚠️  MinIO not configured, skipping storage init');
    }

    // Bind to 0.0.0.0 in production (required by Render), 127.0.0.1 locally
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    app.listen(PORT, host, () => {
      console.log('\n🚀 Server is running!');
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Database: ${process.env.DB_NAME}`);
      console.log(`📍 Storage: MinIO (${process.env.MINIO_BUCKET_NAME})`);
      console.log('\n📚 API Endpoints:');
      console.log(`   - Health: http://localhost:${PORT}/health`);
      console.log(`   - Database: http://localhost:${PORT}/health/db`);
      console.log(`   - Storage: http://localhost:${PORT}/health/storage`);
      console.log(`   - API: http://localhost:${PORT}/api/v1`);
      console.log('\n✨ Ready to accept requests!\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();
