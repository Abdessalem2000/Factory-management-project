import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Star, Mail, Phone } from 'lucide-react'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { supplierApi } from '@/lib/api'
import { Supplier, SupplierFilters } from '@/types'

export function SupplierManagement() {
  const [filters, setFilters] = useState<SupplierFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers', filters, searchTerm],
    queryFn: () => supplierApi.getSuppliers({ ...filters, search: searchTerm }).then(res => res.data),
  })

  const suppliers = suppliersData?.data || []

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
              value={filters.status || ''}
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
              value={filters.rating || ''}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Suppliers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading...</div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No suppliers found
          </div>
        ) : (
          suppliers.map((supplier: Supplier) => (
            <ERPCard key={supplier._id} className="hover:shadow-lg transition-shadow">
              <ERPCardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <ERPCardTitle className="text-lg">{supplier.name}</ERPCardTitle>
                    <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(supplier.status)}`}>
                    {supplier.status}
                  </span>
                </div>
              </ERPCardHeader>
              <ERPCardContent>
                <div className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(supplier.rating)}</div>
                    <span className="text-sm text-gray-600">({supplier.rating}.0)</span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{supplier.phone}</span>
                    </div>
                  </div>

                  {/* Categories */}
                  {supplier.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {supplier.categories.slice(0, 2).map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                        >
                          {category}
                        </span>
                      ))}
                      {supplier.categories.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          +{supplier.categories.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Payment Terms */}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Payment Terms:</span> {supplier.paymentTerms}
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
          ))
        )}
      </div>
    </div>
  )
}
