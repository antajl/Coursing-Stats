import { exportCoursingToExcel } from './exportExcel'
import ViewToggle from './stats/ViewToggle'
import CoursingRecordCard from './CoursingRecordCard'

interface CoursingRecord {
  id: string | number
  name: string
  breed: string
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
}

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
}: CoursingTableTabProps) {
  if (coursingLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-500 border-t-transparent"></div>
          <p className="mt-4 text-old-money-600">Загрузка рекордов курсинга...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 flex-wrap" ref={dropdownRef}>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по кличке..."
            className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
          />
        </div>
        <div className="flex-1 min-w-[120px] relative">
          <button
            onClick={() => onOpenDropdownChange(openDropdown === 'year' ? null : 'year')}
            className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
          >
            {filterYears.length > 0 ? `Выбрано: ${filterYears.length}` : 'Год'}
          </button>
          {openDropdown === 'year' && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
              {coursingYears.map(year => (
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
            {filterBreeds.length > 0 ? `Выбрано: ${filterBreeds.length}` : 'Порода'}
          </button>
          {openDropdown === 'breed' && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
              {coursingBreeds.map(breed => (
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
        <div className="flex items-end">
          <button
            onClick={() => exportCoursingToExcel(filteredCoursingRecords)}
            className="rounded-xl border border-camel-300 dark:border-camel-600 px-4 py-3 font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700"
          >
            Скачать Excel
          </button>
        </div>
        {(searchQuery || filterBreeds.length > 0 || filterYears.length > 0) && (
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

      {filteredCoursingRecords.length === 0 ? (
        <div className="text-center py-12 text-old-money-600 dark:text-old-money-400">Нет данных</div>
      ) : (
        <div className="space-y-3">
          {filteredCoursingRecords.map((record) => (
            <CoursingRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}
