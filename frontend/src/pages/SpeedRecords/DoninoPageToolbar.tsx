import { useMemo, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import FilterSelect from '../../components/FilterSelect'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import QuickBreedBar from '../TopDogs/QuickBreedBar'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { formatBreedName } from '../../lib/breedMapping'
import { TOOLBAR_NUMBER_INPUT, toolbarPillTriggerClass } from '../../lib/toolbar'
import type { DogsIndexEntry } from '../../lib/competingBreeds'
import { displayBreed } from '../../lib/breedMapping'
import { GROUP_BY_OPTIONS, type GroupBy } from './stats/constants'

interface DoninoPageToolbarProps {
  view: 'table' | 'stats'
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYears: string[]
  filterBreeds: string[]
  filterSexes: string[]
  filterMinSpeed: string
  filterMaxSpeed: string
  filterMinTime: string
  filterMaxTime: string
  onFilterMinSpeedChange: (value: string) => void
  onFilterMaxSpeedChange: (value: string) => void
  onFilterMinTimeChange: (value: string) => void
  onFilterMaxTimeChange: (value: string) => void
  statsGroupBy: GroupBy
  onStatsGroupByChange: (value: GroupBy) => void
  dropdownRef: React.RefObject<HTMLDivElement>
  years: string[]
  breeds: string[]
  sexes: string[]
  onToggleFilter: (type: string, value: string) => void
  onYearChange?: (year: string) => void
  onBreedChange?: (breed: string) => void
  currentSeason?: string
  onClearFilters: () => void
  onClearPanelFilters: () => void
  hasActiveFilters: boolean
  dogIndex?: DogsIndexEntry[]
  speedRecords?: { name: string; sex: string; breed: string; speed_km_h: number; date: string; screenshot_url?: string }[]
  coursingRecords?: { name: string; breed: string; time_seconds: number; date: string }[]
  speedStats?: { breed: string; count: number; bestSpeed: number; avgSpeed: number }[]
  coursingStats?: { breed: string; count: number; bestTime: number; avgTime: number }[]
}

function PillChevron() {
  return <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
}

function sexLabel(sex: string): string {
  if (sex === 'С') return 'Сука'
  if (sex === 'К') return 'Кабель'
  return sex
}

export default function DoninoPageToolbar({
  view,
  searchQuery,
  onSearchChange,
  filterYears,
  filterBreeds,
  filterSexes,
  filterMinSpeed,
  filterMaxSpeed,
  filterMinTime,
  filterMaxTime,
  onFilterMinSpeedChange,
  onFilterMaxSpeedChange,
  onFilterMinTimeChange,
  onFilterMaxTimeChange,
  statsGroupBy,
  onStatsGroupByChange,
  dropdownRef,
  years,
  breeds,
  sexes,
  onToggleFilter,
  onYearChange,
  onBreedChange,
  currentSeason = '2026',
  onClearFilters,
  onClearPanelFilters,
  hasActiveFilters,
  dogIndex: propDogIndex,
}: DoninoPageToolbarProps) {
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [sexDropdownOpen, setSexDropdownOpen] = useState(false)

  const hasThresholdFilters = Boolean(
    filterMinSpeed || filterMaxSpeed || filterMinTime || filterMaxTime,
  )
  const thresholdCount = [filterMinSpeed, filterMaxSpeed, filterMinTime, filterMaxTime].filter(Boolean)
    .length

  const sortedYears = useMemo(
    () => [...years].map(String).sort((a, b) => Number(b) - Number(a)),
    [years],
  )

  const dogIndex = useMemo(
    () =>
      propDogIndex && propDogIndex.length > 0
        ? propDogIndex
        : breeds.map((breed) => ({ breed, competition_count: 1 })),
    [propDogIndex, breeds],
  )

  const clearAllYears = () => {
    for (const y of [...filterYears]) onToggleFilter('year', y)
  }

  const yearTriggerLabel =
    filterYears.length === 0
      ? 'Все года'
      : filterYears.length === 1
        ? filterYears[0]
        : `Год · ${filterYears.length}`

  const breedTriggerLabel =
    filterBreeds.length === 0
      ? 'Порода'
      : filterBreeds.length === 1
        ? (displayBreed(filterBreeds[0]).primary || filterBreeds[0])
        : `Порода · ${filterBreeds.length}`

  const sexTriggerLabel =
    filterSexes.length === 0
      ? 'Пол'
      : filterSexes.length === 1
        ? sexLabel(filterSexes[0]!)
        : `Пол · ${filterSexes.length}`



  const isYearActive =
    filterYears.length > 0 &&
    !(filterYears.length === 1 && filterYears[0] === currentSeason)

  return (
    <div ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="flex-wrap md:flex-nowrap"
        filters={
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full min-w-0">
            {/* Строка 1 на мобилке: Поиск на всю ширину */}
            <div className="w-full md:hidden">
              <ToolbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Кличка, порода…"
                className="w-full min-w-0"
              />
            </div>

            {/* Строка 2 на мобилке / левая группа на десктопе */}
            <div className="flex max-w-full flex-wrap items-center gap-1.5 shrink-0 w-full md:w-auto">
              <div className="hidden md:block">
                <ToolbarSearch
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Кличка, порода…"
                  className="sm:w-44 md:w-40 lg:w-48"
                />
              </div>
              <ModernDropdown
                trigger={
                  <button
                    type="button"
                    className={toolbarPillTriggerClass(isYearActive)}
                  >
                    {yearTriggerLabel}
                    <PillChevron />
                  </button>
                }
                isOpen={yearDropdownOpen}
                onOpenChange={setYearDropdownOpen}
                width="120px"
              >
                <div className="max-h-60 overflow-y-auto p-1" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      if (onYearChange) {
                        onYearChange('')
                      } else {
                        clearAllYears()
                      }
                      setYearDropdownOpen(false)
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      filterYears.length === 0
                        ? 'bg-camel-500 text-charcoal-900'
                        : 'text-charcoal-700 hover:bg-camel-100'
                    }`}
                  >
                    Все года
                  </button>
                  {sortedYears.map((year) => {
                    const active = filterYears.length === 1 && filterYears[0] === year
                    return (
                      <button
                        key={year}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          if (onYearChange) {
                            onYearChange(year)
                          } else {
                            clearAllYears()
                            onToggleFilter('year', year)
                          }
                          setYearDropdownOpen(false)
                        }}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? 'bg-camel-500 text-charcoal-900'
                            : 'text-charcoal-700 hover:bg-camel-100'
                        }`}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </ModernDropdown>



              <ModernDropdown
                trigger={
                  <button
                    type="button"
                    className={toolbarPillTriggerClass(filterSexes.length > 0)}
                  >
                    {sexTriggerLabel}
                    <PillChevron />
                  </button>
                }
                isOpen={sexDropdownOpen}
                onOpenChange={setSexDropdownOpen}
                width="140px"
              >
                <div className="p-1" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      for (const s of [...filterSexes]) onToggleFilter('sex', s)
                      setSexDropdownOpen(false)
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      filterSexes.length === 0
                        ? 'bg-camel-500 text-charcoal-900'
                        : 'text-charcoal-700 hover:bg-camel-100'
                    }`}
                  >
                    Все
                  </button>
                  {sexes.map((sex) => {
                    const active = filterSexes.includes(sex)
                    return (
                      <button
                        key={sex}
                        type="button"
                        role="menuitem"
                        onClick={() => onToggleFilter('sex', sex)}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? 'bg-camel-500 text-charcoal-900'
                            : 'text-charcoal-700 hover:bg-camel-100'
                        }`}
                      >
                        <DogSexIcon sex={sex} />
                        {sexLabel(sex)}
                      </button>
                    )
                  })}
                </div>
              </ModernDropdown>

              {view === 'stats' ? (
                <ToolbarFiltersDropdown
                  active={hasThresholdFilters}
                  activeCount={thresholdCount}
                  fillContent
                  panelClassName="md:w-[min(300px,calc(100vw-2rem))]"
                  onReset={onClearPanelFilters}
                  label="Пороги"
                >
                  <div className="space-y-3 p-3">
                    <FilterSelect
                      label="Группировка"
                      ariaLabel="Группировка"
                      value={statsGroupBy}
                      onChange={(value) => onStatsGroupByChange(value as GroupBy)}
                      options={GROUP_BY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                      className="w-full"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block space-y-0.5">
                        <span className="text-[11px] font-medium text-charcoal-600">
                          Мин. км/ч
                        </span>
                        <input
                          type="number"
                          value={filterMinSpeed}
                          onChange={(e) => onFilterMinSpeedChange(e.target.value)}
                          placeholder="мин."
                          className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                        />
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-[11px] font-medium text-charcoal-600">
                          Макс. км/ч
                        </span>
                        <input
                          type="number"
                          value={filterMaxSpeed}
                          onChange={(e) => onFilterMaxSpeedChange(e.target.value)}
                          placeholder="макс."
                          className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                        />
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-[11px] font-medium text-charcoal-600">
                          Мин. сек
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={filterMinTime}
                          onChange={(e) => onFilterMinTimeChange(e.target.value)}
                          placeholder="мин."
                          className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                        />
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-[11px] font-medium text-charcoal-600">
                          Макс. сек
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={filterMaxTime}
                          onChange={(e) => onFilterMaxTimeChange(e.target.value)}
                          placeholder="макс."
                          className={`${TOOLBAR_NUMBER_INPUT} !h-8`}
                        />
                      </label>
                    </div>
                  </div>
                </ToolbarFiltersDropdown>
              ) : null}

              {/* Выбор породы выпадающим списком на мобилке */}
              <div className="shrink-0 md:hidden">
                <BreedSearchDropdown
                  breeds={breeds}
                  selectedBreed={filterBreeds[0] || ''}
                  onSelect={(breed) => {
                    if (onBreedChange) {
                      onBreedChange(breed)
                    } else {
                      for (const b of [...filterBreeds]) onToggleFilter('breed', b)
                      if (breed) onToggleFilter('breed', breed)
                    }
                  }}
                  trigger={
                    <button
                      type="button"
                      className={`shrink-0 ${toolbarPillTriggerClass(filterBreeds.length > 0)}`}
                    >
                      <span className="truncate max-w-[130px]">
                        {filterBreeds.length > 0 ? formatBreedName(filterBreeds[0]) : 'Порода'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  dogIndex={dogIndex}
                />
              </div>

              {/* Сброс фильтров на мобилке */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="md:hidden shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-old-money-600 hover:text-charcoal-900 hover:bg-cream-100 transition-colors"
                  title="Сбросить все фильтры"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Сбросить</span>
                </button>
              )}
            </div>

            {/* Разделитель между фильтрами и породами на десктопе */}
            <div className="hidden md:block h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

            {/* Быстрый выбор пород QuickBreedBar — только на десктопе! */}
            <div className="hidden md:block flex-1 min-w-0 w-full md:w-auto">
              <QuickBreedBar
                selectedBreed={filterBreeds[0] || ''}
                onSelectBreed={(breed) => {
                  if (onBreedChange) {
                    onBreedChange(breed)
                  } else {
                    for (const b of [...filterBreeds]) onToggleFilter('breed', b)
                    if (breed) onToggleFilter('breed', breed)
                  }
                }}
                breedValues={breeds}
                dogIndex={dogIndex}
              />
            </div>
          </div>
        }
      />
      {view === 'table' && filterSexes.length > 0 && (
        <p className="mt-2 text-xs text-old-money-500">
          Фильтр по полу применяется только к колонке «Замер».
        </p>
      )}
      {view === 'stats' &&
        (filterSexes.length > 0 ||
          filterMinSpeed ||
          filterMaxSpeed ||
          filterMinTime ||
          filterMaxTime) && (
          <p className="mt-2 text-xs text-old-money-500">
            {filterSexes.length > 0 && 'Фильтр по полу — только «Замер». '}
            {(filterMinSpeed || filterMaxSpeed) && 'Диапазон км/ч — только «Замер». '}
            {(filterMinTime || filterMaxTime) && 'Диапазон сек — только «Бега 350 м».'}
          </p>
        )}
    </div>
  )
}
