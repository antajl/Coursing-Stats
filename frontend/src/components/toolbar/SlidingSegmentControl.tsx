import { useLayoutEffect, useRef, useState } from 'react'
import {
  TOOLBAR_SEGMENT,
  TOOLBAR_SEGMENT_GROUP,
  TOOLBAR_SEGMENT_IDLE,
} from '../../lib/toolbar'

export interface SlidingSegment {
  id: string
  label: string
}

interface SlidingSegmentControlProps {
  segments: SlidingSegment[]
  value: string
  onChange: (id: string) => void
  ariaLabel: string
}

/**
 * Сегменты тулбара со скользящей camel-подложкой под активным пунктом.
 */
export default function SlidingSegmentControl({
  segments,
  value,
  onChange,
  ariaLabel,
}: SlidingSegmentControlProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return

    const update = () => {
      const btn = group.querySelector<HTMLElement>(`[data-seg-id="${CSS.escape(value)}"]`)
      if (!btn) return
      setPill({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        ready: true,
      })
    }

    update()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(group)
    window.addEventListener('resize', update)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [value, segments])

  return (
    <div ref={groupRef} className={`${TOOLBAR_SEGMENT_GROUP} relative`} role="group" aria-label={ariaLabel}>
      <span
        aria-hidden
        className="pointer-events-none absolute top-0.5 bottom-0.5 rounded-md bg-camel-500 shadow-sm transition-[left,width] duration-200 ease-out dark:bg-camel-600"
        style={{
          left: pill.left,
          width: pill.width,
          opacity: pill.ready ? 1 : 0,
        }}
      />
      {segments.map((segment) => {
        const active = value === segment.id
        return (
          <button
            key={segment.id}
            id={`tab-${segment.id}`}
            type="button"
            data-seg-id={segment.id}
            onClick={() => onChange(segment.id)}
            className={`${TOOLBAR_SEGMENT} relative z-[1] ${
              active
                ? 'text-charcoal-900 dark:text-cream-50'
                : TOOLBAR_SEGMENT_IDLE
            }`}
            aria-pressed={active}
          >
            {segment.label}
          </button>
        )
      })}
    </div>
  )
}
