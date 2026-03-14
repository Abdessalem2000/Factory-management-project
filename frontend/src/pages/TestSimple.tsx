import React, { useState, useEffect } from 'react'

export function TestSimple() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Testing direct API call...')
        
        // Direct fetch test
        const response = await fetch('https://factory-management-project.onrender.com/api/analytics/dashboard')
        const result = await response.json()
        
        console.log('✅ Direct fetch result:', result)
        setData(result)
        setLoading(false)
      } catch (err) {
        console.error('❌ Direct fetch error:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple API Test</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Simple API Test - ERROR</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700"><strong>Error:</strong> {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Simple API Test - SUCCESS!</h1>
      
      <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
        <p className="text-green-700"><strong>Status:</strong> API connection working!</p>
        <p className="text-green-700"><strong>Data received:</strong> {JSON.stringify(data?.success)}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <h3 className="font-bold mb-2">Sample Data:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="mt-4">
        <a href="/analytics" className="text-blue-600 underline">
          ← Back to Analytics
        </a>
      </div>
    </div>
  )
}
