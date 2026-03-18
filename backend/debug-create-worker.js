const axios = require('axios');

async function debugCreateWorker() {
  console.log('🔍 Debugging create worker request...\n');
  
  // Test 1: Check what the backend expects
  console.log('1️⃣ Testing backend validation...');
  try {
    const response = await axios.post('http://localhost:3000/api/workers', {
      employeeId: 'TEST001',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      position: 'Test Position',
      department: 'Production',
      hourlyRate: 1000,
      currency: 'DZD',
      paymentType: 'HOURLY',
      skills: ['Test Skill'],
      status: 'ACTIVE',
      hireDate: new Date().toISOString().split('T')[0]
    });
    
    console.log('✅ Worker created successfully:', response.data);
  } catch (error) {
    console.log('❌ Error details:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
    console.log('   Error data:', error.response?.data);
    console.log('   Request data:', error.config?.data);
  }
  
  // Test 2: Check what the frontend sends
  console.log('\n2️⃣ Frontend data format...');
  const frontendData = {
    employeeId: 'TEST002',
    firstName: 'سارة',
    lastName: 'العربي',
    position: 'Production Manager',
    department: 'Management',
    hourlyRate: 5500,
    currency: 'DZD',
    paymentType: 'HOURLY',
    skills: ['Team Leadership', 'Production Planning'],
    status: 'active',
    hireDate: new Date().toISOString().split('T')[0]
  };
  
  console.log('Frontend sends:', JSON.stringify(frontendData, null, 2));
  
  try {
    const response = await axios.post('http://localhost:3000/api/workers', frontendData);
    console.log('✅ Frontend data works:', response.data);
  } catch (error) {
    console.log('❌ Frontend data fails:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
    console.log('   Validation errors:', error.response?.data?.errors);
  }
  
  // Test 3: Check backend requirements
  console.log('\n3️⃣ Backend endpoint info...');
  try {
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('Backend health:', healthResponse.data);
  } catch (error) {
    console.log('Health check failed:', error.message);
  }
}

debugCreateWorker();
