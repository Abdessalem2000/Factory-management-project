import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Star, Mail, Phone } from 'lucide-react'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { supplierApi } from '@/lib/api'
import { Supplier, SupplierFilters } from '@/types'

// Helper function for status colors with error protection
const getStatusColor = (status: string) => {
  try {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'blacklisted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  } catch (error) {
    console.error('Error in getStatusColor:', error)
    return 'bg-gray-100 text-gray-800'
  }
}

export function SupplierManagement() {
  const [filters, setFilters] = useState<SupplierFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers', filters, searchTerm],
    queryFn: async () => {
      try {
        const result = await supplierApi.getSuppliers({ ...filters, search: searchTerm })
        return result?.data || { data: [] }
      } catch (apiError) {
        console.error('API Error:', apiError)
        return { data: [] } // Fallback empty data
      }
    },
    retry: 1,
    gcTime: 300000,
  })

  const suppliers = suppliersData?.data || []

  // Debug log to track data
  console.log('Suppliers Data:', { suppliersData, suppliers, isLoading, error })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  try {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
            <p className="text-gray-600">Manage supplier relationships and orders</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <ERPCard>
            <ERPCardContent className="p-4">
              <div className="text-red-600">
                Error loading suppliers: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            </ERPCardContent>
          </ERPCard>
        )}

        {/* Filters */}
        <ERPCard>
          <ERPCardHeader>
            <ERPCardTitle className="text-lg">Filters</ERPCardTitle>
          </ERPCardHeader>
          <ERPCardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="supplier-search"
                    name="supplier-search"
                    placeholder="Search suppliers..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters?.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
              <input
                type="number"
                id="supplier-rating"
                name="supplier-rating"
                min="1"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rating"
                value={filters?.rating || ''}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </ERPCardContent>
        </ERPCard>

        {/* Suppliers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-8">Loading...</div>
          ) : error ? (
            <div className="col-span-full text-center py-8 text-red-600">
              Failed to load suppliers. Please try again.
            </div>
          ) : !suppliers || suppliers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No suppliers found
            </div>
          ) : (
            suppliers.map((supplier: any, index: number) => {
              // Multiple safety checks
              if (!supplier || typeof supplier !== 'object') {
                console.warn(`Invalid supplier at index ${index}:`, supplier)
                return null
              }

              // Safe key generation
              const safeKey = supplier?._id || supplier?.id || `supplier-${index}`

              // Safe data extraction with fallbacks
              const safeName = supplier?.name || supplier?.companyName || 'Unknown Supplier'
              const safeContactPerson = supplier?.contactPerson || supplier?.contact?.name || 'No contact person'
              const safeStatus = supplier?.status || 'Unknown'
              const safeRating = typeof supplier?.rating === 'number' ? supplier.rating : 0
              const safeEmail = supplier?.email || supplier?.contact?.email || 'No email'
              const safePhone = supplier?.phone || supplier?.contact?.phone || 'No phone'
              const safePaymentTerms = supplier?.paymentTerms || supplier?.terms || 'Not specified'
              const safeCategories = Array.isArray(supplier?.categories) ? supplier.categories : []

              return (
                <ERPCard key={safeKey} className="hover:shadow-lg transition-shadow">
                  <ERPCardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <ERPCardTitle className="text-lg">{safeName}</ERPCardTitle>
                        <p className="text-sm text-gray-600">{safeContactPerson}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(safeStatus)}`}>
                        {safeStatus}
                      </span>
                    </div>
                  </ERPCardHeader>
                  <ERPCardContent>
                    <div className="space-y-3">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(safeRating)}</div>
                        <span className="text-sm text-gray-600">({safeRating}.0)</span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{safeEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{safePhone}</span>
                        </div>
                      </div>

                      {/* Categories */}
                      {safeCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {safeCategories.slice(0, 2).map((category: any, catIndex: number) => (
                            <span
                              key={catIndex}
                              className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                            >
                              {category || 'Unknown'}
                            </span>
                          ))}
                          {safeCategories.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              +{safeCategories.length - 2} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Payment Terms */}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Payment Terms:</span> {safePaymentTerms}
                      </div>

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
                  </ERPCardContent>
                </ERPCard>
              )
            })
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error rendering SupplierManagement:', error)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
            <p className="text-gray-600">Manage supplier relationships and orders</p>
          </div>
        </div>
        <ERPCard>
          <ERPCardContent className="p-4">
            <div className="text-red-600">
              An error occurred while loading the supplier management page. Please refresh the page.
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>
    )
  }
}
