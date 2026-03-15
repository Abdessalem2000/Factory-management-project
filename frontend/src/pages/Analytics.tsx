import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { formatCurrency } from '@/lib/utils'
import { analyticsApi } from '@/lib/api'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

export function Analytics() {
  const [timeRange, setTimeRange] = useState('6months')
  const [debugInfo, setDebugInfo] = useState({})

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['analytics-dashboard', timeRange],
    queryFn: async () => {
      console.log('🔍 Fetching analytics data...')
      console.log('🌐 API URL:', import.meta.env.VITE_API_URL)
      console.log('🌐 All env vars:', import.meta.env)
      
      setDebugInfo({
        apiUrl: import.meta.env.VITE_API_URL,
        nodeEnv: import.meta.env.VITE_NODE_ENV || 'production', // Default to production
        allEnv: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
      })
      
      try {
        const response = await analyticsApi.getDashboard()
        console.log('✅ Analytics response:', response)
        return response
      } catch (error) {
        console.error('❌ Analytics error:', error)
        throw error
      }
    }
  })

  const { data: workerAnalytics } = useQuery({
    queryKey: ['analytics-workers'],
    queryFn: async () => {
      console.log('🔍 Fetching worker analytics...')
      
      try {
        const response = await analyticsApi.getWorkerAnalytics()
        console.log('✅ Worker analytics response:', response)
        console.log('🔍 Response type:', typeof response)
        console.log('🔍 Response keys:', Object.keys(response || {}))
        console.log('🔍 Response.data:', response?.data)
        console.log('🔍 Response.data type:', typeof response?.data)
        
        return response
      } catch (error) {
        console.error('❌ Worker analytics error:', error)
        throw error
      }
    }
  })

  if (isLoading) return <div className="p-8">Loading analytics...</div>

  const overview = dashboardData?.data?.overview || {}
  const monthlyTrend = dashboardData?.data?.monthlyTrend || []
  const departmentBreakdown = dashboardData?.data?.departmentBreakdown || {}
  const topWorkers = dashboardData?.data?.topWorkers || []

  console.log('📊 Processed data:', { overview, monthlyTrend, departmentBreakdown, topWorkers })

  return (
    <div className="space-y-6 p-6">
      {/* DEBUG INFO */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-bold mb-2">DEBUG INFO</h3>
        <div className="text-sm text-red-700">
          <p><strong>API URL:</strong> {debugInfo.apiUrl || 'NOT SET'}</p>
          <p><strong>Node Env:</strong> {debugInfo.nodeEnv || 'NOT SET'}</p>
          <p><strong>All VITE_ vars:</strong> {JSON.stringify(debugInfo.allEnv)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights for your factory</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="6months">Last 6 Months</option>
          <option value="3months">Last 3 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalWorkers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {overview.activeWorkers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.totalRevenue || 0, 'DZD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.totalWorkers || 0} workers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.totalExpenses || 0, 'DZD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((overview.totalRevenue || 0) - (overview.totalExpenses || 0), 'DZD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.profitMargin || 0}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Financial Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {monthlyTrend.slice(-6).map((month: any, index: number) => (
                <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-800">{month.month}</span>
                    <span className={`text-lg font-bold ${
                      month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(month.profit, 'DZD')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <span>💰 Income</span>
                        <span className="text-green-600 font-bold">
                          +{formatCurrency(month.income, 'DZD')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min((month.income / 25000000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <span>💸 Expenses</span>
                        <span className="text-red-600 font-bold">
                          -{formatCurrency(month.expenses, 'DZD')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min((month.expenses / 25000000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Department Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(departmentBreakdown).map(([dept, count]: [string, any]) => {
                const percentage = overview.totalWorkers ? (count / overview.totalWorkers) * 100 : 0;
                return (
                  <div key={dept} className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-800">{dept}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">{count}</span>
                        <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700 shadow-sm" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Top Performers (Highest Hourly Rates)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topWorkers.map((worker: any, index: number) => (
              <div key={worker._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 ring-2 ring-yellow-300' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 ring-2 ring-gray-300' : 
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 ring-2 ring-orange-300' : 
                    'bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-blue-300'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {worker.firstName} {worker.lastName}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">{worker.position}</div>
                    <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full inline-block mt-1">
                      {worker.department}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-green-600">
                    {formatCurrency(worker.hourlyRate, 'DZD')}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">per hour</div>
                  <div className="text-xs text-gray-600 bg-green-100 px-2 py-1 rounded-full mt-1">
                    {worker.paymentType?.replace('_', ' ') || 'hourly'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Worker Analytics */}
      {workerAnalytics?.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(workerAnalytics.data.skillsAnalysis || {})
                  .sort(([,a]: [string, any], [,b]: [string, any]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([skill, count]: [string, any], index: number) => (
                    <div key={skill} className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                          index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                          index === 1 ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' :
                          index === 2 ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                          'bg-gradient-to-br from-gray-500 to-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{skill}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">{count}</span>
                        <span className="text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                          workers
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(workerAnalytics.data.paymentTypes || {}).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-md">
                        {type === 'hourly' ? '⏱️' : type === 'salary' ? '💰' : '📋'}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">{count}</span>
                      <span className="text-xs text-gray-600 bg-green-100 px-2 py-1 rounded-full">
                        workers
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
