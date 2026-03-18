const axios = require('axios');

async function testApiResponse() {
  try {
    console.log('🔍 Testing API response format...\n');
    
    const response = await axios.get('http://localhost:3000/api/workers');
    
    console.log('1️⃣ Full response object:');
    console.log('   - Status:', response.status);
    console.log('   - Status text:', response.statusText);
    console.log('   - Headers:', response.headers['content-type']);
    console.log('   - Data type:', typeof response.data);
    
    console.log('\n2️⃣ Response data structure:');
    console.log('   - Has data property:', 'data' in response.data);
    console.log('   - Data is array:', Array.isArray(response.data?.data));
    console.log('   - Workers count:', response.data?.data?.length || 0);
    
    console.log('\n3️⃣ First worker structure:');
    if (response.data?.data && response.data.data.length > 0) {
      const worker = response.data.data[0];
      console.log('   - ID:', worker.id);
      console.log('   - Employee ID:', worker.employeeId);
      console.log('   - Name:', `${worker.firstName} ${worker.lastName}`);
      console.log('   - Position:', worker.position);
      console.log('   - Hourly Rate:', worker.hourlyRate);
      console.log('   - Skills type:', typeof worker.skills);
      console.log('   - Skills is array:', Array.isArray(worker.skills));
      
      if (worker.skills) {
        console.log('   - Skills:', worker.skills);
        console.log('   - Skills length:', worker.skills.length);
      }
    }
    
    console.log('\n4️⃣ Frontend expectation:');
    console.log('   - workersData?.data should be an array');
    console.log('   - Each worker should have: id, firstName, lastName, etc.');
    
    console.log('\n5️⃣ Potential issues:');
    if (!response.data?.data) {
      console.log('   ❌ Missing .data property');
    }
    if (!Array.isArray(response.data?.data)) {
      console.log('   ❌ .data is not an array');
    }
    if (response.data?.data && response.data.data.length > 0) {
      const firstWorker = response.data.data[0];
      if (!firstWorker.skills || !Array.isArray(firstWorker.skills)) {
        console.log('   ❌ Worker skills is not an array');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testApiResponse();
