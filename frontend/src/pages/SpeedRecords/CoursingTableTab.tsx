import { useNavigate } from 'react-router-dom'
import { formatRecordDate } from '../../lib/recordDates'
import { exportCoursingToExcel } from './exportExcel'
import ViewToggle from './stats/ViewToggle'

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
  const navigate = useNavigate()

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

      <div className="rounded-xl border border-old-money-200 dark:border-charcoal-600 overflow-hidden">
        <div className="md:hidden space-y-3 p-3">
          {filteredCoursingRecords.map((record) => (
            <div key={record.id} className="bg-white dark:bg-charcoal-800 rounded-xl p-4 shadow-sm border border-cream-200 dark:border-charcoal-600">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div
                    className="font-bold text-charcoal-900 dark:text-charcoal-100 mb-1 cursor-pointer hover:text-camel-700 dark:hover:text-camel-400 transition-colors"
                    onClick={() => {
                      navigate(
                        `/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`,
                        { state: { from: 'coursing-records' } }
                      )
                    }}
                  >
                    {record.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{record.breed}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatRecordDate(record.date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{record.time_seconds}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">350 м</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-cream-100 dark:bg-charcoal-700">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                  Кличка
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                  Порода
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                  Время (350 метров)
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
              {filteredCoursingRecords.map((record) => (
                <tr key={record.id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <span
                      className="font-semibold text-charcoal-900 dark:text-charcoal-100 transition-colors cursor-pointer hover:text-camel-700 dark:hover:text-camel-400"
                      onClick={() => {
                        navigate(
                          `/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`,
                          { state: { from: 'coursing-records' } }
                        )
                      }}
                    >
                      {record.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{record.breed}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block">
                      <span className="inline-block px-3 py-1 rounded-full bg-camel-600 text-white font-bold text-sm">
                        {record.time_seconds} сек
                      </span>
                      {record.history && record.history.length > 0 && (
                        <span className="absolute -right-4 -top-3 rounded border border-warm-blue-300 bg-warm-blue-100 px-1 py-0.5 text-[10px] font-bold text-warm-blue-700 shadow-sm dark:border-warm-blue-600 dark:bg-warm-blue-900 dark:text-warm-blue-300">
                          upd
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{formatRecordDate(record.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
