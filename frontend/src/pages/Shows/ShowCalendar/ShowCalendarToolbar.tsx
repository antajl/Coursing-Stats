import { ChevronDown, X } from 'lucide-react'
import MonthYearDropdown from '../../../components/toolbar/MonthYearDropdown'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import QuickBreedBar, {
  SHOW_CANDIDATE_BREEDS,
  type QuickBreedItem,
} from '../../TopDogs/QuickBreedBar'
import ShowCalendarHint from './ShowCalendarHint'
import { formatBreedName } from '../../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'

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
  filterBreed: string
  onBreedChange: (breed: string) => void
  breedValues: string[]
  candidateBreeds?: QuickBreedItem[]
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
  filterBreed,
  onBreedChange,
  breedValues,
  candidateBreeds = SHOW_CANDIDATE_BREEDS,
  onClearQuickPreset,
  availableMonths,
}: ShowCalendarToolbarProps) {
  const isYearNonDefault = Boolean(filterYear) && filterYear !== currentSeason
  const hasActiveFilters = Boolean(isYearNonDefault || filterMonth || searchQuery || filterBreed)

  const handleReset = () => {
    onSearchChange('')
    onYearChange(currentSeason)
    onMonthChange('')
    onBreedChange('')
    onClearQuickPreset()
  }

  return (
    <div className="w-full min-w-0">
      {/* Мобильная строка (32px): Поиск + Год/Месяц + Порода + (X) + [Количество] + (i) */}
      <div className="flex md:hidden items-center gap-1.5 w-full min-w-0">
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

        <div className="shrink-0">
          <BreedSearchDropdown
            breeds={breedValues}
            selectedBreed={filterBreed}
            onSelect={onBreedChange}
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(Boolean(filterBreed))}`}
              >
                <span className="truncate max-w-[85px]">
                  {filterBreed ? formatBreedName(filterBreed) : 'Порода'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
          />
        </div>

        <div className="ml-auto shrink-0 flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="shrink-0">
            <ShowCalendarHint compact />
          </div>
        </div>
      </div>

      {/* Десктопная строка: Поиск + Год/Месяц + (i) + [Количество] + Сброс + Разделитель + QuickBreedBar edge-to-edge */}
      <div className="hidden md:flex md:items-center gap-2 w-full min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
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

          <div className="shrink-0">
            <ShowCalendarHint />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="cs-glass-pill shrink-0 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold !text-charcoal-600 hover:!text-charcoal-900 transition-colors cursor-pointer select-none"
              title="Сбросить все фильтры"
            >
              <X className="h-3.5 w-3.5" />
              <span>Сбросить</span>
            </button>
          )}
        </div>

        {/* Разделитель между левыми контролами и породами */}
        <div
          className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5"
          aria-hidden="true"
        />

        {/* Выбор породы QuickBreedBar — всегда самая правая часть фильтра до края страницы */}
        <div className="flex-1 min-w-0">
          <QuickBreedBar
            selectedBreed={filterBreed}
            onSelectBreed={onBreedChange}
            breedValues={breedValues}
            candidateBreeds={candidateBreeds}
          />
        </div>
      </div>
    </div>
  )
}
