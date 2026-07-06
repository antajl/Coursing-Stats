import {
  TOOLBAR_SEGMENT,
  TOOLBAR_SEGMENT_ACTIVE,
  TOOLBAR_SEGMENT_GROUP,
  TOOLBAR_SEGMENT_IDLE,
} from '../../lib/toolbar'

interface ViewToggleProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
  tableLabel?: string
}

const VIEW_SEGMENTS = (tableLabel: string) => [
  { id: 'table', label: tableLabel },
  { id: 'stats', label: 'Статистика' },
] as const

export default function ViewToggle({
  view,
  onViewChange,
  tableLabel = 'Записи',
}: ViewToggleProps) {
  return (
    <div className={TOOLBAR_SEGMENT_GROUP} role="group" aria-label="Режим просмотра">
      {VIEW_SEGMENTS(tableLabel).map((segment) => (
        <button
          key={segment.id}
          type="button"
          onClick={() => onViewChange(segment.id as 'table' | 'stats')}
          className={`${TOOLBAR_SEGMENT} ${view === segment.id ? TOOLBAR_SEGMENT_ACTIVE : TOOLBAR_SEGMENT_IDLE}`}
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
