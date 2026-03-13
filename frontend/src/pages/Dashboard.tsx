import { useQuery } from '@tanstack/react-query'
import { 
  Package, 
  DollarSign, 
  Users, 
  Wrench,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { productionApi, financialApi, supplierApi, workerApi } from '@/lib/api'
import { formatCurrency, calculatePercentage } from '@/lib/utils'

export function Dashboard() {
  const { data: productionStats } = useQuery({
    queryKey: ['production-stats'],
    queryFn: () => productionApi.getStats().then(res => res.data),
  })

  const { data: financialSummary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => financialApi.getSummary().then(res => res.data),
  })

  const { data: supplierStats } = useQuery({
    queryKey: ['supplier-stats'],
    queryFn: () => supplierApi.getStats().then(res => res.data),
  })

  const { data: workerStats } = useQuery({
    queryKey: ['worker-stats'],
    queryFn: () => workerApi.getStats().then(res => res.data),
  })

  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon 
  }: {
    title: string
    value: string | number
    change?: number
    changeType?: 'increase' | 'decrease'
    icon: React.ReactNode
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {changeType === 'increase' ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            {changeType === 'increase' ? '+' : '-'}{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your factory operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Production Orders"
          value={productionStats?.activeOrders || 0}
          change={12}
          changeType="increase"
          icon={<Package className="h-4 w-4 text-blue-600" />}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(financialSummary?.netProfit || 0, 'DZD')}
          change={8}
          changeType="increase"
          icon={<DollarSign className="h-4 w-4 text-green-600" />}
        />
        <StatCard
          title="Active Suppliers"
          value={supplierStats?.activeSuppliers || 0}
          change={2}
          changeType="decrease"
          icon={<Users className="h-4 w-4 text-purple-600" />}
        />
        <StatCard
          title="Active Workers"
          value={workerStats?.activeWorkers || 0}
          change={5}
          changeType="increase"
          icon={<Wrench className="h-4 w-4 text-orange-600" />}
        />
      </div>

      {/* Additional Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Production Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Production Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="font-semibold">{productionStats?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Orders</span>
                <span className="font-semibold">{productionStats?.activeOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold">{productionStats?.completedOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {productionStats?.completionRate || 0}%
                </span>
              </div>
              {productionStats?.overdueOrders > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span className="text-sm flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Overdue Orders
                  </span>
                  <span className="font-semibold">{productionStats.overdueOrders}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(financialSummary?.income || 0, 'DZD')}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(financialSummary?.expenses || 0, 'DZD')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Profit</span>
                <span className="font-semibold">
                  {formatCurrency(financialSummary?.netProfit || 0, 'DZD')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profit Margin</span>
                <span className="font-semibold">
                  {financialSummary?.income > 0 
                    ? calculatePercentage(financialSummary.netProfit, financialSummary.income)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
