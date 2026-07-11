import { useMemo } from 'react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  TOOLBAR_FILTER_CHECKBOX_ROW,
  TOOLBAR_FILTER_SECTION_LABEL,
  TOOLBAR_NUMBER_INPUT,
} from '../../lib/toolbar'
import { buildTopDogsActiveFilterChips } from '../SpeedRecords/toolbarFilters'

interface TopDogsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  currentSeason: string
  yearValues: (string | number)[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  filterMinStarts: string
  onMinStartsChange: (value: string) => void
  filterScoreFrom: string
  onScoreFromChange: (value: string) => void
  filterSpeedFrom: string
  onSpeedFromChange: (value: string) => void
  onResetFilters: () => void
  onResetPanelFilters: () => void
  dropdownRef?: React.RefObject<HTMLDivElement>
}

export default function TopDogsFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  currentSeason,
  yearValues,
  filterBreed,
  onBreedChange,
  breedValues,
  filterMinStarts,
  onMinStartsChange,
  filterScoreFrom,
  onScoreFromChange,
  filterSpeedFrom,
  onSpeedFromChange,
  onResetFilters,
  onResetPanelFilters,
  dropdownRef,
}: TopDogsFiltersProps) {
  const sortedYears = useMemo(
    () => [...yearValues].map(String).sort((a, b) => Number(b) - Number(a)),
    [yearValues]
  )

  const hasActiveFilters =
    Boolean(filterYear) ||
    filterBreed ||
    searchQuery ||
    filterMinStarts ||
    filterScoreFrom ||
    filterSpeedFrom

  const hasPanelFilters =
    Boolean(filterYear) ||
    filterBreed ||
    filterMinStarts ||
    filterScoreFrom ||
    filterSpeedFrom

  const activeFilterChips = useMemo(
    () =>
      buildTopDogsActiveFilterChips(
        searchQuery,
        filterYear,
        filterBreed,
        filterMinStarts,
        filterScoreFrom,
        filterSpeedFrom,
        onSearchChange,
        onYearChange,
        onBreedChange,
        onMinStartsChange,
        onScoreFromChange,
        onSpeedFromChange
      ),
    [
      searchQuery,
      filterYear,
      filterBreed,
      filterMinStarts,
      filterScoreFrom,
      filterSpeedFrom,
      onSearchChange,
      onYearChange,
      onBreedChange,
      onMinStartsChange,
      onScoreFromChange,
      onSpeedFromChange,
    ]
  )

  const handleYearToggle = (year: string) => {
    onYearChange(filterYear === year ? '' : year)
  }

  const handleBreedToggle = (breed: string) => {
    onBreedChange(filterBreed === breed ? '' : breed)
  }

  return (
    <div className="mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        activeFilterChips={activeFilterChips}
        onClearAllFilters={hasActiveFilters ? onResetFilters : undefined}
        filters={
          <>
            <ToolbarSearch
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Кличка, порода…"
              className="!w-auto min-w-[200px] flex-1 max-w-lg"
            />
            <div className="flex shrink-0 items-center gap-1.5">
              <ToolbarFiltersDropdown
                active={hasPanelFilters}
                onReset={onResetPanelFilters}
                label="Фильтры"
              >
              <div>
                <p className={TOOLBAR_FILTER_SECTION_LABEL}>Год</p>
                <div className="max-h-36 space-y-0.5 overflow-y-auto">
                  {sortedYears.map((year) => (
                    <label key={year} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                      <input
                        type="checkbox"
                        checked={filterYear === year}
                        onChange={() => handleYearToggle(year)}
                      />
                      {year}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                <div className="max-h-36 space-y-0.5 overflow-y-auto">
                  {breedValues.map((breed) => (
                    <label key={breed} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                      <input
                        type="checkbox"
                        checked={filterBreed === breed}
                        onChange={() => handleBreedToggle(breed)}
                      />
                      <span className="truncate">{breed}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className={TOOLBAR_FILTER_SECTION_LABEL}>Пороги</p>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Мин. старты"
                    value={filterMinStarts}
                    onChange={(e) => onMinStartsChange(e.target.value.replace(/[^0-9]/g, ''))}
                    className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Мин. индекс CS"
                    value={filterScoreFrom}
                    onChange={(e) => onScoreFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                    className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Мин. скорость (рейсинг)"
                    value={filterSpeedFrom}
                    onChange={(e) => onSpeedFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                    className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                  />
                </div>
              </div>
            </ToolbarFiltersDropdown>
              <button
                type="button"
                onClick={() => onYearChange(filterYear === currentSeason ? '' : currentSeason)}
                aria-pressed={filterYear === currentSeason}
                className={`${TOOLBAR_CHIP} ${filterYear === currentSeason ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}`}
              >
                Сезон {currentSeason}
              </button>
            </div>
          </>
        }
      />
    </div>
  )
}
