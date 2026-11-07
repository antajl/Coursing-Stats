import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'
import { sortYearsChronologically } from '../../../components/toolbar/MonthYearDropdown'

interface DoninoYearDropdownProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  sortedYears: string[]
  filterYears: string[]
  yearTriggerLabel: string
  isYearActive: boolean
  onSelectYear: (year: string) => void
}

export function DoninoYearDropdown({
  isOpen,
  onOpenChange,
  sortedYears,
  filterYears,
  yearTriggerLabel,
  isYearActive,
  onSelectYear,
}: DoninoYearDropdownProps) {
  const displayYears = useMemo(() => {
    return sortYearsChronologically(sortedYears)
  }, [sortedYears])

  return (
    <ModernDropdown
      trigger={
        <button
          type="button"
          className={toolbarPillTriggerClass(isYearActive)}
        >
          <span>{yearTriggerLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        </button>
      }
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width="270px"
    >
      {isOpen ? (
      <div className="p-3 text-xs text-charcoal-800 space-y-2.5">
        <button
          type="button"
          onClick={() => {
            onSelectYear('')
            onOpenChange(false)
          }}
          className={`w-full py-1.5 px-3 rounded-lg text-xs transition-colors border text-center cursor-pointer ${
            filterYears.length === 0
              ? 'bg-camel-100 text-camel-950 font-semibold border-camel-600 shadow-xs'
              : 'bg-cream-100/70 hover:bg-camel-100 text-charcoal-700 border-old-money-200/60 font-medium'
          }`}
          title="Показать за все доступные сезоны Донино"
        >
          Все года
        </button>

        <div className="space-y-1">
          <div className="text-[11px] font-medium text-charcoal-500 px-0.5">
            Выберите сезон:
          </div>
          <div
            className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto no-scrollbar p-0.5"
            role="grid"
            aria-label="Годы"
          >
            {displayYears.map((year) => {
              const active = filterYears.length === 1 && filterYears[0] === year
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    onSelectYear(year)
                    onOpenChange(false)
                  }}
                  className={`h-8 rounded-lg text-xs transition-colors tabular-nums font-medium cursor-pointer ${
                    active
                      ? 'bg-camel-100 text-camel-950 font-semibold shadow-xs'
                      : 'bg-cream-100/70 text-charcoal-700 hover:bg-camel-100 hover:text-charcoal-900 border border-old-money-200/60'
                  }`}
                  title={`Сезон ${year}`}
                >
                  {year}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      ) : null}
    </ModernDropdown>
  )
}
