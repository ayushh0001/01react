require('dotenv').config();
const express = require("express");
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require("cors"); // ✅ ADD THIS
const morgan = require('morgan');

const credentialsRoutes = require('./Routes/credentialsRoute');
const businessDetailRoutes = require('./Routes/businessDetailRoute');
const productRoutes = require('./Routes/productRoute');
const categoryRoutes = require('./Routes/categoryRoutes');
const cartRoutes = require('./Routes/cartRoute');
const wishlistRoutes = require('./Routes/wishlistRoute');
const userRoutes = require('./Routes/userRoute');

const authenticateToken = require('./Middleware/tokenauth');
const { connectDB } = require('./Config/db');

const server = express();

/* ---------------- MIDDLEWARES ---------------- */

server.use(express.json());
server.use(cookieParser());

// ✅ CORS FIX (MOST IMPORTANT)
server.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174"
    ], // frontend ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

server.use(morgan("dev"));

/* ---------------- ROUTES ---------------- */

// Auth (Signup, Login, OTP, Logout)
server.use('/api/v1/auth', credentialsRoutes);

// Users
server.use('/api/v1/users', authenticateToken, userRoutes);

// Cart
server.use('/api/v1/cart', authenticateToken, cartRoutes);

// Wishlist
server.use('/api/v1/wishlist', authenticateToken, wishlistRoutes);

// Seller
server.use('/api/v1/sellers', authenticateToken, businessDetailRoutes);

// Products
server.use('/api/v1/products', productRoutes);

// Categories
server.use('/api/v1/categories', categoryRoutes);

/* ---------------- SERVER START ---------------- */

async function startServer() {
  try {
    await connectDB();
    server.listen(process.env.PORT || 5000, () => {
      console.log(
        `Server is running on port ${process.env.PORT || 5000}`.green.bold
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();

module.exports = server;
