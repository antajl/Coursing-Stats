import MonthYearDropdown from '../../../components/toolbar/MonthYearDropdown'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
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
    <>
      <ToolbarSearch
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Название, город, клуб, НКП…"
        className="w-full sm:!w-auto min-w-0 sm:min-w-[200px] max-w-sm"
      />
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
        >
          С протоколом
        </button>
      </div>
    </>
  )
}
