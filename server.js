const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const config = require('./env');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const companyRoutes = require('./routes/company');
const clientRoutes = require('./routes/client');
const projectRoutes = require('./routes/project');
const employeeRoutes = require('./routes/employee');
const taskRoutes = require('./routes/task');
const serverRoutes = require('./routes/server');
const chatRoutes = require('./routes/chat');
const employeeChatRoutes = require('./routes/employeeChat');
const clientChatRoutes = require('./routes/clientChat');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-CSRF-Token',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page'
  ],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  preflightContinue: false
};

app.use(cors());

// CORS preflight handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-CSRF-Token, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(200);
});

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Origin not allowed',
      error: {
        origin: req.get('Origin'),
        allowedOrigins: config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      },
      timestamp: new Date().toISOString()
    });
  }
  next(err);
});

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });

// app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for CORS test page)
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Basic health check endpoint (legacy)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS is working correctly',
    data: {
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent'),
      method: req.method,
      headers: {
        'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Credentials': res.get('Access-Control-Allow-Credentials')
      },
      allowedOrigins: config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
      timestamp: new Date().toISOString()
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/employee-chat', employeeChatRoutes);
app.use('/api/client-chat', clientChatRoutes);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server function
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    const PORT = config.PORT || 5000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🖥️  Server check: http://localhost:${PORT}/api/server`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`👨‍💼 Admin API: http://localhost:${PORT}/api/admin`);
      console.log(`🏢 Company API: http://localhost:${PORT}/api/company`);
      console.log(`👥 Client API: http://localhost:${PORT}/api/client`);
      console.log(`📋 Project API: http://localhost:${PORT}/api/project`);
      console.log(`👨‍💼 Employee API: http://localhost:${PORT}/api/employee`);
      console.log(`✅ Task API: http://localhost:${PORT}/api/task`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
