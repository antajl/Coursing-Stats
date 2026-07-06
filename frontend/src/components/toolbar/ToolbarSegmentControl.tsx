import {
  TOOLBAR_SEGMENT,
  TOOLBAR_SEGMENT_ACTIVE,
  TOOLBAR_SEGMENT_GROUP,
  TOOLBAR_SEGMENT_IDLE,
} from '../../lib/toolbar'

export interface ToolbarSegment {
  id: string
  label: string
}

interface ToolbarSegmentControlProps {
  segments: ToolbarSegment[]
  value: string
  onChange: (id: string) => void
  ariaLabel: string
}

export default function ToolbarSegmentControl({
  segments,
  value,
  onChange,
  ariaLabel,
}: ToolbarSegmentControlProps) {
  return (
    <div className={TOOLBAR_SEGMENT_GROUP} role="group" aria-label={ariaLabel}>
      {segments.map((segment) => (
        <button
          key={segment.id}
          type="button"
          onClick={() => onChange(segment.id)}
          className={`${TOOLBAR_SEGMENT} ${value === segment.id ? TOOLBAR_SEGMENT_ACTIVE : TOOLBAR_SEGMENT_IDLE}`}
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
