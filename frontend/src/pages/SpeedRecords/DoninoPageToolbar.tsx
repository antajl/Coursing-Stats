import { useMemo, useState, useEffect, useRef } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import FilterSelect from '../../components/FilterSelect'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarChip from '../../components/toolbar/ToolbarChip'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import ModernDropdown from '../../components/ui/ModernDropdown'
import { TOOLBAR_NUMBER_INPUT, toolbarPillTriggerClass } from '../../lib/toolbar'
import { exportDoninoToExcel, exportDoninoStatsToExcel } from './exportExcel'
import { GROUP_BY_OPTIONS, type GroupBy } from './stats/constants'
import { buildSpeedActiveFilterChips } from './toolbarFilters'

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
  onClearFilters: () => void
  onClearPanelFilters: () => void
  hasActiveFilters: boolean
  speedRecords: { name: string; sex: string; breed: string; speed_km_h: number; date: string; screenshot_url?: string }[]
  coursingRecords: { name: string; breed: string; time_seconds: number; date: string }[]
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
  onClearFilters,
  onClearPanelFilters,
  hasActiveFilters,
  speedRecords,
  coursingRecords,
  speedStats,
  coursingStats,
}: DoninoPageToolbarProps) {
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false)
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [sexDropdownOpen, setSexDropdownOpen] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement>(null)
  const canExportStats = view === 'stats' && Boolean(speedStats && coursingStats)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false)
      }
    }
    if (exportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [exportDropdownOpen])

  useEffect(() => {
    if (!canExportStats) setExportDropdownOpen(false)
  }, [canExportStats])

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
    () => breeds.map((breed) => ({ breed, competition_count: 1 })),
    [breeds],
  )

  const activeFilterChips = useMemo(() => {
    const chips = buildSpeedActiveFilterChips(
      searchQuery,
      filterYears,
      filterBreeds,
      filterSexes,
      onSearchChange,
      onToggleFilter,
    )
    if (filterMinSpeed) {
      chips.push({
        key: 'minSpeed',
        label: `от ${filterMinSpeed} км/ч`,
        onRemove: () => onFilterMinSpeedChange(''),
      })
    }
    if (filterMaxSpeed) {
      chips.push({
        key: 'maxSpeed',
        label: `до ${filterMaxSpeed} км/ч`,
        onRemove: () => onFilterMaxSpeedChange(''),
      })
    }
    if (filterMinTime) {
      chips.push({
        key: 'minTime',
        label: `от ${filterMinTime} с`,
        onRemove: () => onFilterMinTimeChange(''),
      })
    }
    if (filterMaxTime) {
      chips.push({
        key: 'maxTime',
        label: `до ${filterMaxTime} с`,
        onRemove: () => onFilterMaxTimeChange(''),
      })
    }
    return chips
  }, [
    searchQuery,
    filterYears,
    filterBreeds,
    filterSexes,
    filterMinSpeed,
    filterMaxSpeed,
    filterMinTime,
    filterMaxTime,
    onSearchChange,
    onToggleFilter,
    onFilterMinSpeedChange,
    onFilterMaxSpeedChange,
    onFilterMinTimeChange,
    onFilterMaxTimeChange,
  ])

  const clearAllYears = () => {
    for (const y of [...filterYears]) onToggleFilter('year', y)
  }

  const yearTriggerLabel =
    filterYears.length === 0
      ? 'Год'
      : filterYears.length === 1
        ? filterYears[0]
        : `Год · ${filterYears.length}`

  const breedTriggerLabel =
    filterBreeds.length === 0
      ? 'Порода'
      : filterBreeds.length === 1
        ? filterBreeds[0]
        : `Порода · ${filterBreeds.length}`

  const sexTriggerLabel =
    filterSexes.length === 0
      ? 'Пол'
      : filterSexes.length === 1
        ? sexLabel(filterSexes[0]!)
        : `Пол · ${filterSexes.length}`

  const breedTrigger = (
    <button
      type="button"
      className={toolbarPillTriggerClass(filterBreeds.length > 0, 'max-w-[12rem]')}
      title={filterBreeds.length > 1 ? filterBreeds.join(', ') : undefined}
    >
      <span className="min-w-0 truncate">{breedTriggerLabel}</span>
      <PillChevron />
    </button>
  )

  return (
    <div ref={dropdownRef}>
      <PageToolbar
        bare
        topRowClassName="pr-28 md:pr-32"
        activeFilterChips={activeFilterChips}
        onClearAllFilters={hasActiveFilters ? onClearFilters : undefined}
        filters={
          <>
            <ToolbarSearch
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Кличка, порода…"
              className="!w-auto min-w-[200px] max-w-xs shrink-0"
            />
            <div className="flex max-w-full flex-wrap items-center gap-1.5">
              <ModernDropdown
                trigger={
                  <button
                    type="button"
                    className={toolbarPillTriggerClass(filterYears.length > 0)}
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
                      clearAllYears()
                      setYearDropdownOpen(false)
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      filterYears.length === 0
                        ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                        : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                    }`}
                  >
                    Все года
                  </button>
                  {sortedYears.map((year) => {
                    const active = filterYears.includes(year)
                    return (
                      <button
                        key={year}
                        type="button"
                        role="menuitem"
                        onClick={() => onToggleFilter('year', year)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                            : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
                        }`}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </ModernDropdown>

              <BreedSearchDropdown
                breeds={breeds}
                selectedBreed={filterBreeds[0]}
                onSelect={(breed) => {
                  if (!breed) {
                    for (const b of [...filterBreeds]) onToggleFilter('breed', b)
                    return
                  }
                  onToggleFilter('breed', breed)
                }}
                trigger={breedTrigger}
                dogIndex={dogIndex}
              />

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
                        ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                        : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
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
                            ? 'bg-camel-500 text-charcoal-900 dark:bg-camel-600 dark:text-cream-50'
                            : 'text-charcoal-700 hover:bg-camel-100 dark:text-charcoal-200 dark:hover:bg-camel-900/30'
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
                        <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
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
                        <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
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
                        <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
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
                        <span className="text-[11px] font-medium text-charcoal-600 dark:text-charcoal-300">
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

              <div className="relative shrink-0" ref={exportDropdownRef}>
                {canExportStats ? (
                  <>
                    <ToolbarChip onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      Excel
                      <ChevronDown className="ml-1 h-3.5 w-3.5" strokeWidth={2} />
                    </ToolbarChip>
                    {exportDropdownOpen && (
                      <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-old-money-200 bg-white shadow-lg dark:border-charcoal-600 dark:bg-charcoal-800">
                        <button
                          type="button"
                          onClick={() => {
                            exportDoninoToExcel(speedRecords, coursingRecords)
                            setExportDropdownOpen(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700"
                        >
                          Записи
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            exportDoninoStatsToExcel(speedStats!, coursingStats!)
                            setExportDropdownOpen(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700"
                        >
                          Статистика
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <ToolbarChip onClick={() => exportDoninoToExcel(speedRecords, coursingRecords)}>
                    <Download className="h-3.5 w-3.5" strokeWidth={2} />
                    Excel
                  </ToolbarChip>
                )}
              </div>
            </div>
          </>
        }
      />
      {view === 'table' && filterSexes.length > 0 && (
        <p className="mt-2 text-xs text-old-money-500 dark:text-old-money-400">
          Фильтр по полу применяется только к колонке «Замер».
        </p>
      )}
      {view === 'stats' &&
        (filterSexes.length > 0 ||
          filterMinSpeed ||
          filterMaxSpeed ||
          filterMinTime ||
          filterMaxTime) && (
          <p className="mt-2 text-xs text-old-money-500 dark:text-old-money-400">
            {filterSexes.length > 0 && 'Фильтр по полу — только «Замер». '}
            {(filterMinSpeed || filterMaxSpeed) && 'Диапазон км/ч — только «Замер». '}
            {(filterMinTime || filterMaxTime) && 'Диапазон сек — только «Бега 350 м».'}
          </p>
        )}
    </div>
  )
}
