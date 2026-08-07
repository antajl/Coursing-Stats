import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-3 text-charcoal-400 dark:text-charcoal-600">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-charcoal-900 dark:text-charcoal-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-4 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
