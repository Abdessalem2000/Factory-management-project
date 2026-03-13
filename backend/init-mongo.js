// MongoDB initialization script
db = db.getSiblingDB('factory_management');

// Create collections with indexes
db.createCollection('productionorders');
db.productionorders.createIndex({ orderNumber: 1 }, { unique: true });
db.productionorders.createIndex({ status: 1 });
db.productionorders.createIndex({ priority: 1 });
db.productionorders.createIndex({ createdAt: -1 });

db.createCollection('transactions');
db.transactions.createIndex({ status: 1 });
db.transactions.createIndex({ type: 1 });
db.transactions.createIndex({ category: 1 });
db.transactions.createIndex({ date: -1 });

db.createCollection('suppliers');
db.suppliers.createIndex({ email: 1 }, { unique: true });
db.suppliers.createIndex({ status: 1 });
db.suppliers.createIndex({ rating: 1 });

db.createCollection('workers');
db.workers.createIndex({ employeeId: 1 }, { unique: true });
db.workers.createIndex({ email: 1 }, { unique: true });
db.workers.createIndex({ status: 1 });
db.workers.createIndex({ department: 1 });

// Insert initial data
db.productionorders.insertMany([
  {
    orderNumber: 'PO-000001',
    product: { name: 'Industrial Widget', sku: 'WGT-001' },
    quantity: 100,
    unitOfMeasure: 'units',
    status: 'in_progress',
    priority: 'high',
    stages: [
      { name: 'Planning', status: 'completed', completedAt: new Date() },
      { name: 'Material Procurement', status: 'completed', completedAt: new Date() },
      { name: 'Production', status: 'in_progress', startedAt: new Date() },
      { name: 'Quality Control', status: 'pending' },
      { name: 'Packaging', status: 'pending' },
      { name: 'Delivery', status: 'pending' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.transactions.insertMany([
  {
    type: 'income',
    category: 'sales',
    amount: 1500000, // 1,500,000 DZD
    currency: 'DZD',
    description: 'Industrial equipment sale',
    date: new Date(),
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: 'expense',
    category: 'materials',
    amount: 750000, // 750,000 DZD
    currency: 'DZD',
    description: 'Raw materials purchase',
    date: new Date(),
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.suppliers.insertMany([
  {
    name: 'ABC Supplies Algeria',
    contactPerson: 'Mohamed Benali',
    email: 'mohamed@abc-supplies.dz',
    phone: '+213 21 23 45 67',
    address: {
      street: '123 Rue Didouche Mourad',
      city: 'Alger',
      state: 'Alger',
      postalCode: '16000',
      country: 'Algeria'
    },
    status: 'active',
    rating: 4,
    categories: ['materials', 'components'],
    paymentTerms: 'Net 30 days',
    totalOrders: 15,
    totalSpent: 25000000, // 25,000,000 DZD
    outstandingBalance: 3500000, // 3,500,000 DZD
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.workers.insertMany([
  {
    employeeId: 'EMP-000001',
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@factory.dz',
    phone: '+213 555 123 456',
    position: 'Machine Operator',
    department: 'Production',
    status: 'active',
    hourlyRate: 3200, // 3,200 DZD/hour
    currency: 'DZD',
    paymentType: 'hourly',
    skills: ['Machine Operation', 'Quality Control'],
    address: {
      street: '456 Rue Hassiba Ben Bouali',
      city: 'Oran',
      state: 'Oran',
      postalCode: '31000',
      country: 'Algeria'
    },
    emergencyContact: {
      name: 'Fatima Mohammed',
      relationship: 'Spouse',
      phone: '+213 555 987 654'
    },
    hireDate: new Date('2022-01-15'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('Database initialized successfully with Algerian data!');
