import React from 'react'

interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  height?: number
  maxValue?: number
}

export function SimpleBarChart({ data, height = 200, maxValue }: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-3" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">{item.label}</span>
            <span className="text-white font-medium">{item.value.toLocaleString()}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                item.color || 'bg-gradient-to-r from-blue-400 to-blue-600'
              }`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

interface SimpleLineChartProps {
  data: Array<{ month: string; income: number; expenses: number; profit: number }>
  height?: number
}

export function SimpleLineChart({ data, height = 300 }: SimpleLineChartProps) {
  const maxIncome = Math.max(...data.map(d => d.income))
  const maxExpenses = Math.max(...data.map(d => d.expenses))
  const maxProfit = Math.max(...data.map(d => Math.abs(d.profit)))
  const max = Math.max(maxIncome, maxExpenses, maxProfit)

  return (
    <div className="space-y-4" style={{ height }}>
      <div className="grid grid-cols-1 gap-4">
        {data.map((item, index) => (
          <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-white">{item.month}</span>
              <span className={`text-lg font-bold ${item.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {item.profit >= 0 ? '+' : ''}{item.profit.toLocaleString()} DZD
              </span>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-300">
                  <span>Income</span>
                  <span className="text-green-400 font-bold">+{item.income.toLocaleString()} DZD</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((item.income / max) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-300">
                  <span>Expenses</span>
                  <span className="text-red-400 font-bold">-{item.expenses.toLocaleString()} DZD</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((item.expenses / max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SimplePieChartProps {
  data: Array<{ label: string; value: number; color: string }>
  size?: number
}

export function SimplePieChart({ data, size = 200 }: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="space-y-4">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 relative">
          <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-gray-300">{item.label}</span>
            </div>
            <span className="text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
