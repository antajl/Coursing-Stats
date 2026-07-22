import type { ReactNode } from 'react'
import { TOOLBAR_PANEL } from '../../lib/toolbar'
import ToolbarActiveFilters, { type ActiveFilterChip } from './ToolbarActiveFilters'

interface PageToolbarProps {
  filters: ReactNode
  exportAction?: ReactNode
  /** Справа в первой строке (источник данных и т.п.) */
  trailing?: ReactNode
  activeFilterChips?: ActiveFilterChip[]
  onClearAllFilters?: () => void
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
  bare?: boolean
}

export default function PageToolbar({
  filters,
  exportAction,
  trailing,
  activeFilterChips = [],
  onClearAllFilters,
  bottomLeft,
  bottomRight,
  bare = false,
}: PageToolbarProps) {
  const showBottom = Boolean(bottomLeft || bottomRight)
  const showEnd = Boolean(exportAction || trailing)

  return (
    <div className={bare ? 'space-y-2.5' : `${TOOLBAR_PANEL} space-y-2.5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{filters}</div>
        {showEnd && (
          <div className="flex shrink-0 items-center gap-2">
            {exportAction}
            {trailing}
          </div>
        )}
      </div>

      <ToolbarActiveFilters chips={activeFilterChips} onClearAll={onClearAllFilters} />

      {showBottom && (
        <div className="flex flex-col gap-2 border-t border-old-money-200/60 pt-2.5 sm:flex-row sm:items-center sm:gap-x-4 dark:border-charcoal-600/80">
          {bottomLeft}
          {bottomRight && <div className="sm:ml-auto">{bottomRight}</div>}
        </div>
      )}
    </div>
  )
}
