import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps {
  children: ReactNode
  className?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function Select({ 
  children, 
  className, 
  value,
  onChange,
  placeholder,
  disabled = false
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={cn(
        'block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
        disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
        className
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
}

export default Select

interface SelectOptionProps {
  value: string
  children: ReactNode
  disabled?: boolean
}

export function SelectOption({ value, children, disabled }: SelectOptionProps) {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  )
}
