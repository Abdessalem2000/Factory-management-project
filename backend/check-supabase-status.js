const https = require('https');
require('dotenv').config();

async function checkSupabaseStatus() {
  console.log('🔍 Checking Supabase project status...\n');
  
  const supabaseUrl = 'https://cejduleutqjmtlsmzbrg.supabase.co';
  const dbHost = 'db.cejduleutqjmtlsmzbrg.supabase.co';
  const dbPort = 5432;
  
  try {
    // Test 1: Check if Supabase project is accessible
    console.log('1️⃣ Testing Supabase project accessibility...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY || 'test'
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase project is accessible');
    } else {
      console.log('❌ Supabase project not accessible');
      console.log('   Status:', response.status);
    }
    console.log('');

    // Test 2: Check database connection
    console.log('2️⃣ Testing database connection...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful!');
      
      // Test 3: Check if tables exist
      console.log('3️⃣ Checking if tables exist...');
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      if (tables.length > 0) {
        console.log('✅ Tables found:', tables.length);
        tables.forEach(table => {
          console.log(`   📋 ${table.table_name}`);
        });
      } else {
        console.log('❌ No tables found - need to run prisma db push');
      }
      console.log('');
      
      // Test 4: Check if data exists
      console.log('4️⃣ Checking if data exists...');
      const workerCount = await prisma.worker.count();
      
      if (workerCount > 0) {
        console.log('✅ Data found:', workerCount, 'workers');
        console.log('🎉 Supabase is fully ready!');
      } else {
        console.log('❌ No data found - need to run prisma db seed');
      }
      
    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.message);
      
      if (dbError.message.includes('Can\'t reach database server')) {
        console.log('\n💡 Possible solutions:');
        console.log('   1. Wait 2-3 more minutes for Supabase initialization');
        console.log('   2. Check if project is active in Supabase dashboard');
        console.log('   3. Verify DATABASE_URL is correct');
        console.log('   4. Check if project was created successfully');
      }
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }
  
  console.log('\n📊 Current Status Summary:');
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🗄️  Database URL:', `postgresql://postgres:***@${dbHost}:${dbPort}/postgres`);
  console.log('🔑 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configured' : '❌ Not configured');
  console.log('📱 API Status:', 'http://localhost:3000/api/db-status');
  console.log('🌐 Frontend:', 'http://localhost:5174');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. If database not ready: Wait 2-3 minutes');
  console.log('2. If tables missing: Run npx prisma db push');
  console.log('3. If data missing: Run npx prisma db seed');
  console.log('4. Test with frontend: http://localhost:5174');
}

checkSupabaseStatus();
