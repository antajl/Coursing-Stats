import FiltersDropdown from '../../components/FiltersDropdown'

interface TopDogsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  yearValues: (string | number)[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  filterStartsFrom: string
  onStartsFromChange: (value: string) => void
  filterStartsTo: string
  onStartsToChange: (value: string) => void
  filterScoreFrom: string
  onScoreFromChange: (value: string) => void
  filterScoreTo: string
  onScoreToChange: (value: string) => void
  filterScoreType: string
  onScoreTypeChange: (value: string) => void
  filterSpeedFrom: string
  onSpeedFromChange: (value: string) => void
  filterSpeedTo: string
  onSpeedToChange: (value: string) => void
  filterSpeedType: string
  onSpeedTypeChange: (value: string) => void
  onResetFilters: () => void
}

const inputClass =
  'h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900'
const numberInputClass = `${inputClass} [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`

export default function TopDogsFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  yearValues,
  filterBreed,
  onBreedChange,
  breedValues,
  filterStartsFrom,
  onStartsFromChange,
  filterStartsTo,
  onStartsToChange,
  filterScoreFrom,
  onScoreFromChange,
  filterScoreTo,
  onScoreToChange,
  filterScoreType,
  onScoreTypeChange,
  filterSpeedFrom,
  onSpeedFromChange,
  filterSpeedTo,
  onSpeedToChange,
  filterSpeedType,
  onSpeedTypeChange,
  onResetFilters,
}: TopDogsFiltersProps) {
  return (
    <div className="mb-4 flex flex-col md:flex-row gap-3 items-stretch">
      <input
        type="text"
        placeholder="Поиск по кличке, породе или количеству участий..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-12 flex-1 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-5 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
      />

      <div className="flex gap-3">
        <div className="min-w-[120px] flex-1">
          <select
            value={filterYear}
            onChange={(e) => onYearChange(e.target.value)}
            className={inputClass}
            disabled={false}
          >
            <option value="">Все года</option>
            {yearValues.map((y) => (
              <option key={y} value={y} className="text-gray-900 dark:text-gray-100">
                {y}
              </option>
            ))}
          </select>
        </div>

        <FiltersDropdown onReset={onResetFilters}>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <select
                value={filterBreed}
                onChange={(e) => onBreedChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Все породы</option>
                {breedValues.map((b) => (
                  <option key={b} value={b} className="text-gray-900">
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-charcoal-700 dark:text-charcoal-300">
                Участий от
              </label>
              <input
                type="number"
                value={filterStartsFrom}
                onChange={(e) => onStartsFromChange(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="От"
                className={numberInputClass}
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-charcoal-700 dark:text-charcoal-300">
                Участий до
              </label>
              <input
                type="number"
                value={filterStartsTo}
                onChange={(e) => onStartsToChange(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="До"
                className={numberInputClass}
              />
            </div>
          </div>

          <div className="border-t-2 border-old-money-200 dark:border-charcoal-600 pt-4">
            <h3 className="mb-3 text-sm font-bold text-charcoal-800 dark:text-charcoal-200">
              Фильтры по очкам
            </h3>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                step="0.01"
                value={filterScoreFrom}
                onChange={(e) => onScoreFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="От"
                className={`h-12 w-36 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
              <input
                type="number"
                step="0.01"
                value={filterScoreTo}
                onChange={(e) => onScoreToChange(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="До"
                className={`h-12 w-36 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
              <select
                value={filterScoreType}
                onChange={(e) => onScoreTypeChange(e.target.value)}
                className={`h-12 flex-1 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900`}
              >
                <option value="best">Лучший</option>
                <option value="avg">Средний</option>
              </select>
            </div>
          </div>

          <div className="border-t-2 border-old-money-200 dark:border-charcoal-600 pt-4">
            <h3 className="mb-3 text-sm font-bold text-charcoal-800 dark:text-charcoal-200">
              Фильтры по скорости
            </h3>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                step="0.1"
                value={filterSpeedFrom}
                onChange={(e) => onSpeedFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="От"
                className={`h-12 w-36 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
              <input
                type="number"
                step="0.1"
                value={filterSpeedTo}
                onChange={(e) => onSpeedToChange(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="До"
                className={`h-12 w-36 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
              <select
                value={filterSpeedType}
                onChange={(e) => onSpeedTypeChange(e.target.value)}
                className={`h-12 flex-1 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900`}
              >
                <option value="best">Лучшая</option>
                <option value="avg">Средняя</option>
              </select>
            </div>
          </div>
        </FiltersDropdown>
      </div>
    </div>
  )
}
