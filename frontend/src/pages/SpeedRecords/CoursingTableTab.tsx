import { useMemo } from 'react'
import { Download } from 'lucide-react'
import MultiFilterDropdown from '../../components/toolbar/MultiFilterDropdown'
import RecordsListToolbar from '../../components/toolbar/RecordsListToolbar'
import ToolbarChip from '../../components/toolbar/ToolbarChip'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { exportCoursingToExcel } from './exportExcel'
import CoursingRecordCard from './CoursingRecordCard'
import RecordSortBar from './RecordSortBar'
import { buildCoursingActiveFilterChips } from './toolbarFilters'

interface CoursingRecord {
  id: string | number
  name: string
  breed: string
  sex?: string
  time_seconds: number
  date: string
  dog_id?: string | number
  history?: unknown[]
}

interface CoursingTableTabProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
  coursingLoading: boolean
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYears: string[]
  filterBreeds: string[]
  openDropdown: string | null
  onOpenDropdownChange: (value: string | null) => void
  dropdownRef: React.RefObject<HTMLDivElement>
  coursingYears: string[]
  coursingBreeds: string[]
  onToggleFilter: (type: string, value: string) => void
  onClearFilters: () => void
  filteredCoursingRecords: CoursingRecord[]
  sortField: string
  sortDirection: string
  onSort: (field: string) => void
}

const SORT_OPTIONS = [
  { field: 'time_seconds', label: 'Время' },
  { field: 'date', label: 'Дата' },
  { field: 'name', label: 'Кличка' },
]

const checkboxRowClass =
  'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700'

export default function CoursingTableTab({
  view,
  onViewChange,
  coursingLoading,
  searchQuery,
  onSearchChange,
  filterYears,
  filterBreeds,
  openDropdown,
  onOpenDropdownChange,
  dropdownRef,
  coursingYears,
  coursingBreeds,
  onToggleFilter,
  onClearFilters,
  filteredCoursingRecords,
  sortField,
  sortDirection,
  onSort,
}: CoursingTableTabProps) {
  const hasActiveFilters = Boolean(searchQuery || filterBreeds.length > 0 || filterYears.length > 0)
  const showSort = view === 'table' && !coursingLoading && filteredCoursingRecords.length > 0

  const activeFilterChips = useMemo(
    () =>
      buildCoursingActiveFilterChips(
        searchQuery,
        filterYears,
        filterBreeds,
        onSearchChange,
        onToggleFilter
      ),
    [searchQuery, filterYears, filterBreeds, onSearchChange, onToggleFilter]
  )

  if (coursingLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-500 border-t-transparent" />
        <p className="mt-4 text-old-money-600">Загрузка рекордов курсинга...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div ref={dropdownRef}>
        <RecordsListToolbar
          view={view}
          onViewChange={onViewChange}
          activeFilterChips={activeFilterChips}
          onClearAllFilters={hasActiveFilters ? onClearFilters : undefined}
          exportAction={
            <ToolbarChip onClick={() => exportCoursingToExcel(filteredCoursingRecords)}>
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
                {coursingYears.map((year) => (
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
                {coursingBreeds.map((breed) => (
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
            </>
          }
        />
      </div>

      {view === 'table' && filteredCoursingRecords.length === 0 ? (
        <div className="py-12 text-center text-old-money-600 dark:text-old-money-400">Нет данных</div>
      ) : view === 'table' ? (
        <div className="space-y-3">
          {filteredCoursingRecords.map((record) => (
            <CoursingRecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
