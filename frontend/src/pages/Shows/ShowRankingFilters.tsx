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
} from '../../lib/toolbar'

interface ShowRankingFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  yearValues: string[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  filterGroup: string
  onGroupChange: (value: string) => void
  groupValues: string[]
  onResetFilters: () => void
  onResetPanelFilters: () => void
  dropdownRef?: React.RefObject<HTMLDivElement>
}

export default function ShowRankingFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  yearValues,
  filterBreed,
  onBreedChange,
  breedValues,
  filterGroup,
  onGroupChange,
  groupValues,
  onResetFilters,
  onResetPanelFilters,
  dropdownRef,
}: ShowRankingFiltersProps) {
  const sortedYears = useMemo(
    () => [...yearValues].sort((a, b) => Number(b) - Number(a)),
    [yearValues]
  )

  const hasActiveFilters = Boolean(filterYear) || filterBreed || filterGroup || searchQuery
  const hasPanelFilters = Boolean(filterYear || filterBreed || filterGroup)

  const activeFilterChips = useMemo(() => {
    const chips = []

    if (searchQuery) {
      chips.push(
        <button
          key="search"
          type="button"
          onClick={() => onSearchChange('')}
          className={TOOLBAR_CHIP_ACTIVE}
        >
          Поиск: {searchQuery}
        </button>
      )
    }

    if (filterYear) {
      chips.push(
        <button
          key="year"
          type="button"
          onClick={() => onYearChange('')}
          className={TOOLBAR_CHIP_ACTIVE}
        >
          {filterYear}
        </button>
      )
    }

    if (filterBreed) {
      chips.push(
        <button
          key="breed"
          type="button"
          onClick={() => onBreedChange('')}
          className={TOOLBAR_CHIP_ACTIVE}
        >
          {filterBreed}
        </button>
      )
    }

    if (filterGroup) {
      chips.push(
        <button
          key="group"
          type="button"
          onClick={() => onGroupChange('')}
          className={TOOLBAR_CHIP_ACTIVE}
        >
          {filterGroup}
        </button>
      )
    }

    return chips
  }, [searchQuery, filterYear, filterBreed, filterGroup, onSearchChange, onYearChange, onBreedChange, onGroupChange])

  const handleYearToggle = (year: string) => {
    onYearChange(filterYear === year ? '' : year)
  }

  const handleBreedToggle = (breed: string) => {
    onBreedChange(filterBreed === breed ? '' : breed)
  }

  const handleGroupToggle = (group: string) => {
    onGroupChange(filterGroup === group ? '' : group)
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
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Группа FCI</p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {groupValues.map((group) => (
                      <label key={group} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                        <input
                          type="checkbox"
                          checked={filterGroup === group}
                          onChange={() => handleGroupToggle(group)}
                        />
                        <span className="truncate">{group}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </ToolbarFiltersDropdown>
            </div>
          </>
        }
      />
    </div>
  )
}
