import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ERPCardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
}

export function ERPCard({ 
  children, 
  className, 
  padding = 'md',
  shadow = 'sm',
  border = true 
}: ERPCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  return (
    <div 
      className={cn(
        'bg-white rounded-xl',
        paddingClasses[padding],
        shadowClasses[shadow],
        border && 'border border-gray-200',
        className
      )}
    >
      {children}
    </div>
  )
}

export function ERPCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('pb-4 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

export function ERPCardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

export function ERPCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}
