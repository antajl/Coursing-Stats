import { X } from 'lucide-react'
import { TOOLBAR_ACTIVE_FILTER } from '../../lib/toolbar'

export interface ActiveFilterChip {
  key: string
  label: string
  onRemove: () => void
}

interface ToolbarActiveFiltersProps {
  chips: ActiveFilterChip[]
  onClearAll?: () => void
}

export default function ToolbarActiveFilters({ chips, onClearAll }: ToolbarActiveFiltersProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span key={chip.key} className={TOOLBAR_ACTIVE_FILTER}>
          <span className="truncate">{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="rounded-full p-0.5 text-charcoal-400 hover:bg-old-money-100 hover:text-charcoal-700 dark:hover:bg-charcoal-700 dark:hover:text-charcoal-200"
            aria-label={`Убрать фильтр ${chip.label}`}
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </span>
      ))}
      {onClearAll && chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="px-1 text-xs font-medium text-charcoal-500 underline-offset-2 hover:text-camel-700 hover:underline dark:text-charcoal-400 dark:hover:text-camel-400"
        >
          Сбросить всё
        </button>
      )}
    </div>
  )
}
