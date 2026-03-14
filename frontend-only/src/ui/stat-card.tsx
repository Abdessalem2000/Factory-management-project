import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  className 
}: StatCardProps) {
  return (
    <div className={cn("p-6 bg-white rounded-lg shadow-sm border", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="p-2 bg-gray-100 rounded-full">
            {icon}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-2 flex items-center text-sm">
          <span className={cn(
            "font-medium",
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          )}>
            {changeType === 'increase' ? '↑' : '↓'} {change}%
          </span>
          <span className="ml-2 text-gray-500">from last month</span>
        </div>
      )}
    </div>
  )
}
