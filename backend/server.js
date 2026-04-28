const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Factory Management Backend is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => { 
  res.json({ 
    status: 'healthy', 
    mongodb: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  const connectionState = mongoose.connection.readyState;
  const stateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.json({ 
    success: true,
    message: 'API working',
    mongodb: {
      status: stateMap[connectionState] || 'Unknown',
      readyState: connectionState,
      database: mongoose.connection.name || 'Not connected',
      host: mongoose.connection.host || 'Unknown',
      port: mongoose.connection.port || 'Unknown'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Factory Management Backend v1.0.0'
  });
});

// MongoDB Connection with retry logic and enhanced logging
const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 MongoDB Connection Attempt ${attempt}/${maxRetries}...`);
      console.log(`📡 Connecting to: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@') : 'Not configured'}`);
      
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        socketTimeoutMS: 45000, // 45 seconds socket timeout
        bufferCommands: false // Disable mongoose buffering
      });
      
      console.log('✅ MongoDB Connected Successfully');
      console.log(`🗄️  Database: ${mongoose.connection.name || 'factory-management'}`);
      console.log(`🌐 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
      console.log(`🔗 Host: ${mongoose.connection.host || 'Unknown'}`);
      console.log(`📍 Port: ${mongoose.connection.port || 'Unknown'}`);
      
      return; // Success, exit the retry loop
      
    } catch (err) {
      console.error(`❌ MongoDB Connection Attempt ${attempt} Failed:`, err.message);
      
      if (attempt === maxRetries) {
        console.log('� All MongoDB connection attempts failed');
        console.log('🔄 Continuing with mock data mode...');
        console.log('💡 To fix MongoDB connection:');
        console.log('   1. Check your internet connection');
        console.log('   2. Verify MONGODB_URI in .env file');
        console.log('   3. Ensure MongoDB Atlas allows your IP address');
        console.log('   4. Check if database credentials are correct');
        console.log('📧 Current URI format:', process.env.MONGODB_URI ? 'Valid format' : 'Missing or invalid');
        return; // Continue with mock data
      }
      
      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB connected event fired');
});

mongoose.connection.on('error', (err) => {
  console.error('🔥 MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB:', err);
    process.exit(1);
  }
});

// Initialize database connection
connectDB();

// Worker Schema
const Worker = mongoose.model('Worker', new mongoose.Schema({
  firstName: String,
  lastName: String,
  position: String,
  department: String,
  salary: Number,
  hourlyRate: Number,
  email: String,
  phone: String,
  hireDate: Date,
  isActive: Boolean
}, { timestamps: true }));

// Income Schema
const Income = mongoose.model('Income', new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  date: Date,
  source: String
}, { timestamps: true }));

// Expense Schema
const Expense = mongoose.model('Expense', new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  date: Date,
  vendor: String
}, { timestamps: true }));

// API Routes

// Workers
app.get('/api/workers', async (req, res) => {
  try {
    // If MongoDB is not connected, return mock data
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { _id: '1', firstName: 'Mohamed', lastName: 'Ali', position: 'Sales Agent', role: 'Sales Agent', department: 'Sales', isActive: true },
        { _id: '2', firstName: 'Sami', lastName: 'Brahim', position: 'Sales Agent', role: 'Sales Agent', department: 'Sales', isActive: true }
      ]);
    }
    const workers = await Worker.find({ isActive: true });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/workers', async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.status(201).json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/workers/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/workers/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.json({ success: true, message: 'Worker deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Income
app.get('/api/income', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const income = await Income.find(query).sort({ date: -1 });
    res.json({ success: true, data: income });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/income', async (req, res) => {
  try {
    const income = new Income(req.body);
    await income.save();
    res.status(201).json({ success: true, data: income });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Client Schema
const Client = mongoose.model('Client', new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: String,
  city: String,
  province: String
}, { timestamps: true }));

// Product Schema
const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  barcode: String,
  price: {
    retail: { type: Number, default: 0 },
    wholesale: { type: Number, default: 0 },
    cost: { type: Number, default: 0 }
  },
  inventory: {
    quantity: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 }
  }
}, { timestamps: true }));

// Order Schema
const Order = mongoose.model('Order', new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  salesAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  pricing: {
    subtotal: Number,
    tax: Number,
    total: { type: Number, required: true }
  },
  payment: {
    method: { type: String, enum: ['Cash', 'Credit', 'Bank Transfer', 'Mobile Money'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' }
  },
  delivery: {
    type: { type: String, enum: ['Delivery', 'Pickup'], required: true },
    address: String,
    scheduledDate: Date,
    status: { type: String, enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'], default: 'Pending' }
  },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' },
  notes: String
}, { timestamps: true }));

// Clients endpoints
app.get('/api/clients', async (req, res) => {
  try {
    // If MongoDB is not connected, return mock data
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { _id: '1', name: 'Ahmed Benali', phone: '213555123456', email: 'ahmed@example.com', city: 'Alger', province: 'Alger' },
        { _id: '2', name: 'Fatima Zahra', phone: '213555789012', email: 'fatima@example.com', city: 'Oran', province: 'Oran' }
      ]);
    }
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    // If MongoDB is not connected, return mock data
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { _id: '1', name: 'Coca-Cola 330ml', sku: 'CC-330', barcode: '123456789', price: { retail: 120, wholesale: 100, cost: 80 }, inventory: { quantity: 500, minStock: 50 } },
        { _id: '2', name: 'Fanta Orange 330ml', sku: 'FO-330', barcode: '987654321', price: { retail: 110, wholesale: 90, cost: 70 }, inventory: { quantity: 300, minStock: 30 } }
      ]);
    }
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    // If MongoDB is not connected, return mock data
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { 
          _id: '1', 
          orderNumber: 'ORD-000001',
          client: { name: 'Ahmed Benali', phone: '213555123456', email: 'ahmed@example.com' },
          items: [{ product: { name: 'Coca-Cola 330ml', sku: 'CC-330' }, quantity: 10, unitPrice: 100, totalPrice: 1000 }],
          pricing: { total: 1190 },
          payment: { method: 'Cash', status: 'Paid' },
          delivery: { type: 'Delivery', status: 'Delivered' },
          status: 'Completed',
          createdAt: new Date('2026-04-20')
        },
        { 
          _id: '2', 
          orderNumber: 'ORD-000002',
          client: { name: 'Fatima Zahra', phone: '213555789012', email: 'fatima@example.com' },
          items: [{ product: { name: 'Fanta Orange 330ml', sku: 'FO-330' }, quantity: 5, unitPrice: 90, totalPrice: 450 }],
          pricing: { total: 535.5 },
          payment: { method: 'Credit', status: 'Pending' },
          delivery: { type: 'Pickup', status: 'Pending' },
          status: 'Pending',
          createdAt: new Date('2026-04-25')
        }
      ]);
    }
    const orders = await Order.find()
      .populate('client', 'name phone email')
      .populate('salesAgent', 'firstName lastName')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Generate order number
    const orderCount = await Order.countDocuments();
    orderData.orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;
    
    // Calculate pricing
    const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.19; // 19% tax for Algeria
    orderData.pricing = {
      subtotal,
      tax,
      total: subtotal + tax
    };
    
    const order = new Order(orderData);
    await order.save();
    
    // Return populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name phone email')
      .populate('salesAgent', 'firstName lastName')
      .populate('items.product', 'name sku');
    
    res.status(201).json(populatedOrder);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Analytics endpoints
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const workers = await Worker.countDocuments({ isActive: true });
    const totalIncome = await Income.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const income = totalIncome[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const profit = income - expenses;
    const profitMargin = income > 0 ? (profit / income) * 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalWorkers: workers,
          totalRevenue: income,
          totalExpenses: expenses,
          profitMargin: profitMargin.toFixed(2)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/analytics/workers', async (req, res) => {
  try {
    const workers = await Worker.find({ isActive: true });
    const departments = await Worker.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    const topPerformers = await Worker.find({ isActive: true })
      .sort({ hourlyRate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalWorkers: workers.length,
        departmentBreakdown: departments.reduce((acc, dept) => {
          acc[dept._id] = { count: dept.count };
          return acc;
        }, {}),
        topPerformers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
