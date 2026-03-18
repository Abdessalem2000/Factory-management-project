import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workerApi } from '@/lib/api'

export function WorkerTest() {
  const [testData, setTestData] = useState(null)

  const { data: workersData, isLoading, error } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      console.log('🔍 Fetching workers...')
      try {
        const response = await workerApi.getWorkers()
        console.log('✅ API Response:', response)
        console.log('📊 Response data:', response.data)
        console.log('📋 Data type:', typeof response.data)
        console.log('📋 Is array:', Array.isArray(response.data))
        return response.data
      } catch (error) {
        console.error('❌ API Error:', error)
        throw error
      }
    },
  })

  const workers = Array.isArray(workersData) ? workersData : []

  const testAddWorker = async () => {
    console.log('🧪 Testing add worker...')
    try {
      const newWorker = {
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
      }

      console.log('📝 Sending data:', newWorker)
      const response = await workerApi.createWorker(newWorker)
      console.log('✅ Worker created:', response)
      setTestData(response)
    } catch (error) {
      console.error('❌ Create error:', error)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Worker API Test</h1>
      
      {/* API Status */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">API Status</h2>
        {isLoading && <p>⏳ Loading...</p>}
        {error && <p className="text-red-600">❌ Error: {error.message}</p>}
        {!isLoading && !error && <p className="text-green-600">✅ Connected</p>}
      </div>

      {/* Workers List */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Workers ({workers.length})</h2>
        {workers.length === 0 ? (
          <p>No workers found</p>
        ) : (
          <div className="space-y-2">
            {workers.map((worker, index) => (
              <div key={worker.id || index} className="border p-3 rounded">
                <h3 className="font-semibold">
                  {worker.firstName} {worker.lastName}
                </h3>
                <p>🏢 Position: {worker.position}</p>
                <p>💰 Rate: {worker.hourlyRate} {worker.currency}</p>
                <p>🆔 ID: {worker.employeeId}</p>
                <p>📧 Skills: {Array.isArray(worker.skills) ? worker.skills.join(', ') : 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Add Worker */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Test Add Worker</h2>
        <button
          onClick={testAddWorker}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Test Worker
        </button>
        
        {testData && (
          <div className="mt-4 p-3 bg-green-100 rounded">
            <h3 className="font-semibold text-green-800">✅ Worker Created!</h3>
            <pre className="text-sm">{JSON.stringify(testData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <p><strong>workersData type:</strong> {typeof workersData}</p>
        <p><strong>workers type:</strong> {typeof workers}</p>
        <p><strong>workers is array:</strong> {Array.isArray(workers) ? 'Yes' : 'No'}</p>
        <p><strong>workers length:</strong> {workers.length}</p>
      </div>
    </div>
  )
}
