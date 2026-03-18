const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testMockAPI() {
  console.log('🧪 Testing Mock API with Algerian Data...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    console.log('✅ Health check:', health.data);
    console.log('');

    // Test 2: Database status
    console.log('2. Testing database status...');
    const dbStatus = await axios.get(`${API_BASE}/db-status`);
    console.log('✅ Database status:', dbStatus.data);
    console.log('');

    // Test 3: Get all workers
    console.log('3. Getting all workers...');
    const workers = await axios.get(`${API_BASE}/workers`);
    console.log('✅ Workers list:', workers.data.data.length, 'employees');
    workers.data.data.forEach(worker => {
      console.log(`   👤 ${worker.firstName} ${worker.lastName} - ${worker.position} (${worker.hourlyRate} ${worker.currency}/hour)`);
    });
    console.log('');

    // Test 4: Create new worker
    console.log('4. Creating new worker...');
    const newWorker = {
      employeeId: 'EMP004',
      firstName: 'سارة',
      lastName: 'العربي',
      email: 'sara.arabi@factory.dz',
      position: 'Production Manager',
      department: 'Management',
      hourlyRate: 5500,
      currency: 'DZD',
      paymentType: 'SALARY',
      skills: ['Team Leadership', 'Production Planning'],
      hireDate: new Date().toISOString().split('T')[0]
    };

    const created = await axios.post(`${API_BASE}/workers`, newWorker);
    console.log('✅ Worker created:', created.data.data.firstName, created.data.data.lastName);
    console.log('   📧 Email:', created.data.data.email);
    console.log('   💼 Position:', created.data.data.position);
    console.log('   💰 Salary:', created.data.data.hourlyRate, created.data.data.currency);
    console.log('');

    // Test 5: Search workers
    console.log('5. Searching workers...');
    const search = await axios.get(`${API_BASE}/workers?search=سارة`);
    console.log('✅ Search results for "سارة":', search.data.data.length, 'found');
    search.data.data.forEach(worker => {
      console.log(`   🔍 ${worker.firstName} ${worker.lastName}`);
    });
    console.log('');

    // Test 6: Get worker statistics
    console.log('6. Getting worker statistics...');
    const stats = await axios.get(`${API_BASE}/workers/stats/overview`);
    console.log('✅ Worker statistics:');
    console.log(`   👥 Total workers: ${stats.data.data.total}`);
    console.log(`   ✅ Active workers: ${stats.data.data.active}`);
    console.log(`   💰 Average hourly rate: ${stats.data.data.averageHourlyRate} DZD`);
    console.log('   🏭 Departments:');
    stats.data.data.departments.forEach(dept => {
      console.log(`      - ${dept.name}: ${dept.count} workers`);
    });
    console.log('');

    // Test 7: Update worker
    console.log('7. Updating worker...');
    const updated = await axios.put(`${API_BASE}/workers/${created.data.data.id}`, {
      hourlyRate: 5800,
      skills: ['Team Leadership', 'Production Planning', 'Resource Management']
    });
    console.log('✅ Worker updated:', updated.data.data.firstName);
    console.log('   💰 New salary:', updated.data.data.hourlyRate, updated.data.data.currency);
    console.log('');

    console.log('🎉 All Mock API tests completed successfully!');
    console.log('📊 Your frontend can now test with real Algerian data!');
    console.log('🌐 Frontend URL: http://localhost:5174');
    console.log('👥 API URL: http://localhost:3000/api/workers');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testMockAPI();
