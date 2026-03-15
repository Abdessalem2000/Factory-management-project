import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['analytics-dashboard', timeRange],
    queryFn: async () => {
      const response = await analyticsApi.getDashboard()
      return response
    }
  })

  const { data: workerAnalytics } = useQuery({
    queryKey: ['analytics-workers'],
    queryFn: async () => {
      const response = await analyticsApi.getWorkerAnalytics()
      const workerData = response?.data?.data || response?.data || {}
      return workerData
    }
  })

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading analytics...</div>
    </div>
  )

  const overview = dashboardData?.data?.overview || {}
  const monthlyTrend = dashboardData?.data?.monthlyTrend || []
  const departmentBreakdown = dashboardData?.data?.departmentBreakdown || {}
  const topWorkers = dashboardData?.data?.topWorkers || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="fixed inset-0 opacity-20">
        <div className="w-full h-full bg-pattern"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Comprehensive insights for your factory</p>
        </div>
        
        <div className="mb-6 flex justify-center">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
          >
            <option value="6months">Last 6 Months</option>
            <option value="3months">Last 3 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Workers</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{workerAnalytics?.totalWorkers || 0}</div>
              <p className="text-xs text-gray-300">Active workers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(overview.totalRevenue || 0, 'DZD')}</div>
              <p className="text-xs text-gray-300">Total operations</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(overview.totalExpenses || 0, 'DZD')}</div>
              <p className="text-xs text-gray-300">Across all categories</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency((overview.totalRevenue || 0) - (overview.totalExpenses || 0), 'DZD')}</div>
              <p className="text-xs text-gray-300">{overview.profitMargin || 0}% margin</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Monthly Financial Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlyTrend.slice(-6).map((month: any, index: number) => (
                  <div key={index} className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-white">{month.month}</span>
                      <span className={`text-lg font-bold ${month.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(month.profit, 'DZD')}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-300">
                          <span>Income</span>
                          <span className="text-green-400 font-bold">+{formatCurrency(month.income, 'DZD')}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((month.income / 25000000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-300">
                          <span>Expenses</span>
                          <span className="text-red-400 font-bold">-{formatCurrency(month.expenses, 'DZD')}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
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

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PieChart className="h-5 w-5 text-purple-400" />
                Department Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(departmentBreakdown).map(([dept, count]: [string, any]) => {
                  const percentage = workerAnalytics?.totalWorkers ? (count / workerAnalytics.totalWorkers) * 100 : 0;
                  return (
                    <div key={dept} className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-white">{dept}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-400">{count}</span>
                          <span className="text-sm text-gray-300 bg-blue-400/20 px-2 py-1 rounded-full">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-4">
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

        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-purple-400" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topWorkers.map((worker: any, index: number) => (
                <div key={worker._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
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
                    <div className="font-bold text-xl text-green-400">
                      {formatCurrency(worker.hourlyRate, 'DZD')}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">per hour</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
