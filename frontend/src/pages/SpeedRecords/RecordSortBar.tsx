import { ArrowDown, ArrowUp } from 'lucide-react'
import { TOOLBAR_SORT_ACTIVE, TOOLBAR_SORT_CHIP, TOOLBAR_SORT_IDLE } from '../../lib/toolbar'

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
      <span className="text-xs font-medium text-old-money-500 dark:text-old-money-400">Сортировка</span>
      <div className="inline-flex flex-wrap items-center gap-1.5">
        {options.map(({ field, label }) => {
          const active = sortField === field
          const SortIcon = sortDirection === 'desc' ? ArrowDown : ArrowUp

          return (
            <button
              key={field}
              type="button"
              onClick={() => onSort(field)}
              className={`${TOOLBAR_SORT_CHIP} ${active ? TOOLBAR_SORT_ACTIVE : TOOLBAR_SORT_IDLE}`}
            >
              {label}
              {active && <SortIcon className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2.5} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
