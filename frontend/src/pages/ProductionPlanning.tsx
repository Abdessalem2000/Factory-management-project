import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { productionPlanningApi } from '@/lib/api'
import { 
  Calendar, 
  Clock, 
  Users, 
  Package, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

interface ProductionPlan {
  id: string
  productName: string
  quantity: number
  startDate: string
  endDate: string
  status: 'planned' | 'in-progress' | 'completed' | 'delayed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedWorkers: number
  materials: Array<{
    name: string
    quantity: number
    unit: string
  }>
  progress: number
  notes: string
}

interface ResourceAllocation {
  id: string
  resourceType: 'machine' | 'worker' | 'material'
  resourceName: string
  allocatedTo: string
  allocationDate: string
  utilizationRate: number
  capacity: number
}

export function ProductionPlanning() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null)
  const [newPlan, setNewPlan] = useState<Partial<ProductionPlan>>({
    productName: '',
    quantity: 0,
    startDate: '',
    endDate: '',
    status: 'planned',
    priority: 'medium',
    assignedWorkers: 0,
    materials: [],
    progress: 0,
    notes: ''
  })

  const queryClient = useQueryClient()

  const { data: productionPlans, isLoading } = useQuery({
    queryKey: ['production-plans', selectedTimeRange],
    queryFn: async () => {
      const response = await productionPlanningApi.getProductionPlans(selectedTimeRange)
      return response?.data || []
    }
  })

  const { data: resourceAllocations } = useQuery({
    queryKey: ['resource-allocations'],
    queryFn: async () => {
      const response = await productionPlanningApi.getResourceAllocations()
      return response?.data || []
    }
  })

  const { data: capacityMetrics } = useQuery({
    queryKey: ['capacity-metrics'],
    queryFn: async () => {
      const response = await productionPlanningApi.getCapacityMetrics()
      return response?.data || {}
    }
  })

  const createPlanMutation = useMutation({
    mutationFn: async (plan: ProductionPlan) => {
      return await productionPlanningApi.createProductionPlan(plan)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] })
      setShowCreateModal(false)
      setNewPlan({
        productName: '',
        quantity: 0,
        startDate: '',
        endDate: '',
        status: 'planned',
        priority: 'medium',
        assignedWorkers: 0,
        materials: [],
        progress: 0,
        notes: ''
      })
    }
  })

  const updatePlanMutation = useMutation({
    mutationFn: async (plan: ProductionPlan) => {
      return await productionPlanningApi.updateProductionPlan(plan.id, plan)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] })
      setEditingPlan(null)
    }
  })

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await productionPlanningApi.deleteProductionPlan(planId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20'
      case 'in-progress': return 'text-blue-400 bg-blue-400/20'
      case 'delayed': return 'text-red-400 bg-red-400/20'
      default: return 'text-yellow-400 bg-yellow-400/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/20'
      case 'high': return 'text-orange-400 bg-orange-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-400'
    if (rate >= 75) return 'text-yellow-400'
    return 'text-green-400'
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading production planning...</div>
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
            Production Planning
          </h1>
          <p className="text-gray-300 text-lg">Plan and optimize your production schedule</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </Select>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Production Plan
          </Button>
        </div>

        {/* Capacity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Capacity</CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{capacityMetrics.totalCapacity || 0}</div>
              <p className="text-xs text-gray-300">Units per month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Utilization Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getUtilizationColor(capacityMetrics.utilizationRate || 0)}`}>
                {capacityMetrics.utilizationRate || 0}%
              </div>
              <p className="text-xs text-gray-300">Current utilization</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Plans</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{productionPlans?.filter(p => p.status === 'in-progress').length || 0}</div>
              <p className="text-xs text-gray-300">Currently in production</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Bottlenecks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{capacityMetrics.bottlenecks || 0}</div>
              <p className="text-xs text-gray-300">Identified issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Production Plans */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Production Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productionPlans?.map((plan: ProductionPlan) => (
                <div key={plan.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{plan.productName}</h3>
                      <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                          {plan.status.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                          {plan.priority}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="block text-gray-400">Quantity:</span>
                          <span className="font-medium text-white">{plan.quantity.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Workers:</span>
                          <span className="font-medium text-white">{plan.assignedWorkers}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Start:</span>
                          <span className="font-medium text-white">{formatDate(plan.startDate)}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">End:</span>
                          <span className="font-medium text-white">{formatDate(plan.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingPlan(plan)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deletePlanMutation.mutate(plan.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white font-medium">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {plan.materials && plan.materials.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-400">Materials: </span>
                      {plan.materials.map((material, index) => (
                        <span key={index} className="text-white ml-2">
                          {material.name} ({material.quantity} {material.unit})
                          {index < plan.materials.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {plan.notes && (
                    <div className="mt-2 text-sm text-gray-300">
                      <span className="text-gray-400">Notes: </span>
                      {plan.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Allocations */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Resource Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resourceAllocations?.map((allocation: ResourceAllocation) => (
                <div key={allocation.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{allocation.resourceName}</h4>
                      <p className="text-sm text-gray-300">Type: {allocation.resourceType}</p>
                      <p className="text-sm text-gray-300">Allocated to: {allocation.allocatedTo}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getUtilizationColor(allocation.utilizationRate)}`}>
                        {allocation.utilizationRate}%
                      </div>
                      <p className="text-sm text-gray-300">Utilization</p>
                      <p className="text-xs text-gray-400">Capacity: {allocation.capacity}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          allocation.utilizationRate >= 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                          allocation.utilizationRate >= 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-r from-green-400 to-green-600'
                        }`}
                        style={{ width: `${allocation.utilizationRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPlan) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPlan ? 'Edit Production Plan' : 'Create Production Plan'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                <Input
                  value={editingPlan ? editingPlan.productName : newPlan.productName}
                  onChange={(e) => editingPlan ? 
                    setEditingPlan({...editingPlan, productName: e.target.value}) :
                    setNewPlan({...newPlan, productName: e.target.value})
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                  <Input
                    type="number"
                    value={editingPlan ? editingPlan.quantity : newPlan.quantity}
                    onChange={(e) => editingPlan ? 
                      setEditingPlan({...editingPlan, quantity: parseInt(e.target.value)}) :
                      setNewPlan({...newPlan, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assigned Workers</label>
                  <Input
                    type="number"
                    value={editingPlan ? editingPlan.assignedWorkers : newPlan.assignedWorkers}
                    onChange={(e) => editingPlan ? 
                      setEditingPlan({...editingPlan, assignedWorkers: parseInt(e.target.value)}) :
                      setNewPlan({...newPlan, assignedWorkers: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={editingPlan ? editingPlan.startDate : newPlan.startDate}
                    onChange={(e) => editingPlan ? 
                      setEditingPlan({...editingPlan, startDate: e.target.value}) :
                      setNewPlan({...newPlan, startDate: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={editingPlan ? editingPlan.endDate : newPlan.endDate}
                    onChange={(e) => editingPlan ? 
                      setEditingPlan({...editingPlan, endDate: e.target.value}) :
                      setNewPlan({...newPlan, endDate: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <Select
                    value={editingPlan ? editingPlan.status : newPlan.status}
                    onChange={(e) => editingPlan ? 
                      setEditingPlan({...editingPlan, status: e.target.value as any}) :
                      setNewPlan({...newPlan, status: e.target.value as any})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <Select
                    value={editingPlan ? editingPlan.priority : newPlan.priority}
                    onChange={(e) => editingPlan ? 
                      setEditingPlan({...editingPlan, priority: e.target.value as any}) :
                      setNewPlan({...newPlan, priority: e.target.value as any})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Progress (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editingPlan ? editingPlan.progress : newPlan.progress}
                  onChange={(e) => editingPlan ? 
                    setEditingPlan({...editingPlan, progress: parseInt(e.target.value)}) :
                    setNewPlan({...newPlan, progress: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={editingPlan ? editingPlan.notes : newPlan.notes}
                  onChange={(e) => editingPlan ? 
                    setEditingPlan({...editingPlan, notes: e.target.value}) :
                    setNewPlan({...newPlan, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white h-24 resize-none"
                  placeholder="Enter any additional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingPlan(null)
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingPlan) {
                    updatePlanMutation.mutate(editingPlan)
                  } else {
                    createPlanMutation.mutate(newPlan as ProductionPlan)
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
