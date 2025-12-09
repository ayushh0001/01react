require('dotenv').config();
const express = require("express");
const colors = require('colors');
const cookieParser = require('cookie-parser');
const credentialsRoutes = require('./Routes/credentialsRoute');
const verificationRoutes = require('./Routes/mobile-twilioRoute');
const businessDetailRoutes = require('./Routes/businessDetailRoute');
const productRoutes = require('./Routes/productRoute');
const categoryRoutes = require('./Routes/categoryRoutes');
const path = require('path');
const authenticateToken = require('./Middleware/tokenauth');
const { connectDB } = require('./config/db');
const morgan = require('morgan');

const server = express();

server.use(express.json());
server.use(cookieParser());
server.use(morgan("dev"));


server.use('/user', credentialsRoutes);
server.use('/verification', verificationRoutes);
server.use('/businessdetail', authenticateToken, businessDetailRoutes);
server.use('/product', authenticateToken, productRoutes);
server.use('/category', authenticateToken, categoryRoutes);

async function startServer() {
  try {
    await connectDB();  // Wait for MongoDB connection before starting server
    server.listen(process.env.PORT || 3000, () => {
      console.log('Server is running on port', process.env.PORT || 3000);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();  // Start the app only after DB connection is ready

module.exports = server;
