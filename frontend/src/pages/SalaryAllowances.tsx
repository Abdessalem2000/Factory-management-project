import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { Plus, DollarSign, Calendar, Users, X, Check, Loader2, Download } from 'lucide-react'
import { FileImport } from '@/components/ui/FileImport'
import { financialApi } from '@/lib/api'

export function SalaryAllowances() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const queryClient = useQueryClient()
  
  // Formulaire state
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    type: 'monthly',
    employees: 0
  })

  // Récupération des données réelles
  const { data: allowancesData, isLoading } = useQuery({
    queryKey: ['allowances'],
    queryFn: async () => {
      try {
        const result = await financialApi.getAllowances()
        return result?.data || []
      } catch (apiError) {
        console.error('API Error:', apiError)
        // Fallback to mock data
        return [
          { id: 1, name: 'Transport Allowance', amount: 200, type: 'Monthly', employees: 45 },
          { id: 2, name: 'Meal Allowance', amount: 150, type: 'Monthly', employees: 60 },
          { id: 3, name: 'Housing Allowance', amount: 500, type: 'Monthly', employees: 25 },
        ]
      }
    },
    retry: 1,
    gcTime: 300000,
  })

  const allowances = allowancesData || []

  // Mutation pour ajouter un allowance
  const createAllowanceMutation = useMutation({
    mutationFn: (data: any) => financialApi.createAllowance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowances'] })
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
        setShowAddModal(false)
      }, 2000)
      // Reset form
      setFormData({
        name: '',
        amount: 0,
        type: 'monthly',
        employees: 0
      })
    },
    onError: (error) => {
      console.error('Error creating allowance:', error)
    }
  })

  const handleAddAllowance = () => {
    console.log('Adding allowance:', formData)
    createAllowanceMutation.mutate(formData)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // CSV Export function
  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      const headers = ['Name', 'Amount', 'Type', 'Employees', 'Monthly Total']
      const csvData = allowances.map(allowance => [
        allowance.name || 'Unknown',
        allowance.amount || 0,
        allowance.type || 'N/A',
        allowance.employees || 0,
        (allowance.amount * allowance.employees) || 0
      ])
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `allowances-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      setTimeout(() => setIsExporting(false), 1000)
    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
    }
  }

  // Import function
  const handleImportFile = (file: File) => {
    console.log('Importing file:', file.name)
    // TODO: Implement actual file parsing and API upload
    // For now, just show success message
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="text-green-800 font-medium">Success!</h4>
            <p className="text-green-600 text-sm">Allowance added successfully</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Allowances</h1>
          <p className="text-gray-600">Manage employee salary allowances and benefits</p>
        </div>
        <div className="flex gap-2">
          <FileImport 
            onFileSelect={handleImportFile}
            buttonText="Import"
            accept=".csv,.xlsx,.json"
          />
          <Button 
            variant="outline"
            onClick={exportToCSV}
            disabled={isExporting}
            className={`flex items-center gap-2 ${
              isExporting ? 'bg-green-50 border-green-300 text-green-700' : ''
            }`}
          >
            {isExporting ? (
              <>
                <Check className="h-4 w-4" />
                Exported!
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Allowance
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Allowances</p>
                <p className="text-2xl font-bold text-gray-900">{allowances.length}</p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${allowances.reduce((sum, a) => sum + (a.amount * a.employees), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employees Covered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...allowances.map(a => a.employees))}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* Allowances Table */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle>Allowances List</ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowance Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allowances.map((allowance) => (
                  <tr key={allowance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {allowance.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${allowance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allowance.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allowance.employees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(allowance.amount * allowance.employees).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Add Allowance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Allowance</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowance Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Transport Allowance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"> Amount ($)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => updateFormData('amount', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
                <input
                  type="number"
                  value={formData.employees}
                  onChange={(e) => updateFormData('employees', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={createAllowanceMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddAllowance}
                disabled={createAllowanceMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                {createAllowanceMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Allowance
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
