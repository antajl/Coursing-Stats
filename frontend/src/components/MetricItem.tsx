interface MetricItemProps {
  value: string
  label: string
  highlighted?: boolean
}

export default function MetricItem({ value, label, highlighted = false }: MetricItemProps) {
  return (
    <div className="flex flex-col items-center px-4 md:px-6">
      <div className={`text-lg md:text-xl font-bold tabular-nums text-camel-600 dark:text-camel-300 leading-none whitespace-nowrap ${highlighted ? 'text-xl md:text-2xl' : ''}`}>
        {value}
      </div>
      <div className="text-xs text-charcoal-600 dark:text-charcoal-400 mt-1">
        {label}
      </div>
    </div>
  )
}
