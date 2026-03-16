import { useState } from 'react'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import { Button } from '@/components/ui/Button'
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

// Mock data - sera remplacé par API calls
const rawMaterials = [
  {
    id: 1,
    name: 'Cotton Fabric - Blue',
    reference: 'CF-BLUE-001',
    category: 'fabric',
    currentStock: 45,
    minStockAlert: 100,
    unit: 'meters',
    unitCost: 250,
    supplier: 'Textile Supplier Co.',
    lastRestocked: '2024-03-10',
    location: 'Warehouse A',
    status: 'low_stock'
  },
  {
    id: 2,
    name: 'Zippers - Metal',
    reference: 'ZIP-MET-002',
    category: 'zippers',
    currentStock: 12,
    minStockAlert: 50,
    unit: 'pieces',
    unitCost: 85,
    supplier: 'Hardware Supplies Inc.',
    lastRestocked: '2024-03-08',
    location: 'Warehouse B',
    status: 'low_stock'
  },
  {
    id: 3,
    name: 'Thread - White',
    reference: 'THR-WHT-003',
    category: 'thread',
    currentStock: 8,
    minStockAlert: 25,
    unit: 'rolls',
    unitCost: 45,
    supplier: 'Thread Masters Ltd.',
    lastRestocked: '2024-03-05',
    location: 'Warehouse A',
    status: 'low_stock'
  },
  {
    id: 4,
    name: 'Buttons - Pearl',
    reference: 'BTN-PRL-004',
    category: 'buttons',
    currentStock: 15,
    minStockAlert: 30,
    unit: 'pieces',
    unitCost: 12,
    supplier: 'Button World Co.',
    lastRestocked: '2024-03-12',
    location: 'Warehouse C',
    status: 'low_stock'
  }
]

export function RawMaterials() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low_stock':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'in_stock':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'out_of_stock':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStockPercentage = (current: number, min: number) => {
    return Math.min((current / min) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-gray-500">Manage your factory's raw materials inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
                <p className="text-xs text-gray-500 mt-1">Active items</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
                <p className="text-2xl font-bold text-red-600 mt-1">4</p>
                <p className="text-xs text-red-500 mt-1">Need restocking</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">DZD 2.4M</p>
                <p className="text-xs text-gray-500 mt-1">Inventory value</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suppliers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                <p className="text-xs text-gray-500 mt-1">Active suppliers</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* Filters and Search */}
      <ERPCard>
        <ERPCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="fabric">Fabric</option>
                <option value="thread">Thread</option>
                <option value="buttons">Buttons</option>
                <option value="zippers">Zippers</option>
                <option value="packaging">Packaging</option>
              </select>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Materials Table */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle>Raw Materials Inventory</ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{material.name}</div>
                          <div className="text-sm text-gray-500">{material.reference}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {material.currentStock} {material.unit}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(material.status)}`}>
                            {material.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              getStockPercentage(material.currentStock, material.minStockAlert) < 50 
                                ? 'bg-red-500' 
                                : getStockPercentage(material.currentStock, material.minStockAlert) < 80 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${getStockPercentage(material.currentStock, material.minStockAlert)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {material.minStockAlert} {material.unit}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      DZD {material.unitCost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ERPCardContent>
      </ERPCard>
    </div>
  )
}
