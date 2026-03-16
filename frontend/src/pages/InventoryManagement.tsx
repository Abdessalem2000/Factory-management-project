import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { inventoryApi } from '@/lib/api'
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Clock,
  Truck,
  Calculator
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  unitPrice: number
  supplier: string
  lastRestocked: string
  location: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock'
  consumptionRate: number
  reorderPoint: number
  leadTime: number
}

interface StockMovement {
  id: string
  itemId: string
  itemName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  date: string
  performedBy: string
  reference: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  rating: number
  leadTime: number
  reliability: number
}

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [showStockMovementModal, setShowStockMovementModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    sku: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: '',
    unitPrice: 0,
    supplier: '',
    lastRestocked: '',
    location: '',
    status: 'in-stock',
    consumptionRate: 0,
    reorderPoint: 0,
    leadTime: 0
  })

  const queryClient = useQueryClient()

  const { data: inventoryItems, isLoading } = useQuery({
    queryKey: ['inventory-items', searchTerm, selectedCategory, selectedStatus],
    queryFn: async () => {
      const response = await inventoryApi.getInventoryItems({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus
      })
      return response?.data || []
    }
  })

  const { data: stockMovements } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const response = await inventoryApi.getStockMovements()
      return response?.data || []
    }
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await inventoryApi.getSuppliers()
      return response?.data || []
    }
  })

  const { data: inventoryMetrics } = useQuery({
    queryKey: ['inventory-metrics'],
    queryFn: async () => {
      const response = await inventoryApi.getInventoryMetrics()
      return response?.data || {}
    }
  })

  const createItemMutation = useMutation({
    mutationFn: async (item: InventoryItem) => {
      return await inventoryApi.createInventoryItem(item)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      setShowCreateModal(false)
      setNewItem({
        name: '',
        sku: '',
        category: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unit: '',
        unitPrice: 0,
        supplier: '',
        lastRestocked: '',
        location: '',
        status: 'in-stock',
        consumptionRate: 0,
        reorderPoint: 0,
        leadTime: 0
      })
    }
  })

  const updateItemMutation = useMutation({
    mutationFn: async (item: InventoryItem) => {
      return await inventoryApi.updateInventoryItem(item.id, item)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      setEditingItem(null)
    }
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await inventoryApi.deleteInventoryItem(itemId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
    }
  })

  const recordStockMovementMutation = useMutation({
    mutationFn: async (movement: StockMovement) => {
      return await inventoryApi.recordStockMovement(movement)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      setShowStockMovementModal(false)
      setSelectedItem(null)
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'text-green-400 bg-green-400/20'
      case 'low-stock': return 'text-yellow-400 bg-yellow-400/20'
      case 'out-of-stock': return 'text-red-400 bg-red-400/20'
      case 'overstock': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStockLevelColor = (current: number, min: number, max: number) => {
    if (current === 0) return 'text-red-400'
    if (current <= min) return 'text-yellow-400'
    if (current >= max) return 'text-blue-400'
    return 'text-green-400'
  }

  const getStockLevelPercentage = (current: number, max: number) => {
    return max > 0 ? Math.min((current / max) * 100, 100) : 0
  }

  const filteredItems = inventoryItems?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  }) || []

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading inventory management...</div>
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
            Inventory Management
          </h1>
          <p className="text-gray-300 text-lg">Track and manage your inventory efficiently</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Items</CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{inventoryMetrics.totalItems || 0}</div>
              <p className="text-xs text-gray-300">Unique SKUs</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{inventoryMetrics.lowStockItems || 0}</div>
              <p className="text-xs text-gray-300">Need attention</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Value</CardTitle>
              <Calculator className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(inventoryMetrics.totalValue || 0, 'DZD')}</div>
              <p className="text-xs text-gray-300">Inventory worth</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{inventoryMetrics.outOfStockItems || 0}</div>
              <p className="text-xs text-gray-300">Critical items</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white w-full md:w-64"
              />
            </div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              <option value="raw-materials">Raw Materials</option>
              <option value="components">Components</option>
              <option value="finished-goods">Finished Goods</option>
              <option value="supplies">Supplies</option>
            </Select>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="overstock">Overstock</option>
            </Select>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Item
          </Button>
        </div>

        {/* Inventory Items */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredItems.map((item: InventoryItem) => (
                <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="block text-gray-400">SKU:</span>
                          <span className="font-medium text-white">{item.sku}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Category:</span>
                          <span className="font-medium text-white">{item.category}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Location:</span>
                          <span className="font-medium text-white">{item.location}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Supplier:</span>
                          <span className="font-medium text-white">{item.supplier}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedItem(item)
                          setShowStockMovementModal(true)
                        }}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"
                        title="Record Stock Movement"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setEditingItem(item)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteItemMutation.mutate(item.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">Stock Level</span>
                        <span className={`text-sm font-medium ${getStockLevelColor(item.currentStock, item.minStock, item.maxStock)}`}>
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            item.currentStock === 0 ? 'bg-red-500' :
                            item.currentStock <= item.minStock ? 'bg-yellow-500' :
                            item.currentStock >= item.maxStock ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${getStockLevelPercentage(item.currentStock, item.maxStock)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Min: {item.minStock}</span>
                        <span>Max: {item.maxStock}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Unit Price:</span>
                        <span className="font-medium text-white">{formatCurrency(item.unitPrice, 'DZD')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Value:</span>
                        <span className="font-medium text-white">{formatCurrency(item.currentStock * item.unitPrice, 'DZD')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Consumption:</span>
                        <span className="font-medium text-white">{item.consumptionRate} {item.unit}/day</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reorder Point:</span>
                        <span className="font-medium text-white">{item.reorderPoint} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lead Time:</span>
                        <span className="font-medium text-white">{item.leadTime} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Restocked:</span>
                        <span className="font-medium text-white">{formatDate(item.lastRestocked)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Movements */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockMovements?.slice(0, 10).map((movement: StockMovement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      movement.type === 'in' ? 'bg-green-500' :
                      movement.type === 'out' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}
                    </div>
                    <div>
                      <div className="font-medium text-white">{movement.itemName}</div>
                      <div className="text-sm text-gray-300">{movement.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      movement.type === 'in' ? 'text-green-400' :
                      movement.type === 'out' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity} {movement.reference}
                    </div>
                    <div className="text-sm text-gray-300">{formatDate(movement.date)}</div>
                    <div className="text-xs text-gray-400">{movement.performedBy}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingItem ? 'Edit Inventory Item' : 'Create Inventory Item'}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
                  <Input
                    value={editingItem ? editingItem.name : newItem.name}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, name: e.target.value}) :
                      setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SKU</label>
                  <Input
                    value={editingItem ? editingItem.sku : newItem.sku}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, sku: e.target.value}) :
                      setNewItem({...newItem, sku: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <Select
                    value={editingItem ? editingItem.category : newItem.category}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, category: e.target.value}) :
                      setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">Select category</option>
                    <option value="raw-materials">Raw Materials</option>
                    <option value="components">Components</option>
                    <option value="finished-goods">Finished Goods</option>
                    <option value="supplies">Supplies</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
                  <Input
                    value={editingItem ? editingItem.unit : newItem.unit}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, unit: e.target.value}) :
                      setNewItem({...newItem, unit: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="e.g., pcs, kg, liters"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Stock</label>
                  <Input
                    type="number"
                    value={editingItem ? editingItem.currentStock : newItem.currentStock}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, currentStock: parseInt(e.target.value)}) :
                      setNewItem({...newItem, currentStock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Stock</label>
                  <Input
                    type="number"
                    value={editingItem ? editingItem.minStock : newItem.minStock}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, minStock: parseInt(e.target.value)}) :
                      setNewItem({...newItem, minStock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Stock</label>
                  <Input
                    type="number"
                    value={editingItem ? editingItem.maxStock : newItem.maxStock}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, maxStock: parseInt(e.target.value)}) :
                      setNewItem({...newItem, maxStock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Unit Price (DZD)</label>
                  <Input
                    type="number"
                    value={editingItem ? editingItem.unitPrice : newItem.unitPrice}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, unitPrice: parseFloat(e.target.value)}) :
                      setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <Input
                    value={editingItem ? editingItem.location : newItem.location}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, location: e.target.value}) :
                      setNewItem({...newItem, location: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="e.g., Warehouse A, Shelf 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reorder Point</label>
                  <Input
                    type="number"
                    value={editingItem ? editingItem.reorderPoint : newItem.reorderPoint}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, reorderPoint: parseInt(e.target.value)}) :
                      setNewItem({...newItem, reorderPoint: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Lead Time (days)</label>
                  <Input
                    type="number"
                    value={editingItem ? editingItem.leadTime : newItem.leadTime}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, leadTime: parseInt(e.target.value)}) :
                      setNewItem({...newItem, leadTime: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Consumption Rate</label>
                  <Input
                    type="number"
                    value={editingItem ? editingItem.consumptionRate : newItem.consumptionRate}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, consumptionRate: parseInt(e.target.value)}) :
                      setNewItem({...newItem, consumptionRate: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Supplier</label>
                <Select
                  value={editingItem ? editingItem.supplier : newItem.supplier}
                  onChange={(e) => editingItem ? 
                    setEditingItem({...editingItem, supplier: e.target.value}) :
                    setNewItem({...newItem, supplier: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select supplier</option>
                  {suppliers?.map((supplier: Supplier) => (
                    <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingItem(null)
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingItem) {
                    updateItemMutation.mutate(editingItem)
                  } else {
                    createItemMutation.mutate(newItem as InventoryItem)
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {editingItem ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockMovementModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Record Stock Movement</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Item</label>
                <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                  {selectedItem.name} ({selectedItem.currentStock} {selectedItem.unit})
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Movement Type</label>
                <Select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  defaultValue=""
                >
                  <option value="">Select type</option>
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                  <option value="adjustment">Adjustment</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                <Input
                  type="number"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                <textarea
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white h-20 resize-none"
                  placeholder="Enter reason for movement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reference</label>
                <Input
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="PO number, invoice, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowStockMovementModal(false)
                  setSelectedItem(null)
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle stock movement
                  setShowStockMovementModal(false)
                  setSelectedItem(null)
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Record Movement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
