import { useMemo, useState, useEffect, useRef } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import FilterSelect from '../../components/FilterSelect'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarChip from '../../components/toolbar/ToolbarChip'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ViewToggle from '../../components/toolbar/ViewToggle'
import {
  TOOLBAR_FILTER_CHECKBOX_ROW,
  TOOLBAR_FILTER_SECTION_LABEL,
  TOOLBAR_NUMBER_INPUT,
} from '../../lib/toolbar'
import { exportDoninoToExcel, exportDoninoStatsToExcel } from './exportExcel'
import { GROUP_BY_OPTIONS, type GroupBy } from './stats/constants'
import { buildSpeedActiveFilterChips } from './toolbarFilters'

interface DoninoPageToolbarProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
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

export default function DoninoPageToolbar({
  view,
  onViewChange,
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
  const exportDropdownRef = useRef<HTMLDivElement>(null)

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

  const hasPanelFilters = Boolean(
    filterYears.length > 0 ||
      filterBreeds.length > 0 ||
      filterSexes.length > 0 ||
      filterMinSpeed ||
      filterMaxSpeed ||
      filterMinTime ||
      filterMaxTime
  )

  const activeFilterChips = useMemo(() => {
    const chips = buildSpeedActiveFilterChips(
      searchQuery,
      filterYears,
      filterBreeds,
      filterSexes,
      onSearchChange,
      onToggleFilter
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

  return (
    <div ref={dropdownRef}>
      <PageToolbar
        bare
        activeFilterChips={activeFilterChips}
        onClearAllFilters={hasActiveFilters ? onClearFilters : undefined}
        filters={
          <>
            <ToolbarSearch
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Кличка, порода…"
              className="!w-auto min-w-[200px] flex-1 max-w-lg"
            />
            <ToolbarFiltersDropdown active={hasPanelFilters} onReset={onClearPanelFilters} label="Фильтры">
              <div>
                <p className={TOOLBAR_FILTER_SECTION_LABEL}>Год</p>
                <div className="max-h-36 space-y-0.5 overflow-y-auto">
                  {years.map((year) => (
                    <label key={year} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                      <input
                        type="checkbox"
                        checked={filterYears.includes(year)}
                        onChange={() => onToggleFilter('year', year)}
                      />
                      {year}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                <div className="max-h-36 space-y-0.5 overflow-y-auto">
                  {breeds.map((breed) => (
                    <label key={breed} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                      <input
                        type="checkbox"
                        checked={filterBreeds.includes(breed)}
                        onChange={() => onToggleFilter('breed', breed)}
                      />
                      <span className="truncate">{breed}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className={TOOLBAR_FILTER_SECTION_LABEL}>Пол</p>
                <div className="space-y-0.5">
                  {sexes.map((sex) => (
                    <label key={sex} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                      <input
                        type="checkbox"
                        checked={filterSexes.includes(sex)}
                        onChange={() => onToggleFilter('sex', sex)}
                      />
                      <DogSexIcon sex={sex} />
                      <span>{sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : sex}</span>
                    </label>
                  ))}
                </div>
              </div>
              {view === 'stats' && (
                <>
                  <FilterSelect
                    label="Группировка"
                    ariaLabel="Группировка"
                    value={statsGroupBy}
                    onChange={(value) => onStatsGroupByChange(value as GroupBy)}
                    options={GROUP_BY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filterMinSpeed}
                      onChange={(e) => onFilterMinSpeedChange(e.target.value)}
                      placeholder="Мин. км/ч"
                      className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                      title="Фильтр замера"
                    />
                    <input
                      type="number"
                      value={filterMaxSpeed}
                      onChange={(e) => onFilterMaxSpeedChange(e.target.value)}
                      placeholder="Макс. км/ч"
                      className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                      title="Фильтр замера"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={filterMinTime}
                      onChange={(e) => onFilterMinTimeChange(e.target.value)}
                      placeholder="Мин. сек"
                      className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                      title="Фильтр бегов 350 м"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={filterMaxTime}
                      onChange={(e) => onFilterMaxTimeChange(e.target.value)}
                      placeholder="Макс. сек"
                      className={`${TOOLBAR_NUMBER_INPUT} w-full`}
                      title="Фильтр бегов 350 м"
                    />
                  </div>
                </>
              )}
            </ToolbarFiltersDropdown>
            <div className="relative shrink-0" ref={exportDropdownRef}>
              <ToolbarChip onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                Excel
                <ChevronDown className="ml-1 h-3.5 w-3.5" strokeWidth={2} />
              </ToolbarChip>
              {exportDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-old-money-200 bg-white shadow-lg dark:border-charcoal-600 dark:bg-charcoal-800">
                  <button
                    onClick={() => {
                      exportDoninoToExcel(speedRecords, coursingRecords)
                      setExportDropdownOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700"
                  >
                    Записи
                  </button>
                  {view === 'stats' && speedStats && coursingStats && (
                    <button
                      onClick={() => {
                        exportDoninoStatsToExcel(speedStats, coursingStats)
                        setExportDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700"
                    >
                      Статистика
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="ml-auto shrink-0">
              <ViewToggle view={view} onViewChange={onViewChange} />
            </div>
          </>
        }
      />
      {view === 'table' && filterSexes.length > 0 && (
        <p className="mt-2 text-xs text-old-money-500 dark:text-old-money-400">
          Фильтр по полу применяется только к колонке «Замер».
        </p>
      )}
      {view === 'stats' && (filterSexes.length > 0 || filterMinSpeed || filterMaxSpeed || filterMinTime || filterMaxTime) && (
        <p className="mt-2 text-xs text-old-money-500 dark:text-old-money-400">
          {filterSexes.length > 0 && 'Фильтр по полу — только «Замер». '}
          {(filterMinSpeed || filterMaxSpeed) && 'Диапазон км/ч — только «Замер». '}
          {(filterMinTime || filterMaxTime) && 'Диапазон сек — только «Бега 350 м».'}
        </p>
      )}
    </div>
  )
}
