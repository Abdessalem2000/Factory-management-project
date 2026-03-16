import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import { formatCurrency } from '@/lib/utils'
import { analyticsApi } from '@/lib/api'
import { SimpleBarChart, SimpleLineChart, SimplePieChart } from '@/components/ui/Chart'
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

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const response = await analyticsApi.getDashboard()
      return response?.data?.data || response?.data || {}
    }
  })

  // Fetch worker analytics
  const { data: workerAnalytics, isLoading: workersLoading, error: workersError } = useQuery({
    queryKey: ['analytics-workers'],
    queryFn: async () => {
      const response = await analyticsApi.getWorkerAnalytics()
      console.log('🔍 Worker Analytics Response:', response)
      console.log('📊 Department Breakdown:', response?.data?.data?.departmentBreakdown)
      return response?.data?.data || response?.data || {}
    }
  })

  // Extract data from API responses
  const overview = dashboardData?.overview || {}
  const monthlyTrend = dashboardData?.monthlyTrend || []
  const departmentBreakdown = workerAnalytics?.departmentBreakdown || {}
  const topWorkers = workerAnalytics?.topPerformers || []

  if (dashboardLoading || workersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (dashboardError || workersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">Error loading analytics data</p>
          <p className="text-gray-500 text-sm mt-1">Please check your connection and try again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500">Detailed insights into your factory operations</p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ERPCard className="hover:shadow-md transition-shadow">
          <ERPCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{overview.totalWorkers || 0}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard className="hover:shadow-md transition-shadow">
          <ERPCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(overview.totalRevenue || 0, 'DZD')}</p>
                <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard className="hover:shadow-md transition-shadow">
          <ERPCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(overview.totalExpenses || 0, 'DZD')}</p>
                <p className="text-xs text-red-600 mt-1">+3.1% from last month</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard className="hover:shadow-md transition-shadow">
          <ERPCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency((overview.totalRevenue || 0) - (overview.totalExpenses || 0), 'DZD')}</p>
                <p className="text-xs text-green-600 mt-1">{overview.profitMargin || 0}% margin</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ERPCard>
          <ERPCardHeader>
            <ERPCardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Monthly Financial Trend
            </ERPCardTitle>
          </ERPCardHeader>
          <ERPCardContent>
            <SimpleLineChart data={monthlyTrend.slice(-6)} />
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardHeader>
            <ERPCardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" />
              Department Breakdown
            </ERPCardTitle>
          </ERPCardHeader>
          <ERPCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {Object.entries(departmentBreakdown).map(([department, data]: [string, any], index) => (
                  <div key={department} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 capitalize">{department.replace('-', ' ')}</span>
                      <span className="text-sm font-bold text-indigo-600">{data.count || 0} workers</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(((data.count || 0) / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <SimplePieChart 
                data={Object.entries(departmentBreakdown).map(([department, data]: [string, any]) => ({
                  label: department.replace('-', ' '),
                  value: data.count || 0,
                  color: `bg-gradient-to-r from-indigo-${400 + Math.floor(Math.random() * 200)} to-indigo-${600 + Math.floor(Math.random() * 200)}`
                }))}
                size={150}
              />
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* Top Performers */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Top Performers
          </ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="space-y-4">
            {topWorkers.map((worker: any, index: number) => (
              <div key={worker._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 ring-2 ring-yellow-300' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 ring-2 ring-gray-300' : 
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 ring-2 ring-orange-300' : 
                    'bg-gradient-to-br from-indigo-400 to-indigo-600 ring-2 ring-indigo-400'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {worker.firstName} {worker.lastName}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{worker.position}</div>
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
                </div>
              </div>
            ))}
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Performance Metrics */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Performance Metrics
          </ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <SimpleBarChart 
            data={[
              { label: 'Production Efficiency', value: 85, color: 'bg-gradient-to-r from-green-400 to-green-600' },
              { label: 'Quality Score', value: 92, color: 'bg-gradient-to-r from-indigo-400 to-indigo-600' },
              { label: 'On-time Delivery', value: 78, color: 'bg-gradient-to-r from-indigo-400 to-indigo-600' },
              { label: 'Cost Efficiency', value: 88, color: 'bg-gradient-to-r from-orange-400 to-orange-600' },
              { label: 'Safety Score', value: 95, color: 'bg-gradient-to-r from-red-400 to-red-600' }
            ]}
            height={250}
          />
        </ERPCardContent>
      </ERPCard>
    </div>
  )
}
