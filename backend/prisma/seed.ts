import { PrismaClient, WorkerStatus, PaymentType, SupplierStatus, RawMaterialCategory, RawMaterialUnit, RawMaterialStatus, OrderStatus, OrderPriority, StepStatus, ExpenseCategory, IncomeCategory, PaymentMethod, ExpenseStatus, IncomeStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data
  await prisma.expense.deleteMany()
  await prisma.income.deleteMany()
  await prisma.productionStep.deleteMany()
  await prisma.productionOrder.deleteMany()
  await prisma.rawMaterial.deleteMany()
  await prisma.worker.deleteMany()
  await prisma.address.deleteMany()
  await prisma.supplier.deleteMany()

  console.log('🧹 Cleaned existing data')

  // Create Suppliers with Algerian data
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Algerian Textile Company',
        contactPerson: 'Mohamed Benali',
        email: 'mohamed.benali@atextile.dz',
        phone: '+213 21 23 45 67',
        taxId: '123456789012345',
        paymentTerms: 'Net 30 days',
        categories: ['fabric', 'thread'],
        status: SupplierStatus.ACTIVE,
        rating: 4.5,
        notes: 'Reliable supplier for high-quality fabrics',
        address: {
          create: {
            street: '123 Rue Didouche Mourad',
            city: 'Alger',
            state: 'Alger',
            zipCode: '16000',
            country: 'Algeria'
          }
        }
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Sahara Manufacturing',
        contactPerson: 'Fatima Zahra',
        email: 'fatima@saharamanuf.dz',
        phone: '+213 21 98 76 54',
        taxId: '987654321098765',
        paymentTerms: 'Net 15 days',
        categories: ['buttons', 'zippers', 'labels'],
        status: SupplierStatus.ACTIVE,
        rating: 4.2,
        notes: 'Good quality accessories',
        address: {
          create: {
            street: '45 Avenue des Frères Zemmouri',
            city: 'Oran',
            state: 'Oran',
            zipCode: '31000',
            country: 'Algeria'
          }
        }
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Kabylie Packaging Co',
        contactPerson: 'Amine Boudiaf',
        email: 'amine@kpackaging.dz',
        phone: '+213 26 45 32 10',
        taxId: '555666777888999',
        paymentTerms: 'COD',
        categories: ['packaging'],
        status: SupplierStatus.ACTIVE,
        rating: 3.8,
        notes: 'Local packaging solutions',
        address: {
          create: {
            street: '78 Rue Larbi Ben M\'hidi',
            city: 'Tizi Ouzou',
            state: 'Tizi Ouzou',
            zipCode: '15000',
            country: 'Algeria'
          }
        }
      }
    })
  ])

  console.log(`✅ Created ${suppliers.length} suppliers`)

  // Create Workers with Algerian names
  const workers = await Promise.all([
    prisma.worker.create({
      data: {
        employeeId: 'EMP001',
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmed.mohamed@factory.dz',
        position: 'Machine Operator',
        department: 'Production',
        status: WorkerStatus.ACTIVE,
        hourlyRate: 3500,
        currency: 'DZD',
        paymentType: PaymentType.HOURLY,
        hireDate: new Date('2023-01-15'),
        skills: ['Machine Operation', 'Quality Control', 'Assembly']
      }
    }),
    prisma.worker.create({
      data: {
        employeeId: 'EMP002',
        firstName: 'فاطمة',
        lastName: 'بن علي',
        email: 'fatima.benali@factory.dz',
        position: 'Quality Inspector',
        department: 'Quality Control',
        status: WorkerStatus.ACTIVE,
        hourlyRate: 3800,
        currency: 'DZD',
        paymentType: PaymentType.HOURLY,
        hireDate: new Date('2023-02-20'),
        skills: ['Quality Inspection', 'Documentation', 'Standards Compliance']
      }
    }),
    prisma.worker.create({
      data: {
        employeeId: 'EMP003',
        firstName: 'عمر',
        lastName: 'قاسم',
        email: 'omar.qassem@factory.dz',
        position: 'Maintenance Technician',
        department: 'Maintenance',
        status: WorkerStatus.ACTIVE,
        hourlyRate: 4200,
        currency: 'DZD',
        paymentType: PaymentType.HOURLY,
        hireDate: new Date('2022-11-10'),
        skills: ['Machine Repair', 'Preventive Maintenance', 'Electrical Systems']
      }
    }),
    prisma.worker.create({
      data: {
        employeeId: 'EMP004',
        firstName: 'سارة',
        lastName: 'العربي',
        email: 'sara.arabi@factory.dz',
        position: 'Production Manager',
        department: 'Management',
        status: WorkerStatus.ACTIVE,
        hourlyRate: 5500,
        currency: 'DZD',
        paymentType: PaymentType.SALARY,
        hireDate: new Date('2022-05-01'),
        skills: ['Team Leadership', 'Production Planning', 'Resource Management']
      }
    }),
    prisma.worker.create({
      data: {
        employeeId: 'EMP005',
        firstName: 'ياسين',
        lastName: 'شريفي',
        email: 'yacine.cherif@factory.dz',
        position: 'Warehouse Manager',
        department: 'Warehouse',
        status: WorkerStatus.ACTIVE,
        hourlyRate: 4500,
        currency: 'DZD',
        paymentType: PaymentType.SALARY,
        hireDate: new Date('2023-03-25'),
        skills: ['Inventory Management', 'Logistics', 'Forklift Operation']
      }
    })
  ])

  console.log(`✅ Created ${workers.length} workers`)

  // Create Raw Materials
  const rawMaterials = await Promise.all([
    prisma.rawMaterial.create({
      data: {
        name: 'Cotton Fabric - Premium Quality',
        reference: 'CF-001',
        category: RawMaterialCategory.FABRIC,
        unit: RawMaterialUnit.METERS,
        currentStock: 1500,
        minStockAlert: 200,
        unitCost: 2500,
        lastRestocked: new Date('2024-01-10'),
        description: 'High-quality cotton fabric for premium garments',
        location: 'Warehouse A - Section 1',
        status: RawMaterialStatus.ACTIVE,
        supplierId: suppliers[0].id
      }
    }),
    prisma.rawMaterial.create({
      data: {
        name: 'Polyester Thread - Black',
        reference: 'PT-002',
        category: RawMaterialCategory.THREAD,
        unit: RawMaterialUnit.KILOGRAMS,
        currentStock: 85,
        minStockAlert: 20,
        unitCost: 1800,
        lastRestocked: new Date('2024-01-15'),
        description: 'Durable polyester thread for industrial sewing',
        location: 'Warehouse B - Section 2',
        status: RawMaterialStatus.ACTIVE,
        supplierId: suppliers[0].id
      }
    }),
    prisma.rawMaterial.create({
      data: {
        name: 'Plastic Buttons - 15mm',
        reference: 'PB-003',
        category: RawMaterialCategory.BUTTONS,
        unit: RawMaterialUnit.PIECES,
        currentStock: 5000,
        minStockAlert: 500,
        unitCost: 25,
        lastRestocked: new Date('2024-01-20'),
        description: 'Standard plastic buttons for casual wear',
        location: 'Warehouse C - Section 3',
        status: RawMaterialStatus.ACTIVE,
        supplierId: suppliers[1].id
      }
    }),
    prisma.rawMaterial.create({
      data: {
        name: 'Metal Zippers - 20cm',
        reference: 'MZ-004',
        category: RawMaterialCategory.ZIPPERS,
        unit: RawMaterialUnit.PIECES,
        currentStock: 800,
        minStockAlert: 100,
        unitCost: 450,
        lastRestocked: new Date('2024-01-18'),
        description: 'Durable metal zippers for jackets and coats',
        location: 'Warehouse C - Section 4',
        status: RawMaterialStatus.ACTIVE,
        supplierId: suppliers[1].id
      }
    }),
    prisma.rawMaterial.create({
      data: {
        name: 'Brand Labels - Custom',
        reference: 'BL-005',
        category: RawMaterialCategory.LABELS,
        unit: RawMaterialUnit.PIECES,
        currentStock: 12000,
        minStockAlert: 2000,
        unitCost: 85,
        lastRestocked: new Date('2024-01-22'),
        description: 'Custom brand labels with logo',
        location: 'Warehouse D - Section 1',
        status: RawMaterialStatus.ACTIVE,
        supplierId: suppliers[1].id
      }
    }),
    prisma.rawMaterial.create({
      data: {
        name: 'Polyethylene Bags - Large',
        reference: 'PB-006',
        category: RawMaterialCategory.PACKAGING,
        unit: RawMaterialUnit.BOXES,
        currentStock: 150,
        minStockAlert: 25,
        unitCost: 1200,
        lastRestocked: new Date('2024-01-25'),
        description: 'Large polyethylene bags for finished products',
        location: 'Warehouse D - Section 2',
        status: RawMaterialStatus.ACTIVE,
        supplierId: suppliers[2].id
      }
    })
  ])

  console.log(`✅ Created ${rawMaterials.length} raw materials`)

  // Create Production Orders
  const productionOrders = await Promise.all([
    prisma.productionOrder.create({
      data: {
        orderNumber: 'PO-2024-001',
        customerName: 'Fashion House Algeria',
        productType: 'Winter Collection - Jackets',
        quantity: 500,
        unitPrice: 15000,
        totalAmount: 7500000,
        status: OrderStatus.IN_PROGRESS,
        priority: OrderPriority.HIGH,
        startDate: new Date('2024-01-01'),
        deliveryDate: new Date('2024-02-15'),
        notes: 'Premium winter jackets with custom branding'
      }
    }),
    prisma.productionOrder.create({
      data: {
        orderNumber: 'PO-2024-002',
        customerName: 'Urban Wear Store',
        productType: 'Casual Shirts',
        quantity: 1000,
        unitPrice: 8500,
        totalAmount: 8500000,
        status: OrderStatus.PENDING,
        priority: OrderPriority.MEDIUM,
        deliveryDate: new Date('2024-03-01'),
        notes: 'Standard casual shirts for retail'
      }
    }),
    prisma.productionOrder.create({
      data: {
        orderNumber: 'PO-2024-003',
        customerName: 'School Uniforms Ltd',
        productType: 'School Uniforms',
        quantity: 2000,
        unitPrice: 5500,
        totalAmount: 11000000,
        status: OrderStatus.COMPLETED,
        priority: OrderPriority.URGENT,
        startDate: new Date('2023-12-15'),
        endDate: new Date('2024-01-10'),
        deliveryDate: new Date('2024-01-15'),
        notes: 'Emergency order for new school year'
      }
    })
  ])

  console.log(`✅ Created ${productionOrders.length} production orders`)

  // Create Production Steps
  const productionSteps = await Promise.all([
    prisma.productionStep.create({
      data: {
        name: 'Cutting',
        description: 'Fabric cutting according to patterns',
        status: StepStatus.COMPLETED,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
        duration: 2880, // 48 hours in minutes
        notes: 'All pieces cut accurately',
        orderId: productionOrders[0].id
      }
    }),
    prisma.productionStep.create({
      data: {
        name: 'Sewing',
        description: 'Main sewing and assembly',
        status: StepStatus.IN_PROGRESS,
        startDate: new Date('2024-01-04'),
        duration: 4320, // 72 hours in minutes
        notes: 'Currently in progress - 60% complete',
        orderId: productionOrders[0].id
      }
    }),
    prisma.productionStep.create({
      data: {
        name: 'Quality Control',
        description: 'Final quality inspection',
        status: StepStatus.PENDING,
        notes: 'Waiting for sewing completion',
        orderId: productionOrders[0].id
      }
    }),
    prisma.productionStep.create({
      data: {
        name: 'Packaging',
        description: 'Final packaging and labeling',
        status: StepStatus.PENDING,
        notes: 'Waiting for quality control approval',
        orderId: productionOrders[0].id
      }
    })
  ])

  console.log(`✅ Created ${productionSteps.length} production steps`)

  // Create Expenses (Algerian Dinar amounts)
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        reference: 'EXP-2024-001',
        description: 'Raw Materials Purchase - Cotton Fabric',
        amount: 3750000,
        category: ExpenseCategory.RAW_MATERIALS,
        subcategory: 'Fabric Purchase',
        date: new Date('2024-01-10'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: ExpenseStatus.PAID,
        invoiceNumber: 'INV-AT-001',
        tags: ['cotton', 'fabric', 'bulk'],
        department: 'Procurement',
        supplierId: suppliers[0].id
      }
    }),
    prisma.expense.create({
      data: {
        reference: 'EXP-2024-002',
        description: 'Monthly Salaries - January',
        amount: 8500000,
        category: ExpenseCategory.SALARIES,
        subcategory: 'Monthly Payroll',
        date: new Date('2024-01-31'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: ExpenseStatus.PAID,
        tags: ['salaries', 'payroll', 'monthly'],
        department: 'HR',
        workerId: workers[0].id
      }
    }),
    prisma.expense.create({
      data: {
        reference: 'EXP-2024-003',
        description: 'Electricity Bill - Factory',
        amount: 450000,
        category: ExpenseCategory.UTILITIES,
        subcategory: 'Electricity',
        date: new Date('2024-01-25'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: ExpenseStatus.PAID,
        tags: ['electricity', 'utilities', 'factory'],
        department: 'Operations'
      }
    }),
    prisma.expense.create({
      data: {
        reference: 'EXP-2024-004',
        description: 'Machine Maintenance',
        amount: 650000,
        category: ExpenseCategory.MAINTENANCE,
        subcategory: 'Preventive Maintenance',
        date: new Date('2024-01-15'),
        paymentMethod: PaymentMethod.CASH,
        status: ExpenseStatus.PAID,
        tags: ['maintenance', 'machines', 'repairs'],
        department: 'Maintenance',
        workerId: workers[2].id
      }
    }),
    prisma.expense.create({
      data: {
        reference: 'EXP-2024-005',
        description: 'Fuel and Transportation',
        amount: 280000,
        category: ExpenseCategory.TRANSPORT,
        subcategory: 'Fuel Costs',
        date: new Date('2024-01-20'),
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: ExpenseStatus.PAID,
        tags: ['fuel', 'transport', 'delivery'],
        department: 'Logistics'
      }
    }),
    prisma.expense.create({
      data: {
        reference: 'EXP-2024-006',
        description: 'Office Supplies',
        amount: 125000,
        category: ExpenseCategory.OTHER,
        subcategory: 'Office',
        date: new Date('2024-01-05'),
        paymentMethod: PaymentMethod.CASH,
        status: ExpenseStatus.PAID,
        tags: ['office', 'supplies', 'administrative'],
        department: 'Administration'
      }
    })
  ])

  console.log(`✅ Created ${expenses.length} expenses`)

  // Create Incomes (Algerian Dinar amounts)
  const incomes = await Promise.all([
    prisma.income.create({
      data: {
        reference: 'INC-2024-001',
        description: 'Winter Jackets Order Payment',
        amount: 7500000,
        category: IncomeCategory.PRODUCT_SALES,
        subcategory: 'Bulk Order',
        date: new Date('2024-01-15'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: IncomeStatus.RECEIVED,
        invoiceNumber: 'INV-CUST-001',
        tags: ['jackets', 'winter', 'bulk'],
        department: 'Sales',
        orderId: productionOrders[0].id
      }
    }),
    prisma.income.create({
      data: {
        reference: 'INC-2024-002',
        description: 'School Uniforms Final Payment',
        amount: 11000000,
        category: IncomeCategory.PRODUCT_SALES,
        subcategory: 'Government Contract',
        date: new Date('2024-01-20'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: IncomeStatus.RECEIVED,
        invoiceNumber: 'INV-CUST-002',
        tags: ['uniforms', 'school', 'government'],
        department: 'Sales',
        orderId: productionOrders[2].id
      }
    }),
    prisma.income.create({
      data: {
        reference: 'INC-2024-003',
        description: 'Consulting Services - Process Optimization',
        amount: 2500000,
        category: IncomeCategory.SERVICES,
        subcategory: 'Consulting',
        date: new Date('2024-01-10'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: IncomeStatus.RECEIVED,
        tags: ['consulting', 'services', 'optimization'],
        department: 'Management'
      }
    }),
    prisma.income.create({
      data: {
        reference: 'INC-2024-004',
        description: 'Investment Returns - Equipment Lease',
        amount: 850000,
        category: IncomeCategory.INVESTMENTS,
        subcategory: 'Equipment Lease',
        date: new Date('2024-01-25'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: IncomeStatus.RECEIVED,
        tags: ['investment', 'lease', 'equipment'],
        department: 'Finance'
      }
    }),
    prisma.income.create({
      data: {
        reference: 'INC-2024-005',
        description: 'Sample Orders - Various Clients',
        amount: 450000,
        category: IncomeCategory.PRODUCT_SALES,
        subcategory: 'Samples',
        date: new Date('2024-01-08'),
        paymentMethod: PaymentMethod.CASH,
        status: IncomeStatus.RECEIVED,
        tags: ['samples', 'clients', 'testing'],
        department: 'Sales'
      }
    })
  ])

  console.log(`✅ Created ${incomes.length} incomes`)

  console.log('🎉 Database seeding completed successfully!')
  console.log(`
📊 Summary:
- Suppliers: ${suppliers.length}
- Workers: ${workers.length}
- Raw Materials: ${rawMaterials.length}
- Production Orders: ${productionOrders.length}
- Production Steps: ${productionSteps.length}
- Expenses: ${expenses.length} (${expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()} DZD)
- Incomes: ${incomes.length} (${incomes.reduce((sum, inc) => sum + inc.amount, 0).toLocaleString()} DZD)
- Net Profit: ${(incomes.reduce((sum, inc) => sum + inc.amount, 0) - expenses.reduce((sum, exp) => sum + exp.amount, 0)).toLocaleString()} DZD
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
