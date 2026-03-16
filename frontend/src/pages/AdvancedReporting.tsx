import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
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
  Globe
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
  createdBy: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  category: string
  parameters: Array<{
    name: string
    type: 'date' | 'select' | 'text' | 'number' | 'boolean'
    label: string
    required: boolean
    options?: string[]
    defaultValue?: any
  }>
  format: string[]
  frequency: string[]
  recipients: string[]
}

interface ScheduledReport {
  id: string
  reportId: string
  reportName: string
  schedule: string
  nextRun: string
  lastRun?: string
  status: 'active' | 'paused' | 'failed'
  recipients: string[]
  parameters: Record<string, any>
}

interface ReportMetric {
  name: string
  value: number | string
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: any
  color: string
  format?: 'currency' | 'percentage' | 'number'
}

export function AdvancedReporting() {
  const [activeTab, setActiveTab] = useState<'reports' | 'templates' | 'scheduled' | 'analytics'>('reports')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({})

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', selectedType, selectedCategory, selectedStatus],
    queryFn: async () => {
      const response = await reportingApi.getReports({
        type: selectedType,
        category: selectedCategory,
        status: selectedStatus
      })
      return response?.data || []
    }
  })

  const { data: templates } = useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => {
      const response = await reportingApi.getReportTemplates()
      return response?.data || []
    }
  })

  const { data: scheduledReports } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const response = await reportingApi.getScheduledReports()
      return response?.data || []
    }
  })

  const { data: analyticsData } = useQuery({
    queryKey: ['report-analytics', dateRange],
    queryFn: async () => {
      const response = await reportingApi.getReportAnalytics(dateRange)
      return response?.data || {}
    }
  })

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'text-green-400 bg-green-400/20'
      case 'production': return 'text-blue-400 bg-blue-400/20'
      case 'inventory': return 'text-purple-400 bg-purple-400/20'
      case 'employee': return 'text-yellow-400 bg-yellow-400/20'
      case 'sales': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400 bg-green-400/20'
      case 'generating': return 'text-blue-400 bg-blue-400/20'
      case 'scheduled': return 'text-yellow-400 bg-yellow-400/20'
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'failed': return 'text-red-400 bg-red-400/20'
      case 'paused': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value
    
    switch (format) {
      case 'currency':
        return formatCurrency(value, 'DZD')
      case 'percentage':
        return `${value}%`
      case 'number':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  const generateReport = async (templateId: string, parameters: Record<string, any>) => {
    try {
      await reportingApi.generateReport(templateId, parameters)
      // Refresh reports list
      window.location.reload()
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const downloadReport = async (reportId: string, format: string) => {
    try {
      const response = await reportingApi.downloadReport(reportId, format)
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportId}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  const shareReport = async (reportId: string, recipients: string[]) => {
    try {
      await reportingApi.shareReport(reportId, recipients)
      // Show success message
    } catch (error) {
      console.error('Error sharing report:', error)
    }
  }

  const filteredReports = reports?.filter(report => {
    const matchesType = selectedType === 'all' || report.type === selectedType
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus
    return matchesType && matchesCategory && matchesStatus
  }) || []

  const reportMetrics: ReportMetric[] = [
    {
      name: 'Total Reports',
      value: analyticsData.totalReports || 0,
      change: analyticsData.reportsGrowth || 0,
      changeType: analyticsData.reportsGrowth >= 0 ? 'increase' : 'decrease',
      icon: FileText,
      color: 'text-blue-400',
      format: 'number'
    },
    {
      name: 'Generated Today',
      value: analyticsData.generatedToday || 0,
      change: analyticsData.todayGrowth || 0,
      changeType: analyticsData.todayGrowth >= 0 ? 'increase' : 'decrease',
      icon: Zap,
      color: 'text-green-400',
      format: 'number'
    },
    {
      name: 'Scheduled Reports',
      value: analyticsData.scheduledReports || 0,
      change: analyticsData.scheduledGrowth || 0,
      changeType: analyticsData.scheduledGrowth >= 0 ? 'increase' : 'decrease',
      icon: Clock,
      color: 'text-purple-400',
      format: 'number'
    },
    {
      name: 'Active Users',
      value: analyticsData.activeUsers || 0,
      change: analyticsData.usersGrowth || 0,
      changeType: analyticsData.usersGrowth >= 0 ? 'increase' : 'decrease',
      icon: Users,
      color: 'text-yellow-400',
      format: 'number'
    }
  ]

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading advanced reporting...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="fixed inset-0 opacity-20">
        <div className="w-full h-full bg-pattern"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
            Advanced Reporting
          </h1>
          <p className="text-gray-300 text-lg">Generate custom reports and gain deep insights</p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 flex justify-center">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </Select>
        </div>

        {/* Report Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportMetrics.map((metric, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">{metric.name}</CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatValue(metric.value, metric.format)}
                </div>
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  {metric.changeType === 'increase' ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : metric.changeType === 'decrease' ? (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                  {metric.change >= 0 ? '+' : ''}{metric.change}% from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-white/20">
          <nav className="flex space-x-8">
            {[
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'templates', label: 'Templates', icon: Settings },
              { id: 'scheduled', label: 'Scheduled', icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all">All Types</option>
                <option value="financial">Financial</option>
                <option value="production">Production</option>
                <option value="inventory">Inventory</option>
                <option value="employee">Employee</option>
                <option value="sales">Sales</option>
              </Select>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all">All Categories</option>
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="analytical">Analytical</option>
                <option value="comparative">Comparative</option>
              </Select>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="all">All Status</option>
                <option value="ready">Ready</option>
                <option value="generating">Generating</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </Select>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Generate Report
              </Button>
            </div>

            {/* Reports List */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Generated Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report: Report) => (
                    <div key={report.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{report.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.type)}`}>
                              {report.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{report.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                            <div>
                              <span className="block text-gray-400">Format:</span>
                              <span className="font-medium text-white">{report.format.toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Frequency:</span>
                              <span className="font-medium text-white">{report.frequency}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Created:</span>
                              <span className="font-medium text-white">{formatDate(report.createdAt)}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Size:</span>
                              <span className="font-medium text-white">{report.size ? `${(report.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
                            </div>
                          </div>
                          {report.lastGenerated && (
                            <div className="mt-2 text-sm text-gray-300">
                              <span className="text-gray-400">Last Generated: </span>
                              {formatDate(report.lastGenerated)}
                            </div>
                          )}
                          {report.nextScheduled && (
                            <div className="mt-2 text-sm text-gray-300">
                              <span className="text-gray-400">Next Scheduled: </span>
                              {formatDate(report.nextScheduled)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {report.status === 'ready' && (
                            <>
                              <Button
                                onClick={() => downloadReport(report.id, report.format)}
                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => shareReport(report.id, report.recipients)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                title="Share"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded" title="Print">
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Report Templates</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates?.map((template: ReportTemplate) => (
                  <div key={template.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-300">{template.description}</p>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>
                        <span className="text-gray-400">Type: </span>
                        <span className="text-white">{template.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Category: </span>
                        <span className="text-white">{template.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Parameters: </span>
                        <span className="text-white">{template.parameters.length} required</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedTemplate(template)
                          setShowCreateModal(true)
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                      >
                        Use Template
                      </Button>
                      <Button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Reports Tab */}
        {activeTab === 'scheduled' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Scheduled Reports</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Schedule Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports?.map((scheduled: ScheduledReport) => (
                  <div key={scheduled.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{scheduled.reportName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheduled.status)}`}>
                            {scheduled.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="block text-gray-400">Schedule:</span>
                            <span className="font-medium text-white">{scheduled.schedule}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Next Run:</span>
                            <span className="font-medium text-white">{formatDate(scheduled.nextRun)}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Last Run:</span>
                            <span className="font-medium text-white">{scheduled.lastRun ? formatDate(scheduled.lastRun) : 'Never'}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Recipients:</span>
                            <span className="font-medium text-white">{scheduled.recipients.length}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-300">
                          <span className="text-gray-400">Recipients: </span>
                          {scheduled.recipients.join(', ')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded" title="Pause">
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Report Generation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.generationTrends?.map((trend: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{trend.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{trend.count}</span>
                        <span className={`text-sm ${trend.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Popular Report Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.popularTypes?.map((type: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{type.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" 
                            style={{ width: `${type.percentage}%` }}
                          />
                        </div>
                        <span className="text-white font-medium">{type.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.userActivity?.map((user: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{user.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{user.reports}</span>
                        <span className="text-xs text-gray-400">reports</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg Generation Time</span>
                    <span className="text-white font-medium">{analyticsData.avgGenerationTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-green-400 font-medium">{analyticsData.successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Storage Used</span>
                    <span className="text-white font-medium">{analyticsData.storageUsed} MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Users</span>
                    <span className="text-white font-medium">{analyticsData.activeUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {selectedTemplate ? 'Generate Report from Template' : 'Generate Custom Report'}
            </h2>
            
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">{selectedTemplate.name}</h3>
                  <p className="text-gray-300 mb-4">{selectedTemplate.description}</p>
                </div>
                
                {selectedTemplate.parameters.map((param, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {param.label} {param.required && <span className="text-red-400">*</span>}
                    </label>
                    {param.type === 'date' ? (
                      <Input
                        type="date"
                        value={reportParameters[param.name] || ''}
                        onChange={(e) => setReportParameters({...reportParameters, [param.name]: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    ) : param.type === 'select' ? (
                      <Select
                        value={reportParameters[param.name] || param.defaultValue || ''}
                        onChange={(e) => setReportParameters({...reportParameters, [param.name]: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="">Select {param.label}</option>
                        {param.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </Select>
                    ) : param.type === 'number' ? (
                      <Input
                        type="number"
                        value={reportParameters[param.name] || param.defaultValue || ''}
                        onChange={(e) => setReportParameters({...reportParameters, [param.name]: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder={`Enter ${param.label.toLowerCase()}`}
                      />
                    ) : (
                      <Input
                        type="text"
                        value={reportParameters[param.name] || param.defaultValue || ''}
                        onChange={(e) => setReportParameters({...reportParameters, [param.name]: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder={`Enter ${param.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Report Name</label>
                  <Input
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                  <Select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="">Select type</option>
                    <option value="financial">Financial</option>
                    <option value="production">Production</option>
                    <option value="inventory">Inventory</option>
                    <option value="employee">Employee</option>
                    <option value="sales">Sales</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                  <Select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedTemplate(null)
                  setReportParameters({})
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedTemplate) {
                    generateReport(selectedTemplate.id, reportParameters)
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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
