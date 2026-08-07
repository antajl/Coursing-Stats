import SlidingSegmentControl from './SlidingSegmentControl'

interface ViewToggleProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
  tableLabel?: string
}

export default function ViewToggle({
  view,
  onViewChange,
  tableLabel = 'Записи',
}: ViewToggleProps) {
  return (
    <SlidingSegmentControl
      ariaLabel="Режим просмотра"
      value={view}
      onChange={(id) => onViewChange(id as 'table' | 'stats')}
      segments={[
        { id: 'table', label: tableLabel },
        { id: 'stats', label: 'Статистика' },
      ]}
    />
  )
}
