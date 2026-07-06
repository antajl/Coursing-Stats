import type { ReactNode } from 'react'
import { TOOLBAR_PANEL } from '../../lib/toolbar'
import ToolbarActiveFilters, { type ActiveFilterChip } from './ToolbarActiveFilters'

interface PageToolbarProps {
  filters: ReactNode
  exportAction?: ReactNode
  activeFilterChips?: ActiveFilterChip[]
  onClearAllFilters?: () => void
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
}

export default function PageToolbar({
  filters,
  exportAction,
  activeFilterChips = [],
  onClearAllFilters,
  bottomLeft,
  bottomRight,
}: PageToolbarProps) {
  const showBottom = Boolean(bottomLeft || bottomRight)

  return (
    <div className={`${TOOLBAR_PANEL} space-y-2.5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{filters}</div>
        {exportAction && <div className="flex shrink-0 items-center gap-2">{exportAction}</div>}
      </div>

      <ToolbarActiveFilters chips={activeFilterChips} onClearAll={onClearAllFilters} />

      {showBottom && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-old-money-200/60 pt-2.5 dark:border-charcoal-600/80">
          {bottomLeft}
          {bottomRight}
        </div>
      )}
    </div>
  )
}
