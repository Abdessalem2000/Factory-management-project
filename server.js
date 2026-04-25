const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Factory Backend is running!', currency: 'DZD' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', currency: 'DZD', market: 'Algeria' });
});

app.get('/api/health', (req, res) => { 
  res.json({ 
    status: 'healthy', 
    mongodb: mongoose.connection.readyState === 1,
    currency: 'DZD',
    market: 'Algeria',
    features: ['workers', 'income', 'products', 'expenses', 'production', 'quality']
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// SCHEMAS FOR FMCG DISTRIBUTION ERP
const WorkerSchema = new mongoose.Schema({
  name: String, 
  position: String, 
  salary: Number,
  department: String,
  hireDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' },
  phone: String,
  email: String,
  address: String,
  skills: [String],
  certifications: [String],
  role: { type: String, enum: ['Sales Agent', 'Delivery Driver', 'Manager', 'Admin'], default: 'Sales Agent' },
  commissionRate: { type: Number, default: 0.05 }, // 5% commission
  targetSales: { type: Number, default: 0 },
  currentSales: { type: Number, default: 0 }
});

const ClientSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['Retailer', 'Wholesaler', 'Supermarket', 'Restaurant', 'Hotel'], required: true },
  location: {
    address: String,
    city: String,
    province: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    contactPerson: String
  },
  business: {
    registrationNumber: String,
    taxId: String,
    businessType: String
  },
  credit: {
    creditLimit: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    paymentTerms: { type: String, default: 'NET30' }
  },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  lastOrderDate: Date,
  totalPurchases: { type: Number, default: 0 },
  visitFrequency: { type: String, enum: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'], default: 'Weekly' }
});

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  logo: String,
  website: String,
  contact: {
    phone: String,
    email: String,
    address: String
  },
  commission: {
    rate: { type: Number, default: 0.15 }, // 15% brand commission
    paymentTerms: String
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  sku: { type: String, unique: true },
  barcode: String,
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  price: {
    retail: Number,
    wholesale: Number,
    cost: Number
  },
  inventory: {
    quantity: { type: Number, default: 0 },
    minStock: { type: Number, default: 10 },
    reserved: { type: Number, default: 0 }, // reserved for orders
    available: { type: Number, default: 0 } // calculated field
  },
  packaging: {
    unit: String, // pieces, boxes, cartons
    unitsPerBox: Number,
    boxPerCarton: Number,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  status: { type: String, default: 'Active' },
  qualityGrade: String,
  supplier: String,
  expiryDate: Date,
  batchNumber: String,
  currency: { type: String, default: 'DZD' }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  salesAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 }
  }],
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'DZD' }
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Validated', 'Processing', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  payment: {
    method: { type: String, enum: ['Cash', 'Credit', 'Bank Transfer', 'Mobile Money'], default: 'Cash' },
    status: { type: String, enum: ['Pending', 'Paid', 'Partial', 'Overdue'], default: 'Pending' },
    amount: { type: Number, default: 0 },
    paidDate: Date
  },
  delivery: {
    type: { type: String, enum: ['Pickup', 'Delivery'], default: 'Delivery' },
    address: String,
    scheduledDate: Date,
    estimatedTime: String,
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    trackingNumber: String,
    deliveredDate: Date,
    notes: String
  },
  dates: {
    orderDate: { type: Date, default: Date.now },
    validatedDate: Date,
    processedDate: Date,
    deliveredDate: Date
  },
  notes: String,
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
  createdAt: { type: Date, default: Date.now }
});

const DeliverySchema = new mongoose.Schema({
  deliveryNumber: { type: String, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  vehicle: {
    type: String,
    plateNumber: String,
    capacity: Number
  },
  route: {
    startLocation: String,
    stops: [{
      client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
      address: String,
      estimatedTime: Date,
      actualTime: Date,
      status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Failed'], default: 'Pending' },
      notes: String
    }],
    endLocation: String
  },
  status: { 
    type: String, 
    enum: ['Preparing', 'Ready', 'In Transit', 'Delivering', 'Completed', 'Failed'], 
    default: 'Preparing' 
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: String,
    notes: String,
    driver: String
  }],
  metrics: {
    totalDistance: Number,
    totalTime: Number,
    fuelConsumption: Number,
    deliveredOrders: { type: Number, default: 0 },
    failedOrders: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

const IncomeSchema = new mongoose.Schema({
  description: String, 
  amount: Number,
  type: String,
  category: String,
  date: { type: Date, default: Date.now },
  client: String,
  invoiceNumber: String,
  paymentStatus: { type: String, default: 'Pending' },
  currency: { type: String, default: 'DZD' },
  source: { type: String, enum: ['Order', 'Service', 'Other'], default: 'Order' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
});

const ExpenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  type: String,
  date: { type: Date, default: Date.now },
  supplier: String,
  invoiceNumber: String,
  paymentStatus: { type: String, default: 'Pending' },
  approvedBy: String,
  currency: { type: String, default: 'DZD' },
  department: { type: String, enum: ['Sales', 'Delivery', 'Operations', 'Admin'], default: 'Operations' }
});

const ProductionSchema = new mongoose.Schema({
  productName: String,
  batchNumber: String,
  quantity: Number,
  startDate: Date,
  endDate: Date,
  status: String,
  assignedWorkers: [String],
  materials: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
  qualityChecks: [{
    checkType: String,
    result: String,
    date: Date,
    inspector: String
  }],
  notes: String,
  currency: { type: String, default: 'DZD' }
});

const QualitySchema = new mongoose.Schema({
  productName: String,
  batchNumber: String,
  testType: String,
  result: String,
  grade: String,
  inspector: String,
  date: Date,
  defects: [String],
  correctiveActions: [String],
  nextInspection: Date,
  currency: { type: String, default: 'DZD' }
});

// MODELS
const Worker = mongoose.model('Worker', WorkerSchema);
const Client = mongoose.model('Client', ClientSchema);
const Brand = mongoose.model('Brand', BrandSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Delivery = mongoose.model('Delivery', DeliverySchema);
const Income = mongoose.model('Income', IncomeSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);
const Production = mongoose.model('Production', ProductionSchema);
const Quality = mongoose.model('Quality', QualitySchema);

// Seed sample data for FMCG distribution demo
const seedData = async () => {
  const workerCount = await Worker.countDocuments();
  if (workerCount === 0) {
    // Sample workers for FMCG distribution
    const sampleWorkers = [
      { 
        name: 'Ahmed Benali', 
        position: 'Sales Manager', 
        salary: 180000, 
        department: 'Sales',
        role: 'Sales Agent',
        phone: '+213 55 123 4567',
        email: 'ahmed@distribution.dz',
        commissionRate: 0.05,
        targetSales: 5000000,
        currentSales: 0,
        skills: ['Sales', 'Client Management', 'FMCG Knowledge'],
        certifications: ['Sales Management', 'FMCG Distribution']
      },
      { 
        name: 'Sofia Meriem', 
        position: 'Sales Agent', 
        salary: 120000, 
        department: 'Sales',
        role: 'Sales Agent',
        phone: '+213 55 234 5678',
        email: 'sofia@distribution.dz',
        commissionRate: 0.04,
        targetSales: 3000000,
        currentSales: 0,
        skills: ['Pre-sales', 'Client Relations', 'Product Knowledge'],
        certifications: ['Sales Techniques', 'FMCG Products']
      },
      { 
        name: 'Mohamed Karim', 
        position: 'Delivery Driver', 
        salary: 100000, 
        department: 'Delivery',
        role: 'Delivery Driver',
        phone: '+213 55 345 6789',
        email: 'mohamed@distribution.dz',
        skills: ['Driving', 'Route Planning', 'Customer Service'],
        certifications: ['Commercial License', 'Safety Training']
      },
      { 
        name: 'Fatima Zahra', 
        position: 'Warehouse Manager', 
        salary: 140000, 
        department: 'Operations',
        role: 'Manager',
        phone: '+213 55 456 7890',
        email: 'fatima@distribution.dz',
        skills: ['Inventory Management', 'Logistics', 'ERP Systems'],
        certifications: ['Warehouse Management', 'Logistics']
      },
      { 
        name: 'Youssef Amine', 
        position: 'Operations Manager', 
        salary: 160000, 
        department: 'Operations',
        role: 'Manager',
        phone: '+213 55 567 8901',
        email: 'youssef@distribution.dz',
        skills: ['Operations', 'Distribution', 'Team Management'],
        certifications: ['Operations Management', 'Supply Chain']
      }
    ];

    // Sample brands for FMCG
    const sampleBrands = [
      {
        name: 'Coca-Cola Algeria',
        description: 'Leading beverage brand in Algeria',
        website: 'www.coca-cola.dz',
        contact: {
          phone: '+213 21 123 456',
          email: 'contact@coca-cola.dz',
          address: 'Alger, Algeria'
        },
        commission: {
          rate: 0.15,
          paymentTerms: 'NET30'
        }
      },
      {
        name: 'Nestlé Algeria',
        description: 'Food and beverage multinational',
        website: 'www.nestle.dz',
        contact: {
          phone: '+213 21 234 567',
          email: 'info@nestle.dz',
          address: 'Algiers, Algeria'
        },
        commission: {
          rate: 0.12,
          paymentTerms: 'NET45'
        }
      },
      {
        name: 'Talis Algeria',
        description: 'Local dairy and juice producer',
        website: 'www.talis.dz',
        contact: {
          phone: '+213 21 345 678',
          email: 'contact@talis.dz',
          address: 'Oran, Algeria'
        },
        commission: {
          rate: 0.18,
          paymentTerms: 'NET30'
        }
      }
    ];

    // Sample clients for FMCG distribution
    const sampleClients = [
      {
        name: 'Supermarché El-Feth',
        type: 'Supermarket',
        location: {
          address: '123 Rue Didouche Mourad',
          city: 'Alger',
          province: 'Alger',
          postalCode: '16000'
        },
        contact: {
          phone: '+213 21 987 654',
          email: 'contact@elfeth.dz',
          contactPerson: 'Mohamed Lamine'
        },
        business: {
          registrationNumber: '123456789',
          taxId: 'TX123456',
          businessType: 'Retail'
        },
        credit: {
          creditLimit: 1000000,
          currentBalance: 0,
          paymentTerms: 'NET30'
        },
        visitFrequency: 'Weekly'
      },
      {
        name: 'Boulangerie Parisienne',
        type: 'Retailer',
        location: {
          address: '45 Rue Hassiba Ben Bouali',
          city: 'Alger',
          province: 'Alger',
          postalCode: '16000'
        },
        contact: {
          phone: '+213 21 876 543',
          email: 'info@boulangerie-parisienne.dz',
          contactPerson: 'Sofia Benz'
        },
        business: {
          registrationNumber: '987654321',
          taxId: 'TX987654',
          businessType: 'Bakery'
        },
        credit: {
          creditLimit: 200000,
          currentBalance: 0,
          paymentTerms: 'NET15'
        },
        visitFrequency: 'Daily'
      },
      {
        name: 'Hotel Sofitel Alger',
        type: 'Hotel',
        location: {
          address: 'Bordj El Kiffan',
          city: 'Alger',
          province: 'Alger',
          postalCode: '16000'
        },
        contact: {
          phone: '+213 21 765 432',
          email: 'procurement@sofitel-alger.dz',
          contactPerson: 'Ahmed Chérif'
        },
        business: {
          registrationNumber: '456789123',
          taxId: 'TX456789',
          businessType: 'Hospitality'
        },
        credit: {
          creditLimit: 5000000,
          currentBalance: 0,
          paymentTerms: 'NET30'
        },
        visitFrequency: 'Bi-weekly'
      }
    ];

    // Insert brands first to get their IDs
    const savedBrands = await Brand.insertMany(sampleBrands);
    
    // Sample products for FMCG
    const sampleProducts = [
      {
        name: 'Coca-Cola 33cl',
        category: 'Beverages',
        description: 'Classic Coca-Cola in 33cl bottle',
        sku: 'COC-33CL-001',
        barcode: '5449000000996',
        brand: savedBrands[0]._id, // Coca-Cola
        price: {
          retail: 120,
          wholesale: 100,
          cost: 80
        },
        inventory: {
          quantity: 5000,
          minStock: 500,
          reserved: 0,
          available: 5000
        },
        packaging: {
          unit: 'bottles',
          unitsPerBox: 24,
          boxPerCarton: 4,
          weight: 33,
          dimensions: { length: 8, width: 8, height: 25 }
        }
      },
      {
        name: 'Nescafé 3in1 20 Sachets',
        category: 'Coffee',
        description: 'Instant coffee 3in1 sachets',
        sku: 'NES-3IN1-020',
        barcode: '7613034668232',
        brand: savedBrands[1]._id, // Nestlé
        price: {
          retail: 650,
          wholesale: 550,
          cost: 450
        },
        inventory: {
          quantity: 2000,
          minStock: 200,
          reserved: 0,
          available: 2000
        },
        packaging: {
          unit: 'sachets',
          unitsPerBox: 20,
          boxPerCarton: 6,
          weight: 300,
          dimensions: { length: 15, width: 10, height: 5 }
        }
      },
      {
        name: 'Talis Jus d\'Orange 1L',
        category: 'Juices',
        description: 'Fresh orange juice 1 liter',
        sku: 'TAL-ORG-1L',
        barcode: '6421000000012',
        brand: savedBrands[2]._id, // Talis
        price: {
          retail: 250,
          wholesale: 200,
          cost: 150
        },
        inventory: {
          quantity: 3000,
          minStock: 300,
          reserved: 0,
          available: 3000
        },
        packaging: {
          unit: 'liters',
          unitsPerBox: 12,
          boxPerCarton: 4,
          weight: 1000,
          dimensions: { length: 10, width: 10, height: 30 }
        }
      }
    ];

    // Insert clients to get their IDs
    const savedClients = await Client.insertMany(sampleClients);

    // Insert products
    const savedProducts = await Product.insertMany(sampleProducts);

    // Sample orders
    const sampleOrders = [
      {
        orderNumber: 'ORD-2024-001',
        client: savedClients[0]._id, // Supermarché El-Feth
        salesAgent: sampleWorkers[0]._id, // Ahmed Benali
        items: [
          {
            product: savedProducts[0]._id, // Coca-Cola
            quantity: 240, // 10 boxes
            unitPrice: 100,
            totalPrice: 24000,
            discount: 0,
            tax: 0
          },
          {
            product: savedProducts[2]._id, // Talis Juice
            quantity: 120, // 10 boxes
            unitPrice: 200,
            totalPrice: 24000,
            discount: 0,
            tax: 0
          }
        ],
        pricing: {
          subtotal: 48000,
          discount: 2400, // 5% discount
          tax: 0,
          total: 45600,
          currency: 'DZD'
        },
        status: 'Validated',
        payment: {
          method: 'Credit',
          status: 'Pending',
          amount: 45600
        },
        delivery: {
          type: 'Delivery',
          address: '123 Rue Didouche Mourad, Alger',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          estimatedTime: '09:00 - 11:00'
        },
        notes: 'Regular weekly order'
      }
    ];

    // Sample income from orders
    const sampleIncome = [
      { 
        description: 'Order ORD-2024-001 - Supermarché El-Feth', 
        amount: 45600, 
        type: 'Revenue',
        category: 'Product Sales',
        client: 'Supermarché El-Feth',
        invoiceNumber: 'INV-2024-001',
        paymentStatus: 'Pending',
        source: 'Order',
        orderId: sampleOrders[0]._id
      }
    ];

    // Sample expenses
    const sampleExpenses = [
      {
        description: 'Fuel for delivery vehicles',
        amount: 150000,
        category: 'Transportation',
        type: 'Operating Cost',
        supplier: 'Sonatrach Station',
        invoiceNumber: 'EXP-2024-001',
        paymentStatus: 'Paid',
        approvedBy: 'Youssef Amine',
        department: 'Delivery'
      },
      {
        description: 'Warehouse rent',
        amount: 200000,
        category: 'Rent',
        type: 'Fixed Cost',
        supplier: 'Alger Properties',
        invoiceNumber: 'EXP-2024-002',
        paymentStatus: 'Pending',
        approvedBy: 'Fatima Zahra',
        department: 'Operations'
      }
    ];

    await Worker.insertMany(sampleWorkers);
    await Client.insertMany(sampleClients);
    await Brand.insertMany(sampleBrands);
    await Product.insertMany(sampleProducts);
    await Order.insertMany(sampleOrders);
    await Income.insertMany(sampleIncome);
    await Expense.insertMany(sampleExpenses);
    
    console.log('🌱 FMCG Distribution sample data seeded for Algerian market');
  }
};

// API ROUTES FOR FMCG DISTRIBUTION ERP

// Workers API (enhanced for sales agents)
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ name: 1 }).populate('currentSales');
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

// Clients API
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort({ name: 1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Brands API
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brands', async (req, res) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products API (enhanced for FMCG)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().populate('brand').sort({ name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    const populatedProduct = await Product.findById(product._id).populate('brand');
    res.json(populatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('brand');
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders API (pre-sales system)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('client')
      .populate('salesAgent')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Generate order number
    const orderCount = await Order.countDocuments();
    orderData.orderNumber = `ORD-2024-${String(orderCount + 1).padStart(3, '0')}`;
    
    // Calculate pricing
    let subtotal = 0;
    orderData.items.forEach(item => {
      item.totalPrice = item.quantity * item.unitPrice;
      subtotal += item.totalPrice;
    });
    
    orderData.pricing = {
      subtotal,
      discount: orderData.pricing?.discount || 0,
      tax: orderData.pricing?.tax || 0,
      total: subtotal - (orderData.pricing?.discount || 0) + (orderData.pricing?.tax || 0),
      currency: 'DZD'
    };
    
    const order = new Order(orderData);
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('client')
      .populate('salesAgent')
      .populate('items.product');
    
    res.json(populatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('client')
      .populate('salesAgent')
      .populate('items.product');
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delivery API
app.get('/api/deliveries', async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('order')
      .populate('driver')
      .populate('route.stops.client')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deliveries', async (req, res) => {
  try {
    const deliveryData = req.body;
    
    // Generate delivery number
    const deliveryCount = await Delivery.countDocuments();
    deliveryData.deliveryNumber = `DEL-2024-${String(deliveryCount + 1).padStart(3, '0')}`;
    
    const delivery = new Delivery(deliveryData);
    await delivery.save();
    
    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('order')
      .populate('driver')
      .populate('route.stops.client');
    
    res.json(populatedDelivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/deliveries/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('order')
      .populate('driver')
      .populate('route.stops.client');
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Income API (enhanced)
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

// Expenses API (enhanced)
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Production API
app.get('/api/production', async (req, res) => {
  try {
    const production = await Production.find().sort({ startDate: -1 });
    res.json(production);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/production', async (req, res) => {
  try {
    const production = new Production(req.body);
    await production.save();
    res.json(production);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quality API
app.get('/api/quality', async (req, res) => {
  try {
    const quality = await Quality.find().sort({ date: -1 });
    res.json(quality);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quality', async (req, res) => {
  try {
    const quality = new Quality(req.body);
    await quality.save();
    res.json(quality);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enhanced Sales Dashboard API
app.get('/api/dashboard', async (req, res) => {
  try {
    const workerCount = await Worker.countDocuments();
    const clientCount = await Client.countDocuments();
    const brandCount = await Brand.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const deliveryCount = await Delivery.countDocuments();
    
    const totalSalary = await Worker.aggregate([{ $group: { _id: null, total: { $sum: "$salary" } } }]);
    const totalIncome = await Income.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalExpenses = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    
    // Sales metrics
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    
    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.totalPrice' } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }
    ]);
    
    // Top sales agents
    const topSalesAgents = await Order.aggregate([
      { $group: { _id: '$salesAgent', totalRevenue: { $sum: '$pricing.total' }, orderCount: { $sum: 1 } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'workers', localField: '_id', foreignField: '_id', as: 'agent' } }
    ]);
    
    // Sales by brand
    const salesByBrand = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.brand', totalRevenue: { $sum: '$items.totalPrice' } } },
      { $sort: { totalRevenue: -1 } },
      { $lookup: { from: 'brands', localField: '_id', foreignField: '_id', as: 'brand' } }
    ]);
    
    // Calculate profit margin
    const income = totalIncome[0]?.total || 0;
    const expenses = (totalSalary[0]?.total || 0) + (totalExpenses[0]?.total || 0);
    const profit = income - expenses;
    const profitMargin = income > 0 ? (profit / income) * 100 : 0;
    
    res.json({
      // Basic counts
      workers: workerCount,
      clients: clientCount,
      brands: brandCount,
      products: productCount,
      orders: orderCount,
      deliveries: deliveryCount,
      
      // Financial metrics
      totalSalary: totalSalary[0]?.total || 0,
      totalIncome: income,
      totalExpenses: totalExpenses[0]?.total || 0,
      totalRevenue,
      profit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      avgSalary: workerCount > 0 ? (totalSalary[0]?.total || 0) / workerCount : 0,
      
      // Sales metrics
      pendingOrders,
      deliveredOrders,
      deliveryRate: orderCount > 0 ? Math.round((deliveredOrders / orderCount) * 100) : 0,
      
      // Top performers
      topProducts: topProducts.map(item => ({
        ...item.product[0],
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue
      })),
      topSalesAgents: topSalesAgents.map(item => ({
        ...item.agent[0],
        totalRevenue: item.totalRevenue,
        orderCount: item.orderCount
      })),
      salesByBrand: salesByBrand.map(item => ({
        ...item.brand[0],
        totalRevenue: item.totalRevenue
      })),
      
      // System info
      currency: 'DZD',
      market: 'Algeria',
      system: 'FMCG Distribution ERP'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed data on startup
seedData();

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 FMCG Distribution ERP LIVE on port ${PORT}`);
  console.log(`🇩🇿 Market: Algeria | Currency: DZD`);
  console.log(`📊 Sales Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`👥 Sales Agents API: http://localhost:${PORT}/api/workers`);
  console.log(`🏪 Clients API: http://localhost:${PORT}/api/clients`);
  console.log(`🏷️ Brands API: http://localhost:${PORT}/api/brands`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`📋 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`� Delivery API: http://localhost:${PORT}/api/deliveries`);
  console.log(`💰 Income API: http://localhost:${PORT}/api/income`);
  console.log(`�💸 Expenses API: http://localhost:${PORT}/api/expenses`);
  console.log(`🏭 Production API: http://localhost:${PORT}/api/production`);
  console.log(`🔍 Quality API: http://localhost:${PORT}/api/quality`);
  console.log(`🎯 Ready for FMCG Distribution in Algeria!`);
});
