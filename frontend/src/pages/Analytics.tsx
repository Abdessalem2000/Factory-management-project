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
  Activity,
  Search
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

  const { data: financialAnalytics } = useQuery({
    queryKey: ['analytics-financial'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/financial')
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
            <div className="space-y-4">
              {monthlyTrend.slice(-6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-green-600">
                        +{formatCurrency(month.income, 'DZD')}
                      </div>
                      <div className="text-xs text-red-600">
                        -{formatCurrency(month.expenses, 'DZD')}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${
                      month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(month.profit, 'DZD')}
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
              {Object.entries(departmentBreakdown).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dept}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / overview.totalWorkers) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                </div>
              ))}
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
            {topWorkers.map((worker, index) => (
              <div key={worker._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">
                      {worker.firstName} {worker.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{worker.position}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {formatCurrency(worker.hourlyRate, 'DZD')}/hour
                  </div>
                  <div className="text-sm text-gray-600">{worker.department}</div>
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
              <div className="space-y-2">
                {Object.entries(workerAnalytics.data.skillsAnalysis || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([skill, count]) => (
                    <div key={skill} className="flex justify-between items-center">
                      <span className="text-sm">{skill}</span>
                      <span className="text-sm font-bold">{count} workers</span>
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
              <div className="space-y-2">
                {Object.entries(workerAnalytics.data.paymentTypes || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-sm font-bold">{count} workers</span>
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
