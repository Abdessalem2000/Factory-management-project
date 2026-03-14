import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { workerApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export function WorkerManagement() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: workersData, isLoading, error } = useQuery({
    queryKey: ['workers', searchTerm],
    queryFn: () => workerApi.getWorkers({ search: searchTerm }).then(res => res.data),
  })

  const workers = workersData?.data || []

  if (isLoading) return <div className="p-8">Loading workers...</div>
  
  if (error) return <div className="p-8">Error loading workers: {error.message}</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Worker Management</h1>
          <p className="text-gray-600">Manage workers, assignments, and payments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Worker
        </Button>
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
    </div>
  )
}
