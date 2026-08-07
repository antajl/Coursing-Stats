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
  /** Extra classes on the filters row (e.g. pr-* to clear a corner footnote chip) */
  topRowClassName?: string
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
  topRowClassName = '',
}: PageToolbarProps) {
  const showBottom = Boolean(bottomLeft || bottomRight)
  const showEnd = Boolean(exportAction || trailing)

  return (
    <div className={bare ? 'space-y-2.5' : `${TOOLBAR_PANEL} space-y-2.5`}>
      <div className={`flex flex-wrap items-center justify-between gap-2 ${topRowClassName}`.trim()}>
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
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-old-money-200/60 pt-2.5 dark:border-charcoal-600/80">
          {bottomLeft}
          {bottomRight}
        </div>
      )}
    </div>
  )
}
