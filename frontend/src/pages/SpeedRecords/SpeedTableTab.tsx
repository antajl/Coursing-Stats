import { exportToExcel } from './exportExcel'
import ViewToggle from './stats/ViewToggle'
import SpeedRecordCard from './SpeedRecordCard'
import RecordSortBar from './RecordSortBar'
import DogSexIcon from '../../components/DogSexIcon'

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
  { field: 'breed', label: 'Порода' },
  { field: 'sex', label: 'Пол' },
]

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
  return (
    <div className="space-y-6">
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 flex-wrap" ref={dropdownRef}>
        <div className="flex-1 min-w-[120px] relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск..."
            className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
          />
        </div>
        <div className="flex-1 min-w-[100px] relative">
          <button
            onClick={() => onOpenDropdownChange(openDropdown === 'year' ? null : 'year')}
            className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
          >
            {filterYears.length > 0 ? `Год: ${filterYears.length}` : 'Год'}
          </button>
          {openDropdown === 'year' && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
              {years.map(year => (
                <label key={year} className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterYears.includes(year)}
                    onChange={() => onToggleFilter('year', year)}
                    className="mr-2"
                  />
                  {year}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[120px] relative">
          <button
            onClick={() => onOpenDropdownChange(openDropdown === 'breed' ? null : 'breed')}
            className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
          >
            {filterBreeds.length > 0 ? `Порода: ${filterBreeds.length}` : 'Порода'}
          </button>
          {openDropdown === 'breed' && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
              {breeds.map(breed => (
                <label key={breed} className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterBreeds.includes(breed)}
                    onChange={() => onToggleFilter('breed', breed)}
                    className="mr-2"
                  />
                  {breed}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[80px] relative">
          <button
            onClick={() => onOpenDropdownChange(openDropdown === 'sex' ? null : 'sex')}
            className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
          >
            {filterSexes.length > 0 ? `Пол: ${filterSexes.length}` : 'Пол'}
          </button>
          {openDropdown === 'sex' && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
              {sexes.map(sex => (
                <label key={sex} className="flex items-center gap-2 px-4 py-2 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterSexes.includes(sex)}
                    onChange={() => onToggleFilter('sex', sex)}
                  />
                  <DogSexIcon sex={sex} />
                  <span className="text-sm text-charcoal-700 dark:text-charcoal-200">
                    {sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : sex}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-end">
          <button
            onClick={() => exportToExcel(filteredRecords)}
            className="rounded-xl border border-camel-300 dark:border-camel-600 px-4 py-3 font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700"
          >
            Скачать Excel
          </button>
        </div>
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="rounded-xl border border-red-300 dark:border-red-600 px-4 py-3 font-semibold text-red-600 dark:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-900"
            >
              Сбросить
            </button>
          </div>
        )}
      </div>

      <ViewToggle view={view} onViewChange={onViewChange} />

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-500 border-t-transparent"></div>
          <p className="mt-4 text-old-money-600 dark:text-old-money-400">Загрузка...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 rounded-xl p-4 text-red-700 dark:text-red-300">
          Ошибка: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {!loading && !error && filteredRecords.length === 0 && (
        <div className="text-center py-12 text-old-money-600 dark:text-old-money-400">
          Нет данных
        </div>
      )}

      {!loading && !error && filteredRecords.length > 0 && (
        <div className="space-y-3">
          <RecordSortBar
            options={SORT_OPTIONS}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />
          {filteredRecords.map((record) => (
            <SpeedRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}
