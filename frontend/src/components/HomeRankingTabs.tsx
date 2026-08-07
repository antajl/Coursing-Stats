import { useLayoutEffect, useRef, useState, useEffect } from 'react'

export type HomeRankingTab = 'placement' | 'score' | 'speed' | 'elo'

const SEGMENTS: { id: HomeRankingTab; label: string }[] = [
  { id: 'placement', label: 'Медали' },
  { id: 'score', label: 'Очки' },
  { id: 'elo', label: 'Elo' },
  { id: 'speed', label: 'Скорость' },
]

interface HomeRankingTabsProps {
  value: HomeRankingTab
  onChange: (tab: HomeRankingTab) => void
}

export default function HomeRankingTabs({ value, onChange }: HomeRankingTabsProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const [line, setLine] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return

    const update = () => {
      const btn = group.querySelector<HTMLElement>(`[data-seg-id="${CSS.escape(value)}"]`)
      if (!btn) return
      setLine({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true })
    }

    update()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(group)
    window.addEventListener('resize', update)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [value])

  // Keyboard navigation for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = SEGMENTS.findIndex((seg) => seg.id === value)
      if (currentIndex === -1) return

      let newIndex = currentIndex
      if (e.key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % SEGMENTS.length
      } else if (e.key === 'ArrowLeft') {
        newIndex = (currentIndex - 1 + SEGMENTS.length) % SEGMENTS.length
      } else {
        return
      }

      onChange(SEGMENTS[newIndex].id)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [value, onChange])

  return (
    <div 
      ref={groupRef} 
      className="home-ranking-tabs relative" 
      role="tablist" 
      aria-label="Тип рейтинга"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-camel-500 transition-[left,width] duration-200 ease-out dark:bg-camel-400"
        style={{
          left: line.left,
          width: line.width,
          opacity: line.ready ? 1 : 0,
        }}
      />
      {SEGMENTS.map((segment) => {
        const active = value === segment.id
        return (
          <button
            key={segment.id}
            type="button"
            data-seg-id={segment.id}
            className={`home-ranking-tab${active ? ' home-ranking-tab--active' : ''}`}
            onClick={() => onChange(segment.id)}
            role="tab"
            aria-selected={active}
            aria-controls="ranking-panel"
            tabIndex={active ? 0 : -1}
          >
            {segment.label}
          </button>
        )
      })}
    </div>
  )
}
