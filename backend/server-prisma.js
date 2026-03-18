const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import Prisma Worker Routes (temporary JS version until TypeScript compilation)
const workerRoutes = require('./dist/routes/workerRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'Supabase (PostgreSQL)' : 'MongoDB',
    version: '2.0.0-prisma'
  });
});

// API Routes
app.use('/api/workers', workerRoutes);

// Legacy MongoDB API endpoints (for backward compatibility)
// These will be gradually replaced with Prisma versions
app.get('/api/legacy/status', (req, res) => {
  res.json({
    message: 'Legacy MongoDB API - Will be deprecated',
    recommendation: 'Please migrate to new Prisma-based endpoints',
    newEndpoints: [
      'GET /api/workers',
      'POST /api/workers',
      'PUT /api/workers/:id',
      'DELETE /api/workers/:id',
      'GET /api/workers/stats/overview'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Prisma error handling
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Record already exists',
      error: 'Unique constraint violation'
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
      error: 'Record not found'
    });
  }
  
  // Generic error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /api/workers',
      'POST /api/workers',
      'PUT /api/workers/:id',
      'DELETE /api/workers/:id',
      'GET /api/workers/stats/overview',
      'GET /api/legacy/status'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Factory Management API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Supabase (PostgreSQL)' : 'MongoDB'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/workers`);
  
  // Display database connection status
  if (process.env.DATABASE_URL) {
    console.log('✅ Prisma/Supabase connection configured');
    console.log('📝 Make sure to run: npm run prisma:push && npm run prisma:seed');
  } else {
    console.log('⚠️  DATABASE_URL not configured - using MongoDB fallback');
    console.log('📝 To migrate to Supabase, configure DATABASE_URL in .env');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
