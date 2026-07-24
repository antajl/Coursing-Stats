import { useMemo, useState } from 'react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import {
  TOOLBAR_CHIP,
  TOOLBAR_CHIP_ACTIVE,
  TOOLBAR_CHIP_IDLE,
  TOOLBAR_FILTER_OPTION_ROW,
  TOOLBAR_FILTER_OPTION_ROW_ACTIVE,
  TOOLBAR_FILTER_SEARCH,
  TOOLBAR_FILTER_SECTION_LABEL,
  TOOLBAR_FILTER_YEAR_CHIP,
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
  const [breedQuery, setBreedQuery] = useState('')

  const sortedYears = useMemo(
    () => [...yearValues].map(String).sort((a, b) => Number(b) - Number(a)),
    [yearValues]
  )

  const filteredBreeds = useMemo(() => {
    const q = breedQuery.trim().toLowerCase()
    if (!q) return breedValues
    return breedValues.filter((breed) => breed.toLowerCase().includes(q))
  }, [breedValues, breedQuery])

  const hasActiveFilters =
    (Boolean(filterYear) && filterYear !== currentSeason) ||
    filterBreed ||
    searchQuery ||
    filterMinStarts ||
    filterScoreFrom ||
    filterSpeedFrom

  const hasPanelFilters =
    (Boolean(filterYear) && filterYear !== currentSeason) ||
    Boolean(filterBreed) ||
    Boolean(filterMinStarts) ||
    Boolean(filterScoreFrom) ||
    Boolean(filterSpeedFrom)

  const panelFilterCount = useMemo(() => {
    let n = 0
    if (filterYear && filterYear !== currentSeason) n += 1
    if (filterBreed) n += 1
    if (filterMinStarts) n += 1
    if (filterScoreFrom) n += 1
    if (filterSpeedFrom) n += 1
    return n
  }, [filterYear, currentSeason, filterBreed, filterMinStarts, filterScoreFrom, filterSpeedFrom])

  const thresholdCount = [filterMinStarts, filterScoreFrom, filterSpeedFrom].filter(Boolean).length
  const thresholdsOpenDefault = thresholdCount > 0

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
        onSpeedFromChange,
        currentSeason,
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
      currentSeason,
    ]
  )

  const handleYearSelect = (year: string) => {
    onYearChange(filterYear === year ? '' : year)
  }

  const handleBreedSelect = (breed: string) => {
    onBreedChange(filterBreed === breed ? '' : breed)
  }

  return (
    <div className="mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="pr-28 md:pr-32"
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
            <div className="flex max-w-full flex-wrap items-center gap-1.5">
              <ToolbarFiltersDropdown
                active={hasPanelFilters}
                activeCount={panelFilterCount}
                fillContent
                panelClassName="md:h-[min(440px,72vh)] md:max-h-none md:w-[min(520px,calc(100vw-2rem))]"
                onReset={() => {
                  setBreedQuery('')
                  onResetPanelFilters()
                }}
                label="Фильтры"
              >
                <div className="flex min-h-0 flex-1 flex-col gap-3">
                  <div className="shrink-0">
                    <p className={TOOLBAR_FILTER_SECTION_LABEL}>Год</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => onYearChange('')}
                        aria-pressed={!filterYear}
                        className={`${TOOLBAR_FILTER_YEAR_CHIP} ${
                          !filterYear ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
                        }`}
                      >
                        Все
                      </button>
                      {sortedYears.map((year) => {
                        const selected = filterYear === year
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => handleYearSelect(year)}
                            aria-pressed={selected}
                            className={`${TOOLBAR_FILTER_YEAR_CHIP} ${
                              selected ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
                            }`}
                          >
                            {year}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_148px]">
                    <div className="flex min-h-0 flex-col">
                      <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                      <input
                        type="search"
                        value={breedQuery}
                        onChange={(e) => setBreedQuery(e.target.value)}
                        placeholder="Найти породу…"
                        className={`${TOOLBAR_FILTER_SEARCH} mb-2 shrink-0`}
                        autoComplete="off"
                      />
                      <div
                        className="min-h-0 flex-1 space-y-0.5 overflow-y-auto rounded-lg border border-old-money-200/70 bg-white/70 p-1 dark:border-charcoal-600 dark:bg-charcoal-900/40"
                        role="listbox"
                        aria-label="Порода"
                      >
                        {filteredBreeds.length === 0 ? (
                          <p className="px-2.5 py-3 text-xs text-charcoal-500 dark:text-charcoal-400">
                            Ничего не найдено
                          </p>
                        ) : (
                          filteredBreeds.map((breed) => {
                            const selected = filterBreed === breed
                            return (
                              <button
                                key={breed}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => handleBreedSelect(breed)}
                                className={`${TOOLBAR_FILTER_OPTION_ROW} ${
                                  selected ? TOOLBAR_FILTER_OPTION_ROW_ACTIVE : ''
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                                    selected
                                      ? 'border-camel-600 bg-camel-500'
                                      : 'border-old-money-300 bg-white dark:border-charcoal-500 dark:bg-charcoal-800'
                                  }`}
                                  aria-hidden
                                >
                                  {selected ? (
                                    <span className="h-1.5 w-1.5 rounded-full bg-charcoal-900" />
                                  ) : null}
                                </span>
                                <span className="min-w-0 flex-1 whitespace-normal">{breed}</span>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>

                    {/* Desktop: пороги всегда справа. Mobile: аккордеон снизу. */}
                    <div className="hidden min-h-0 flex-col md:flex">
                      <p className={TOOLBAR_FILTER_SECTION_LABEL}>
                        Пороги
                        {thresholdCount > 0 ? (
                          <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-camel-500/90 px-1 text-[10px] font-bold tabular-nums normal-case tracking-normal text-charcoal-900">
                            {thresholdCount}
                          </span>
                        ) : null}
                      </p>
                      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto rounded-lg border border-old-money-200/70 bg-white/70 p-2.5 dark:border-charcoal-600 dark:bg-charcoal-900/40">
                        <label className="block space-y-1">
                          <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
                            Старты
                          </span>
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="мин."
                            value={filterMinStarts}
                            onChange={(e) => onMinStartsChange(e.target.value.replace(/[^0-9]/g, ''))}
                            className={TOOLBAR_NUMBER_INPUT}
                          />
                        </label>
                        <label className="block space-y-1">
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
                            className={TOOLBAR_NUMBER_INPUT}
                          />
                        </label>
                        <label className="block space-y-1">
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
                            className={TOOLBAR_NUMBER_INPUT}
                          />
                        </label>
                      </div>
                    </div>

                    <details
                      className="group shrink-0 rounded-lg border border-old-money-200/80 bg-white/50 md:hidden dark:border-charcoal-600 dark:bg-charcoal-900/30"
                      defaultOpen={thresholdsOpenDefault}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold text-charcoal-700 marker:content-none dark:text-charcoal-200 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2">
                          Пороги
                          {thresholdCount > 0 ? (
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-camel-500/90 px-1 text-[10px] font-bold tabular-nums text-charcoal-900">
                              {thresholdCount}
                            </span>
                          ) : (
                            <span className="font-medium text-old-money-400 dark:text-charcoal-500">редко</span>
                          )}
                        </span>
                        <span className="text-old-money-400 transition-transform group-open:rotate-180 dark:text-charcoal-500">
                          ▾
                        </span>
                      </summary>
                      <div className="space-y-2.5 border-t border-old-money-200/70 px-3 py-3 dark:border-charcoal-600/70">
                        <label className="block space-y-1">
                          <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
                            Мин. старты
                          </span>
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="например 5"
                            value={filterMinStarts}
                            onChange={(e) => onMinStartsChange(e.target.value.replace(/[^0-9]/g, ''))}
                            className={TOOLBAR_NUMBER_INPUT}
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
                            Мин. индекс CS
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            placeholder="например 70"
                            value={filterScoreFrom}
                            onChange={(e) => onScoreFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                            className={TOOLBAR_NUMBER_INPUT}
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
                            Мин. скорость (рейсинг)
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            placeholder="км/ч"
                            value={filterSpeedFrom}
                            onChange={(e) => onSpeedFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                            className={TOOLBAR_NUMBER_INPUT}
                          />
                        </label>
                      </div>
                    </details>
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
