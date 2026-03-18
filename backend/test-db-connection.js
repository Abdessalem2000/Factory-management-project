const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📋 PostgreSQL version:', result[0].version);
    
    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 Existing tables:', tables.map(t => t.table_name));
    
    console.log('🎉 Database connection test PASSED!');
    
  } catch (error) {
    console.error('❌ Database connection FAILED:');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.log('💡 Possible solutions:');
      console.log('   1. Check if Supabase project is active');
      console.log('   2. Verify DATABASE_URL is correct');
      console.log('   3. Check network connectivity');
      console.log('   4. Wait 2-3 minutes after project creation');
    }
    
    if (error.code === 'P1002') {
      console.log('💡 Database not found - check project name');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
