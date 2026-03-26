const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Factory Backend is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/health', (req, res) => { 
  res.json({ 
    status: 'healthy', 
    mongodb: mongoose.connection.readyState === 1 
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// SCHEMAS
const WorkerSchema = new mongoose.Schema({
  name: String, 
  position: String, 
  salary: Number,
  department: String,
  hireDate: { type: Date, default: Date.now }
});

const IncomeSchema = new mongoose.Schema({
  description: String, 
  amount: Number,
  type: String,
  date: { type: Date, default: Date.now }
});

const Worker = mongoose.model('Worker', WorkerSchema);
const Income = mongoose.model('Income', IncomeSchema);

// Seed sample data for demo
const seedData = async () => {
  const workerCount = await Worker.countDocuments();
  if (workerCount === 0) {
    // Sample workers for investor demo
    const sampleWorkers = [
      { name: 'Ahmed Benali', position: 'Production Manager', salary: 85000, department: 'Production' },
      { name: 'Sofia Meriem', position: 'Quality Control', salary: 65000, department: 'Quality' },
      { name: 'Mohamed Karim', position: 'Machine Operator', salary: 45000, department: 'Production' },
      { name: 'Fatima Zahra', position: 'Warehouse Manager', salary: 55000, department: 'Logistics' },
      { name: 'Youssef Amine', position: 'Maintenance Tech', salary: 52000, department: 'Maintenance' }
    ];
    
    const sampleIncome = [
      { description: 'Product Sales - Q1 2024', amount: 250000, type: 'Revenue' },
      { description: 'Service Contracts', amount: 45000, type: 'Revenue' },
      { description: 'Equipment Rental', amount: 12000, type: 'Revenue' },
      { description: 'Consulting Services', amount: 28000, type: 'Revenue' }
    ];

    await Worker.insertMany(sampleWorkers);
    await Income.insertMany(sampleIncome);
    console.log('🌱 Sample data seeded for investor demo');
  }
};

// API ROUTES
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ name: 1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workers', async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/income', async (req, res) => {
  try {
    const income = await Income.find().sort({ date: -1 });
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/income', async (req, res) => {
  try {
    const income = new Income(req.body);
    await income.save();
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats for investors
app.get('/api/dashboard', async (req, res) => {
  try {
    const workerCount = await Worker.countDocuments();
    const totalSalary = await Worker.aggregate([{ $group: { _id: null, total: { $sum: "$salary" } } }]);
    const totalIncome = await Income.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    
    res.json({
      workers: workerCount,
      totalSalary: totalSalary[0]?.total || 0,
      totalIncome: totalIncome[0]?.total || 0,
      avgSalary: workerCount > 0 ? (totalSalary[0]?.total || 0) / workerCount : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed data on startup
seedData();

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Factory Backend LIVE on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`👥 Workers API: http://localhost:${PORT}/api/workers`);
  console.log(`💰 Income API: http://localhost:${PORT}/api/income`);
});
