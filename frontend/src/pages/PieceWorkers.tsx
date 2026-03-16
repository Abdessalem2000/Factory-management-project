import { useState } from 'react'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { Plus, Users, Wrench, DollarSign } from 'lucide-react'

export function PieceWorkers() {
  const [workers] = useState([
    { id: 1, name: 'Robert Brown', specialty: 'Assembly', piecesCompleted: 150, rate: 2.50, status: 'Active' },
    { id: 2, name: 'Lisa Davis', specialty: 'Welding', piecesCompleted: 89, rate: 3.25, status: 'Active' },
    { id: 3, name: 'Tom Wilson', specialty: 'Painting', piecesCompleted: 120, rate: 2.00, status: 'Active' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Piece Workers</h1>
          <p className="text-gray-600">Manage piece-rate workers and production tracking</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Worker
        </Button>
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
    </div>
  )
}
