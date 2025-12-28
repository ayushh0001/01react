require('dotenv').config();
const express = require("express");
const colors = require('colors');
const cookieParser = require('cookie-parser');
const credentialsRoutes = require('./Routes/credentialsRoute');
const businessDetailRoutes = require('./Routes/businessDetailRoute');
const productRoutes = require('./Routes/productRoute');
const categoryRoutes = require('./Routes/categoryRoutes');
const cartRoutes = require('./Routes/cartRoute');
const wishlistRoutes = require('./Routes/wishlistRoute');
const userRoutes = require('./Routes/userRoute');
const verificationRoutes = require('./Routes/verificationRoute');

const path = require('path');
const authenticateToken = require('./Middleware/tokenauth');
const { connectDB } = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');



const server = express();

const cors = require('cors');

// Allow frontend Vercel domain + localhost for dev
server.use(cors({
  origin: [
    'https://01react.vercel.app/',// frontend live URL
    'http://localhost:3000',       // frontend local dev
    'http://localhost:5174'        // Vite dev server
  ],
  credentials: true  // if using cookies/JWT
}));

// Your other middleware and routes below...


server.use(express.json());
server.use(cookieParser());
server.use(morgan("dev"));



server.use('/api/v1/auth', credentialsRoutes);           // Authentication routes
server.use('/api/v1/verification', authenticateToken, verificationRoutes); // Verification services (GST/PAN)
server.use('/api/v1/users', authenticateToken, userRoutes);  // User profile management
server.use('/api/v1/cart', authenticateToken, cartRoutes);   // Cart operations
server.use('/api/v1/wishlist', authenticateToken, wishlistRoutes); // Wishlist operations
server.use('/api/v1/sellers', authenticateToken, businessDetailRoutes); // Seller operations
server.use('/api/v1/products', productRoutes);               // Product catalog (public + protected)
server.use('/api/v1/categories', categoryRoutes);            // Category management



async function startServer() {
  try {
    await connectDB();  // Wait for MongoDB connection before starting server
    server.listen(process.env.PORT || 5000, () => {
      console.log('Server is running on port', process.env.PORT || 5000);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();  // Start the app only after DB connection is ready

module.exports = server;
