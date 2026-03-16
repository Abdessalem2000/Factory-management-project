import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  AlertTriangle,
  Factory,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Mock data - will be replaced with real API calls
const monthlyData = [
  { month: 'Jan', expenses: 45000, production: 120000, income: 180000 },
  { month: 'Feb', expenses: 52000, production: 135000, income: 195000 },
  { month: 'Mar', expenses: 48000, production: 142000, income: 210000 },
  { month: 'Apr', expenses: 61000, production: 155000, income: 225000 },
  { month: 'May', expenses: 55000, production: 168000, income: 240000 },
  { month: 'Jun', expenses: 58000, production: 175000, income: 255000 }
]

const productionData = [
  { name: 'Cutting', value: 450, color: '#4F46E5' },
  { name: 'Assembly', value: 380, color: '#10B981' },
  { name: 'Finishing', value: 220, color: '#F59E0B' },
  { name: 'Quality Control', value: 180, color: '#EF4444' }
]

const lowStockMaterials = [
  { id: 1, name: 'Cotton Fabric - Blue', current: 45, min: 100, unit: 'meters' },
  { id: 2, name: 'Zippers - Metal', current: 12, min: 50, unit: 'pieces' },
  { id: 3, name: 'Thread - White', current: 8, min: 25, unit: 'rolls' },
  { id: 4, name: 'Buttons - Pearl', current: 15, min: 30, unit: 'pieces' }
]

const kpiData = [
  { title: 'Total Production', value: '1,245', change: '+12.5%', trend: 'up', icon: Factory, color: 'bg-blue-500' },
  { title: 'Revenue', value: 'DZD 255K', change: '+8.2%', trend: 'up', icon: DollarSign, color: 'bg-green-500' },
  { title: 'Expenses', value: 'DZD 58K', change: '+3.1%', trend: 'up', icon: TrendingUp, color: 'bg-red-500' },
  { title: 'Active Orders', value: '47', change: '-5.3%', trend: 'down', icon: ShoppingCart, color: 'bg-purple-500' }
]

export function ERPDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factory Dashboard</h1>
          <p className="text-gray-500">Overview of your factory operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Trends */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Financial Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                <Line type="monotone" dataKey="production" stroke="#4F46E5" strokeWidth={2} dot={{ fill: '#4F46E5' }} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Production</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production by Category */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Production by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockMaterials.map((material) => (
              <div key={material.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{material.name}</p>
                    <p className="text-sm text-gray-500">
                      Current: {material.current} {material.unit} | Min: {material.min} {material.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 font-medium">
                    {((material.min - material.current) / material.min * 100).toFixed(0)}% below min
                  </span>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Order Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
