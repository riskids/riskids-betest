require('dotenv').config();
const logger = require('./src/utils/logger');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connect: dbConnect } = require('./src/config/db');
const { connectPromise: redisConnect } = require('./src/services/cacheService');
const { swaggerUi, specs } = require('./src/config/swagger');

const app = express();

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connections
Promise.all([dbConnect(), redisConnect])
  .then(() => {
    logger.info({
      message: 'All services connected successfully',
      timestamp: new Date().toISOString()
    });
    
    // Routes
    const userRoutes = require('./src/routes/userRoutes');
    app.use('/api', userRoutes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      logger.error({
        message: 'Express error handler',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      });
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
    logger.info({
      message: 'Server started successfully',
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
    });
  })
  .catch(err => {
    logger.error({
      message: 'Failed to initialize services',
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error({
    message: 'Unhandled Rejection',
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error({
    message: 'Uncaught Exception',
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});
