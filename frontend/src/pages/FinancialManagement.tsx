import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { financialApi } from '@/lib/api'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  FileText,
  Calendar,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Receipt
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  amount: number
  dueDate: string
  issueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  tax: number
  total: number
  notes: string
}

interface Budget {
  id: string
  name: string
  category: string
  allocatedAmount: number
  spentAmount: number
  remainingAmount: number
  period: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'exceeded'
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  receipt: string
  notes: string
  approvedBy?: string
  approvedDate?: string
}

interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  paymentDate: string
  method: 'cash' | 'bank-transfer' | 'credit-card' | 'check'
  status: 'pending' | 'completed' | 'failed'
  reference: string
  notes: string
}

export function FinancialManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses' | 'budgets' | 'payments'>('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  const { data: financialMetrics } = useQuery({
    queryKey: ['financial-metrics', selectedPeriod],
    queryFn: async () => {
      const response = await financialApi.getFinancialMetrics(selectedPeriod)
      return response?.data || {}
    }
  })

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await financialApi.getInvoices()
      return response?.data || []
    }
  })

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await financialApi.getExpenses()
      return response?.data || []
    }
  })

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await financialApi.getBudgets()
      return response?.data || []
    }
  })

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await financialApi.getPayments()
      return response?.data || []
    }
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoice: Invoice) => {
      return await financialApi.createInvoice(invoice)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setShowCreateModal(false)
    }
  })

  const updateInvoiceMutation = useMutation({
    mutationFn: async (invoice: Invoice) => {
      return await financialApi.updateInvoice(invoice.id, invoice)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setEditingItem(null)
    }
  })

  const approveExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      return await financialApi.approveExpense(expenseId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })

  const recordPaymentMutation = useMutation({
    mutationFn: async (payment: Payment) => {
      return await financialApi.recordPayment(payment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-400/20'
      case 'completed': return 'text-green-400 bg-green-400/20'
      case 'sent': return 'text-blue-400 bg-blue-400/20'
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'overdue': return 'text-red-400 bg-red-400/20'
      case 'rejected': return 'text-red-400 bg-red-400/20'
      case 'failed': return 'text-red-400 bg-red-400/20'
      case 'exceeded': return 'text-orange-400 bg-orange-400/20'
      case 'active': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getBudgetStatusColor = (budget: Budget) => {
    const percentage = (budget.spentAmount / budget.allocatedAmount) * 100
    if (percentage >= 100) return 'text-red-400 bg-red-400/20'
    if (percentage >= 80) return 'text-yellow-400 bg-yellow-400/20'
    return 'text-green-400 bg-green-400/20'
  }

  const getBudgetPercentage = (budget: Budget) => {
    return Math.min((budget.spentAmount / budget.allocatedAmount) * 100, 100)
  }

  const filteredInvoices = invoices?.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const filteredExpenses = expenses?.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="fixed inset-0 opacity-20">
        <div className="w-full h-full bg-pattern"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
            Financial Management
          </h1>
          <p className="text-gray-300 text-lg">Manage your finances, invoices, and budgets</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex justify-center">
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </Select>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(financialMetrics.totalRevenue || 0, 'DZD')}</div>
              <p className="text-xs text-gray-300">
                {financialMetrics.revenueGrowth >= 0 ? '+' : ''}{financialMetrics.revenueGrowth || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(financialMetrics.totalExpenses || 0, 'DZD')}</div>
              <p className="text-xs text-gray-300">
                {financialMetrics.expenseGrowth >= 0 ? '+' : ''}{financialMetrics.expenseGrowth || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(financialMetrics.netProfit || 0, 'DZD')}</div>
              <p className="text-xs text-gray-300">
                {financialMetrics.profitMargin || 0}% profit margin
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Outstanding Invoices</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(financialMetrics.outstandingInvoices || 0, 'DZD')}</div>
              <p className="text-xs text-gray-300">
                {financialMetrics.overdueInvoices || 0} overdue invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-white/20">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'expenses', label: 'Expenses', icon: Receipt },
              { id: 'budgets', label: 'Budgets', icon: PieChart },
              { id: 'payments', label: 'Payments', icon: CreditCard }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices?.slice(0, 5).map((invoice: Invoice) => (
                    <div key={invoice.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <div className="font-medium text-white">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-300">{invoice.clientName}</div>
                        <div className="text-xs text-gray-400">{formatDate(issueDate)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">{formatCurrency(invoice.total, 'DZD')}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses?.slice(0, 5).map((expense: Expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <div className="font-medium text-white">{expense.description}</div>
                        <div className="text-sm text-gray-300">{expense.category}</div>
                        <div className="text-xs text-gray-400">{formatDate(expense.date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">{formatCurrency(expense.amount, 'DZD')}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Invoices</CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white w-64"
                  />
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInvoices.map((invoice: Invoice) => (
                  <div key={invoice.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{invoice.invoiceNumber}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="block text-gray-400">Client:</span>
                            <span className="font-medium text-white">{invoice.clientName}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Issue Date:</span>
                            <span className="font-medium text-white">{formatDate(invoice.issueDate)}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Due Date:</span>
                            <span className="font-medium text-white">{formatDate(invoice.dueDate)}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Total:</span>
                            <span className="font-medium text-white">{formatCurrency(invoice.total, 'DZD')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded" title="Send">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded" title="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400">Items: </span>
                          {invoice.items.map((item, index) => (
                            <span key={index} className="text-white ml-2">
                              {item.description} ({item.quantity} x {formatCurrency(item.unitPrice, 'DZD')})
                              {index < invoice.items.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                        <div>
                          <span className="text-gray-400">Subtotal: </span>
                          <span className="text-white ml-2">{formatCurrency(invoice.total - invoice.tax, 'DZD')}</span>
                          <span className="text-gray-400 ml-4">Tax: </span>
                          <span className="text-white ml-2">{formatCurrency(invoice.tax, 'DZD')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Expenses</CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white w-64"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredExpenses.map((expense: Expense) => (
                  <div key={expense.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{expense.description}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="block text-gray-400">Category:</span>
                            <span className="font-medium text-white">{expense.category}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Date:</span>
                            <span className="font-medium text-white">{formatDate(expense.date)}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Amount:</span>
                            <span className="font-medium text-white">{formatCurrency(expense.amount, 'DZD')}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Receipt:</span>
                            <span className="font-medium text-white">{expense.receipt || 'N/A'}</span>
                          </div>
                        </div>
                        {expense.notes && (
                          <div className="mt-2 text-sm text-gray-300">
                            <span className="text-gray-400">Notes: </span>
                            {expense.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {expense.status === 'pending' && (
                          <Button
                            onClick={() => approveExpenseMutation.mutate(expense.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="View">
                          <Eye className="w-4 h-4" />
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

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Budgets</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Budget
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets?.map((budget: Budget) => (
                  <div key={budget.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{budget.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBudgetStatusColor(budget)}`}>
                            {budget.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="block text-gray-400">Category:</span>
                            <span className="font-medium text-white">{budget.category}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Period:</span>
                            <span className="font-medium text-white">{budget.period}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Allocated:</span>
                            <span className="font-medium text-white">{formatCurrency(budget.allocatedAmount, 'DZD')}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Remaining:</span>
                            <span className="font-medium text-white">{formatCurrency(budget.remainingAmount, 'DZD')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Spent: {formatCurrency(budget.spentAmount, 'DZD')}</span>
                        <span className="text-white font-medium">{getBudgetPercentage(budget).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            getBudgetPercentage(budget) >= 100 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                            getBudgetPercentage(budget) >= 80 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-green-400 to-green-600'
                          }`}
                          style={{ width: `${getBudgetPercentage(budget)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      <span className="text-gray-400">Period: </span>
                      {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Payments</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Record Payment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments?.map((payment: Payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{payment.invoiceNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="block text-gray-400">Amount:</span>
                          <span className="font-medium text-white">{formatCurrency(payment.amount, 'DZD')}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Method:</span>
                          <span className="font-medium text-white">{payment.method.replace('-', ' ')}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Date:</span>
                          <span className="font-medium text-white">{formatDate(payment.paymentDate)}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Reference:</span>
                          <span className="font-medium text-white">{payment.reference}</span>
                        </div>
                      </div>
                      {payment.notes && (
                        <div className="mt-2 text-sm text-gray-300">
                          <span className="text-gray-400">Notes: </span>
                          {payment.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="View">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded" title="Download">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
