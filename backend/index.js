require('dotenv').config();
const express = require("express");
const colors = require('colors');
const cookieParser = require('cookie-parser');
const credentialsRoutes = require('./Routes/credentialsRoute');
const businessDetailRoutes = require('./Routes/businessDetailRoute');
const productRoutes = require('./Routes/productRoute');
const categoryRoutes = require('./Routes/categoryRoutes');
const cartRoutes = require('./Routes/cartRoute');
const userRoutes = require('./Routes/userRoute');

const path = require('path');
const authenticateToken = require('./Middleware/tokenauth');
const { connectDB } = require('./Config/db');
const morgan = require('morgan');

const server = express();

server.use(express.json());
server.use(cookieParser());
server.use(morgan("dev"));


// Debug routes (before authentication middleware)
server.get('/users/test', (req, res) => {
  res.json({ message: 'Users route is working' });
});

server.post('/users/cart-test', (req, res) => {
  res.json({ message: 'Cart route is reachable', body: req.body });
});

server.use('/auth', credentialsRoutes);           // Authentication routes
server.use('/users', authenticateToken, userRoutes);  // User management routes
server.use('/users', authenticateToken, cartRoutes);  // User-specific routes (cart, wishlist, orders)
server.use('/sellers', authenticateToken, businessDetailRoutes); // Seller-specific routes
server.use('/products', productRoutes);               // Product routes (public + protected)
server.use('/categories', categoryRoutes);            // Category routes



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
