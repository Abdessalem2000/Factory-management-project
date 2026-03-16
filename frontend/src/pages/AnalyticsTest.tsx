import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function AnalyticsTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="fixed inset-0 opacity-20">
        <div className="w-full h-full bg-pattern"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
            Analytics Test
          </h1>
          <p className="text-gray-300 text-lg">Testing Analytics Component</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Test Component</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white">If you can see this, the component is working correctly.</p>
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
              <p className="text-green-400">✅ Analytics component is rendering properly</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
