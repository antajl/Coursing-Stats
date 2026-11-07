import { ChevronDown } from 'lucide-react'
import MonthYearDropdown from '../../../components/toolbar/MonthYearDropdown'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import type { DogsIndexEntry } from '../../../lib/competingBreeds'
import CitySearchDropdown, { type CityOption } from './CitySearchDropdown'
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
  filterCity?: string
  onCityChange?: (city: string) => void
  cities?: CityOption[]
  breedValues: string[]
  candidateBreeds?: QuickBreedItem[]
  dogIndex?: DogsIndexEntry[]
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
  filterCity = '',
  onCityChange,
  cities = [],
  breedValues,
  candidateBreeds = SHOW_CANDIDATE_BREEDS,
  dogIndex,
  onClearQuickPreset,
  availableMonths,
}: ShowCalendarToolbarProps) {
  return (
    <div className="w-full min-w-0">
      {/* Мобильная строка (32px): Поиск + Год/Месяц + Локация + Порода + (i) */}
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

        {cities.length > 0 && onCityChange && (
          <CitySearchDropdown
            cities={cities}
            selectedCity={filterCity}
            onSelect={onCityChange}
            compact
          />
        )}

        <div className="shrink-0">
          <BreedSearchDropdown
            breeds={breedValues}
            dogIndex={dogIndex}
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

        <div className="ml-auto shrink-0 flex items-center">
          <ShowCalendarHint compact />
        </div>
      </div>

      {/* Десктопная строка: Поиск + Год/Месяц + Локация + (i) + Разделитель + QuickBreedBar edge-to-edge */}
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

          {cities.length > 0 && onCityChange && (
            <CitySearchDropdown
              cities={cities}
              selectedCity={filterCity}
              onSelect={onCityChange}
            />
          )}

          <div className="shrink-0">
            <ShowCalendarHint />
          </div>
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
            dogIndex={dogIndex}
            candidateBreeds={candidateBreeds}
          />
        </div>
      </div>
    </div>
  )
}
