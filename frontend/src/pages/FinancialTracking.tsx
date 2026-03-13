import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { financialApi } from '@/lib/api'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import { Transaction, FinancialFilters } from '@/types'

export function FinancialTracking() {
  const [filters, setFilters] = useState<FinancialFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['financial-transactions', filters, searchTerm],
    queryFn: () => financialApi.getTransactions({ ...filters, search: searchTerm }).then(res => res.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => financialApi.getSummary().then(res => res.data),
  })

  const transactions = transactionsData?.data || []

  const totalIncome = summary?.income || 0
  const totalExpenses = summary?.expenses || 0
  const netProfit = summary?.netProfit || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Tracking</h1>
          <p className="text-gray-600">Manage income, expenses, and financial reporting</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <StatCard
            title="Total Income"
            value={formatCurrency(totalIncome, 'DZD')}
            change={12}
            changeType="increase"
            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          />
        </Card>
        <Card>
          <StatCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses, 'DZD')}
            change={12}
            changeType="decrease"
            icon={<TrendingDown className="h-4 w-4 text-red-600" />}
          />
        </Card>
        <Card>
          <StatCard
            title="Net Profit"
            value={formatCurrency(netProfit, 'DZD')}
            change={12}
            changeType={netProfit >= 0 ? 'increase' : 'decrease'}
            icon={<DollarSign className="h-4 w-4 text-blue-600" />}
          />
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as any })}
            >
              <option value="">All Categories</option>
              <option value="materials">Materials</option>
              <option value="labor">Labor</option>
              <option value="overhead">Overhead</option>
              <option value="sales">Sales</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Description</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction: Transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(transaction.date)}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.reference && (
                            <div className="text-gray-500 text-xs">{transaction.reference}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, 'DZD')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
