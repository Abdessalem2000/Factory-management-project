const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Basic API endpoints with Algerian Dinar data
app.get('/api/production/stats/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalOrders: 25,
      activeOrders: 8,
      completedOrders: 15,
      overdueOrders: 2,
      completionRate: 60
    }
  });
});

app.get('/api/financial/summary/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      income: 20000000, // 20,000,000 DZD
      expenses: 12000000, // 12,000,000 DZD
      netProfit: 8000000, // 8,000,000 DZD
      incomeCount: 45,
      expenseCount: 78
    }
  });
});

app.get('/api/supplier/stats/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalSuppliers: 12,
      activeSuppliers: 10,
      inactiveSuppliers: 1,
      blacklistedSuppliers: 1,
      averageRating: 4.2
    }
  });
});

app.get('/api/worker/stats/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalWorkers: 35,
      activeWorkers: 32,
      inactiveWorkers: 2,
      terminatedWorkers: 1,
      averageHourlyRate: 3500 // 3,500 DZD/hour
    }
  });
});

// Mock data endpoints
app.get('/api/production', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        orderNumber: 'PO-000001',
        product: { name: 'Widget A', sku: 'WGT-001' },
        quantity: 100,
        unitOfMeasure: 'units',
        status: 'in_progress',
        priority: 'high',
        createdAt: new Date().toISOString()
      }
    ],
    pagination: { page: 1, limit: 10, total: 1, pages: 1 }
  });
});

app.get('/api/financial', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        type: 'income',
        category: 'sales',
        amount: 1500000, // 1,500,000 DZD
        currency: 'DZD',
        description: 'Product sale - Industrial equipment',
        date: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        type: 'expense',
        category: 'materials',
        amount: 750000, // 750,000 DZD
        currency: 'DZD',
        description: 'Raw materials purchase',
        date: new Date().toISOString(),
        status: 'completed'
      }
    ],
    pagination: { page: 1, limit: 10, total: 2, pages: 1 }
  });
});

app.get('/api/supplier', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'ABC Supplies',
        contactPerson: 'John Doe',
        email: 'john@abc.com',
        phone: '555-0101',
        status: 'active',
        rating: 4,
        categories: ['materials', 'components']
      }
    ],
    pagination: { page: 1, limit: 10, total: 1, pages: 1 }
  });
});

app.get('/api/worker', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        employeeId: 'EMP-000001',
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmed@factory.com',
        position: 'Assembler',
        department: 'Production',
        status: 'active',
        hourlyRate: 3200, // 3,200 DZD/hour
        currency: 'DZD',
        skills: ['Assembly', 'Quality Control']
      },
      {
        id: '2',
        employeeId: 'EMP-000002',
        firstName: 'فاطمة',
        lastName: 'بن علي',
        email: 'fatima@factory.com',
        position: 'Machine Operator',
        department: 'Production',
        status: 'active',
        hourlyRate: 3500, // 3,500 DZD/hour
        currency: 'DZD',
        skills: ['Machine Operation', 'Maintenance']
      }
    ],
    pagination: { page: 1, limit: 10, total: 2, pages: 1 }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💰 Algerian Dinar (DZD) currency configured`);
});

module.exports = app;
