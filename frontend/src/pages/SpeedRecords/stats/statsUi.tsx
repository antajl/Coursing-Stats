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
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-5 shadow-md">
      <div className="text-xs uppercase tracking-wide text-old-money-600 mb-2">{label}</div>
      <div
        className={`text-2xl font-bold ${highlight ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-900 dark:text-charcoal-100'}`}
      >
        {value}
      </div>
      {sub && <div className="text-sm text-charcoal-500 mt-1">{sub}</div>}
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
}: {
  title: string
  ranges: { min: number; max: number; label: string }[]
  values: number[]
}) {
  const maxCount = Math.max(
    ...ranges.map((range) => values.filter((v) => v >= range.min && v < range.max).length),
    1
  )
  const total = values.length

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-6 shadow-md">
      <h2 className="text-xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">{title}</h2>
      <div className="space-y-2">
        {ranges.map((range) => {
          const count = values.filter((v) => v >= range.min && v < range.max).length
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={range.label} className="flex items-center gap-4">
              <div className="w-28 text-sm text-right text-charcoal-700 dark:text-charcoal-300">{range.label}</div>
              <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-camel-400 to-camel-600 h-full rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <div className="w-24 text-sm font-semibold">
                {count} <span className="text-charcoal-500 font-normal">({pct.toFixed(1)}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
