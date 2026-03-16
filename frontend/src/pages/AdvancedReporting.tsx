import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { reportingApi } from '@/lib/api'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Filter,
  FileText,
  Mail,
  Printer,
  Settings,
  Eye,
  Clock,
  Target,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Award,
  Globe,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

interface Report {
  id: string
  name: string
  description: string
  type: 'financial' | 'production' | 'inventory' | 'employee' | 'sales' | 'custom'
  category: 'summary' | 'detailed' | 'analytical' | 'comparative'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on-demand'
  status: 'generating' | 'ready' | 'scheduled' | 'failed'
  createdAt: string
  lastGenerated?: string
  nextScheduled?: string
  format: 'pdf' | 'excel' | 'csv' | 'json'
  size?: number
  downloadUrl?: string
  parameters: Record<string, any>
  recipients: string[]
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'financial' | 'production' | 'inventory' | 'employee' | 'sales'
  category: 'summary' | 'detailed' | 'analytical' | 'comparative'
  parameters: Array<{
    name: string
    type: 'date' | 'select' | 'number' | 'text'
    required: boolean
    options?: string[]
    defaultValue?: any
  }>
  icon: React.ElementType
  color: string
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'financial-summary',
    name: 'Financial Summary',
    description: 'Overview of financial performance with revenue, expenses, and profit analysis',
    type: 'financial',
    category: 'summary',
    icon: DollarSign,
    color: 'text-green-600',
    parameters: [
      { name: 'startDate', type: 'date', required: true },
      { name: 'endDate', type: 'date', required: true },
      { name: 'includeForecast', type: 'select', required: false, options: ['yes', 'no'], defaultValue: 'no' }
    ]
  },
  {
    id: 'production-efficiency',
    name: 'Production Efficiency',
    description: 'Detailed analysis of production metrics, efficiency rates, and bottlenecks',
    type: 'production',
    category: 'analytical',
    icon: Target,
    color: 'text-blue-600',
    parameters: [
      { name: 'period', type: 'select', required: true, options: ['daily', 'weekly', 'monthly'] },
      { name: 'department', type: 'select', required: false, options: ['all', 'cutting', 'assembly', 'finishing'] },
      { name: 'targetEfficiency', type: 'number', required: false, defaultValue: 85 }
    ]
  },
  {
    id: 'inventory-status',
    name: 'Inventory Status',
    description: 'Current inventory levels, stock movements, and low stock alerts',
    type: 'inventory',
    category: 'detailed',
    icon: Package,
    color: 'text-purple-600',
    parameters: [
      { name: 'warehouse', type: 'select', required: false, options: ['all', 'A', 'B', 'C'] },
      { name: 'includeLowStock', type: 'select', required: false, options: ['yes', 'no'], defaultValue: 'yes' },
      { name: 'category', type: 'select', required: false, options: ['all', 'raw-materials', 'finished-goods'] }
    ]
  },
  {
    id: 'employee-performance',
    name: 'Employee Performance',
    description: 'Employee productivity, attendance, and performance metrics',
    type: 'employee',
    category: 'analytical',
    icon: Users,
    color: 'text-indigo-600',
    parameters: [
      { name: 'department', type: 'select', required: false, options: ['all', 'production', 'quality', 'maintenance'] },
      { name: 'period', type: 'select', required: true, options: ['weekly', 'monthly', 'quarterly'] },
      { name: 'includeGoals', type: 'select', required: false, options: ['yes', 'no'], defaultValue: 'yes' }
    ]
  }
]

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Financial Report - March 2024',
    description: 'Complete financial analysis for March 2024',
    type: 'financial',
    category: 'detailed',
    frequency: 'monthly',
    status: 'ready',
    createdAt: '2024-03-15T10:30:00Z',
    lastGenerated: '2024-03-15T14:20:00Z',
    format: 'pdf',
    size: 2457600,
    downloadUrl: '/api/reports/1/download',
    parameters: { startDate: '2024-03-01', endDate: '2024-03-31' },
    recipients: ['manager@factory.com', 'finance@factory.com']
  },
  {
    id: '2',
    name: 'Production Efficiency Analysis',
    description: 'Weekly production efficiency metrics and analysis',
    type: 'production',
    category: 'analytical',
    frequency: 'weekly',
    status: 'generating',
    createdAt: '2024-03-16T09:15:00Z',
    format: 'excel',
    parameters: { period: 'weekly', department: 'all' },
    recipients: ['production@factory.com']
  },
  {
    id: '3',
    name: 'Inventory Status Report',
    description: 'Current inventory levels and low stock alerts',
    type: 'inventory',
    category: 'detailed',
    frequency: 'daily',
    status: 'ready',
    createdAt: '2024-03-16T08:00:00Z',
    lastGenerated: '2024-03-16T08:30:00Z',
    format: 'pdf',
    size: 1843200,
    downloadUrl: '/api/reports/3/download',
    parameters: { warehouse: 'all', includeLowStock: 'yes' },
    recipients: ['warehouse@factory.com', 'procurement@factory.com']
  }
]

const analyticsData = {
  totalReports: 156,
  activeReports: 23,
  scheduledReports: 8,
  failedReports: 2,
  reportsGenerated: 1247,
  averageGenerationTime: 45, // seconds
  storageUsed: 2.4, // GB
  activeUsers: 12,
  usersGrowth: 8.5,
  reportsByType: {
    financial: 45,
    production: 38,
    inventory: 32,
    employee: 28,
    sales: 13
  },
  reportsByStatus: {
    ready: 89,
    generating: 12,
    scheduled: 8,
    failed: 2
  },
  generationTrends: [
    { date: '2024-03-10', reports: 18 },
    { date: '2024-03-11', reports: 22 },
    { date: '2024-03-12', reports: 19 },
    { date: '2024-03-13', reports: 25 },
    { date: '2024-03-14', reports: 31 },
    { date: '2024-03-15', reports: 28 },
    { date: '2024-03-16', reports: 13 }
  ]
}

export function AdvancedReporting() {
  const [selectedPeriod, setSelectedPeriod] = useState('7days')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({})

  // Mock API calls - replace with actual API calls
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', selectedPeriod, selectedType, selectedStatus],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockReports
    }
  })

  const { data: analytics } = useQuery({
    queryKey: ['reporting-analytics'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return analyticsData
    }
  })

  const metrics = [
    {
      title: 'Total Reports',
      value: analytics?.totalReports || 0,
      change: analytics?.reportsGenerated || 0,
      changeType: 'increase',
      icon: FileText,
      color: 'text-blue-600',
      format: 'number'
    },
    {
      title: 'Active Reports',
      value: analytics?.activeReports || 0,
      change: 12.5,
      changeType: 'increase',
      icon: Activity,
      color: 'text-green-600',
      format: 'number'
    },
    {
      title: 'Scheduled Reports',
      value: analytics?.scheduledReports || 0,
      change: -2.3,
      changeType: 'decrease',
      icon: Clock,
      color: 'text-purple-600',
      format: 'number'
    },
    {
      title: 'Avg. Generation Time',
      value: analytics?.averageGenerationTime || 0,
      change: -8.7,
      changeType: 'increase',
      icon: Zap,
      color: 'text-orange-600',
      format: 'time'
    }
  ]

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-900 text-xl">Loading advanced reporting...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Advanced Reporting
        </h1>
        <p className="text-gray-500 text-lg">Generate custom reports and gain deep insights</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <ERPCard key={index}>
            <ERPCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {metric.format === 'time' ? `${metric.value}s` : metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 bg-gray-100 rounded-lg`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </ERPCardContent>
          </ERPCard>
        ))}
      </div>

      {/* Report Templates */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle>Report Templates</ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(template)
                  setShowCreateModal(true)
                }}
              >
                <div className="flex items-center mb-3">
                  <template.icon className={`h-6 w-6 ${template.color} mr-2`} />
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    {template.category}
                  </span>
                  <span className="text-xs font-medium text-indigo-600">
                    {template.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Recent Reports */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle className="flex items-center justify-between">
            <span>Recent Reports</span>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports?.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'ready' ? 'bg-green-100 text-green-800' :
                        report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.lastGenerated ? formatDate(report.lastGenerated) : 'Not generated'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {report.status === 'ready' && (
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Create Report Modal */}
      {showCreateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Generate Report: {selectedTemplate.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedTemplate.name}</h3>
                <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
              </div>
              
              {selectedTemplate.parameters.map((param, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {param.name} {param.required && <span className="text-red-500">*</span>}
                  </label>
                  {param.type === 'date' ? (
                    <Input
                      type="date"
                      value={reportParameters[param.name] || ''}
                      onChange={(value) => setReportParameters(prev => ({
                        ...prev,
                        [param.name]: value
                      }))}
                    />
                  ) : param.type === 'select' ? (
                    <Select
                      value={reportParameters[param.name] || param.defaultValue || ''}
                      onChange={(value) => setReportParameters(prev => ({
                        ...prev,
                        [param.name]: value
                      }))}
                    >
                      {param.options?.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  ) : param.type === 'number' ? (
                    <Input
                      type="number"
                      value={reportParameters[param.name] || param.defaultValue || ''}
                      onChange={(value) => setReportParameters(prev => ({
                        ...prev,
                        [param.name]: parseInt(value)
                      }))}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={reportParameters[param.name] || ''}
                      onChange={(value) => setReportParameters(prev => ({
                        ...prev,
                        [param.name]: value
                      }))}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedTemplate(null)
                  setReportParameters({})
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  // Handle report generation
                  console.log('Generating report with parameters:', reportParameters)
                  setShowCreateModal(false)
                  setSelectedTemplate(null)
                  setReportParameters({})
                }}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
