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
  totalCoursing?: number
  totalRacing?: number
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
  totalCoursing,
  totalRacing,
}: TopDogsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', 'ranking')
    if (filterYear) url.searchParams.set('year', filterYear)
    else url.searchParams.delete('year')
    if (filterBreed) url.searchParams.set('breed', filterBreed)
    else url.searchParams.delete('breed')
    if (searchQuery) url.searchParams.set('search', searchQuery)
    else url.searchParams.delete('search')
    if (filterMinStarts) url.searchParams.set('minStarts', filterMinStarts)
    else url.searchParams.delete('minStarts')
    if (filterScoreFrom) url.searchParams.set('scoreFrom', filterScoreFrom)
    else url.searchParams.delete('scoreFrom')
    if (filterSpeedFrom) url.searchParams.set('speedFrom', filterSpeedFrom)
    else url.searchParams.delete('speedFrom')

    void navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  
  const sortedYears = useMemo(
    () => [...yearValues].map(String).sort((a, b) => Number(b) - Number(a)),
    [yearValues]
  )

  const hasActiveFilters =
    filterYear !== '' ||
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
          ? 'border-camel-500 bg-camel-500 text-charcoal-900'
          : 'border-old-money-200 bg-cream-50 text-charcoal-700 hover:bg-old-money-50'
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
        filterYear
          ? 'border-camel-500 bg-camel-500 text-charcoal-900'
          : 'border-old-money-200 bg-cream-50 text-charcoal-700 hover:bg-old-money-50'
      }`}
    >
      {filterYear || 'Все года'}
      <svg xmlns="http://www.w3.org/0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5 transition-transform" aria-hidden>
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  )

  return (
    <div className="mb-4" ref={dropdownRef}>
      <PageToolbar
        bare
        filters={
          <>
            <ToolbarSearch
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Кличка, порода…"
              className="w-full sm:!w-auto min-w-0 sm:min-w-[200px] max-w-sm"
            />
            <div className="flex max-w-full flex-wrap items-center gap-1.5 w-full sm:w-auto">
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
                          ? 'bg-camel-500 text-charcoal-900'
                          : 'text-charcoal-700 hover:bg-camel-100'
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
                            ? 'bg-camel-500 text-charcoal-900'
                            : 'text-charcoal-700 hover:bg-camel-100'
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
                      <span className="text-[11px] font-medium text-charcoal-600">
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
                      <span className="text-[11px] font-medium text-charcoal-600">
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
                      <span className="text-[11px] font-medium text-charcoal-600">
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
        trailing={
          <div className="flex items-center gap-2">
            {(totalCoursing !== undefined || totalRacing !== undefined) && (
              <span className="hidden md:inline-flex text-xs text-charcoal-500 font-medium px-2.5 py-1 rounded-full bg-cream-100/70 border border-old-money-200/60">
                {filterBreed ? (
                  <span>{filterBreed}: <strong className="font-semibold text-charcoal-800 tabular-nums">{(totalCoursing ?? 0) + (totalRacing ?? 0)}</strong></span>
                ) : (
                  <span>Сезон {filterYear || currentSeason}: <strong className="font-semibold text-charcoal-800 tabular-nums">{(totalCoursing ?? 0) + (totalRacing ?? 0)}</strong> участников</span>
                )}
              </span>
            )}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-old-money-200/80 bg-cream-50 px-3 text-xs font-semibold text-charcoal-700 hover:bg-old-money-50 hover:text-charcoal-900 transition-all active:scale-95 cursor-pointer"
              title="Скопировать прямую ссылку на этот фильтр"
              aria-label="Скопировать ссылку на рейтинг"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-emerald-700">Скопировано!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal-500">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>Поделиться</span>
                </>
              )}
            </button>
          </div>
        }
      />
    </div>
  )
}
