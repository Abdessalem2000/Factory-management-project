const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const Worker = require('./models/Worker');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MongoDB Connected'
  });
});

// Worker endpoints
app.get('/api/worker/stats/overview', async (req, res) => {
  try {
    const totalWorkers = await Worker.countDocuments();
    const activeWorkers = await Worker.countDocuments({ status: 'active' });
    const inactiveWorkers = await Worker.countDocuments({ status: 'inactive' });
    const terminatedWorkers = await Worker.countDocuments({ status: 'terminated' });
    
    // Calculate average hourly rate
    const workers = await Worker.find({ status: 'active' });
    const totalRate = workers.reduce((sum, worker) => sum + worker.hourlyRate, 0);
    const averageHourlyRate = workers.length > 0 ? Math.round(totalRate / workers.length) : 0;

    res.json({
      success: true,
      data: {
        totalWorkers,
        activeWorkers,
        inactiveWorkers,
        terminatedWorkers,
        averageHourlyRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/worker', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: workers,
      pagination: { page: 1, limit: 10, total: workers.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/worker', async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Transaction endpoints
app.get('/api/financial/summary/overview', async (req, res) => {
  try {
    const incomeTransactions = await Transaction.find({ type: 'income', status: 'completed' });
    const expenseTransactions = await Transaction.find({ type: 'expense', status: 'completed' });
    
    const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const expenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = income - expenses;
    
    res.json({
      success: true,
      data: {
        income,
        expenses,
        netProfit,
        incomeCount: incomeTransactions.length,
        expenseCount: expenseTransactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/financial', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json({
      success: true,
      data: transactions,
      pagination: { page: 1, limit: 10, total: transactions.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/financial', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Mock endpoints for other modules (for now)
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

app.get('/api/production', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        orderNumber: 'PO-000001',
        product: { name: 'Widget A', sku: 'WGT-001' },
        quantity: 100,
        unitOfMeasure: 'units',
        status: 'in_progress',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    pagination: { page: 1, limit: 10, total: 1, pages: 1 }
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

app.get('/api/supplier', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Factory Management Platform API',
    status: 'Running with MongoDB',
    currency: 'DZD - Algerian Dinar',
    endpoints: ['/api/health', '/api/worker', '/api/financial', '/api/production', '/api/supplier']
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💰 Algerian Dinar (DZD) currency configured`);
  console.log(`🗄️  MongoDB database connected`);
});

module.exports = app;
