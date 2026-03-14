import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { formatCurrency } from '@/lib/utils'
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
      const response = await fetch('/api/analytics/dashboard')
      return response.json()
    }
  })

  const { data: workerAnalytics } = useQuery({
    queryKey: ['analytics-workers'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/workers')
      return response.json()
    }
  })

  if (isLoading) return <div className="p-8">Loading analytics...</div>

  const overview = dashboardData?.data?.overview || {}
  const monthlyTrend = dashboardData?.data?.monthlyTrend || []
  const departmentBreakdown = dashboardData?.data?.departmentBreakdown || {}
  const topWorkers = dashboardData?.data?.topWorkers || []

  return (
    <div className="space-y-6 p-6">
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
              {formatCurrency(overview.totalIncome || 0, 'DZD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.totalTransactions || 0} transactions
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
              {formatCurrency(overview.netProfit || 0, 'DZD')}
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
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className={`text-sm font-bold ${
                      month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(month.profit, 'DZD')}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-600">Income</span>
                        <span className="text-green-600 font-medium">
                          +{formatCurrency(month.income, 'DZD')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((month.income / 25000000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-600">Expenses</span>
                        <span className="text-red-600 font-medium">
                          -{formatCurrency(month.expenses, 'DZD')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
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
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{dept}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
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
              <div key={worker._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {worker.firstName} {worker.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{worker.position}</div>
                    <div className="text-xs text-gray-500">{worker.department}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-600">
                    {formatCurrency(worker.hourlyRate, 'DZD')}
                  </div>
                  <div className="text-xs text-gray-500">per hour</div>
                  <div className="text-xs text-gray-600 mt-1">{worker.paymentType?.replace('_', ' ') || 'hourly'}</div>
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
                    <div key={skill} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{skill}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">workers</span>
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
                  <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">workers</span>
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
