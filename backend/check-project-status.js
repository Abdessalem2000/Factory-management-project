const https = require('https');
require('dotenv').config();

async function checkProjectStatus() {
  console.log('🔍 Vérification du statut du projet Supabase...\n');
  
  const projectId = 'cejduleutqjmtlsmzbrg';
  
  try {
    // Test 1: Check project via REST API
    console.log('1️⃣ Test d\'accès au projet...');
    const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY || 'test',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Projet accessible');
    } else if (response.status === 401) {
      console.log('   ⚠️  Projet accessible mais clés API manquantes');
    } else if (response.status === 404) {
      console.log('   ❌ Projet non trouvé');
    } else {
      console.log('   ❌ Erreur inconnue');
    }
    
    // Test 2: Check with proper headers
    console.log('\n2️⃣ Test avec en-têtes complets...');
    const response2 = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY || 'test',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'test'}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ test: 'connection' })
    });
    
    console.log(`   Status: ${response2.status}`);
    
    if (response2.ok) {
      console.log('   ✅ Base de données accessible');
    } else {
      console.log('   ❌ Base de données non accessible');
    }
    
  } catch (error) {
    console.error('❌ Erreur de vérification:', error.message);
  }
  
  console.log('\n📊 Résumé du statut:');
  console.log('🔗 Projet ID:', projectId);
  console.log('🌐 URL:', `https://${projectId}.supabase.co`);
  console.log('🗄️  Database URL:', process.env.DATABASE_URL ? '✅ Configurée' : '❌ Manquante');
  console.log('🔑 ANON Key:', process.env.SUPABASE_ANON_KEY ? '✅ Configurée' : '❌ Manquante');
  console.log('🔑 Service Key:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurée' : '❌ Manquante');
  
  console.log('\n🎯 Actions recommandées:');
  console.log('1. Vérifiez le dashboard Supabase');
  console.log('2. Confirmez que le projet est "Active"');
  console.log('3. Copiez les clés API depuis Settings → API');
  console.log('4. Mettez à jour le fichier .env');
  
  console.log('\n📋 Variables manquantes dans .env:');
  if (!process.env.SUPABASE_ANON_KEY) {
    console.log('   ❌ SUPABASE_ANON_KEY');
  }
  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.log('   ❌ SUPABASE_SERVICE_KEY');
  }
}

checkProjectStatus();
