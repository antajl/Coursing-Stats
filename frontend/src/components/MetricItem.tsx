interface MetricItemProps {
  value: string
  label: string
  highlighted?: boolean
}

export default function MetricItem({ value, label, highlighted = false }: MetricItemProps) {
  return (
    <div className="flex flex-col items-center px-1.5 sm:px-2.5 md:px-3 lg:px-4 xl:px-5">
      <div className={`text-lg md:text-xl font-bold tabular-nums text-camel-600 leading-none whitespace-nowrap ${highlighted ? 'text-xl md:text-2xl' : ''}`}>
        {value}
      </div>
      <div className="text-[11px] sm:text-xs text-charcoal-600 mt-1 whitespace-nowrap">
        {label}
      </div>
    </div>
  )
}
