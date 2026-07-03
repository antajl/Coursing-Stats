import { useNavigate } from 'react-router-dom'
import { formatRecordDate } from '../../lib/recordDates'
import { exportToExcel } from './exportExcel'

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

export default function SpeedTableTab({
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
  const navigate = useNavigate()

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
                <label key={sex} className="flex items-center px-4 py-2 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterSexes.includes(sex)}
                    onChange={() => onToggleFilter('sex', sex)}
                    className="mr-2"
                  />
                  {sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : sex}
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
        <div className="rounded-xl border border-old-money-200 dark:border-charcoal-600 overflow-hidden">
          <div className="md:hidden space-y-3 p-3">
            {filteredRecords.map((record) => (
              <div key={record.id} className="bg-white dark:bg-charcoal-800 rounded-xl p-4 shadow-sm border border-cream-200 dark:border-charcoal-600">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div
                      className={`font-bold text-charcoal-900 dark:text-charcoal-100 mb-1 cursor-pointer hover:text-camel-700 dark:hover:text-camel-400 transition-colors ${
                        record.dog_id ? '' : 'cursor-default'
                      }`}
                      onClick={() => {
                        navigate(
                          `/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`,
                          { state: { from: 'speed-records' } }
                        )
                      }}
                    >
                      {record.name}
                    </div>
                    <div className="text-xs text-old-money-600 dark:text-old-money-400">
                      {record.breed} • {record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex}
                    </div>
                    <div className="text-xs text-old-money-500 dark:text-old-money-400 mt-1">{formatRecordDate(record.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{record.speed_km_h}</div>
                    <div className="text-xs text-old-money-500 dark:text-old-money-400">км/ч</div>
                  </div>
                </div>
                {record.screenshot_url && (
                  <a
                    href={record.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-camel-700 dark:text-camel-400 hover:text-camel-800 dark:hover:text-camel-300 font-semibold"
                  >
                    Открыть скриншот →
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-cream-100 dark:bg-charcoal-700">
                <tr>
                  <th
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => onSort('name')}
                  >
                    Кличка {sortField === 'name' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => onSort('sex')}
                  >
                    Пол {sortField === 'sex' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => onSort('breed')}
                  >
                    Порода {sortField === 'breed' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => onSort('speed_km_h')}
                  >
                    Скорость {sortField === 'speed_km_h' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => onSort('date')}
                  >
                    Дата {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
                    Скриншот
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span
                        className="font-semibold text-charcoal-900 dark:text-charcoal-100 transition-colors cursor-pointer hover:text-camel-700 dark:hover:text-camel-400"
                        onClick={() => {
                          navigate(
                            `/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`,
                            { state: { from: 'speed-records' } }
                          )
                        }}
                      >
                        {record.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">
                      {record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex}
                    </td>
                    <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{record.breed}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block">
                        <span className="inline-block rounded-full bg-camel-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
                          {record.speed_km_h} км/ч
                        </span>
                        {record.status === 'new' && (
                          <span className="absolute -right-4 -top-3 rounded border border-red-300 bg-red-100 px-1 py-0.5 text-[10px] font-bold text-red-600 shadow-sm dark:border-red-600 dark:bg-red-900 dark:text-red-300">
                            new
                          </span>
                        )}
                        {(record.status === 'improved' || (record.history && record.history.length > 0)) && (
                          <span className="absolute -right-4 -top-3 rounded border border-warm-blue-300 bg-warm-blue-100 px-1 py-0.5 text-[10px] font-bold text-warm-blue-700 shadow-sm dark:border-warm-blue-600 dark:bg-warm-blue-900 dark:text-warm-blue-300">
                            upd
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{formatRecordDate(record.date)}</td>
                    <td className="px-6 py-4 text-center">
                      {record.screenshot_url && (
                        <a
                          href={record.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-camel-700 transition-colors hover:text-camel-800"
                        >
                          Открыть
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
