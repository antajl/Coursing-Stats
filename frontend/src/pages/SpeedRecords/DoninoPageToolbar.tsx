import { useMemo, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import QuickBreedBar from '../TopDogs/QuickBreedBar'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { displayBreed } from '../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import type { DogsIndexEntry } from '../../lib/competingBreeds'
import type { GroupBy } from './stats/constants'
import { DoninoYearDropdown } from './components/DoninoYearDropdown'
import { DoninoSexDropdown, sexLabel } from './components/DoninoSexDropdown'
import { DoninoThresholdDropdown } from './components/DoninoThresholdDropdown'

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
  const [mobileYearDropdownOpen, setMobileYearDropdownOpen] = useState(false)
  const [desktopYearDropdownOpen, setDesktopYearDropdownOpen] = useState(false)
  const [mobileSexDropdownOpen, setMobileSexDropdownOpen] = useState(false)
  const [desktopSexDropdownOpen, setDesktopSexDropdownOpen] = useState(false)

  const hasThresholdFilters = Boolean(
    filterMinSpeed || filterMaxSpeed || filterMinTime || filterMaxTime,
  )
  const thresholdCount = [filterMinSpeed, filterMaxSpeed, filterMinTime, filterMaxTime].filter(Boolean).length

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

  const handleSelectYear = (year: string) => {
    if (onYearChange) {
      onYearChange(year)
    } else {
      clearAllYears()
      if (year) onToggleFilter('year', year)
    }
  }

  const handleSelectSex = (sex: string) => {
    for (const s of [...filterSexes]) onToggleFilter('sex', s)
    if (sex) onToggleFilter('sex', sex)
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
        topRowClassName="flex-nowrap"
        filters={
          <div className="w-full min-w-0">
            {/* Мобильная консоль: единый компактный ряд */}
            <div className="flex items-center gap-1.5 w-full md:hidden overflow-x-auto no-scrollbar py-0.5">
              <ToolbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Кличка собаки…"
              />

              <DoninoYearDropdown
                isOpen={mobileYearDropdownOpen}
                onOpenChange={setMobileYearDropdownOpen}
                sortedYears={sortedYears}
                filterYears={filterYears}
                yearTriggerLabel={yearTriggerLabel}
                isYearActive={isYearActive}
                onSelectYear={handleSelectYear}
              />

              <div className="shrink-0">
                <BreedSearchDropdown
                  breeds={breeds}
                  selectedBreed={filterBreeds.length === 1 ? filterBreeds[0] : ''}
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
                      <span className="truncate max-w-[100px]">
                        {breedTriggerLabel}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </button>
                  }
                  dogIndex={dogIndex}
                />
              </div>

              <DoninoSexDropdown
                isOpen={mobileSexDropdownOpen}
                onOpenChange={setMobileSexDropdownOpen}
                sexes={sexes}
                filterSexes={filterSexes}
                sexTriggerLabel={sexTriggerLabel}
                onSelectSex={handleSelectSex}
              />

              {view === 'stats' ? (
                <DoninoThresholdDropdown
                  hasThresholdFilters={hasThresholdFilters}
                  thresholdCount={thresholdCount}
                  onClearPanelFilters={onClearPanelFilters}
                  statsGroupBy={statsGroupBy}
                  onStatsGroupByChange={onStatsGroupByChange}
                  filterMinSpeed={filterMinSpeed}
                  filterMaxSpeed={filterMaxSpeed}
                  filterMinTime={filterMinTime}
                  filterMaxTime={filterMaxTime}
                  onFilterMinSpeedChange={onFilterMinSpeedChange}
                  onFilterMaxSpeedChange={onFilterMaxSpeedChange}
                  onFilterMinTimeChange={onFilterMinTimeChange}
                  onFilterMaxTimeChange={onFilterMaxTimeChange}
                />
              ) : null}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="cs-glass-pill shrink-0 inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold !text-charcoal-600 hover:!text-charcoal-900 transition-colors cursor-pointer select-none"
                  title="Сбросить все фильтры"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Сбросить</span>
                </button>
              )}
            </div>

            {/* Десктопная панель фильтров: второй ряд */}
            <div className="hidden md:flex items-center gap-2 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
              <ToolbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Поиск по кличке собаки…"
              />

              <DoninoYearDropdown
                isOpen={desktopYearDropdownOpen}
                onOpenChange={setDesktopYearDropdownOpen}
                sortedYears={sortedYears}
                filterYears={filterYears}
                yearTriggerLabel={yearTriggerLabel}
                isYearActive={isYearActive}
                onSelectYear={handleSelectYear}
              />

              <DoninoSexDropdown
                isOpen={desktopSexDropdownOpen}
                onOpenChange={setDesktopSexDropdownOpen}
                sexes={sexes}
                filterSexes={filterSexes}
                sexTriggerLabel={sexTriggerLabel}
                onSelectSex={handleSelectSex}
              />

              {view === 'stats' ? (
                <DoninoThresholdDropdown
                  hasThresholdFilters={hasThresholdFilters}
                  thresholdCount={thresholdCount}
                  onClearPanelFilters={onClearPanelFilters}
                  statsGroupBy={statsGroupBy}
                  onStatsGroupByChange={onStatsGroupByChange}
                  filterMinSpeed={filterMinSpeed}
                  filterMaxSpeed={filterMaxSpeed}
                  filterMinTime={filterMinTime}
                  filterMaxTime={filterMaxTime}
                  onFilterMinSpeedChange={onFilterMinSpeedChange}
                  onFilterMaxSpeedChange={onFilterMaxSpeedChange}
                  onFilterMinTimeChange={onFilterMinTimeChange}
                  onFilterMaxTimeChange={onFilterMaxTimeChange}
                />
              ) : null}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="cs-glass-pill shrink-0 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold !text-charcoal-600 hover:!text-charcoal-900 transition-colors cursor-pointer select-none"
                  title="Сбросить все фильтры"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Сбросить</span>
                </button>
              )}

              {/* Разделитель между фильтрами и породами на десктопе */}
              <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

              {/* Быстрый выбор пород QuickBreedBar — всегда самая правая часть панели фильтров */}
              <div className="flex-1 min-w-0">
                <QuickBreedBar
                  selectedBreed={filterBreeds.length === 1 ? filterBreeds[0] : ''}
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
