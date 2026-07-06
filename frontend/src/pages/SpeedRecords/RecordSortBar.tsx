interface SortOption {
  field: string
  label: string
}

interface RecordSortBarProps {
  options: SortOption[]
  sortField: string
  sortDirection: string
  onSort: (field: string) => void
}

export default function RecordSortBar({ options, sortField, sortDirection, onSort }: RecordSortBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
        Сортировка
      </span>
      {options.map(({ field, label }) => {
        const active = sortField === field
        const arrow = active ? (sortDirection === 'desc' ? ' ↓' : ' ↑') : ''

        return (
          <button
            key={field}
            type="button"
            onClick={() => onSort(field)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-camel-600 text-white shadow-sm'
                : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 dark:bg-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-600'
            }`}
          >
            {label}
            {arrow}
          </button>
        )
      })}
    </div>
  )
}
