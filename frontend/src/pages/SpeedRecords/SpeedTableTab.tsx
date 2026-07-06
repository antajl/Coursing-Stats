import { useMemo } from 'react'
import { Download } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import MultiFilterDropdown from '../../components/toolbar/MultiFilterDropdown'
import RecordsListToolbar from '../../components/toolbar/RecordsListToolbar'
import ToolbarChip from '../../components/toolbar/ToolbarChip'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { exportToExcel } from './exportExcel'
import SpeedRecordCard from './SpeedRecordCard'
import RecordSortBar from './RecordSortBar'
import { buildSpeedActiveFilterChips } from './toolbarFilters'

interface SpeedRecord {
  id: string | number
  name: string
  sex: string
  breed: string
  speed_km_h: number
  date: string
  screenshot_url?: string
  dog_id?: string | number
  status?: string
  history?: unknown[]
}

interface SpeedTableTabProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYears: string[]
  filterBreeds: string[]
  filterSexes: string[]
  openDropdown: string | null
  onOpenDropdownChange: (value: string | null) => void
  dropdownRef: React.RefObject<HTMLDivElement>
  years: string[]
  breeds: string[]
  sexes: string[]
  onToggleFilter: (type: string, value: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  loading: boolean
  error: unknown
  filteredRecords: SpeedRecord[]
  sortField: string
  sortDirection: string
  onSort: (field: string) => void
}

const SORT_OPTIONS = [
  { field: 'speed_km_h', label: 'Скорость' },
  { field: 'date', label: 'Дата' },
  { field: 'name', label: 'Кличка' },
]

const checkboxRowClass =
  'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700'

export default function SpeedTableTab({
  view,
  onViewChange,
  searchQuery,
  onSearchChange,
  filterYears,
  filterBreeds,
  filterSexes,
  openDropdown,
  onOpenDropdownChange,
  dropdownRef,
  years,
  breeds,
  sexes,
  onToggleFilter,
  onClearFilters,
  hasActiveFilters,
  loading,
  error,
  filteredRecords,
  sortField,
  sortDirection,
  onSort,
}: SpeedTableTabProps) {
  const showSort = view === 'table' && !loading && !error && filteredRecords.length > 0

  const activeFilterChips = useMemo(
    () =>
      buildSpeedActiveFilterChips(
        searchQuery,
        filterYears,
        filterBreeds,
        filterSexes,
        onSearchChange,
        onToggleFilter
      ),
    [searchQuery, filterYears, filterBreeds, filterSexes, onSearchChange, onToggleFilter]
  )

  return (
    <div className="space-y-4">
      <div ref={dropdownRef}>
        <RecordsListToolbar
          view={view}
          onViewChange={onViewChange}
          activeFilterChips={activeFilterChips}
          onClearAllFilters={hasActiveFilters ? onClearFilters : undefined}
          exportAction={
            <ToolbarChip onClick={() => exportToExcel(filteredRecords)}>
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              Excel
            </ToolbarChip>
          }
          sortBar={
            showSort ? (
              <RecordSortBar
                options={SORT_OPTIONS}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            ) : undefined
          }
          filters={
            <>
              <ToolbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Кличка, порода…"
              />

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
            </>
          }
        />
      </div>

      {loading && (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-500 border-t-transparent" />
          <p className="mt-4 text-old-money-600 dark:text-old-money-400">Загрузка...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-300">
          Ошибка: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {view === 'table' && !loading && !error && filteredRecords.length === 0 && (
        <div className="py-12 text-center text-old-money-600 dark:text-old-money-400">Нет данных</div>
      )}

      {view === 'table' && !loading && !error && filteredRecords.length > 0 && (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <SpeedRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}
