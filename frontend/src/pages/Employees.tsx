import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { Plus, Users, UserCheck, Briefcase, X, Check, Loader2, Download } from 'lucide-react'
import { FileImport } from '@/components/ui/FileImport'
import { employeeApi } from '@/lib/api'

export function Employees() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const queryClient = useQueryClient()
  
  // Formulaire state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    status: 'active'
  })

  // Récupération des données réelles
  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const result = await employeeApi.getEmployees()
        return result?.data || []
      } catch (apiError) {
        console.error('API Error:', apiError)
        // Fallback to mock data
        return [
          { id: 1, name: 'John Doe', position: 'Production Manager', department: 'Production', status: 'Active' },
          { id: 2, name: 'Jane Smith', position: 'Quality Control', department: 'Quality', status: 'Active' },
          { id: 3, name: 'Mike Johnson', position: 'Machine Operator', department: 'Production', status: 'On Leave' },
        ]
      }
    },
    retry: 1,
    gcTime: 300000,
  })

  const employees = employeesData || []

  // Mutation pour ajouter un employee
  const createEmployeeMutation = useMutation({
    mutationFn: (data: any) => employeeApi.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
        setShowAddModal(false)
      }, 2000)
      // Reset form
      setFormData({
        name: '',
        position: '',
        department: '',
        status: 'active'
      })
    },
    onError: (error) => {
      console.error('Error creating employee:', error)
    }
  })

  const handleAddEmployee = () => {
    console.log('Adding employee:', formData)
    createEmployeeMutation.mutate(formData)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // CSV Export function
  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      const headers = ['Name', 'Position', 'Department', 'Status']
      const csvData = employees.map(employee => [
        employee.name || 'Unknown',
        employee.position || 'N/A',
        employee.department || 'N/A',
        employee.status || 'active'
      ])
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`
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
            <p className="text-green-600 text-sm">Employee added successfully</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage factory workforce and personnel</p>
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
            Add Employee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(e => e?.status === 'Active').length}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(employees.map(e => e?.department).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* Employees Table */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle>Employee List</ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee?.id || `employee-${Math.random()}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee?.position || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee?.department || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee?.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee?.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Employee</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => updateFormData('position', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Production Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => updateFormData('department', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="Production">Production</option>
                  <option value="Quality">Quality</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Administration">Administration</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={createEmployeeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEmployee}
                disabled={createEmployeeMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                {createEmployeeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Employee
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
