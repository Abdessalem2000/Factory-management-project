import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps {
  className?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  label?: string
  id?: string
}

export function Input({ 
  className, 
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  label,
  id
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          'block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          className
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export { Input }

export default Input
