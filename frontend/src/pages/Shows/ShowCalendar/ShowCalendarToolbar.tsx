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
  filterLcOnly: boolean
  onLcOnlyChange: (value: boolean) => void
  onClearQuickPreset: () => void
  availableMonths?: Set<string>
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
  filterLcOnly,
  onLcOnlyChange,
  onClearQuickPreset,
  availableMonths,
}: ShowCalendarToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full min-w-0">
      {/* Строка 1 на мобилке: Поиск + О календаре */}
      <div className="flex items-center gap-2 w-full sm:hidden">
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Название, город, клуб, НКП…"
          className="flex-1 min-w-0"
        />
        <div className="shrink-0">
          <ShowCalendarHint />
        </div>
      </div>

      {/* Поиск на десктопе */}
      <div className="hidden sm:flex min-w-0 items-center gap-2 sm:w-auto">
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Название, город, клуб, НКП…"
          className="w-auto min-w-[200px]"
        />
      </div>

      {/* Строка 2 на мобилке / продолжение на десктопе */}
      <div className="flex max-w-full flex-wrap items-center gap-1.5">
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

        <button
          type="button"
          onClick={() => onLcOnlyChange(!filterLcOnly)}
          className={`${TOOLBAR_CHIP} ${
            filterLcOnly ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
          }`}
          aria-pressed={filterLcOnly}
          title={filterLcOnly ? 'Показаны только выставки с опубликованными протоколами' : 'Показаны все выставки года (включая расписание)'}
        >
          {filterLcOnly ? 'С протоколом' : 'Все события'}
        </button>
      </div>
    </div>
  )
}
