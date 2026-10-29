import { X } from 'lucide-react'
import MonthYearDropdown from '../../../components/toolbar/MonthYearDropdown'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import ShowCalendarHint from './ShowCalendarHint'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
} from '../../../lib/toolbar'

export type QuickPreset = 'upcoming30' | null

export interface ShowCalendarToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  currentSeason: string
  sortedYears: string[]
  onYearChange: (year: string) => void
  yearDropdownOpen?: boolean
  onYearDropdownOpenChange?: (open: boolean) => void
  filterMonth: string
  onMonthChange: (month: string) => void
  monthDropdownOpen?: boolean
  onMonthDropdownOpenChange?: (open: boolean) => void
onClearQuickPreset: () => void
  availableMonths?: Set<string>
  totalCount?: number
}

export function ShowCalendarToolbar({
  searchQuery,
  onSearchChange,
  filterYear,
  currentSeason,
  sortedYears,
  onYearChange,
  filterMonth,
  onMonthChange,
  onClearQuickPreset,
  availableMonths,
}: ShowCalendarToolbarProps) {
  const isYearNonDefault = Boolean(filterYear) && filterYear !== currentSeason
  const hasActiveFilters = Boolean(isYearNonDefault || filterMonth || searchQuery)

  const handleReset = () => {
    onSearchChange('')
    onYearChange(currentSeason)
    onMonthChange('')
    onClearQuickPreset()
  }
  return (
    <div className="w-full min-w-0">
      {/* Мобильная строка (32px): Поиск + Год/Месяц + (i) + [Количество справа] */}
      <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0">
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Поиск…"
        />

        <MonthYearDropdown
          selectedYear={filterYear}
          onSelectYear={onYearChange}
          selectedMonth={filterMonth}
          onSelectMonth={onMonthChange}
          sortedYears={sortedYears}
          currentSeason={currentSeason}
          onClearPreset={onClearQuickPreset}
          availableMonthsByYear={availableMonths ? { [filterYear]: availableMonths } : undefined}
        />

        <div className="ml-auto shrink-0 flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {typeof totalCount === 'number' && (
            <span className="text-xs text-charcoal-500 tabular-nums whitespace-nowrap">
              {totalCount} с протоколом
            </span>
          )}

          <div className="shrink-0">
            <ShowCalendarHint compact />
          </div>
        </div>
      </div>

      {/* Десктопная строка: Поиск + Год/Месяц + Сброс + [О календаре справа] */}
      <div className="hidden sm:flex sm:items-center justify-between gap-2 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Название, город, клуб, НКП…"
          />

          <MonthYearDropdown
            selectedYear={filterYear}
            onSelectYear={onYearChange}
            selectedMonth={filterMonth}
            onSelectMonth={onMonthChange}
            sortedYears={sortedYears}
            currentSeason={currentSeason}
            onClearPreset={onClearQuickPreset}
            availableMonthsByYear={availableMonths ? { [filterYear]: availableMonths } : undefined}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-full border border-old-money-200 bg-cream-50 px-3 text-xs font-semibold text-charcoal-600 hover:border-camel-500 hover:text-charcoal-900 hover:bg-cream-100 transition-colors cursor-pointer"
              title="Сбросить все фильтры"
            >
              <X className="h-3.5 w-3.5" />
              <span>Сбросить</span>
            </button>
          )}
        </div>

        <div className="shrink-0 ml-auto">
          <ShowCalendarHint />
        </div>
      </div>
    </div>
  )
}
