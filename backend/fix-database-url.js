require('dotenv').config();

console.log('🔍 Vérification de la DATABASE_URL...\n');

const currentUrl = process.env.DATABASE_URL;
console.log('URL actuelle:', currentUrl);

// Extraire les informations de l'URL
const url = new URL(currentUrl);
console.log('\n📊 Analyse de l\'URL:');
console.log('Protocol:', url.protocol);
console.log('Username:', url.username);
console.log('Password:', url.password ? '***' : 'non configuré');
console.log('Hostname:', url.hostname);
console.log('Port:', url.port);
console.log('Database:', url.pathname.slice(1));

// URL Supabase typique
console.log('\n🎯 URL Supabase attendue:');
console.log('Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
console.log('Votre hostname devrait être: db.cejduleutqjmtlsmzbrg.supabase.co');

// Vérifier si le hostname est correct
if (url.hostname === 'db.cejduleutqjmtlsmzbrg.supabase.co') {
  console.log('✅ Hostname correct');
} else {
  console.log('❌ Hostname incorrect');
  console.log('💡 Essayez avec: db.cejduleutqjmtlsmzbrg.supabase.co');
}

// Suggestions
console.log('\n🔧 Suggestions:');
console.log('1. Vérifiez que le projet est "Active" dans le dashboard');
console.log('2. Essayez de vous reconnecter: npx supabase login');
console.log('3. Re-link le projet: npx supabase link --project-ref cejduleutqjmtlsmzbrg');
console.log('4. Vérifiez que le mot de passe est correct');

// Test de connexion simple
console.log('\n🧪 Test de connexion réseau...');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion réussie!');
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n💡 Solutions possibles:');
      console.log('   1. Le projet n\'est pas encore "Active"');
      console.log('   2. L\'hostname est incorrect');
      console.log('   3. Le mot de passe est incorrect');
      console.log('   4. Problème réseau/firewall');
    }
  }
}

testConnection();
