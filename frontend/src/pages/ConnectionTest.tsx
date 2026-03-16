import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { analyticsApi } from '@/lib/api'

export function ConnectionTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      console.log('🔍 Testing API connection...')
      
      // Test 1: Basic API test
      const testResponse = await fetch('http://localhost:10003/api/test')
      const testData = await testResponse.json()
      console.log('✅ API Test Result:', testData)

      // Test 2: Analytics endpoint
      const analyticsResponse = await analyticsApi.getDashboard()
      console.log('✅ Analytics Result:', analyticsResponse)

      setTestResults({
        apiTest: testData,
        analyticsData: analyticsResponse.data,
        status: 'success'
      })
    } catch (error) {
      console.error('❌ Connection Test Error:', error)
      setTestResults({
        error: error.message,
        status: 'error'
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">API Connection Test</h1>
          <p className="text-gray-300">Test frontend-backend connection</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>

            {testResults && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  testResults.status === 'success' 
                    ? 'bg-green-500/20 border border-green-500' 
                    : 'bg-red-500/20 border border-red-500'
                }`}>
                  <h3 className={`font-bold mb-2 ${
                    testResults.status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Status: {testResults.status.toUpperCase()}
                  </h3>
                  
                  {testResults.status === 'success' ? (
                    <div className="space-y-2 text-white">
                      <div>✅ API Test: {JSON.stringify(testResults.apiTest?.message)}</div>
                      <div>✅ Analytics Data: {testResults.analyticsData ? 'Received' : 'Not received'}</div>
                      <div>✅ Connection Working!</div>
                    </div>
                  ) : (
                    <div className="text-red-400">
                      <div>❌ Error: {testResults.error}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-gray-300 text-sm">
              <div>API URL: http://localhost:10003/api</div>
              <div>Frontend URL: {window.location.origin}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
