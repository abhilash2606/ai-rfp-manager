const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('../config');
const emailProcessor = require('../services/emailProcessor');
const logger = require('../utils/logger');

// Import routes
const authRoutes = require('../routes/authRoutes');
const rfpRoutes = require('../routes/rfpRoutes');
const vendorRoutes = require('../routes/vendorRoutes');
const aiRoutes = require('../routes/aiRoutes');

// Initialize express
const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable file uploads
app.use((req, res, next) => {
    // 50MB limit for file uploads
    req.maxFileSize = 50 * 1024 * 1024;
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rfp', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/ai', aiRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource was not found.'
  });
});

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  
  // Start the email processor if email configuration is available
  if (config.email.user && config.email.password) {
      try {
          emailProcessor.start();
          logger.info('Email processor started successfully');
      } catch (error) {
          logger.error('Failed to start email processor:', error);
      }
  } else {
      logger.warn('Email processor not started - missing email configuration');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;