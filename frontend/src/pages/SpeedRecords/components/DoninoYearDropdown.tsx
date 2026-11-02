import { ChevronDown } from 'lucide-react'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'

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
  return (
    <ModernDropdown
      trigger={
        <button
          type="button"
          className={toolbarPillTriggerClass(isYearActive)}
        >
          {yearTriggerLabel}
          <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </button>
      }
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width="120px"
    >
      <div className="max-h-60 overflow-y-auto p-1" role="menu">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onSelectYear('')
            onOpenChange(false)
          }}
          className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
            filterYears.length === 0
              ? 'bg-camel-100 text-camel-950 font-semibold'
              : 'text-charcoal-700 hover:bg-camel-100'
          }`}
        >
          Все года
        </button>
        {sortedYears.map((year) => {
          const active = filterYears.length === 1 && filterYears[0] === year
          return (
            <button
              key={year}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelectYear(year)
                onOpenChange(false)
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? 'bg-camel-100 text-camel-950 font-semibold'
                  : 'text-charcoal-700 hover:bg-camel-100'
              }`}
            >
              {year}
            </button>
          )
        })}
      </div>
    </ModernDropdown>
  )
}
