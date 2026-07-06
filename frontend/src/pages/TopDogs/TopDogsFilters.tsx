import FilterSelect from '../../components/FilterSelect'
import { Icons } from '../../lib/icons'

interface TopDogsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: string
  onYearChange: (value: string) => void
  yearValues: (string | number)[]
  filterBreed: string
  onBreedChange: (value: string) => void
  breedValues: string[]
  filterMinStarts: string
  onMinStartsChange: (value: string) => void
  filterScoreFrom: string
  onScoreFromChange: (value: string) => void
  filterSpeedFrom: string
  onSpeedFromChange: (value: string) => void
  onResetFilters: () => void
  activeTab: string
}

export default function TopDogsFilters({
  searchQuery,
  onSearchChange,
  filterYear,
  onYearChange,
  yearValues,
  filterBreed,
  onBreedChange,
  breedValues,
  filterMinStarts,
  onMinStartsChange,
  filterScoreFrom,
  onScoreFromChange,
  filterSpeedFrom,
  onSpeedFromChange,
  onResetFilters,
  activeTab,
}: TopDogsFiltersProps) {
  const SearchIcon = Icons.search

  const hasActiveFilters =
    (filterYear && filterYear !== '2026') ||
    filterBreed ||
    searchQuery ||
    filterMinStarts ||
    (activeTab === 'score' && filterScoreFrom) ||
    (activeTab === 'speed' && filterSpeedFrom)

  return (
    <div className="mb-4 flex w-full flex-wrap items-center gap-2">
      <div className="flex h-9 w-[280px] shrink-0 items-center gap-2 rounded-[10px] border-[1.5px] border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-3">
        <SearchIcon className="h-3.5 w-3.5 shrink-0 text-charcoal-500" strokeWidth={1.75} />
        <input
          type="text"
          placeholder="Кличка, порода…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full min-w-0 border-none bg-transparent text-xs font-medium text-charcoal-800 dark:text-charcoal-200 outline-none placeholder:text-charcoal-400"
        />
      </div>

      <FilterSelect
        ariaLabel="Год"
        value={filterYear}
        onChange={onYearChange}
        allLabel="Все года"
        options={yearValues
          .sort((a, b) => Number(b) - Number(a))
          .map((y) => ({ value: String(y), label: String(y) }))}
        className="min-w-[96px]"
      />

      <FilterSelect
        ariaLabel="Порода"
        value={filterBreed}
        onChange={onBreedChange}
        allLabel="Все породы"
        options={breedValues.map((b) => ({ value: b, label: b }))}
        className="w-[140px] hidden sm:block"
      />

      <div className="flex h-9 items-center gap-2 rounded-[10px] border-[1.5px] border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-3">
        <input
          type="number"
          placeholder="Мин. старты"
          value={filterMinStarts}
          onChange={(e) => onMinStartsChange(e.target.value.replace(/[^0-9]/g, ''))}
          className="w-20 min-w-0 border-none bg-transparent text-xs font-medium text-charcoal-800 dark:text-charcoal-200 outline-none placeholder:text-charcoal-400 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {activeTab === 'score' && (
        <div className="flex h-9 items-center gap-2 rounded-[10px] border-[1.5px] border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-3">
          <input
            type="number"
            step="0.1"
            placeholder="Мин. очки"
            value={filterScoreFrom}
            onChange={(e) => onScoreFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
            className="w-20 min-w-0 border-none bg-transparent text-xs font-medium text-charcoal-800 dark:text-charcoal-200 outline-none placeholder:text-charcoal-400 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      )}

      {activeTab === 'speed' && (
        <div className="flex h-9 items-center gap-2 rounded-[10px] border-[1.5px] border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-3">
          <input
            type="number"
            step="0.1"
            placeholder="Мин. скорость"
            value={filterSpeedFrom}
            onChange={(e) => onSpeedFromChange(e.target.value.replace(/[^0-9.]/g, ''))}
            className="w-24 min-w-0 border-none bg-transparent text-xs font-medium text-charcoal-800 dark:text-charcoal-200 outline-none placeholder:text-charcoal-400 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="h-9 shrink-0 px-1 text-xs font-medium text-charcoal-500 underline-offset-2 hover:text-camel-700 hover:underline dark:text-charcoal-400 dark:hover:text-camel-400"
        >
          Сбросить
        </button>
      )}
    </div>
  )
}
