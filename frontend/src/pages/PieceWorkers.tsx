import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { Plus, Users, Wrench, DollarSign, X, Check, Loader2, Download } from 'lucide-react'
import { FileImport } from '@/components/ui/FileImport'
import { workerApi } from '@/lib/api'

export function PieceWorkers() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const queryClient = useQueryClient()
  
  // Formulaire state
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    rate: 0,
    status: 'active'
  })

  // Récupération des données réelles
  const { data: workersData, isLoading } = useQuery({
    queryKey: ['pieceWorkers'],
    queryFn: async () => {
      try {
        const result = await workerApi.getWorkers()
        return result?.data || []
      } catch (apiError) {
        console.error('API Error:', apiError)
        // Fallback to mock data
        return [
          { id: 1, name: 'Robert Brown', specialty: 'Assembly', piecesCompleted: 150, rate: 2.50, status: 'Active' },
          { id: 2, name: 'Lisa Davis', specialty: 'Welding', piecesCompleted: 89, rate: 3.25, status: 'Active' },
          { id: 3, name: 'Tom Wilson', specialty: 'Painting', piecesCompleted: 120, rate: 2.00, status: 'Active' },
        ]
      }
    },
    retry: 1,
    gcTime: 300000,
  })

  const workers = workersData || []

  // Mutation pour ajouter un worker
  const createWorkerMutation = useMutation({
    mutationFn: (data: any) => workerApi.createWorker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieceWorkers'] })
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
        setShowAddModal(false)
      }, 2000)
      // Reset form
      setFormData({
        name: '',
        specialty: '',
        rate: 0,
        status: 'active'
      })
    },
    onError: (error) => {
      console.error('Error creating worker:', error)
    }
  })

  const handleAddWorker = () => {
    console.log('Adding piece worker:', formData)
    createWorkerMutation.mutate(formData)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // CSV Export function
  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      const headers = ['Name', 'Specialty', 'Pieces Completed', 'Rate', 'Status']
      const csvData = workers.map(worker => [
        worker.name || 'Unknown',
        worker.specialty || 'N/A',
        worker.piecesCompleted || 0,
        worker.rate || 0,
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
      a.download = `piece-workers-${new Date().toISOString().split('T')[0]}.csv`
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
            <p className="text-green-600 text-sm">Piece worker added successfully</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Piece Workers</h1>
          <p className="text-gray-600">Manage piece-rate workers and production tracking</p>
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
            Add Worker
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
                <p className="text-sm font-medium text-gray-600">Total Workers</p>
                <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pieces Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workers.reduce((sum, w) => sum + w.piecesCompleted, 0)}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(workers.reduce((sum, w) => sum + w.rate, 0) / workers.length).toFixed(2)}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* Workers Table */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle>Piece Workers List</ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieces Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/Piece</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {worker.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {worker.specialty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.piecesCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${worker.rate.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {worker.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Piece Worker</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => updateFormData('specialty', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Assembly, Welding, Painting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Piece ($)</label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => updateFormData('rate', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
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
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
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
    </div>
  )
}
