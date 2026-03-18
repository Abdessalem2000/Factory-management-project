const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // Step 1: Test connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Step 2: Push schema
    console.log('2️⃣ Creating tables with Prisma...');
    try {
      execSync('npx prisma db push', { stdio: 'inherit', cwd: process.cwd() });
      console.log('✅ Tables created successfully!\n');
    } catch (error) {
      console.log('❌ Failed to create tables:', error.message);
      return;
    }

    // Step 3: Check if tables exist
    console.log('3️⃣ Verifying tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Created tables:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.table_name}`);
    });
    console.log('');

    // Step 4: Seed data
    console.log('4️⃣ Inserting Algerian data...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit', cwd: process.cwd() });
      console.log('✅ Algerian data inserted successfully!\n');
    } catch (error) {
      console.log('❌ Failed to seed data:', error.message);
      return;
    }

    // Step 5: Verify data
    console.log('5️⃣ Verifying data...');
    const [workerCount, supplierCount, materialCount] = await Promise.all([
      prisma.worker.count(),
      prisma.supplier.count(),
      prisma.rawMaterial.count()
    ]);

    console.log('📈 Data verification:');
    console.log(`   👥 Workers: ${workerCount}`);
    console.log(`   🏭 Suppliers: ${supplierCount}`);
    console.log(`   📦 Raw Materials: ${materialCount}`);
    console.log('');

    // Step 6: Show sample data
    console.log('6️⃣ Sample worker data:');
    const workers = await prisma.worker.findMany({
      take: 3,
      select: {
        employeeId: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        hourlyRate: true,
        currency: true
      }
    });

    workers.forEach(worker => {
      console.log(`   👤 ${worker.firstName} ${worker.lastName} - ${worker.position} (${worker.hourlyRate} ${worker.currency}/hour)`);
    });
    console.log('');

    console.log('🎉 Database setup completed successfully!');
    console.log('🌐 Your ERP is now ready with Algerian data!');
    console.log('🔗 Test the API: http://localhost:3000/api/workers');
    console.log('📊 View data: https://cejduleutqjmtlsmzbrg.supabase.co');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Wait 2-3 more minutes for Supabase initialization');
      console.log('   2. Check if Supabase project is active in dashboard');
      console.log('   3. Verify DATABASE_URL is correct');
      console.log('   4. Try running this script again in a few minutes');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
setupDatabase();
