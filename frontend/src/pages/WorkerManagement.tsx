import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, DollarSign, Calendar, X, Check, Loader2, Download } from 'lucide-react'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { workerApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileImport } from '@/components/ui/FileImport'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/ToastContainer'

export function WorkerManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()
  const toast = useToast()
  
  // Formulaire state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    employeeId: '',
    hourlyRate: 0,
    hireDate: '',
    status: 'active',
    skills: [] as string[],
    currency: 'DZD',
    paymentType: 'hourly'
  })

  const { data: workersData, isLoading, error } = useQuery({
    queryKey: ['workers', searchTerm],
    queryFn: () => workerApi.getWorkers({ search: searchTerm }).then(res => res.data),
  })

  const workers = workersData?.data || []

  // Enhanced Validation function - PREVENTS CRASHES!
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // Safe validation with null checks
    if (!formData?.firstName?.trim()) errors.firstName = 'First name is required'
    if (!formData?.lastName?.trim()) errors.lastName = 'Last name is required'
    if (!formData?.email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData?.phone?.trim()) errors.phone = 'Phone is required'
    if (!formData?.position?.trim()) errors.position = 'Position is required'
    if (!formData?.department?.trim()) errors.department = 'Department is required'
    if (!formData?.employeeId?.trim()) errors.employeeId = 'Employee ID is required'
    if (!formData?.hourlyRate || formData.hourlyRate <= 0) errors.hourlyRate = 'Hourly rate must be greater than 0'
    if (!formData?.hireDate) errors.hireDate = 'Hire date is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Mutation pour ajouter un worker avec timeout et meilleure gestion d'erreur
  const createWorkerMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🚀 Données envoyées:', data)
      
      // Créer un timeout de 5 secondes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Le serveur met du temps à répondre, réessayez'))
        }, 5000)
      })
      
      // Appel API normal
      const apiPromise = workerApi.createWorker(data)
      
      // Race entre l'API et le timeout
      return Promise.race([apiPromise, timeoutPromise])
    },
    onSuccess: (response) => {
      console.log('✅ Succès API:', response)
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      toast.success('Worker added successfully!')
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
        setShowAddModal(false)
      }, 1500)
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        employeeId: '',
        hourlyRate: 0,
        hireDate: '',
        status: 'active',
        skills: [],
        currency: 'DZD',
        paymentType: 'hourly'
      })
      setFormErrors({})
    },
    onError: (error: any) => {
      console.error('❌ Erreur API:', error)
      let errorMessage = 'Failed to add worker'
      
      if (error.message === 'Le serveur met du temps à répondre, réessayez') {
        errorMessage = '⏱️ Le serveur met du temps à répondre, réessayez'
      } else if (error.response?.data?.message) {
        errorMessage = `❌ ${error.response.data.message}`
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`
      }
      
      toast.error(errorMessage)
    }
  })

  // Enhanced handleAddWorker - PREVENTS CRASHES!
  const handleAddWorker = () => {
    console.log('🔍 Début de la soumission du formulaire')
    
    // SAFE VALIDATION - Prevents crashes!
    if (!validateForm()) {
      toast.warning('Please fill in all required fields correctly')
      return
    }
    
    // SAFE DATA PREPARATION - Prevents crashes!
    const workerData = {
      firstName: formData?.firstName || '',
      lastName: formData?.lastName || '',
      email: formData?.email || '',
      phone: formData?.phone || '',
      position: formData?.position || '',
      department: formData?.department || '',
      employeeId: formData?.employeeId || '',
      hourlyRate: parseFloat(formData?.hourlyRate?.toString() || '0') || 1500,
      hireDate: formData?.hireDate || new Date().toISOString().split('T')[0],
      status: formData?.status || 'active',
      skills: formData?.skills?.length > 0 ? formData.skills : ['General'],
      currency: formData?.currency || 'DZD',
      paymentType: formData?.paymentType || 'hourly'
    }
    
    // VALIDATE PREPARED DATA
    if (!workerData.firstName || !workerData.lastName || !workerData.email) {
      toast.error('Missing required worker information')
      return
    }
    
    console.log('📋 Données préparées pour l\'API:', workerData)
    
    // Afficher toast d'envoi
    toast.info('📤 Envoi en cours...', 10000) // 10 secondes pour le timeout
    
    // Lancer la mutation
    createWorkerMutation.mutate(workerData)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // CSV Export function
  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      const headers = ['Name', 'Email', 'Phone', 'Position', 'Department', 'Salary', 'Hire Date', 'Status']
      const csvData = workers.map(worker => [
        worker.name || 'Unknown',
        worker.email || 'N/A',
        worker.phone || 'N/A',
        worker.position || 'N/A',
        worker.department || 'N/A',
        worker.salary || 0,
        worker.hireDate || 'N/A',
        worker.status || 'active'
      ])
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workers-${new Date().toISOString().split('T')[0]}.csv`
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

  if (isLoading) return <div className="p-8">Loading workers...</div>
  
  if (error) return <div className="p-8">Error loading workers: {error.message}</div>

  return (
    <div className="space-y-6 p-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="text-green-800 font-medium">Success!</h4>
            <p className="text-green-600 text-sm">Worker added successfully</p>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Worker</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.firstName 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Ahmed"
                  required
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.lastName 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Mohamed"
                  required
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.email 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., ahmed@example.com"
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., +213 123 456 789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => updateFormData('position', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Machine Operator"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => updateFormData('department', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Production">Production</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Administration">Administration</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => updateFormData('employeeId', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., EMP001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (DZD) *</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => updateFormData('hourlyRate', parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.hourlyRate 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="3500"
                  min="0"
                  required
                />
                {formErrors.hourlyRate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.hourlyRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => updateFormData('hireDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => updateFormData('paymentType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="salary">Salary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => updateFormData('currency', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DZD">Algerian Dinar (DZD)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={createWorkerMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddWorker}
                disabled={createWorkerMutation.isPending}
                className="flex items-center gap-2"
              >
                {createWorkerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Worker
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Worker Management</h1>
          <p className="text-gray-600">Manage workers, assignments, and payments</p>
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
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Workers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="worker-search"
              name="worker-search"
              placeholder="Search workers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No workers found
          </div>
        ) : (
          workers.map((worker: any) => (
            <Card key={worker._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {worker.firstName} {worker.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{worker.position}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800`}>
                    {worker.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Employee Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="font-medium">{worker.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{worker.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Type:</span>
                      <span className="font-medium capitalize">{worker.paymentType?.replace('_', ' ') || 'hourly'}</span>
                    </div>
                  </div>

                  {/* Rate - Algerian Dinar */}
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        {formatCurrency(worker.hourlyRate || 0, 'DZD')}/hour
                      </div>
                      <div className="text-xs text-blue-700">
                        {worker.currency || 'DZD'}
                      </div>
                    </div>
                  </div>

                  {/* Hire Date */}
                  {worker.hireDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Hired: {formatDate(worker.hireDate)}</span>
                    </div>
                  )}

                  {/* Skills */}
                  {worker.skills && worker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.slice(0, 3).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {worker.skills.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          +{worker.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer 
        toasts={toast.toasts} 
        onRemoveToast={toast.removeToast} 
      />
    </div>
  )
}
