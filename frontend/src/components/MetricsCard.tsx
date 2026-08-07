import type { ReactNode } from 'react'
import MetricItem from './MetricItem'

interface MetricsCardProps {
  title: string
  metrics: Array<{ value: string; label: string; highlighted?: boolean }>
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function MetricsCard({
  title,
  metrics,
  variant = 'secondary',
  className = '',
}: MetricsCardProps) {
  const variantStyles = {
    primary: 'bg-gradient-to-br from-camel-100/95 to-cream-50/95 dark:from-camel-900/80 dark:to-charcoal-800/80 shadow-2xl',
    secondary: 'bg-gradient-to-br from-camel-100/95 to-cream-50/95 dark:from-camel-900/80 dark:to-charcoal-800/80',
  }

  const paddingStyles = {
    primary: 'p-5 md:p-6',
    secondary: 'p-4 md:p-5',
  }

  return (
    <div className={`${variantStyles[variant]} ${paddingStyles[variant]} backdrop-blur-md rounded-xl border border-camel-200/50 dark:border-camel-700/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-center mb-3 pb-3 border-b border-charcoal-200 dark:border-charcoal-700">
        <p className={`font-semibold text-camel-700 dark:text-camel-300 ${variant === 'primary' ? 'text-base' : 'text-sm'}`}>
          {title}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-0 items-center relative">
        {metrics.map((metric, index) => (
          <MetricItem
            key={`${metric.label}-${index}`}
            value={metric.value}
            label={metric.label}
            highlighted={metric.highlighted}
          />
        ))}
        {metrics.length > 1 && (
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-charcoal-200 dark:bg-charcoal-700" />
        )}
        {metrics.length > 2 && (
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-charcoal-200 dark:bg-charcoal-700" />
        )}
      </div>
    </div>
  )
}
