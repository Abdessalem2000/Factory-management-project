const mongoose = require('mongoose');
const Worker = require('./models/Worker');
const Transaction = require('./models/Transaction');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://abdslemk251_db_user:Khouya123@cluster0.178ejs0.mongodb.net/factory-management?retryWrites=true&w=majority');
    console.log('🗄️  Connected to MongoDB');

    // Clear existing data
    await Worker.deleteMany({});
    await Transaction.deleteMany({});
    console.log('🧹 Cleared existing data');

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

    // Insert workers
    const createdWorkers = await Worker.insertMany(workers);
    console.log(`✅ Created ${createdWorkers.length} workers`);

    // Insert transactions
    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`✅ Created ${createdTransactions.length} transactions`);

    // Calculate totals
    const totalIncome = createdTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = createdTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    console.log(`\n💰 Financial Summary:`);
    console.log(`   Total Income: ${totalIncome.toLocaleString()} DZD`);
    console.log(`   Total Expenses: ${totalExpenses.toLocaleString()} DZD`);
    console.log(`   Net Profit: ${(totalIncome - totalExpenses).toLocaleString()} DZD`);

    console.log(`\n👥 Worker Summary:`);
    console.log(`   Total Workers: ${createdWorkers.length}`);
    console.log(`   Average Hourly Rate: ${Math.round(workers.reduce((sum, w) => sum + w.hourlyRate, 0) / workers.length)} DZD`);

    console.log(`\n🎉 Database seeded successfully!`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
