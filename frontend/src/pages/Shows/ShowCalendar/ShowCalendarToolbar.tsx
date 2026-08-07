import { ChevronDown } from 'lucide-react'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  toolbarPillTriggerClass,
} from '../../../lib/toolbar'
import { MONTH_FILTER_OPTIONS } from '../../Events/eventListUtils'

export type QuickPreset = 'upcoming30' | null

export interface ShowCalendarToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  currentSeason: string
  sortedYears: string[]
  onYearChange: (year: string) => void
  yearDropdownOpen: boolean
  onYearDropdownOpenChange: (open: boolean) => void
  filterMonth: string
  onMonthChange: (month: string) => void
  monthDropdownOpen: boolean
  onMonthDropdownOpenChange: (open: boolean) => void
  filterLcOnly: boolean
  onLcOnlyChange: (value: boolean) => void
  onClearQuickPreset: () => void
}

export function ShowCalendarToolbar({
  searchQuery,
  onSearchChange,
  filterYear,
  currentSeason,
  sortedYears,
  onYearChange,
  yearDropdownOpen,
  onYearDropdownOpenChange,
  filterMonth,
  onMonthChange,
  monthDropdownOpen,
  onMonthDropdownOpenChange,
  filterLcOnly,
  onLcOnlyChange,
  onClearQuickPreset,
}: ShowCalendarToolbarProps) {
  const monthTriggerLabel =
    MONTH_FILTER_OPTIONS.find((m) => m.value === filterMonth)?.label || 'Месяц'

  return (
    <>
      <ToolbarSearch
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Название, город, клуб, НКП…"
      />
      <div className="flex max-w-full flex-wrap items-center gap-1.5">
        <ModernDropdown
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(filterYear !== currentSeason)}
            >
              {!filterYear ? 'Все года' : filterYear !== currentSeason ? filterYear : 'Год'}
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          }
          isOpen={yearDropdownOpen}
          onOpenChange={onYearDropdownOpenChange}
          width="120px"
        >
          <div className="max-h-60 overflow-y-auto p-1" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onYearChange('')
                onClearQuickPreset()
                onYearDropdownOpenChange(false)
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                !filterYear
                  ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                  : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
              }`}
            >
              Все года
            </button>
            {sortedYears.map((year) => (
              <button
                key={year}
                type="button"
                role="menuitem"
                onClick={() => {
                  onYearChange(year)
                  onClearQuickPreset()
                  onYearDropdownOpenChange(false)
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  filterYear === year
                    ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                    : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </ModernDropdown>

        <ModernDropdown
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(Boolean(filterMonth))}
            >
              {filterMonth ? monthTriggerLabel : 'Месяц'}
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          }
          isOpen={monthDropdownOpen}
          onOpenChange={onMonthDropdownOpenChange}
          width="160px"
        >
          <div className="max-h-60 overflow-y-auto p-1" role="menu">
            {MONTH_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value || 'all'}
                type="button"
                role="menuitem"
                onClick={() => {
                  onMonthChange(opt.value)
                  onClearQuickPreset()
                  onMonthDropdownOpenChange(false)
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  filterMonth === opt.value
                    ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                    : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </ModernDropdown>

        <button
          type="button"
          onClick={() => onLcOnlyChange(!filterLcOnly)}
          className={`${TOOLBAR_CHIP} ${
            filterLcOnly ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
          }`}
          aria-pressed={filterLcOnly}
        >
          С протоколом
        </button>
      </div>
    </>
  )
}
