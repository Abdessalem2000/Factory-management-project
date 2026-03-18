import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import { Button } from '@/components/ui/Button'
import { rawMaterialsApi, financialApi, workerApi, supplierApi, productionApi } from '@/lib/api'
import { generateFactoryAudit, downloadAsPDF, type FactoryData } from '@/lib/ai'
import { UserButton } from '@/lib/auth.tsx'
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
  ArrowDownRight,
  Download,
  ExternalLink,
  Brain,
  Loader2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Mock data - will be replaced with real API calls
const monthlyData = [
  { month: 'Jan', expenses: 280000, production: 420000, income: 380000 },
  { month: 'Feb', expenses: 295000, production: 445000, income: 410000 },
  { month: 'Mar', expenses: 310000, production: 470000, income: 435000 },
  { month: 'Apr', expenses: 285000, production: 490000, income: 455000 },
  { month: 'May', expenses: 320000, production: 510000, income: 480000 },
  { month: 'Jun', expenses: 340000, production: 530000, income: 510000 }
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
  { title: 'Total Production', value: '12,450', change: '+12.5%', trend: 'up', icon: Factory, color: 'bg-blue-500' },
  { title: 'Revenue', value: 'DZD 2.55M', change: '+8.2%', trend: 'up', icon: DollarSign, color: 'bg-green-500' },
  { title: 'Expenses', value: 'DZD 1.8M', change: '+3.1%', trend: 'up', icon: TrendingUp, color: 'bg-red-500' },
  { title: 'Active Orders', value: '47', change: '-5.3%', trend: 'down', icon: ShoppingCart, color: 'bg-purple-500' }
]

export function ERPDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false)
  const [auditReport, setAuditReport] = useState<string | null>(null)

  // Handler pour naviguer vers les matériaux
  const handleViewMaterials = () => {
    // Naviguer vers la page Raw Materials
    window.location.href = '/raw-materials'
  }

  // Récupération des données réelles des raw materials pour les alertes
  const { data: rawMaterialsData } = useQuery({
    queryKey: ['rawMaterials-dashboard'],
    queryFn: async () => {
      try {
        const result = await rawMaterialsApi.getRawMaterials()
        console.log('Raw Materials API Response:', result)
        // Extract data from response - handle different response formats
        const materialsArray = result?.data || result || []
        console.log('Raw Materials array:', materialsArray)
        return Array.isArray(materialsArray) ? materialsArray : []
      } catch (apiError) {
        console.error('API Error:', apiError)
        // Fallback to mock data
        return [
          { id: '1', name: 'Cotton Fabric - Blue', currentStock: 45, minStockAlert: 100, unit: 'meters' },
          { id: '2', name: 'Zippers - Metal', currentStock: 12, minStockAlert: 50, unit: 'pieces' },
          { id: '3', name: 'Thread - White', currentStock: 8, minStockAlert: 25, unit: 'rolls' },
          { id: '4', name: 'Buttons - Pearl', currentStock: 15, minStockAlert: 30, unit: 'pieces' }
        ]
      }
    },
    retry: 1,
    gcTime: 300000,
  })

  // Récupération des données pour l'audit AI
  const { data: workersData } = useQuery({
    queryKey: ['workers-audit'],
    queryFn: async () => {
      try {
        const result = await workerApi.getWorkers()
        return result?.data || []
      } catch (error) {
        return []
      }
    },
    retry: 1
  })

  const { data: incomesData } = useQuery({
    queryKey: ['incomes-audit'],
    queryFn: async () => {
      try {
        const result = await financialApi.getIncomes()
        return result?.data || []
      } catch (error) {
        return []
      }
    },
    retry: 1
  })

  const { data: expensesData } = useQuery({
    queryKey: ['expenses-audit'],
    queryFn: async () => {
      try {
        const result = await financialApi.getExpensesList()
        return result?.data || []
      } catch (error) {
        return []
      }
    },
    retry: 1
  })

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-audit'],
    queryFn: async () => {
      try {
        const result = await supplierApi.getSuppliers()
        return result?.data || []
      } catch (error) {
        return []
      }
    },
    retry: 1
  })

  const { data: productionData } = useQuery({
    queryKey: ['production-audit'],
    queryFn: async () => {
      try {
        const result = await productionApi.getProductionOrders()
        return result?.data || []
      } catch (error) {
        return []
      }
    },
    retry: 1
  })

  // AI Audit Generation
  const handleGenerateAudit = async () => {
    setIsGeneratingAudit(true)
    setAuditReport(null)
    
    try {
      const factoryData: FactoryData = {
        workers: workersData || [],
        incomes: incomesData || [],
        expenses: expensesData || [],
        rawMaterials: rawMaterialsData || [],
        suppliers: suppliersData || [],
        productionOrders: productionData || []
      }
      
      const audit = await generateFactoryAudit(factoryData)
      setAuditReport(audit)
    } catch (error) {
      console.error('Audit generation failed:', error)
      setAuditReport('Failed to generate audit report. Please check your OpenAI API key.')
    } finally {
      setIsGeneratingAudit(false)
    }
  }

  const handleDownloadAudit = () => {
    if (auditReport) {
      downloadAsPDF(auditReport, 'factory-audit-report.txt')
    }
  }

  // Calculer les matériaux en stock faible
  const lowStockMaterials = (rawMaterialsData || []).filter(material => 
    material?.currentStock <= material?.minStockAlert
  )

  // Export CSV function pour le dashboard
  const exportDashboardToCSV = () => {
    const headers = ['Month', 'Expenses', 'Production', 'Income']
    const csvData = monthlyData.map(item => [
      item.month,
      item.expenses,
      item.production,
      item.income
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factory Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time overview of your manufacturing operations</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleGenerateAudit}
            disabled={isGeneratingAudit}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            {isGeneratingAudit ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating AI Audit...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                AI Production Audit
              </>
            )}
          </Button>
          <Button 
            className={`flex items-center gap-2 ${
              isExporting ? 'bg-green-50 border-green-300 text-green-700' : ''
            }`}
            onClick={exportDashboardToCSV}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <ERPCard key={index}>
            <ERPCardContent className="p-6">
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
            </ERPCardContent>
          </ERPCard>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <ERPCard className="border-red-200 bg-red-50">
          <ERPCardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="text-red-800 font-semibold">Critical Inventory Alert</h3>
                  <p className="text-red-600 text-sm">
                    {lowStockMaterials.length} materials need immediate restocking
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-100 flex items-center gap-2"
                onClick={handleViewMaterials}
              >
                <ExternalLink className="h-4 w-4" />
                View Materials
              </Button>
            </div>
            
            {/* Quick List of Critical Items */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {lowStockMaterials.slice(0, 4).map((material) => (
                <div key={material?._id} className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{material?.name || 'Unknown'}</p>
                      <p className="text-xs text-red-600 font-semibold">
                        {material?.currentStock || 0} / {material?.minStockAlert || 0} {material?.unit || 'units'}
                      </p>
                    </div>
                    <div className="bg-red-100 rounded-full p-1">
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ERPCardContent>
        </ERPCard>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Trends */}
        <ERPCard>
          <ERPCardHeader>
            <ERPCardTitle className="text-lg font-semibold text-gray-900">Financial Trends</ERPCardTitle>
          </ERPCardHeader>
          <ERPCardContent>
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
          </ERPCardContent>
        </ERPCard>

        {/* Production by Category */}
        <ERPCard>
          <ERPCardHeader>
            <ERPCardTitle className="text-lg font-semibold text-gray-900">Production by Category</ERPCardTitle>
          </ERPCardHeader>
          <ERPCardContent>
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
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* AI Audit Report */}
      {auditReport && (
        <ERPCard>
          <ERPCardHeader>
            <ERPCardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 text-purple-500 mr-2" />
              AI Production Audit Report
            </ERPCardTitle>
          </ERPCardHeader>
          <ERPCardContent>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {auditReport}
                </pre>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleDownloadAudit} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>
      )}

      {/* Low Stock Alert */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Low Stock Alert
          </ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="space-y-3">
            {lowStockMaterials.map((material) => (
              <div key={material.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{material.name}</p>
                    <p className="text-sm text-gray-500">
                      Current: {material.currentStock} {material.unit} | Min: {material.minStockAlert} {material.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 font-medium">
                    {((material.minStockAlert - material.currentStock) / material.minStockAlert * 100).toFixed(0)}% below min
                  </span>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Order Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ERPCardContent>
      </ERPCard>
    </div>
  )
}
