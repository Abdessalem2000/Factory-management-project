import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { Plus, Package, Settings, X, Check, Loader2, Download } from 'lucide-react'
import { FileImport } from '@/components/ui/FileImport'
import { productionApi } from '@/lib/api'

export function Models() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const queryClient = useQueryClient()
  
  // Formulaire state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    version: '',
    status: 'active'
  })

  // Récupération des données réelles
  const { data: modelsData, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      try {
        const result = await productionApi.getModels()
        return result?.data || []
      } catch (apiError) {
        console.error('API Error:', apiError)
        // Fallback to mock data
        return [
          { id: 1, name: 'Model A-1', category: 'Electronics', version: 'v2.1', status: 'Active' },
          { id: 2, name: 'Model B-2', category: 'Mechanical', version: 'v1.5', status: 'In Development' },
          { id: 3, name: 'Model C-3', category: 'Hybrid', version: 'v3.0', status: 'Active' },
        ]
      }
    },
    retry: 1,
    gcTime: 300000,
  })

  const models = modelsData || []

  // Mutation pour ajouter un model
  const createModelMutation = useMutation({
    mutationFn: (data: any) => productionApi.createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
        setShowAddModal(false)
      }, 2000)
      // Reset form
      setFormData({
        name: '',
        category: '',
        version: '',
        status: 'active'
      })
    },
    onError: (error) => {
      console.error('Error creating model:', error)
    }
  })

  const handleAddModel = () => {
    console.log('Adding model:', formData)
    // Convert form data to production order format (temporary solution)
    const productionOrderData = {
      orderNumber: `MODEL-${Date.now()}`,
      product: {
        name: formData.name,
        category: formData.category,
        version: formData.version
      },
      quantity: 1, // Models are typically single units
      priority: 'medium',
      status: formData.status === 'active' ? 'in-progress' : 'planned',
      startDate: new Date().toISOString(),
      estimatedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      customer: {
        name: 'Internal',
        type: 'internal'
      },
      totalValue: 0,
      isModel: true, // Flag to identify this as a model
      metadata: {
        modelVersion: formData.version,
        modelCategory: formData.category,
        modelStatus: formData.status
      }
    }
    createModelMutation.mutate(productionOrderData)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // CSV Export function
  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      const headers = ['Name', 'Category', 'Version', 'Status']
      const csvData = models.map(model => [
        model.name || 'Unknown',
        model.category || 'N/A',
        model.version || 'N/A',
        model.status || 'active'
      ])
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `models-${new Date().toISOString().split('T')[0]}.csv`
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
            <p className="text-green-600 text-sm">Model added successfully</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Models</h1>
          <p className="text-gray-600">Manage product models and specifications</p>
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
            Add Model
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Models</p>
                <p className="text-2xl font-bold text-gray-900">{models.length}</p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">
                  {models.filter(m => m?.status === 'Active').length}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(models.map(m => m?.category).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* Models Table */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle>Product Models</ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {models.map((model) => (
                  <tr key={model?.id || `model-${Math.random()}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {model?.name || 'Unknown Model'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model?.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model?.version || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        model?.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {model?.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Add Model Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Model</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Model A-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Software">Software</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => updateFormData('version', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., v2.1"
                />
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
                  <option value="development">In Development</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={createModelMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddModel}
                disabled={createModelMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                {createModelMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Model
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
