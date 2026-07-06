import { useMemo } from 'react'
import { Download } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import MultiFilterDropdown from '../../components/toolbar/MultiFilterDropdown'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ViewToggle from '../../components/toolbar/ViewToggle'
import ToolbarChip from '../../components/toolbar/ToolbarChip'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { TOOLBAR_NUMBER_INPUT } from '../../lib/toolbar'
import { exportDoninoToExcel } from './exportExcel'
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
  openDropdown: string | null
  onOpenDropdownChange: (value: string | null) => void
  dropdownRef: React.RefObject<HTMLDivElement>
  years: string[]
  breeds: string[]
  sexes: string[]
  onToggleFilter: (type: string, value: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  speedRecords: { name: string; sex: string; breed: string; speed_km_h: number; date: string; screenshot_url?: string }[]
  coursingRecords: { name: string; breed: string; time_seconds: number; date: string }[]
}

const checkboxRowClass =
  'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700'

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
  openDropdown,
  onOpenDropdownChange,
  dropdownRef,
  years,
  breeds,
  sexes,
  onToggleFilter,
  onClearFilters,
  hasActiveFilters,
  speedRecords,
  coursingRecords,
}: DoninoPageToolbarProps) {
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
      <div className="mb-4 overflow-x-auto scrollbar-hide">
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>

      <PageToolbar
        activeFilterChips={activeFilterChips}
        onClearAllFilters={hasActiveFilters ? onClearFilters : undefined}
        exportAction={
          <ToolbarChip onClick={() => exportDoninoToExcel(speedRecords, coursingRecords)}>
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
            Excel
          </ToolbarChip>
        }
        filters={
          <>
            <ToolbarSearch value={searchQuery} onChange={onSearchChange} placeholder="Кличка, порода…" />

            <MultiFilterDropdown
              label="Год"
              selectedCount={filterYears.length}
              open={openDropdown === 'year'}
              onToggle={() => onOpenDropdownChange(openDropdown === 'year' ? null : 'year')}
            >
              {years.map((year) => (
                <label key={year} className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={filterYears.includes(year)}
                    onChange={() => onToggleFilter('year', year)}
                  />
                  {year}
                </label>
              ))}
            </MultiFilterDropdown>

            <MultiFilterDropdown
              label="Порода"
              selectedCount={filterBreeds.length}
              open={openDropdown === 'breed'}
              onToggle={() => onOpenDropdownChange(openDropdown === 'breed' ? null : 'breed')}
            >
              {breeds.map((breed) => (
                <label key={breed} className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={filterBreeds.includes(breed)}
                    onChange={() => onToggleFilter('breed', breed)}
                  />
                  <span className="truncate">{breed}</span>
                </label>
              ))}
            </MultiFilterDropdown>

            <MultiFilterDropdown
              label="Пол"
              selectedCount={filterSexes.length}
              open={openDropdown === 'sex'}
              onToggle={() => onOpenDropdownChange(openDropdown === 'sex' ? null : 'sex')}
            >
              {sexes.map((sex) => (
                <label key={sex} className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={filterSexes.includes(sex)}
                    onChange={() => onToggleFilter('sex', sex)}
                  />
                  <DogSexIcon sex={sex} />
                  <span>{sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : sex}</span>
                </label>
              ))}
            </MultiFilterDropdown>

            {view === 'stats' && (
              <>
                <input
                  type="number"
                  value={filterMinSpeed}
                  onChange={(e) => onFilterMinSpeedChange(e.target.value)}
                  placeholder="Мин. км/ч"
                  className={TOOLBAR_NUMBER_INPUT}
                  title="Фильтр замера"
                />
                <input
                  type="number"
                  value={filterMaxSpeed}
                  onChange={(e) => onFilterMaxSpeedChange(e.target.value)}
                  placeholder="Макс. км/ч"
                  className={TOOLBAR_NUMBER_INPUT}
                  title="Фильтр замера"
                />
                <input
                  type="number"
                  step="0.01"
                  value={filterMinTime}
                  onChange={(e) => onFilterMinTimeChange(e.target.value)}
                  placeholder="Мин. сек"
                  className={TOOLBAR_NUMBER_INPUT}
                  title="Фильтр бегов 350 м"
                />
                <input
                  type="number"
                  step="0.01"
                  value={filterMaxTime}
                  onChange={(e) => onFilterMaxTimeChange(e.target.value)}
                  placeholder="Макс. сек"
                  className={TOOLBAR_NUMBER_INPUT}
                  title="Фильтр бегов 350 м"
                />
              </>
            )}
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
