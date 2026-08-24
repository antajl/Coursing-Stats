import { useMemo, useState } from 'react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarFilterOptionList from '../../components/toolbar/ToolbarFilterOptionList'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import ModernDropdown from '../../components/ui/ModernDropdown'
import {
  TOOLBAR_FILTER_SECTION_LABEL,
  TOOLBAR_NUMBER_INPUT,
} from '../../lib/toolbar'
import {
  SHOW_AWARD_BADGE,
  SHOW_FILTER_AWARD_KEYS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'

export type ShowAwardMinFilters = Partial<Record<ShowAwardKey, string>>

interface ShowRankingFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  currentSeason: string
  yearValues: string[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  dogIndex?: import('../../lib/competingBreeds').DogsIndexEntry[]
  filterGroup: string
  onGroupChange: (value: string) => void
  groupValues: string[]
  awardMins: ShowAwardMinFilters
  onAwardMinChange: (key: ShowAwardKey, value: string) => void
  onResetFilters: () => void
  onResetPanelFilters: () => void
  dropdownRef?: React.RefObject<HTMLDivElement>
}

export default function ShowRankingFilters({
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
  filterGroup,
  onGroupChange,
  groupValues,
  awardMins,
  onAwardMinChange,
  onResetFilters,
  onResetPanelFilters,
  dropdownRef,
}: ShowRankingFiltersProps) {
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false)
  
  const sortedYears = useMemo(
    () => [...yearValues].sort((a, b) => Number(b) - Number(a)),
    [yearValues],
  )

  const hasAwardMins = SHOW_FILTER_AWARD_KEYS.some((key) => Boolean(awardMins[key]))
  const awardMinCount = SHOW_FILTER_AWARD_KEYS.filter((key) => Boolean(awardMins[key])).length
  const yearIsNonDefault = filterYear !== '' && filterYear !== currentSeason
  const hasActiveFilters =
    yearIsNonDefault || filterBreed || filterGroup || searchQuery || hasAwardMins
  const hasPanelFilters = Boolean(hasAwardMins)

  const panelFilterCount = useMemo(() => {
    let n = 0
    n += awardMinCount
    return n
  }, [awardMinCount])

  const activeFilterChips = useMemo(() => {
    const chips = []

    if (yearIsNonDefault) {
      chips.push({
        key: 'year',
        label: filterYear || 'Все года',
        onRemove: () => onYearChange(''),
      })
    }

    if (filterBreed) {
      chips.push({
        key: 'breed',
        label: filterBreed,
        onRemove: () => onBreedChange(''),
      })
    }

    if (filterGroup) {
      chips.push({
        key: 'group',
        label: filterGroup,
        onRemove: () => onGroupChange(''),
      })
    }

    for (const key of SHOW_FILTER_AWARD_KEYS) {
      if (!awardMins[key]) continue
      chips.push({
        key: `min-${key}`,
        label: `${SHOW_AWARD_BADGE[key]} ≥ ${awardMins[key]}`,
        onRemove: () => onAwardMinChange(key, ''),
      })
    }

    return chips
  }, [
    yearIsNonDefault,
    filterYear,
    filterBreed,
    filterGroup,
    awardMins,
    onYearChange,
    onBreedChange,
    onGroupChange,
    onAwardMinChange,
  ])

  const handleBreedSelect = (breed: string) => {
    onBreedChange(filterBreed === breed ? '' : breed)
  }

  const handleGroupSelect = (group: string) => {
    onGroupChange(filterGroup === group ? '' : group)
  }

  const breedTrigger = (
    <button
      type="button"
      className={`inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors gap-1.5 ${
        filterBreed
          ? 'border-camel-500 bg-camel-500 text-charcoal-900 dark:border-camel-400 dark:bg-camel-600 dark:text-cream-50'
          : 'border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700'
      }`}
    >
      {filterBreed || 'Порода'}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5 transition-transform" aria-hidden>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5 transition-transform" aria-hidden>
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  )

  const groupTrigger = (
    <button
      type="button"
      className={`inline-flex h-8 max-w-[14rem] items-center rounded-full border px-3.5 text-xs font-semibold transition-colors gap-1.5 ${
        filterGroup
          ? 'border-camel-500 bg-camel-500 text-charcoal-900 dark:border-camel-400 dark:bg-camel-600 dark:text-cream-50'
          : 'border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700'
      }`}
      title={filterGroup || undefined}
    >
      <span className="min-w-0 truncate">{filterGroup || 'Группа'}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5 shrink-0 transition-transform" aria-hidden>
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
                isOpen={yearDropdownOpen}
                onOpenChange={setYearDropdownOpen}
                width="120px"
              >
                <div className="p-1 min-w-[100px]">
                  <div className="max-h-60 overflow-y-auto" role="menu">
                    <button
                      role="menuitem"
                      onClick={() => {
                        onYearChange('')
                        setYearDropdownOpen(false)
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
                          setYearDropdownOpen(false)
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

              {/* Group dropdown */}
              {groupValues.length > 0 && (
                <ModernDropdown
                  trigger={groupTrigger}
                  isOpen={groupDropdownOpen}
                  onOpenChange={setGroupDropdownOpen}
                  width="320px"
                >
                  <div className="p-1 min-w-[300px]">
                    <div className="max-h-60 overflow-y-auto" role="menu">
                      <button
                        role="menuitem"
                        onClick={() => {
                          onGroupChange('')
                          setGroupDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        !filterGroup
                          ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                          : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                      }`}
                      >
                        Все группы
                      </button>
                      {groupValues.map((group) => (
                        <button
                          key={group}
                          role="menuitem"
                          onClick={() => {
                            onGroupChange(group)
                            setGroupDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            filterGroup === group
                              ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                              : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>
                </ModernDropdown>
              )}

              {/* Award minimums dropdown */}
              {hasAwardMins && (
                <ToolbarFiltersDropdown
                  active={hasAwardMins}
                  activeCount={awardMinCount}
                  fillContent
                  panelClassName="md:w-[min(300px,calc(100vw-2rem))]"
                  onReset={() => {
                    for (const key of SHOW_FILTER_AWARD_KEYS) {
                      onAwardMinChange(key, '')
                    }
                  }}
                  label="Награды"
                >
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-2">
                    <details
                      className="group shrink-0 rounded-lg border border-old-money-200/80 bg-white/50 dark:border-charcoal-600 dark:bg-charcoal-900/30"
                      defaultOpen={hasAwardMins}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold text-charcoal-700 marker:content-none dark:text-charcoal-200 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2">
                          Награды (минимум)
                          {awardMinCount > 0 ? (
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-camel-500/90 px-1 text-[10px] font-bold tabular-nums text-charcoal-900">
                              {awardMinCount}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-old-money-400 transition-transform group-open:rotate-180 dark:text-charcoal-500">
                          ▾
                        </span>
                      </summary>
                      <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto overflow-x-hidden border-t border-old-money-200/70 px-3 py-3 dark:border-charcoal-600/70">
                        {SHOW_FILTER_AWARD_KEYS.map((key) => (
                          <label key={key} className="block min-w-0 space-y-0.5">
                            <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
                              {SHOW_AWARD_BADGE[key]}
                            </span>
                            <input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              placeholder="мин."
                              value={awardMins[key] || ''}
                              onChange={(e) =>
                                onAwardMinChange(key, e.target.value.replace(/[^0-9]/g, ''))
                              }
                              className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                            />
                          </label>
                        ))}
                      </div>
                    </details>
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
