import { useMemo, useState } from 'react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import ModernDropdown from '../../components/ui/ModernDropdown'
import {
  TOOLBAR_FILTER_SECTION_LABEL,
  TOOLBAR_NUMBER_INPUT,
} from '../../lib/toolbar'

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
  dogIndex?: import('../../lib/competingBreeds').DogsIndexEntry[]
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
  dogIndex,
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
  const [isOpen, setIsOpen] = useState(false)
  
  const sortedYears = useMemo(
    () => [...yearValues].map(String).sort((a, b) => Number(b) - Number(a)),
    [yearValues]
  )

  const hasActiveFilters =
    (filterYear !== '' && filterYear !== currentSeason) ||
    filterBreed ||
    searchQuery ||
    filterMinStarts ||
    filterScoreFrom ||
    filterSpeedFrom

  const hasThresholdFilters = filterMinStarts || filterScoreFrom || filterSpeedFrom
  const thresholdCount = [filterMinStarts, filterScoreFrom, filterSpeedFrom].filter(Boolean).length

  const handleBreedSelect = (breed: string) => {
    onBreedChange(filterBreed === breed ? '' : breed)
  }

  const breedTrigger = (
    <button
      type="button"
      className={`inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-semibold transition-colors gap-1.5 ${
        filterBreed
          ? 'border-camel-500 bg-camel-500 text-charcoal-900 dark:border-camel-400 dark:bg-camel-600 dark:text-cream-50'
          : 'border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700'
      }`}
      title={filterBreed || 'Порода'}
      aria-label={filterBreed ? `Порода: ${filterBreed}` : 'Порода'}
    >
      <span className="shrink-0">Порода</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5 transition-transform shrink-0" aria-hidden>
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  )

  const yearTrigger = (
    <button
      type="button"
      className={`inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors gap-1.5 ${
        filterYear && filterYear !== currentSeason
          ? 'border-camel-500 bg-camel-500 text-charcoal-900 dark:border-camel-400 dark:bg-camel-600 dark:text-cream-50'
          : 'border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700'
      }`}
    >
      {filterYear || 'Год'}
      <svg xmlns="http://www.w3.org/0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5 transition-transform" aria-hidden>
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  )

  return (
    <div className="mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="pr-28 md:pr-32"
        filters={
          <>
            <ToolbarSearch
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Кличка, порода…"
              className="!w-auto min-w-[200px] max-w-xs"
            />
            <div className="flex max-w-full flex-wrap items-center gap-1.5">
              {/* Year dropdown */}
              <ModernDropdown
                trigger={yearTrigger}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                width="120px"
              >
                <div className="p-1 min-w-[100px]">
                  <div className="max-h-60 overflow-y-auto" role="menu">
                    <button
                      role="menuitem"
                      onClick={() => {
                        onYearChange('')
                        setIsOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
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
                        role="menuitem"
                        onClick={() => {
                          onYearChange(year)
                          setIsOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          filterYear === year
                            ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                            : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </ModernDropdown>

              {/* Breed dropdown */}
              <BreedSearchDropdown
                breeds={breedValues}
                selectedBreed={filterBreed}
                onSelect={handleBreedSelect}
                trigger={breedTrigger}
                dogIndex={dogIndex}
              />

              {/* General filters dropdown (only thresholds now) */}
              {hasThresholdFilters && (
                <ToolbarFiltersDropdown
                  active={hasThresholdFilters}
                  activeCount={thresholdCount}
                  fillContent
                  panelClassName="md:w-[min(300px,calc(100vw-2rem))]"
                  onReset={() => {
                    onMinStartsChange('')
                    onScoreFromChange('')
                    onSpeedFromChange('')
                  }}
                  label="Пороги"
                >
                  <div className="flex flex-col gap-3 p-2">
                    <label className="block space-y-0.5">
                      <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
                        Участия
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="мин."
                        value={filterMinStarts}
                        onChange={(e) => onMinStartsChange(e.target.value.replace(/[^0-9]/g, ''))}
                        className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                      />
                    </label>
                    <label className="block space-y-0.5">
                      <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
                        CS
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        placeholder="мин."
                        value={filterScoreFrom}
                        onChange={(e) => onScoreFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                        className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                      />
                    </label>
                    <label className="block space-y-0.5">
                      <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
                        Скорость
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        placeholder="км/ч"
                        value={filterSpeedFrom}
                        onChange={(e) => onSpeedFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                        className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                      />
                    </label>
                  </div>
                </ToolbarFiltersDropdown>
              )}
            </div>
          </>
        }
      />
    </div>
  )
}
