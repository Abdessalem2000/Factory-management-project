import { useState } from 'react'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { Plus, DollarSign, Calendar, Users } from 'lucide-react'

export function SalaryAllowances() {
  const [allowances] = useState([
    { id: 1, name: 'Transport Allowance', amount: 200, type: 'Monthly', employees: 45 },
    { id: 2, name: 'Meal Allowance', amount: 150, type: 'Monthly', employees: 60 },
    { id: 3, name: 'Housing Allowance', amount: 500, type: 'Monthly', employees: 25 },
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Allowances</h1>
          <p className="text-gray-600">Manage employee salary allowances and benefits</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Allowance
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Allowances</p>
                <p className="text-2xl font-bold text-gray-900">{allowances.length}</p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${allowances.reduce((sum, a) => sum + (a.amount * a.employees), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>

        <ERPCard>
          <ERPCardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employees Covered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...allowances.map(a => a.employees))}
                </p>
              </div>
            </div>
          </ERPCardContent>
        </ERPCard>
      </div>

      {/* Allowances Table */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle>Allowances List</ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowance Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allowances.map((allowance) => (
                  <tr key={allowance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {allowance.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${allowance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allowance.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allowance.employees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(allowance.amount * allowance.employees).toLocaleString()}
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
