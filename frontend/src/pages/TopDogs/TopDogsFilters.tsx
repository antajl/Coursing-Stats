import { useMemo } from 'react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarSegmentControl from '../../components/toolbar/ToolbarSegmentControl'
import {
  TOOLBAR_FILTER_CHECKBOX_ROW,
  TOOLBAR_FILTER_SECTION_LABEL,
  TOOLBAR_NUMBER_INPUT,
} from '../../lib/toolbar'
import { buildTopDogsActiveFilterChips } from '../SpeedRecords/toolbarFilters'

const RANKING_SEGMENTS = [
  { id: 'placement', label: 'По местам' },
  { id: 'score', label: 'По очкам' },
  { id: 'speed', label: 'По скорости' },
]

interface TopDogsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  defaultYear: string
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
  activeTab: string
  onTabChange: (tab: string) => void
  dropdownRef?: React.RefObject<HTMLDivElement>
}

export default function TopDogsFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  defaultYear,
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
  activeTab,
  onTabChange,
  dropdownRef,
}: TopDogsFiltersProps) {
  const sortedYears = useMemo(
    () => [...yearValues].map(String).sort((a, b) => Number(b) - Number(a)),
    [yearValues]
  )

  const hasActiveFilters =
    filterYear !== defaultYear ||
    filterBreed ||
    searchQuery ||
    filterMinStarts ||
    (activeTab === 'score' && filterScoreFrom) ||
    (activeTab === 'speed' && filterSpeedFrom)

  const hasPanelFilters =
    filterYear !== defaultYear ||
    filterBreed ||
    filterMinStarts ||
    (activeTab === 'score' && filterScoreFrom) ||
    (activeTab === 'speed' && filterSpeedFrom)

  const activeFilterChips = useMemo(
    () =>
      buildTopDogsActiveFilterChips(
        searchQuery,
        filterYear,
        filterBreed,
        filterMinStarts,
        filterScoreFrom,
        filterSpeedFrom,
        activeTab,
        defaultYear,
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
      activeTab,
      onSearchChange,
      onYearChange,
      onBreedChange,
      onMinStartsChange,
      onScoreFromChange,
      onSpeedFromChange,
      defaultYear,
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
                  {activeTab === 'score' && (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Мин. очки"
                      value={filterScoreFrom}
                      onChange={(e) => onScoreFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                      className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                    />
                  )}
                  {activeTab === 'speed' && (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Мин. скорость"
                      value={filterSpeedFrom}
                      onChange={(e) => onSpeedFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                      className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                    />
                  )}
                </div>
              </div>
            </ToolbarFiltersDropdown>
            <div className="ml-auto shrink-0">
              <ToolbarSegmentControl
                segments={RANKING_SEGMENTS}
                value={activeTab}
                onChange={onTabChange}
                ariaLabel="Тип рейтинга"
              />
            </div>
          </>
        }
      />
    </div>
  )
}
