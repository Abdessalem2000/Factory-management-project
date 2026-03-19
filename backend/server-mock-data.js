const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - WILDCARD for demo - MUST be above routes
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// OPTIONS preflight handler for wildcard CORS
app.options('*', cors());

// Mock Algerian data
const mockWorkers = [
  {
    id: 'worker-1',
    employeeId: 'EMP001',
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed.mohamed@factory.dz',
    position: 'Machine Operator',
    department: 'Production',
    status: 'ACTIVE',
    hourlyRate: 3500,
    currency: 'DZD',
    paymentType: 'HOURLY',
    hireDate: '2023-01-15',
    skills: ['Machine Operation', 'Quality Control', 'Assembly'],
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'worker-2',
    employeeId: 'EMP002',
    firstName: 'فاطمة',
    lastName: 'بن علي',
    email: 'fatima.benali@factory.dz',
    position: 'Quality Inspector',
    department: 'Quality Control',
    status: 'ACTIVE',
    hourlyRate: 3800,
    currency: 'DZD',
    paymentType: 'HOURLY',
    hireDate: '2023-02-20',
    skills: ['Quality Inspection', 'Documentation', 'Standards Compliance'],
    createdAt: '2023-02-20T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'worker-3',
    employeeId: 'EMP003',
    firstName: 'عمر',
    lastName: 'قاسم',
    email: 'omar.qassem@factory.dz',
    position: 'Maintenance Technician',
    department: 'Maintenance',
    status: 'ACTIVE',
    hourlyRate: 4200,
    currency: 'DZD',
    paymentType: 'HOURLY',
    hireDate: '2022-11-10',
    skills: ['Machine Repair', 'Preventive Maintenance', 'Electrical Systems'],
    createdAt: '2022-11-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

// Mock Algerian incomes data
const mockIncomes = [
  {
    id: 'income-1',
    description: 'Vente de produits finis - Janvier',
    amount: 2500000,
    date: '2026-01-31',
    source: 'Product Sales',
    category: 'Revenue',
    status: 'CONFIRMED',
    currency: 'DZD',
    notes: 'Vente mensuelle standard',
    createdAt: '2026-01-31T10:00:00Z',
    updatedAt: '2026-01-31T10:00:00Z'
  },
  {
    id: 'income-2',
    description: 'Contrat maintenance - Client Alger',
    amount: 850000,
    date: '2026-02-15',
    source: 'Service Contract',
    category: 'Service Revenue',
    status: 'CONFIRMED',
    currency: 'DZD',
    notes: 'Maintenance annuelle équipement',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'income-3',
    description: 'Location entrepôt - Février',
    amount: 450000,
    date: '2026-02-28',
    source: 'Rental',
    category: 'Rental Income',
    status: 'CONFIRMED',
    currency: 'DZD',
    notes: 'Location espace de stockage',
    createdAt: '2026-02-28T10:00:00Z',
    updatedAt: '2026-02-28T10:00:00Z'
  }
];

// Mock Algerian expenses data
const mockExpenses = [
  {
    id: 'expense-1',
    description: 'Salaires employés - Janvier',
    amount: 1200000,
    date: '2026-01-31',
    category: 'Salaries',
    subcategory: 'Monthly Wages',
    status: 'PAID',
    currency: 'DZD',
    paymentMethod: 'Bank Transfer',
    notes: 'Salaires 15 employés',
    createdAt: '2026-01-31T10:00:00Z',
    updatedAt: '2026-01-31T10:00:00Z'
  },
  {
    id: 'expense-2',
    description: 'Matériaux premiers - Février',
    amount: 680000,
    date: '2026-02-20',
    category: 'Materials',
    subcategory: 'Raw Materials',
    status: 'PAID',
    currency: 'DZD',
    paymentMethod: 'Bank Transfer',
    notes: 'Achat acier et composants',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-20T10:00:00Z'
  },
  {
    id: 'expense-3',
    description: 'Électricité - Février',
    amount: 85000,
    date: '2026-02-28',
    category: 'Utilities',
    subcategory: 'Electricity',
    status: 'PAID',
    currency: 'DZD',
    paymentMethod: 'Bank Transfer',
    notes: 'Facture SONELGAZ',
    createdAt: '2026-02-28T10:00:00Z',
    updatedAt: '2026-02-28T10:00:00Z'
  }
];

// Mock Algerian raw materials data
const mockRawMaterials = [
  {
    id: 'material-1',
    name: 'Coton Bleu - Qualité Premium',
    description: 'Tissu en coton bleu de haute qualité',
    category: 'Tissus',
    currentStock: 150,
    minStockAlert: 50,
    unit: 'mètres',
    unitPrice: 850,
    currency: 'DZD',
    supplier: 'Alger Textile Company',
    location: 'Entrepôt A',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z'
  },
  {
    id: 'material-2',
    name: 'Fermetures Éclair - Métal',
    description: 'Fermetures éclair en métal robuste',
    category: 'Accessoires',
    currentStock: 25,
    minStockAlert: 30,
    unit: 'pièces',
    unitPrice: 45,
    currency: 'DZD',
    supplier: 'Alger Hardware Supply',
    location: 'Entrepôt B',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z'
  },
  {
    id: 'material-3',
    name: 'Fil Blanc - Polyester',
    description: 'Fil polyester blanc pour couture',
    category: 'Fils',
    currentStock: 8,
    minStockAlert: 25,
    unit: 'rouleaux',
    unitPrice: 1200,
    currency: 'DZD',
    supplier: 'Alger Textile Company',
    location: 'Entrepôt A',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z'
  }
];

// Mock Algerian suppliers data
const mockSuppliers = [
  {
    id: 'supplier-1',
    name: 'Alger Textile Company',
    email: 'contact@alger-textile.dz',
    phone: '+213 21 23 45 67',
    address: '123 Rue des Manufactures, Alger',
    category: 'Tissus',
    rating: 4.5,
    status: 'ACTIVE',
    totalOrders: 45,
    lastOrderDate: '2026-03-15',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z'
  },
  {
    id: 'supplier-2',
    name: 'Alger Hardware Supply',
    email: 'info@alger-hardware.dz',
    phone: '+213 21 34 56 78',
    address: '456 Avenue des Industries, Alger',
    category: 'Accessoires',
    rating: 4.2,
    status: 'ACTIVE',
    totalOrders: 28,
    lastOrderDate: '2026-03-10',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z'
  },
  {
    id: 'supplier-3',
    name: 'Alger Chemical Solutions',
    email: 'sales@alger-chemical.dz',
    phone: '+213 21 45 67 89',
    address: '789 Boulevard Technologie, Alger',
    category: 'Produits Chimiques',
    rating: 3.8,
    status: 'ACTIVE',
    totalOrders: 15,
    lastOrderDate: '2026-03-08',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z'
  }
];

// Mock Algerian production orders data
const mockProductionOrders = [
  {
    id: 'order-1',
    orderNumber: 'PO-2026-001',
    productName: 'Chemise Traditionnelle - Modèle A',
    productCode: 'CT-A-001',
    quantity: 500,
    unit: 'pièces',
    status: 'IN_PRODUCTION',
    priority: 'HIGH',
    startDate: '2026-03-01',
    expectedDeliveryDate: '2026-03-20',
    actualDeliveryDate: null,
    assignedWorkers: ['worker-1', 'worker-2'],
    materialsRequired: [
      { materialId: 'material-1', quantity: 200, unit: 'mètres' },
      { materialId: 'material-3', quantity: 10, unit: 'rouleaux' }
    ],
    progress: 65,
    qualityChecks: [
      { stage: 'Coupe', status: 'COMPLETED', checkedBy: 'Quality Team A' },
      { stage: 'Couture', status: 'IN_PROGRESS', checkedBy: null }
    ],
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-17T14:30:00Z'
  },
  {
    id: 'order-2',
    orderNumber: 'PO-2026-002',
    productName: 'Pantalon Classique - Modèle B',
    productCode: 'PC-B-002',
    quantity: 300,
    unit: 'pièces',
    status: 'PENDING',
    priority: 'MEDIUM',
    startDate: '2026-03-15',
    expectedDeliveryDate: '2026-04-05',
    actualDeliveryDate: null,
    assignedWorkers: [],
    materialsRequired: [
      { materialId: 'material-1', quantity: 150, unit: 'mètres' },
      { materialId: 'material-2', quantity: 60, unit: 'pièces' }
    ],
    progress: 0,
    qualityChecks: [],
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z'
  }
];

let workers = [...mockWorkers];
let nextId = 4;
let incomes = [...mockIncomes];
let expenses = [...mockExpenses];
let rawMaterials = [...mockRawMaterials];
let suppliers = [...mockSuppliers];
let productionOrders = [...mockProductionOrders];

// Security middleware
app.use(helmet());

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
    database: 'Mock Data (Supabase pending)',
    version: '2.0.0-mock-data',
    message: 'Using mock Algerian data while Supabase initializes'
  });
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    success: true,
    status: 'mock',
    message: 'Using mock data - Supabase connection pending',
    workersCount: workers.length,
    database: process.env.DATABASE_URL ? 'Supabase (PostgreSQL) - Initializing' : 'Not configured',
    recommendation: 'Try real database connection in 2-3 minutes'
  });
});

// Worker Routes with Mock Data
app.get('/api/workers', (req, res) => {
  const { search, department, page = 1, limit = 50 } = req.query;
  
  let filteredWorkers = [...workers];
  
  // Search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    filteredWorkers = filteredWorkers.filter(worker => 
      worker.firstName.toLowerCase().includes(searchLower) ||
      worker.lastName.toLowerCase().includes(searchLower) ||
      worker.email.toLowerCase().includes(searchLower) ||
      worker.position.toLowerCase().includes(searchLower) ||
      worker.employeeId.toLowerCase().includes(searchLower)
    );
  }
  
  // Department filter
  if (department) {
    const deptLower = department.toLowerCase();
    filteredWorkers = filteredWorkers.filter(worker => 
      worker.department.toLowerCase().includes(deptLower)
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedWorkers = filteredWorkers.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedWorkers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredWorkers.length,
      pages: Math.ceil(filteredWorkers.length / limit)
    }
  });
});

app.get('/api/workers/:id', (req, res) => {
  const { id } = req.params;
  const worker = workers.find(w => w.id === id);
  
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
});

app.post('/api/workers', (req, res) => {
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
  
  // Check for duplicate employee ID
  if (workers.some(w => w.employeeId === workerData.employeeId)) {
    return res.status(409).json({
      success: false,
      message: 'Employee ID already exists'
    });
  }
  
  // Check for duplicate email
  if (workers.some(w => w.email === workerData.email)) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists'
    });
  }
  
  const newWorker = {
    id: `worker-${nextId++}`,
    ...workerData,
    status: workerData.status || 'ACTIVE',
    currency: workerData.currency || 'DZD',
    paymentType: workerData.paymentType || 'HOURLY',
    hireDate: workerData.hireDate || new Date().toISOString().split('T')[0],
    skills: workerData.skills || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  workers.push(newWorker);
  
  res.status(201).json({
    success: true,
    data: newWorker,
    message: 'Worker created successfully (mock data)'
  });
});

app.put('/api/workers/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const workerIndex = workers.findIndex(w => w.id === id);
  
  if (workerIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Worker not found'
    });
  }
  
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
  
  workers[workerIndex] = {
    ...workers[workerIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: workers[workerIndex],
    message: 'Worker updated successfully (mock data)'
  });
});

app.delete('/api/workers/:id', (req, res) => {
  const { id } = req.params;
  const workerIndex = workers.findIndex(w => w.id === id);
  
  if (workerIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Worker not found'
    });
  }
  
  workers.splice(workerIndex, 1);
  
  res.json({
    success: true,
    message: 'Worker deleted successfully (mock data)'
  });
});

// Worker statistics
app.get('/api/workers/stats/overview', (req, res) => {
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'ACTIVE').length;
  
  const departments = {};
  workers.forEach(worker => {
    departments[worker.department] = (departments[worker.department] || 0) + 1;
  });
  
  const paymentTypes = {};
  workers.forEach(worker => {
    paymentTypes[worker.paymentType] = (paymentTypes[worker.paymentType] || 0) + 1;
  });
  
  const avgHourlyRate = workers.reduce((sum, worker) => sum + worker.hourlyRate, 0) / workers.length;
  
  res.json({
    success: true,
    data: {
      total: totalWorkers,
      active: activeWorkers,
      departments: Object.entries(departments).map(([name, count]) => ({ name, count })),
      paymentTypes: Object.entries(paymentTypes).map(([type, count]) => ({ type, count })),
      averageHourlyRate: Math.round(avgHourlyRate)
    }
  });
});

// Incomes API Routes
app.get('/api/incomes', (req, res) => {
  const { page = 1, limit = 10, search, category, startDate, endDate } = req.query;
  
  let filteredIncomes = [...incomes];
  
  // Search filter
  if (search) {
    filteredIncomes = filteredIncomes.filter(income => 
      income.description.toLowerCase().includes(search.toLowerCase()) ||
      income.source.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Category filter
  if (category) {
    filteredIncomes = filteredIncomes.filter(income => income.category === category);
  }
  
  // Date range filter
  if (startDate) {
    filteredIncomes = filteredIncomes.filter(income => income.date >= startDate);
  }
  if (endDate) {
    filteredIncomes = filteredIncomes.filter(income => income.date <= endDate);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedIncomes = filteredIncomes.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedIncomes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredIncomes.length,
      pages: Math.ceil(filteredIncomes.length / limit)
    }
  });
});

app.post('/api/incomes', (req, res) => {
  const incomeData = req.body;
  
  // Validation
  const requiredFields = ['description', 'amount', 'date', 'source'];
  const missingFields = requiredFields.filter(field => !incomeData[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  // Amount validation
  if (incomeData.amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0'
    });
  }
  
  const newIncome = {
    id: `income-${incomes.length + 1}`,
    description: incomeData.description,
    amount: parseFloat(incomeData.amount),
    date: incomeData.date,
    source: incomeData.source,
    category: incomeData.category || 'Revenue',
    status: incomeData.status || 'CONFIRMED',
    currency: incomeData.currency || 'DZD',
    notes: incomeData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  incomes.push(newIncome);
  
  res.status(201).json({
    success: true,
    data: newIncome,
    message: 'Income created successfully (mock data)'
  });
});

app.get('/api/incomes/:id', (req, res) => {
  const { id } = req.params;
  const income = incomes.find(i => i.id === id);
  
  if (!income) {
    return res.status(404).json({
      success: false,
      message: 'Income not found'
    });
  }
  
  res.json({
    success: true,
    data: income
  });
});

app.put('/api/incomes/:id', (req, res) => {
  const { id } = req.params;
  const incomeIndex = incomes.findIndex(i => i.id === id);
  
  if (incomeIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Income not found'
    });
  }
  
  const updateData = req.body;
  
  // Amount validation if provided
  if (updateData.amount !== undefined && updateData.amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0'
    });
  }
  
  incomes[incomeIndex] = {
    ...incomes[incomeIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: incomes[incomeIndex],
    message: 'Income updated successfully (mock data)'
  });
});

app.delete('/api/incomes/:id', (req, res) => {
  const { id } = req.params;
  const incomeIndex = incomes.findIndex(i => i.id === id);
  
  if (incomeIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Income not found'
    });
  }
  
  incomes.splice(incomeIndex, 1);
  
  res.json({
    success: true,
    message: 'Income deleted successfully (mock data)'
  });
});

// Expenses API Routes
app.get('/api/expenses', (req, res) => {
  const { page = 1, limit = 10, search, category, startDate, endDate } = req.query;
  
  let filteredExpenses = [...expenses];
  
  // Search filter
  if (search) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.category.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Category filter
  if (category) {
    filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
  }
  
  // Date range filter
  if (startDate) {
    filteredExpenses = filteredExpenses.filter(expense => expense.date >= startDate);
  }
  if (endDate) {
    filteredExpenses = filteredExpenses.filter(expense => expense.date <= endDate);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedExpenses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredExpenses.length,
      pages: Math.ceil(filteredExpenses.length / limit)
    }
  });
});

app.post('/api/expenses', (req, res) => {
  const expenseData = req.body;
  
  // Validation
  const requiredFields = ['description', 'amount', 'date', 'category'];
  const missingFields = requiredFields.filter(field => !expenseData[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  // Amount validation
  if (expenseData.amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0'
    });
  }
  
  const newExpense = {
    id: `expense-${expenses.length + 1}`,
    description: expenseData.description,
    amount: parseFloat(expenseData.amount),
    date: expenseData.date,
    category: expenseData.category,
    subcategory: expenseData.subcategory || '',
    status: expenseData.status || 'PAID',
    currency: expenseData.currency || 'DZD',
    paymentMethod: expenseData.paymentMethod || 'Bank Transfer',
    notes: expenseData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  expenses.push(newExpense);
  
  res.status(201).json({
    success: true,
    data: newExpense,
    message: 'Expense created successfully (mock data)'
  });
});

// Financial summary
app.get('/api/financial/summary/overview', (req, res) => {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  
  const incomeByCategory = {};
  incomes.forEach(income => {
    incomeByCategory[income.category] = (incomeByCategory[income.category] || 0) + income.amount;
  });
  
  const expenseByCategory = {};
  expenses.forEach(expense => {
    expenseByCategory[expense.category] = (expenseByCategory[expense.category] || 0) + expense.amount;
  });
  
  res.json({
    success: true,
    data: {
      totalIncome,
      totalExpenses,
      netIncome,
      incomeByCategory: Object.entries(incomeByCategory).map(([category, amount]) => ({ category, amount })),
      expenseByCategory: Object.entries(expenseByCategory).map(([category, amount]) => ({ category, amount })),
      totalTransactions: incomes.length + expenses.length
    }
  });
});

// Raw Materials API Routes
app.get('/api/raw-materials', (req, res) => {
  const { page = 1, limit = 10, search, category, lowStock } = req.query;
  
  let filteredMaterials = [...rawMaterials];
  
  // Search filter
  if (search) {
    filteredMaterials = filteredMaterials.filter(material => 
      material.name.toLowerCase().includes(search.toLowerCase()) ||
      material.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Category filter
  if (category) {
    filteredMaterials = filteredMaterials.filter(material => material.category === category);
  }
  
  // Low stock filter
  if (lowStock === 'true') {
    filteredMaterials = filteredMaterials.filter(material => 
      material.currentStock <= material.minStockAlert
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedMaterials,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredMaterials.length,
      pages: Math.ceil(filteredMaterials.length / limit)
    }
  });
});

app.post('/api/raw-materials', (req, res) => {
  const materialData = req.body;
  
  // Validation
  const requiredFields = ['name', 'description', 'category', 'currentStock', 'minStockAlert', 'unitPrice'];
  const missingFields = requiredFields.filter(field => !materialData[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  // Unit price validation
  if (materialData.unitPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Unit price must be greater than 0'
    });
  }
  
  const newMaterial = {
    id: `material-${rawMaterials.length + 1}`,
    name: materialData.name,
    description: materialData.description,
    category: materialData.category,
    currentStock: parseInt(materialData.currentStock),
    minStockAlert: parseInt(materialData.minStockAlert),
    unit: materialData.unit || 'pièces',
    unitPrice: parseFloat(materialData.unitPrice),
    currency: materialData.currency || 'DZD',
    supplier: materialData.supplier || '',
    location: materialData.location || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  rawMaterials.push(newMaterial);
  
  res.status(201).json({
    success: true,
    data: newMaterial,
    message: 'Material created successfully (mock data)'
  });
});

// Suppliers API Routes
app.get('/api/suppliers', (req, res) => {
  const { page = 1, limit = 10, search, category, rating } = req.query;
  
  let filteredSuppliers = [...suppliers];
  
  // Search filter
  if (search) {
    filteredSuppliers = filteredSuppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Category filter
  if (category) {
    filteredSuppliers = filteredSuppliers.filter(supplier => supplier.category === category);
  }
  
  // Rating filter
  if (rating) {
    const minRating = parseFloat(rating);
    filteredSuppliers = filteredSuppliers.filter(supplier => supplier.rating >= minRating);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedSuppliers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredSuppliers.length,
      pages: Math.ceil(filteredSuppliers.length / limit)
    }
  });
});

app.post('/api/suppliers', (req, res) => {
  const supplierData = req.body;
  
  // Validation
  const requiredFields = ['name', 'email', 'phone', 'address', 'category'];
  const missingFields = requiredFields.filter(field => !supplierData[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(supplierData.email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  const newSupplier = {
    id: `supplier-${suppliers.length + 1}`,
    name: supplierData.name,
    email: supplierData.email,
    phone: supplierData.phone,
    address: supplierData.address,
    category: supplierData.category,
    rating: parseFloat(supplierData.rating) || 0,
    status: supplierData.status || 'ACTIVE',
    totalOrders: 0,
    lastOrderDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  suppliers.push(newSupplier);
  
  res.status(201).json({
    success: true,
    data: newSupplier,
    message: 'Supplier created successfully (mock data)'
  });
});

// Production Orders API Routes
app.get('/api/production', (req, res) => {
  const { page = 1, limit = 10, status, priority, search } = req.query;
  
  let filteredOrders = [...productionOrders];
  
  // Search filter
  if (search) {
    filteredOrders = filteredOrders.filter(order => 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.productName.toLowerCase().includes(search.toLowerCase()) ||
      order.productCode.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Status filter
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  
  // Priority filter
  if (priority) {
    filteredOrders = filteredOrders.filter(order => order.priority === priority);
  }
  
  // Sort by creation date (newest first)
  filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedOrders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredOrders.length,
      pages: Math.ceil(filteredOrders.length / limit)
    }
  });
});

app.post('/api/production', (req, res) => {
  const orderData = req.body;
  
  // Validation
  const requiredFields = ['orderNumber', 'productName', 'productCode', 'quantity', 'unit', 'priority', 'expectedDeliveryDate'];
  const missingFields = requiredFields.filter(field => !orderData[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  // Quantity validation
  if (orderData.quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be greater than 0'
    });
  }
  
  const newOrder = {
    id: `order-${productionOrders.length + 1}`,
    orderNumber: orderData.orderNumber,
    productName: orderData.productName,
    productCode: orderData.productCode,
    quantity: parseInt(orderData.quantity),
    unit: orderData.unit,
    status: orderData.status || 'PENDING',
    priority: orderData.priority,
    startDate: orderData.startDate || null,
    expectedDeliveryDate: orderData.expectedDeliveryDate,
    actualDeliveryDate: null,
    assignedWorkers: [],
    materialsRequired: orderData.materialsRequired || [],
    progress: 0,
    qualityChecks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  productionOrders.push(newOrder);
  
  res.status(201).json({
    success: true,
    data: newOrder,
    message: 'Production order created successfully (mock data)'
  });
});

app.put('/api/production/:id', (req, res) => {
  const { id } = req.params;
  const orderIndex = productionOrders.findIndex(order => order.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Production order not found'
    });
  }
  
  const updateData = req.body;
  
  // Progress validation
  if (updateData.progress !== undefined && (updateData.progress < 0 || updateData.progress > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Progress must be between 0 and 100'
    });
  }
  
  productionOrders[orderIndex] = {
    ...productionOrders[orderIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: productionOrders[orderIndex],
    message: 'Production order updated successfully (mock data)'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
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
      'GET /api/db-status',
      'GET /api/workers',
      'POST /api/workers',
      'PUT /api/workers/:id',
      'DELETE /api/workers/:id',
      'GET /api/workers/stats/overview',
      'GET /api/incomes',
      'POST /api/incomes',
      'GET /api/incomes/:id',
      'PUT /api/incomes/:id',
      'DELETE /api/incomes/:id',
      'GET /api/expenses',
      'POST /api/expenses',
      'GET /api/expenses/:id',
      'PUT /api/expenses/:id',
      'DELETE /api/expenses/:id',
      'GET /api/financial/summary/overview',
      'GET /api/raw-materials',
      'POST /api/raw-materials',
      'GET /api/suppliers',
      'POST /api/suppliers',
      'GET /api/production',
      'POST /api/production',
      'PUT /api/production/:id'
    ]
  });
});

// AI Audit Endpoint
app.post('/api/ai-audit', async (req, res) => {
  try {
    const factoryData = req.body;
    const auditReport = await generateFactoryAudit(factoryData);
    res.json({ success: true, data: auditReport });
  } catch (error) {
    console.error('AI Audit Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI Audit temporarily unavailable. Please try again later.' 
    });
  }
});

// Import AI service
const { generateFactoryAudit } = require('./src/services/aiService');
app.listen(PORT, () => {
  console.log(`🚀 Factory Management API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: Mock Algerian Data (Supabase pending)`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Database status: http://localhost:${PORT}/api/db-status`);
  console.log(`👥 Workers API: http://localhost:${PORT}/api/workers`);
  console.log(`📝 Mock workers: ${workers.length} Algerian employees`);
  console.log(`⏳ Supabase will be ready in 2-3 minutes`);
});

module.exports = app;
