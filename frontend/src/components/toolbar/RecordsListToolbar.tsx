import ViewToggle from './ViewToggle'
import PageToolbar from './PageToolbar'
import type { ActiveFilterChip } from './ToolbarActiveFilters'
import type { ReactNode } from 'react'

interface RecordsListToolbarProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
  filters: ReactNode
  exportAction?: ReactNode
  activeFilterChips?: ActiveFilterChip[]
  onClearAllFilters?: () => void
  sortBar?: ReactNode
}

export default function RecordsListToolbar({
  view,
  onViewChange,
  filters,
  exportAction,
  activeFilterChips = [],
  onClearAllFilters,
  sortBar,
}: RecordsListToolbarProps) {
  return (
    <PageToolbar
      filters={filters}
      exportAction={exportAction}
      activeFilterChips={activeFilterChips}
      onClearAllFilters={onClearAllFilters}
      bottomLeft={<ViewToggle view={view} onViewChange={onViewChange} />}
      bottomRight={sortBar}
    />
  )
}
