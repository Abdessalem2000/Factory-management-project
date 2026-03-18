const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import Prisma client
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
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
    version: '2.0.0-prisma-simple'
  });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT version()`;
    res.json({
      success: true,
      message: 'Database connected successfully',
      version: result[0].version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Worker Routes
app.get('/api/workers', async (req, res) => {
  try {
    const { search, department, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.worker.count({ where })
    ]);

    res.json({
      success: true,
      data: workers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting workers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve workers'
    });
  }
});

app.get('/api/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        expenses: true,
        incomes: true
      }
    });
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.json({
      success: true,
      data: worker
    });
  } catch (error) {
    console.error('Error getting worker:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve worker'
    });
  }
});

app.post('/api/workers', async (req, res) => {
  try {
    const workerData = req.body;
    
    // Validation
    const requiredFields = ['employeeId', 'firstName', 'lastName', 'email', 'position', 'department', 'hourlyRate'];
    const missingFields = requiredFields.filter(field => !workerData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workerData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Hourly rate validation
    if (workerData.hourlyRate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Hourly rate must be greater than 0'
      });
    }

    const worker = await prisma.worker.create({
      data: {
        ...workerData,
        hireDate: workerData.hireDate ? new Date(workerData.hireDate) : new Date(),
        skills: workerData.skills || [],
        status: workerData.status || 'ACTIVE',
        currency: workerData.currency || 'DZD',
        paymentType: workerData.paymentType || 'HOURLY'
      }
    });
    
    res.status(201).json({
      success: true,
      data: worker,
      message: 'Worker created successfully'
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      if (target?.includes('employeeId')) {
        return res.status(409).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create worker'
    });
  }
});

app.put('/api/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Email validation if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    // Hourly rate validation if provided
    if (updateData.hourlyRate !== undefined && updateData.hourlyRate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Hourly rate must be greater than 0'
      });
    }

    const worker = await prisma.worker.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      data: worker,
      message: 'Worker updated successfully'
    });
  } catch (error) {
    console.error('Error updating worker:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update worker'
    });
  }
});

app.delete('/api/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.worker.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting worker:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete worker'
    });
  }
});

// Worker statistics
app.get('/api/workers/stats/overview', async (req, res) => {
  try {
    const [
      totalWorkers,
      activeWorkers,
      departments,
      paymentTypes,
      avgHourlyRate
    ] = await Promise.all([
      prisma.worker.count(),
      prisma.worker.count({ where: { status: 'ACTIVE' } }),
      prisma.worker.groupBy({
        by: ['department'],
        _count: { department: true }
      }),
      prisma.worker.groupBy({
        by: ['paymentType'],
        _count: { paymentType: true }
      }),
      prisma.worker.aggregate({
        _avg: { hourlyRate: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalWorkers,
        active: activeWorkers,
        departments: departments.map(d => ({
          name: d.department,
          count: d._count.department
        })),
        paymentTypes: paymentTypes.map(p => ({
          type: p.paymentType,
          count: p._count.paymentType
        })),
        averageHourlyRate: avgHourlyRate._avg.hourlyRate || 0
      }
    });
  } catch (error) {
    console.error('Error getting worker stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve worker statistics'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Record already exists'
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /api/db-test',
      'GET /api/workers',
      'POST /api/workers',
      'PUT /api/workers/:id',
      'DELETE /api/workers/:id',
      'GET /api/workers/stats/overview'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Factory Management API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Supabase (PostgreSQL)' : 'MongoDB'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 Database test: http://localhost:${PORT}/api/db-test`);
  console.log(`👥 Workers API: http://localhost:${PORT}/api/workers`);
  
  if (process.env.DATABASE_URL) {
    console.log('✅ Prisma/Supabase connection configured');
  } else {
    console.log('⚠️  DATABASE_URL not configured');
  }
});

module.exports = app;
