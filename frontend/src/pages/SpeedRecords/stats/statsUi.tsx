import { ChevronDown } from 'lucide-react'
import { TOOLBAR_FILTER_BTN, TOOLBAR_FILTER_PANEL } from '../../../lib/toolbar'

export function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-cream-300 dark:border-charcoal-600 p-5">
      <div className="text-xs uppercase tracking-wide text-old-money-600 dark:text-old-money-400 mb-2">{label}</div>
      <div
        className={`text-2xl font-bold ${highlight ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-900 dark:text-charcoal-100'}`}
      >
        {value}
      </div>
      {sub && <div className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">{sub}</div>}
    </div>
  )
}

export function FilterDropdown({
  label,
  open,
  onToggle,
  options,
  selected,
  onChange,
  formatOption,
}: {
  label: string
  open: boolean
  onToggle: () => void
  options: string[]
  selected: string[]
  onChange: (value: string) => void
  formatOption?: (v: string) => string
}) {
  return (
    <div className="relative min-w-[96px]">
      <button type="button" onClick={onToggle} className={`${TOOLBAR_FILTER_BTN} w-full`}>
        <span className="truncate">{label}</span>
      </button>
      {open && (
        <div className={`${TOOLBAR_FILTER_PANEL} w-full`}>
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-cream-50 dark:hover:bg-charcoal-700"
            >
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => onChange(opt)} />
              {formatOption ? formatOption(opt) : opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function DistributionChart({
  title,
  ranges,
  values,
  compact = false,
  hideTitle = false,
  bare = false,
}: {
  title: string
  ranges: { min: number; max: number; label: string }[]
  values: number[]
  compact?: boolean
  hideTitle?: boolean
  bare?: boolean
}) {
  const maxCount = Math.max(
    ...ranges.map((range) => values.filter((v) => v >= range.min && v < range.max).length),
    1
  )
  const total = values.length

  return (
    <div
      className={
        bare
          ? ''
          : `bg-white dark:bg-charcoal-800 rounded-xl border border-cream-300 dark:border-charcoal-600 ${
              compact ? 'p-3 md:p-4' : 'p-6'
            }`
      }
    >
      {!hideTitle && (
        <h2
          className={`font-bold text-charcoal-900 dark:text-charcoal-100 mb-4 ${
            compact ? 'text-base' : 'text-xl'
          }`}
        >
          {title}
        </h2>
      )}
      <div className="space-y-2">
        {ranges.map((range) => {
          const count = values.filter((v) => v >= range.min && v < range.max).length
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={range.label} className="flex items-center gap-2 md:gap-4">
              <div
                className={`shrink-0 text-right text-charcoal-700 dark:text-charcoal-300 ${
                  compact ? 'w-14 text-xs' : 'w-28 text-sm'
                }`}
              >
                {range.label}
              </div>
              <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-5 md:h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-camel-400 to-camel-600 h-full rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <div className={`shrink-0 font-semibold text-charcoal-800 dark:text-charcoal-200 ${compact ? 'w-16 text-xs' : 'w-24 text-sm'}`}>
                {count}{' '}
                <span className="text-charcoal-500 dark:text-charcoal-400 font-normal">({pct.toFixed(1)}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CollapsibleDistributionChart({
  title,
  ranges,
  values,
}: {
  title: string
  ranges: { min: number; max: number; label: string }[]
  values: number[]
}) {
  return (
    <details className="donino-stats-chart mb-4">
      <summary className="donino-stats-chart__summary">
        <span>{title}</span>
        <ChevronDown className="donino-stats-chart__chevron" strokeWidth={2} aria-hidden />
      </summary>
      <div className="donino-stats-chart__body">
        <DistributionChart title={title} ranges={ranges} values={values} compact hideTitle bare />
      </div>
    </details>
  )
}
