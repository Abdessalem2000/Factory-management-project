const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkTables() {
  console.log('🔍 Vérification des tables Supabase...\n');
  
  try {
    // Test 1: Try to connect
    console.log('1️⃣ Test de connexion...');
    await prisma.$connect();
    console.log('✅ Connexion réussie!');
    console.log('');

    // Test 2: Check if tables exist by trying to query them
    console.log('2️⃣ Vérification des tables...');
    
    const tables = [
      { name: 'workers', model: 'worker' },
      { name: 'suppliers', model: 'supplier' },
      { name: 'raw_materials', model: 'rawMaterial' },
      { name: 'production_orders', model: 'productionOrder' },
      { name: 'expenses', model: 'expense' },
      { name: 'incomes', model: 'income' }
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table.model].count();
        console.log(`✅ ${table.name}: ${count} enregistrements`);
      } catch (error) {
        if (error.message.includes('Unknown table')) {
          console.log(`❌ ${table.name}: Table non trouvée`);
        } else {
          console.log(`⚠️  ${table.name}: Erreur - ${error.message}`);
        }
      }
    }
    
    console.log('');
    
    // Test 3: Try to create a test worker
    console.log('3️⃣ Test de création d\'un worker...');
    try {
      const testWorker = await prisma.worker.create({
        data: {
          employeeId: 'TEST001',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@factory.dz',
          position: 'Test Position',
          department: 'Test Department',
          hourlyRate: 1000,
          currency: 'DZD',
          paymentType: 'HOURLY'
        }
      });
      console.log('✅ Worker de test créé:', testWorker.firstName, testWorker.lastName);
      
      // Clean up test worker
      await prisma.worker.delete({
        where: { id: testWorker.id }
      });
      console.log('✅ Worker de test supprimé');
      
    } catch (error) {
      console.log('❌ Erreur création worker:', error.message);
    }
    
    console.log('');
    console.log('🎉 Vérification terminée!');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n💡 Solutions possibles:');
      console.log('   1. Attendre encore 1-2 minutes');
      console.log('   2. Vérifier le dashboard Supabase');
      console.log('   3. Redémarrer le projet');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
