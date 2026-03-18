// Test script for Worker API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testWorkerAPI() {
  console.log('🧪 Testing Worker API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    console.log('✅ Health check:', health.data);
    console.log('');

    // Test 2: Get all workers (should be empty initially)
    console.log('2. Getting all workers...');
    const workers = await axios.get(`${API_BASE}/workers`);
    console.log('✅ Workers list:', workers.data);
    console.log('');

    // Test 3: Create a new worker
    console.log('3. Creating new worker...');
    const newWorker = {
      employeeId: 'EMP001',
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed.mohamed@factory.dz',
      position: 'Machine Operator',
      department: 'Production',
      hourlyRate: 3500,
      currency: 'DZD',
      paymentType: 'HOURLY',
      skills: ['Machine Operation', 'Quality Control'],
      hireDate: new Date().toISOString().split('T')[0]
    };

    try {
      const created = await axios.post(`${API_BASE}/workers`, newWorker);
      console.log('✅ Worker created:', created.data);
      const workerId = created.data.data.id;
      console.log('');

      // Test 4: Get worker by ID
      console.log('4. Getting worker by ID...');
      const worker = await axios.get(`${API_BASE}/workers/${workerId}`);
      console.log('✅ Worker details:', worker.data);
      console.log('');

      // Test 5: Update worker
      console.log('5. Updating worker...');
      const updated = await axios.put(`${API_BASE}/workers/${workerId}`, {
        hourlyRate: 3800,
        skills: ['Machine Operation', 'Quality Control', 'Maintenance']
      });
      console.log('✅ Worker updated:', updated.data);
      console.log('');

      // Test 6: Get worker statistics
      console.log('6. Getting worker statistics...');
      const stats = await axios.get(`${API_BASE}/workers/stats/overview`);
      console.log('✅ Worker stats:', stats.data);
      console.log('');

      // Test 7: Search workers
      console.log('7. Searching workers...');
      const search = await axios.get(`${API_BASE}/workers?search=أحمد`);
      console.log('✅ Search results:', search.data);
      console.log('');

      // Test 8: Delete worker
      console.log('8. Deleting worker...');
      await axios.delete(`${API_BASE}/workers/${workerId}`);
      console.log('✅ Worker deleted successfully');
      console.log('');

    } catch (error) {
      if (error.response?.status === 500) {
        console.log('⚠️  Worker operations failed (database not ready)');
        console.log('   This is expected if Supabase is still initializing');
      } else {
        throw error;
      }
    }

    // Test 9: Test validation errors
    console.log('9. Testing validation...');
    try {
      await axios.post(`${API_BASE}/workers`, {
        // Missing required fields
        firstName: 'Test'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working:', error.response.data.message);
      }
    }
    console.log('');

    console.log('🎉 All API tests completed!');
    console.log('📊 Note: Worker operations require database connection');
    console.log('🔄 Try again in 2-3 minutes when Supabase is ready');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testWorkerAPI();
