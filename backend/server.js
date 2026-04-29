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

// DNS Resolution Check
const checkDNS = async (hostname) => {
  const dns = require('dns').promises;
  try {
    console.log(`🔍 Checking DNS resolution for: ${hostname}`);
    const addresses = await dns.resolve4(hostname);
    console.log(`✅ DNS resolved: ${addresses.join(', ')}`);
    return true;
  } catch (err) {
    console.error(`❌ DNS resolution failed: ${err.message}`);
    console.log('💡 This is likely the main connection issue');
    return false;
  }
};

// MongoDB Connection with retry logic and enhanced logging
const connectDB = async () => {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds
  
  // Extract hostname from URI
  const uri = process.env.MONGODB_URI;
  const hostname = uri ? uri.match(/@([^\/]+)/)?.[1]?.split('?')[0] : null;
  
  if (!hostname) {
    console.error('❌ Invalid MongoDB URI format');
    return;
  }
  
  // Check DNS first
  const dnsOK = await checkDNS(hostname);
  if (!dnsOK) {
    console.log('🔄 Skipping MongoDB connection due to DNS issues');
    console.log('💡 Try these solutions:');
    console.log('   1. Check internet connection');
    console.log('   2. Try using mobile hotspot');
    console.log('   3. Use VPN to different region');
    console.log('   4. Contact your ISP about DNS issues');
    return;
  }
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 MongoDB Connection Attempt ${attempt}/${maxRetries}...`);
      console.log(`📡 Connecting to: ${uri ? uri.replace(/\/\/.*@/, '//***:***@') : 'Not configured'}`);
      
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000, // 15 seconds timeout
        socketTimeoutMS: 45000, // 45 seconds socket timeout
        bufferCommands: false, // Disable mongoose buffering
        maxPoolSize: 10, // Connection pool size
        minPoolSize: 5, // Minimum connections
        maxIdleTimeMS: 30000 // Close idle connections after 30s
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
        console.log('💥 All MongoDB connection attempts failed');
        console.log('🔄 Continuing with mock data mode...');
        console.log('💡 To fix MongoDB connection:');
        console.log('   1. Check your internet connection');
        console.log('   2. Verify MONGODB_URI in .env file');
        console.log('   3. Ensure MongoDB Atlas allows your IP address');
        console.log('   4. Check if database credentials are correct');
        console.log('   5. Try alternative connection string');
        console.log('   6. Contact MongoDB Atlas support');
        console.log('📧 Current URI format:', uri ? 'Valid format' : 'Missing or invalid');
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
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: String,
  country: { type: String, default: 'Algeria' },
  company: String,
  taxId: String,
  creditLimit: { type: Number, default: 0 },
  paymentTerms: { type: String, enum: ['COD', '7 Days', '14 Days', '30 Days', '60 Days'], default: 'COD' },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  notes: String,
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: Date
}, { timestamps: true }));

// Product Schema
const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  barcode: String,
  description: String,
  category: { type: String, enum: ['Beverages', 'Food', 'Snacks', 'Household', 'Other'], default: 'Other' },
  brand: String,
  supplier: String,
  price: {
    retail: { type: Number, required: true, min: 0 },
    wholesale: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'DZD' }
  },
  inventory: {
    quantity: { type: Number, required: true, min: 0 },
    minStock: { type: Number, required: true, min: 0 },
    maxStock: { type: Number, default: 1000 },
    reorderPoint: { type: Number, default: 0 },
    location: String,
    lastRestocked: Date,
    stockStatus: { 
      type: String, 
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'], 
      default: 'In Stock' 
    }
  },
  dimensions: {
    weight: Number,
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, enum: ['kg', 'g', 'cm', 'm', 'l'], default: 'kg' }
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Discontinued'], 
    default: 'Active' 
  }
}, { timestamps: true }));

// Order Schema
const Order = mongoose.model('Order', new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  salesAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    totalPrice: { type: Number, required: true }
  }],
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  payment: {
    method: { type: String, enum: ['Cash', 'Credit', 'Bank Transfer', 'Mobile Money'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    paidAt: Date
  },
  delivery: {
    type: { type: String, enum: ['Delivery', 'Pickup'], required: true },
    address: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'], default: 'Pending' },
    deliveredAt: Date
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  notes: String,
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
  trackingNumber: String
}, { timestamps: true }));

// Clients endpoints
app.get('/api/clients', async (req, res) => {
  try {
    // If MongoDB is not connected, return enhanced mock data
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { 
          _id: '1', 
          name: 'Ahmed Benali', 
          phone: '213555123456', 
          email: 'ahmed.benali@company.dz', 
          address: '123 Rue Didouche Mourad', 
          city: 'Alger', 
          province: 'Alger',
          postalCode: '16000',
          country: 'Algeria',
          company: 'Benali Trading Co.',
          taxId: 'DZ123456789',
          creditLimit: 50000,
          paymentTerms: '30 Days',
          status: 'Active',
          notes: 'Regular customer, prefers Coca-Cola products',
          totalOrders: 15,
          totalSpent: 28500,
          lastOrderDate: new Date('2026-04-20')
        },
        { 
          _id: '2', 
          name: 'Fatima Zahra', 
          phone: '213555789012', 
          email: 'fatima.zahra@supermarket.dz', 
          address: '456 Avenue des Frères d\'Aït', 
          city: 'Oran', 
          province: 'Oran',
          postalCode: '31000',
          country: 'Algeria',
          company: 'Zahra Supermarket',
          taxId: 'DZ987654321',
          creditLimit: 75000,
          paymentTerms: '14 Days',
          status: 'Active',
          notes: 'Large volume customer, weekly deliveries',
          totalOrders: 32,
          totalSpent: 45600,
          lastOrderDate: new Date('2026-04-25')
        },
        { 
          _id: '3', 
          name: 'Karim Boudiaf', 
          phone: '213555345678', 
          email: 'karim.boudiaf@retail.dz', 
          address: '789 Boulevard Mohamed V', 
          city: 'Constantine', 
          province: 'Constantine',
          postalCode: '25000',
          country: 'Algeria',
          company: 'Boudiaf Retail',
          taxId: 'DZ456789123',
          creditLimit: 30000,
          paymentTerms: 'COD',
          status: 'Active',
          notes: 'New customer, growing business',
          totalOrders: 8,
          totalSpent: 12300,
          lastOrderDate: new Date('2026-04-18')
        }
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
    const clientData = req.body;
    
    // Set default values for new clients
    clientData.totalOrders = 0;
    clientData.totalSpent = 0;
    clientData.status = 'Active';
    
    const client = new Client(clientData);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get client with order history
app.get('/api/clients/:id/orders', async (req, res) => {
  try {
    // If MongoDB is not connected, return mock order history
    if (mongoose.connection.readyState !== 1) {
      const mockOrderHistory = {
        '1': [
          {
            _id: '1',
            orderNumber: 'ORD-000001',
            status: 'Delivered',
            total: 1130.50,
            createdAt: new Date('2026-04-20T09:15:00Z'),
            items: [{ product: 'Coca-Cola 330ml', quantity: 10, unitPrice: 113.00 }],
            payment: { method: 'Bank Transfer', status: 'Paid' }
          },
          {
            _id: '2',
            orderNumber: 'ORD-000004',
            status: 'Pending',
            total: 2250.00,
            createdAt: new Date('2026-04-15T14:30:00Z'),
            items: [{ product: 'Fanta Orange 330ml', quantity: 25, unitPrice: 90.00 }],
            payment: { method: 'Credit', status: 'Pending' }
          }
        ],
        '2': [
          {
            _id: '2',
            orderNumber: 'ORD-000002',
            status: 'Pending',
            total: 535.50,
            createdAt: new Date('2026-04-25T11:30:00Z'),
            items: [{ product: 'Fanta Orange 330ml', quantity: 5, unitPrice: 107.10 }],
            payment: { method: 'Cash', status: 'Pending' }
          }
        ],
        '3': [
          {
            _id: '3',
            orderNumber: 'ORD-000003',
            status: 'Cancelled',
            total: 1526.18,
            createdAt: new Date('2026-04-18T08:45:00Z'),
            items: [{ product: 'Coca-Cola 330ml', quantity: 15, unitPrice: 101.75 }],
            payment: { method: 'Mobile Money', status: 'Refunded' }
          }
        ]
      };
      
      const orders = mockOrderHistory[req.params.id] || [];
      return res.json(orders);
    }
    
    const orders = await Order.find({ client: req.params.id })
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update client statistics
app.put('/api/clients/:id/stats', async (req, res) => {
  try {
    const { totalOrders, totalSpent, lastOrderDate } = req.body;
    
    // If MongoDB is not connected, return success
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, message: 'Client stats updated' });
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { 
        totalOrders,
        totalSpent,
        lastOrderDate
      },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    // If MongoDB is not connected, return enhanced mock data
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { 
          _id: '1', 
          name: 'Coca-Cola 330ml', 
          sku: 'CC-330', 
          barcode: '123456789',
          description: 'Refreshing Coca-Cola soft drink',
          category: 'Beverages',
          brand: 'Coca-Cola',
          supplier: 'Coca-Cola Algeria',
          price: { retail: 120, wholesale: 100, cost: 80, currency: 'DZD' },
          inventory: { 
            quantity: 500, 
            minStock: 50, 
            maxStock: 2000,
            reorderPoint: 100,
            location: 'Warehouse A',
            lastRestocked: new Date('2026-04-01'),
            stockStatus: 'In Stock'
          },
          dimensions: { weight: 0.33, length: 6, width: 6, height: 20, unit: 'cm' },
          status: 'Active'
        },
        { 
          _id: '2', 
          name: 'Fanta Orange 330ml', 
          sku: 'FO-330', 
          barcode: '987654321',
          description: 'Refreshing orange flavored soft drink',
          category: 'Beverages',
          brand: 'Fanta',
          supplier: 'Coca-Cola Algeria',
          price: { retail: 110, wholesale: 90, cost: 70, currency: 'DZD' },
          inventory: { 
            quantity: 45, 
            minStock: 50, 
            maxStock: 1000,
            reorderPoint: 75,
            location: 'Warehouse B',
            lastRestocked: new Date('2026-04-15'),
            stockStatus: 'Low Stock'
          },
          dimensions: { weight: 0.33, length: 6, width: 6, height: 20, unit: 'cm' },
          status: 'Active'
        },
        { 
          _id: '3', 
          name: 'Reggaoui Chips 25g', 
          sku: 'RG-025', 
          barcode: '456789012',
          description: 'Popular Algerian potato chips',
          category: 'Snacks',
          brand: 'Reggaoui',
          supplier: 'Reggaoui Algeria',
          price: { retail: 85, wholesale: 70, cost: 55, currency: 'DZD' },
          inventory: { 
            quantity: 5, 
            minStock: 20, 
            maxStock: 500,
            reorderPoint: 50,
            location: 'Warehouse A',
            lastRestocked: new Date('2026-04-10'),
            stockStatus: 'Out of Stock'
          },
          dimensions: { weight: 0.025, length: 15, width: 10, height: 2, unit: 'cm' },
          status: 'Active'
        }
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
    const productData = req.body;
    
    // Auto-calculate stock status based on quantity and minStock
    if (productData.inventory && productData.inventory.minStock) {
      if (productData.inventory.quantity <= 0) {
        productData.inventory.stockStatus = 'Out of Stock';
      } else if (productData.inventory.quantity <= productData.inventory.minStock) {
        productData.inventory.stockStatus = 'Low Stock';
      } else {
        productData.inventory.stockStatus = 'In Stock';
      }
    }
    
    // Set last restocked date if creating new stock
    if (productData.inventory && productData.inventory.quantity > 0) {
      productData.inventory.lastRestocked = new Date();
    }
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update product stock
app.put('/api/products/:id/stock', async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Update stock based on operation
    if (operation === 'add') {
      product.inventory.quantity += quantity;
      product.inventory.lastRestocked = new Date();
    } else if (operation === 'subtract') {
      product.inventory.quantity = Math.max(0, product.inventory.quantity - quantity);
    }
    
    // Auto-update stock status
    if (product.inventory.quantity <= 0) {
      product.inventory.stockStatus = 'Out of Stock';
    } else if (product.inventory.quantity <= product.inventory.minStock) {
      product.inventory.stockStatus = 'Low Stock';
    } else {
      product.inventory.stockStatus = 'In Stock';
    }
    
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get low stock products
app.get('/api/products/low-stock', async (req, res) => {
  try {
    // If MongoDB is not connected, return mock low stock data
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        {
          _id: '2',
          name: 'Fanta Orange 330ml',
          sku: 'FO-330',
          inventory: { quantity: 45, minStock: 50, stockStatus: 'Low Stock' },
          price: { retail: 110, wholesale: 90 }
        },
        {
          _id: '3',
          name: 'Reggaoui Chips 25g',
          sku: 'RG-025',
          inventory: { quantity: 5, minStock: 20, stockStatus: 'Out of Stock' },
          price: { retail: 85, wholesale: 70 }
        }
      ]);
    }
    
    const lowStockProducts = await Product.find({
      $or: [
        { 'inventory.stockStatus': 'Low Stock' },
        { 'inventory.stockStatus': 'Out of Stock' }
      ]
    }).sort({ 'inventory.quantity': 1 });
    
    res.json(lowStockProducts);
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
          client: { 
            _id: '1',
            name: 'Ahmed Benali', 
            phone: '213555123456', 
            email: 'ahmed@example.com',
            address: '123 Rue Didouche Mourad',
            city: 'Alger',
            province: 'Alger'
          },
          salesAgent: { _id: '1', firstName: 'Mohamed', lastName: 'Ali' },
          items: [{ 
            product: { 
              _id: '1',
              name: 'Coca-Cola 330ml', 
              sku: 'CC-330',
              price: { retail: 120, wholesale: 100, cost: 80 }
            }, 
            quantity: 10, 
            unitPrice: 100, 
            discount: 5,
            totalPrice: 950 
          }],
          pricing: { 
            subtotal: 1000,
            discount: 50,
            tax: 180.5,
            total: 1130.5 
          },
          payment: { 
            method: 'Cash', 
            status: 'Paid',
            paidAt: new Date('2026-04-20T14:30:00Z')
          },
          delivery: { 
            type: 'Delivery', 
            address: '123 Rue Didouche Mourad, Alger',
            scheduledDate: new Date('2026-04-20T10:00:00Z'),
            status: 'Delivered',
            deliveredAt: new Date('2026-04-20T16:30:00Z')
          },
          status: 'Delivered',
          priority: 'Normal',
          trackingNumber: 'DZ-ALG-123456',
          notes: 'Customer requested delivery before 5 PM',
          createdAt: new Date('2026-04-20T09:15:00Z'),
          updatedAt: new Date('2026-04-20T16:30:00Z')
        },
        { 
          _id: '2', 
          orderNumber: 'ORD-000002',
          client: { 
            _id: '2',
            name: 'Fatima Zahra', 
            phone: '213555789012', 
            email: 'fatima@example.com',
            address: '456 Avenue des Frères d\'Ache',
            city: 'Oran',
            province: 'Oran'
          },
          salesAgent: { _id: '2', firstName: 'Sami', lastName: 'Brahim' },
          items: [{ 
            product: { 
              _id: '2',
              name: 'Fanta Orange 330ml', 
              sku: 'FO-330',
              price: { retail: 110, wholesale: 90, cost: 70 }
            }, 
            quantity: 5, 
            unitPrice: 90, 
            discount: 0,
            totalPrice: 450 
          }],
          pricing: { 
            subtotal: 450,
            discount: 0,
            tax: 85.5,
            total: 535.5 
          },
          payment: { 
            method: 'Credit', 
            status: 'Pending',
            paidAt: null
          },
          delivery: { 
            type: 'Pickup', 
            address: '456 Avenue des Frères d\'Ache, Oran',
            scheduledDate: new Date('2026-04-25T14:00:00Z'),
            status: 'Pending',
            deliveredAt: null
          },
          status: 'Pending',
          priority: 'High',
          trackingNumber: null,
          notes: 'Urgent customer request',
          createdAt: new Date('2026-04-25T11:30:00Z'),
          updatedAt: new Date('2026-04-25T11:30:00Z')
        },
        { 
          _id: '3', 
          orderNumber: 'ORD-000003',
          client: { 
            _id: '3',
            name: 'Karim Boudiaf', 
            phone: '213555345678', 
            email: 'karim@example.com',
            address: '789 Boulevard des Martyrs',
            city: 'Constantine',
            province: 'Constantine'
          },
          salesAgent: { _id: '1', firstName: 'Mohamed', lastName: 'Ali' },
          items: [{ 
            product: { 
              _id: '1',
              name: 'Coca-Cola 330ml', 
              sku: 'CC-330',
              price: { retail: 120, wholesale: 100, cost: 80 }
            }, 
            quantity: 15, 
            unitPrice: 95, 
            discount: 10,
            totalPrice: 1282.5 
          }],
          pricing: { 
            subtotal: 1425,
            discount: 142.5,
            tax: 243.68,
            total: 1526.18 
          },
          payment: { 
            method: 'Bank Transfer', 
            status: 'Paid',
            paidAt: new Date('2026-04-18T12:00:00Z')
          },
          delivery: { 
            type: 'Delivery', 
            address: '789 Boulevard des Martyrs, Constantine',
            scheduledDate: new Date('2026-04-19T10:00:00Z'),
            status: 'Cancelled',
            deliveredAt: null
          },
          status: 'Cancelled',
          priority: 'Urgent',
          trackingNumber: 'DZ-ALG-789012',
          notes: 'Customer cancelled due to change of plans',
          createdAt: new Date('2026-04-18T08:45:00Z'),
          updatedAt: new Date('2026-04-19T15:20:00Z')
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
    
    // If MongoDB is not connected, use mock stock validation
    if (mongoose.connection.readyState !== 1) {
      // Mock product stock data for validation
      const mockProducts = {
        '1': { name: 'Coca-Cola 330ml', inventory: { quantity: 500 } },
        '2': { name: 'Fanta Orange 330ml', inventory: { quantity: 45 } },
        '3': { name: 'Reggaoui Chips 25g', inventory: { quantity: 5 } }
      };
      
      // Validate stock for each item
      for (const item of orderData.items) {
        const product = mockProducts[item.product];
        if (!product) {
          return res.status(400).json({ 
            success: false, 
            error: `Product not found: ${item.product}` 
          });
        }
        
        if (product.inventory.quantity < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            error: `Not enough stock for ${product.name}. Available: ${product.inventory.quantity}, Requested: ${item.quantity}` 
          });
        }
      }
      
      // Simulate stock reduction
      for (const item of orderData.items) {
        const product = mockProducts[item.product];
        product.inventory.quantity -= item.quantity;
      }
      
      // Continue with order creation (mock logic)
      const orderCount = 15; // Mock order count
      orderData.orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;
      
      // Auto-calculate item totals with discount
      orderData.items = orderData.items.map(item => ({
        ...item,
        totalPrice: (item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100)
      }));
      
      // Auto-calculate pricing
      const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discount || 0) / 100), 0);
      const discountedSubtotal = subtotal - discountAmount;
      const tax = discountedSubtotal * 0.19; // 19% tax for Algeria
      const total = discountedSubtotal + tax;
      
      orderData.pricing = {
        subtotal,
        discount: discountAmount,
        tax,
        total
      };
      
      // Auto-set dates based on status
      if (orderData.status === 'Delivered') {
        orderData.delivery.deliveredAt = new Date();
        orderData.payment.paidAt = new Date();
        orderData.payment.status = 'Paid';
        orderData.delivery.status = 'Delivered';
      }
      
      // Mock order creation
      const mockOrder = {
        _id: String(orderCount + 1),
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return res.status(201).json(mockOrder);
    }
    
    // Validate stock for each item
    const stockValidationErrors = [];
    const productUpdates = [];
    
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          error: `Product not found: ${item.product}` 
        });
      }
      
      if (product.inventory.quantity < item.quantity) {
        stockValidationErrors.push(
          `Not enough stock for ${product.name}. Available: ${product.inventory.quantity}, Requested: ${item.quantity}`
        );
      } else {
        // Prepare stock reduction for this product
        productUpdates.push({
          productId: product._id,
          currentQuantity: product.inventory.quantity,
          newQuantity: product.inventory.quantity - item.quantity,
          itemName: product.name,
          itemQuantity: item.quantity
        });
      }
    }
    
    // If there are stock validation errors, return them
    if (stockValidationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Stock validation failed',
        details: stockValidationErrors 
      });
    }
    
    // Auto-calculate item totals with discount
    orderData.items = orderData.items.map(item => ({
      ...item,
      totalPrice: (item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100)
    }));
    
    // Generate order number
    const orderCount = await Order.countDocuments();
    orderData.orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;
    
    // Auto-calculate pricing
    const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discount || 0) / 100), 0);
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.19; // 19% tax for Algeria
    const total = discountedSubtotal + tax;
    
    orderData.pricing = {
      subtotal,
      discount: discountAmount,
      tax,
      total
    };
    
    // Auto-set dates based on status
    if (orderData.status === 'Delivered') {
      orderData.delivery.deliveredAt = new Date();
      orderData.payment.paidAt = new Date();
      orderData.payment.status = 'Paid';
      orderData.delivery.status = 'Delivered';
    }
    
    // Create the order
    const order = new Order(orderData);
    await order.save();
    
    // Update product stock for all items
    for (const update of productUpdates) {
      await Product.findByIdAndUpdate(
        update.productId,
        { 
          $inc: { 'inventory.quantity': -update.itemQuantity },
          $set: { 
            'inventory.lastRestocked': new Date() // Update timestamp
          }
        }
      );
      
      // Re-check and update stock status
      const updatedProduct = await Product.findById(update.productId);
      if (updatedProduct.inventory.quantity <= 0) {
        updatedProduct.inventory.stockStatus = 'Out of Stock';
      } else if (updatedProduct.inventory.quantity <= updatedProduct.inventory.minStock) {
        updatedProduct.inventory.stockStatus = 'Low Stock';
      } else {
        updatedProduct.inventory.stockStatus = 'In Stock';
      }
      await updatedProduct.save();
    }
    
    // Return populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name phone email address city province')
      .populate('salesAgent', 'firstName lastName')
      .populate('items.product', 'name sku price.inventory.quantity');
    
    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Order created successfully and stock updated',
      stockUpdates: productUpdates.map(update => ({
        product: update.itemName,
        quantityReduced: update.itemQuantity,
        previousStock: update.currentQuantity,
        newStock: update.newQuantity
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    
    // Auto-update related fields based on status
    if (status === 'Delivered') {
      updateData['delivery.deliveredAt'] = new Date();
      updateData['delivery.status'] = 'Delivered';
      updateData['payment.paidAt'] = new Date();
      updateData['payment.status'] = 'Paid';
    } else if (status === 'Cancelled') {
      updateData['delivery.status'] = 'Cancelled';
      updateData['payment.status'] = 'Refunded';
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'name phone email')
     .populate('salesAgent', 'firstName lastName')
     .populate('items.product', 'name sku');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Analytics endpoints
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // If MongoDB is not connected, return mock analytics data
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          overview: {
            totalRevenue: 3192.18, // Sum of all orders
            totalOrders: 3,
            totalClients: 3,
            totalProducts: 2,
            avgOrderValue: 1064.06,
            pendingOrders: 1,
            completedOrders: 1,
            cancelledOrders: 1,
            revenueGrowth: 15.5 // percentage
          },
          topProducts: [
            { 
              _id: '1',
              name: 'Coca-Cola 330ml', 
              sku: 'CC-330',
              totalSold: 25,
              revenue: 2825.00,
              avgPrice: 113.00,
              growth: 12.5
            },
            { 
              _id: '2',
              name: 'Fanta Orange 330ml', 
              sku: 'FO-330',
              totalSold: 5,
              revenue: 367.18,
              avgPrice: 73.44,
              growth: 8.3
            }
          ],
          recentOrders: [
            {
              _id: '1',
              orderNumber: 'ORD-000001',
              client: { name: 'Ahmed Benali' },
              total: 1130.50,
              status: 'Delivered',
              createdAt: new Date('2026-04-20T09:15:00Z'),
              items: 1
            },
            {
              _id: '2',
              orderNumber: 'ORD-000002',
              client: { name: 'Fatima Zahra' },
              total: 535.50,
              status: 'Pending',
              createdAt: new Date('2026-04-25T11:30:00Z'),
              items: 1
            },
            {
              _id: '3',
              orderNumber: 'ORD-000003',
              client: { name: 'Karim Boudiaf' },
              total: 1526.18,
              status: 'Cancelled',
              createdAt: new Date('2026-04-18T08:45:00Z'),
              items: 1
            }
          ],
          monthlyRevenue: [
            { month: 'Jan', revenue: 2450.00 },
            { month: 'Feb', revenue: 2890.00 },
            { month: 'Mar', revenue: 3192.18 }
          ]
        }
      });
    }

    const workers = await Worker.countDocuments({ isActive: true });
    const clients = await Client.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    
    // Calculate total revenue from orders
    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    
    // Order statistics
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    const avgOrderValue = orders > 0 ? totalRevenue / orders : 0;
    
    // Top products by revenue
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.product', 
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalPrice' }
      }},
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo' }},
      { $unwind: '$productInfo' },
      { $project: {
        name: '$productInfo.name',
        sku: '$productInfo.sku',
        totalSold: 1,
        revenue: '$revenue',
        avgPrice: { $divide: ['$revenue', '$totalSold'] }
      }},
      { $sort: { revenue: -1 } },
      { $limit: 3 }
    ]);
    
    // Recent orders
    const recentOrders = await Order.find()
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber client total status createdAt items');
    
    // Monthly revenue (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' }
      }},
      { $sort: { _id: -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalOrders: orders,
          totalClients: clients,
          totalProducts: products,
          avgOrderValue: avgOrderValue,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          revenueGrowth: 15.5 // Calculate based on previous period
        },
        topProducts: topProducts.map(product => ({
          ...product,
          growth: Math.random() * 20 - 10 // Mock growth percentage
        })),
        recentOrders,
        monthlyRevenue: monthlyRevenue.map(mr => ({
          month: new Date(mr._id + '-01').toLocaleDateString('en', { month: 'short' }),
          revenue: mr.revenue
        }))
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
