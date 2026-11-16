import { useMemo, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import ModernDropdown from './ModernDropdown'

export interface JudgeYearDropdownProps {
  /** Currently selected year, or '' for all years */
  value: string
  /** Callback when year changes ('' for all years) */
  onChange: (year: string) => void
  /** List of available years with competitions/exhibitions */
  availableYears: string[]
  /** Label for reset / all years option (defaults to 'Все года') */
  allLabel?: string
  /** Additional classes for trigger */
  className?: string
  /** Dropdown menu alignment relative to trigger ('left' | 'right') */
  align?: 'left' | 'right'
}

export default function JudgeYearDropdown({
  value,
  onChange,
  availableYears,
  allLabel = 'Все года',
  className = '',
  align = 'right',
}: JudgeYearDropdownProps) {
  const [open, setOpen] = useState(false)

  const sortedYears = useMemo(() => {
    const list = [...new Set(availableYears)].filter((y): y is string => Boolean(y && String(y).trim()))
    return list.sort((a, b) => b.localeCompare(a))
  }, [availableYears])

  const options = useMemo(() => {
    if (value && !sortedYears.includes(value)) {
      return [value, ...sortedYears].sort((a, b) => b.localeCompare(a))
    }
    return sortedYears
  }, [sortedYears, value])

  const displayLabel = value || allLabel
  const hasActiveYear = Boolean(value)

  const trigger = (
    <div
      className={`h-9 sm:h-10 min-w-[124px] sm:min-w-[132px] inline-flex items-center justify-between gap-2.5 rounded-xl border bg-white px-3 sm:px-3.5 text-xs sm:text-sm font-medium transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-200 ${
        open
          ? 'border-camel-500 ring-2 ring-camel-100 text-charcoal-900 shadow-2xs'
          : hasActiveYear
            ? 'border-camel-300/90 text-charcoal-900 shadow-2xs hover:border-camel-400'
            : 'border-old-money-200 text-charcoal-800 shadow-2xs hover:border-camel-400'
      } ${className}`}
      aria-label={`Период: ${displayLabel}`}
      title={`Период: ${displayLabel}`}
    >
      <span className="tabular-nums font-semibold text-charcoal-900 truncate">
        {displayLabel}
      </span>
      <ChevronDown
        className={`h-3.5 w-3.5 shrink-0 text-charcoal-400 transition-transform duration-200 ${
          open ? 'rotate-180 text-camel-700' : ''
        }`}
        aria-hidden="true"
      />
    </div>
  )

  return (
    <ModernDropdown
      trigger={trigger}
      isOpen={open}
      onOpenChange={setOpen}
      width="156px"
      align={align}
      portal
      closeOnScroll
      className="p-1 space-y-0.5"
    >
      {(close) => (
        <div role="listbox" aria-label="Период" className="space-y-0.5 text-xs">
          {/* Option: Все года */}
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange('')
              close()
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 sm:py-2 rounded-lg text-xs transition-colors cursor-pointer ${
              !value
                ? 'bg-camel-100/90 text-camel-950 font-semibold'
                : 'text-charcoal-700 hover:bg-cream-100/80 font-medium'
            }`}
          >
            <span>{allLabel}</span>
            {!value && (
              <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" aria-hidden="true" />
            )}
          </button>

          {/* Option years */}
          {options.length > 0 && (
            <div className="max-h-60 overflow-y-auto no-scrollbar space-y-0.5 pt-0.5 border-t border-old-money-100/70">
              {options.map((year) => {
                const isSelected = value === year
                return (
                  <button
                    key={year}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(year)
                      close()
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 sm:py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-camel-100/90 text-camel-950 font-semibold'
                        : 'text-charcoal-700 hover:bg-cream-100/80 font-medium'
                    }`}
                  >
                    <span className="tabular-nums">{year}</span>
                    {isSelected && (
                      <Check
                        className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </ModernDropdown>
  )
}
