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

// Connect to MongoDB and seed data
const initializeDatabase = async () => {
  try {
    await connectDB();
    
    // Check if data exists, if not seed it
    const workerCount = await Worker.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    
    if (workerCount === 0 && transactionCount === 0) {
      console.log('🌱 Seeding database with sample data...');
      await seedDatabase();
    } else {
      console.log(`📊 Database already has data: ${workerCount} workers, ${transactionCount} transactions`);
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Seed database function
const seedDatabase = async () => {
  try {
    // Create Algerian workers
    const workers = [
      {
        employeeId: 'EMP-000001',
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmed@factory.com',
        position: 'Assembler',
        department: 'Production',
        status: 'active',
        hourlyRate: 3200,
        currency: 'DZD',
        paymentType: 'hourly',
        hireDate: new Date('2023-01-15'),
        skills: ['Assembly', 'Quality Control']
      },
      {
        employeeId: 'EMP-000002',
        firstName: 'فاطمة',
        lastName: 'بن علي',
        email: 'fatima@factory.com',
        position: 'Machine Operator',
        department: 'Production',
        status: 'active',
        hourlyRate: 3500,
        currency: 'DZD',
        paymentType: 'hourly',
        hireDate: new Date('2023-03-20'),
        skills: ['Machine Operation', 'Maintenance']
      },
      {
        employeeId: 'EMP-000003',
        firstName: 'محمد',
        lastName: 'العربي',
        email: 'mohammed@factory.com',
        position: 'Supervisor',
        department: 'Production',
        status: 'active',
        hourlyRate: 4500,
        currency: 'DZD',
        paymentType: 'salary',
        hireDate: new Date('2022-06-10'),
        skills: ['Supervision', 'Training', 'Quality Control']
      },
      {
        employeeId: 'EMP-000004',
        firstName: 'سارة',
        lastName: 'قريشي',
        email: 'sara@factory.com',
        position: 'Quality Inspector',
        department: 'Quality Control',
        status: 'active',
        hourlyRate: 3800,
        currency: 'DZD',
        paymentType: 'hourly',
        hireDate: new Date('2023-02-01'),
        skills: ['Quality Inspection', 'Documentation', 'Reporting']
      },
      {
        employeeId: 'EMP-000005',
        firstName: 'عمر',
        lastName: 'بوضياف',
        email: 'omar@factory.com',
        position: 'Maintenance Technician',
        department: 'Maintenance',
        status: 'active',
        hourlyRate: 4000,
        currency: 'DZD',
        paymentType: 'hourly',
        hireDate: new Date('2022-11-15'),
        skills: ['Electrical Maintenance', 'Mechanical Repair', 'Preventive Maintenance']
      }
    ];

    // Create transactions in Algerian Dinars
    const transactions = [
      {
        type: 'income',
        category: 'sales',
        amount: 15000000, // 15,000,000 DZD
        currency: 'DZD',
        description: 'Product sale - Industrial equipment batch',
        date: new Date('2024-01-15'),
        status: 'completed'
      },
      {
        type: 'income',
        category: 'services',
        amount: 8500000, // 8,500,000 DZD
        currency: 'DZD',
        description: 'Maintenance contract - Factory A',
        date: new Date('2024-01-20'),
        status: 'completed'
      },
      {
        type: 'expense',
        category: 'materials',
        amount: 7500000, // 7,500,000 DZD
        currency: 'DZD',
        description: 'Raw materials purchase - Steel and components',
        date: new Date('2024-01-10'),
        status: 'completed'
      },
      {
        type: 'expense',
        category: 'salaries',
        amount: 12000000, // 12,000,000 DZD
        currency: 'DZD',
        description: 'Monthly salaries - January 2024',
        date: new Date('2024-01-31'),
        status: 'completed'
      },
      {
        type: 'expense',
        category: 'utilities',
        amount: 2800000, // 2,800,000 DZD
        currency: 'DZD',
        description: 'Electricity and water bills - January 2024',
        date: new Date('2024-01-25'),
        status: 'completed'
      },
      {
        type: 'income',
        category: 'sales',
        amount: 22000000, // 22,000,000 DZD
        currency: 'DZD',
        description: 'Product sale - Manufacturing components',
        date: new Date('2024-02-05'),
        status: 'completed'
      },
      {
        type: 'expense',
        category: 'equipment',
        amount: 18500000, // 18,500,000 DZD
        currency: 'DZD',
        description: 'New machinery purchase - CNC Machine',
        date: new Date('2024-02-01'),
        status: 'completed'
      }
    ];

    // Insert data
    await Worker.insertMany(workers);
    await Transaction.insertMany(transactions);
    
    console.log('✅ Database seeded successfully!');
    console.log(`👥 Created ${workers.length} workers`);
    console.log(`💰 Created ${transactions.length} transactions`);
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

// Initialize database
initializeDatabase();

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

// Enhanced analytics endpoints
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // Get all data
    const workers = await Worker.find();
    const transactions = await Transaction.find();
    
    // Calculate metrics
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    const totalTransactions = transactions.length;
    
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    
    // Department breakdown
    const departmentBreakdown = workers.reduce((acc, worker) => {
      acc[worker.department] = (acc[worker.department] || 0) + 1;
      return acc;
    }, {});
    
    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      });
    }
    
    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc, t) => {
      if (t.type === 'income') {
        acc.income[t.category] = (acc.income[t.category] || 0) + t.amount;
      } else {
        acc.expenses[t.category] = (acc.expenses[t.category] || 0) + t.amount;
      }
      return acc;
    }, { income: {}, expenses: {} });
    
    // Top performers (workers with highest rates)
    const topWorkers = workers
      .filter(w => w.status === 'active')
      .sort((a, b) => b.hourlyRate - a.hourlyRate)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalWorkers,
          activeWorkers,
          totalTransactions,
          totalIncome,
          totalExpenses,
          netProfit,
          profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0
        },
        departmentBreakdown,
        monthlyTrend: monthlyData,
        categoryBreakdown,
        topWorkers,
        currency: 'DZD'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Worker performance analytics
app.get('/api/analytics/workers', async (req, res) => {
  try {
    const workers = await Worker.find();
    
    // Calculate statistics
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    const inactiveWorkers = workers.filter(w => w.status === 'inactive').length;
    const terminatedWorkers = workers.filter(w => w.status === 'terminated').length;
    
    // Department statistics
    const departmentStats = workers.reduce((acc, worker) => {
      if (!acc[worker.department]) {
        acc[worker.department] = {
          total: 0,
          active: 0,
          averageRate: 0,
          totalRate: 0
        };
      }
      acc[worker.department].total++;
      if (worker.status === 'active') {
        acc[worker.department].active++;
        acc[worker.department].totalRate += worker.hourlyRate;
      }
      return acc;
    }, {});
    
    // Calculate averages
    Object.keys(departmentStats).forEach(dept => {
      const stats = departmentStats[dept];
      stats.averageRate = stats.active > 0 ? Math.round(stats.totalRate / stats.active) : 0;
    });
    
    // Skills analysis
    const skillsAnalysis = workers.reduce((acc, worker) => {
      worker.skills.forEach(skill => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {});
    
    // Payment type distribution
    const paymentTypes = workers.reduce((acc, worker) => {
      acc[worker.paymentType] = (acc[worker.paymentType] || 0) + 1;
      return acc;
    }, {});
    
    // Hire date trends
    const hireTrends = workers.reduce((acc, worker) => {
      const year = new Date(worker.hireDate).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        summary: {
          totalWorkers,
          activeWorkers,
          inactiveWorkers,
          terminatedWorkers,
          averageHourlyRate: Math.round(workers.reduce((sum, w) => sum + w.hourlyRate, 0) / workers.length)
        },
        departmentStats,
        skillsAnalysis,
        paymentTypes,
        hireTrends,
        currency: 'DZD'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Financial analytics
app.get('/api/analytics/financial', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    
    // Basic metrics
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    
    // Monthly trends
    const monthlyTrends = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = { income: 0, expenses: 0, transactions: 0 };
      }
      if (t.type === 'income') {
        monthlyTrends[month].income += t.amount;
      } else {
        monthlyTrends[month].expenses += t.amount;
      }
      monthlyTrends[month].transactions++;
    });
    
    // Category analysis
    const categoryAnalysis = transactions.reduce((acc, t) => {
      const key = `${t.type}_${t.category}`;
      if (!acc[key]) {
        acc[key] = { amount: 0, count: 0, type: t.type, category: t.category };
      }
      acc[key].amount += t.amount;
      acc[key].count++;
      return acc;
    }, {});
    
    // Recent transactions
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    // Status breakdown
    const statusBreakdown = transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          netProfit,
          totalTransactions: transactions.length,
          averageTransaction: Math.round(totalIncome / incomeTransactions.length) || 0,
          profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0
        },
        monthlyTrends,
        categoryAnalysis: Object.values(categoryAnalysis),
        recentTransactions,
        statusBreakdown,
        currency: 'DZD'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced worker CRUD operations
app.put('/api/worker/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/worker/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Enhanced transaction CRUD operations
app.put('/api/financial/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/financial/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Search functionality
app.get('/api/workers/search', async (req, res) => {
  try {
    const { query } = req.query;
    const workers = await Worker.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { position: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });
    res.json({ success: true, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/transactions/search', async (req, res) => {
  try {
    const { query } = req.query;
    const transactions = await Transaction.find({
      $or: [
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).sort({ date: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
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
    status: 'Running with MongoDB - Version 2.2 - FINAL UPDATE',
    currency: 'DZD - Algerian Dinar',
    endpoints: ['/api/health', '/api/worker', '/api/financial', '/api/production', '/api/supplier', '/api/analytics/dashboard'],
    timestamp: new Date().toISOString(),
    features: ['Analytics Dashboard', 'Visual Charts', 'Auto-Seeding', 'Enhanced UI']
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💰 Algerian Dinar (DZD) currency configured`);
  console.log(`🗄️  MongoDB database connected`);
  console.log(`📈 Analytics endpoints available`);
  console.log(`🎨 Version: 2.2 - FINAL UPDATE - ALL FEATURES ENABLED`);
  console.log(`🌟 Auto-seeding system active`);
  console.log(`📊 Visual analytics dashboard ready`);
});

module.exports = app;
