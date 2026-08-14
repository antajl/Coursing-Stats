import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE, TOOLBAR_FILTER_YEAR_CHIP } from '../../lib/toolbar'

interface ToolbarYearChipsProps {
  years: string[]
  mode?: 'single' | 'multi'
  /** single: выбранный год; multi: выбранные годы */
  value: string | string[]
  /** Клик по году (single: выбрать/снять; multi: toggle — делает родитель). */
  onChange: (year: string) => void
  /** single: чип «Все» (пустой value). multi: чип сбрасывает выбор через onClear. */
  showAll?: boolean
  allLabel?: string
  onClear?: () => void
}

function updateScrollState(el: HTMLDivElement) {
  const max = el.scrollWidth - el.clientWidth
  return {
    canLeft: el.scrollLeft > 2,
    canRight: max > 2 && el.scrollLeft < max - 2,
  }
}

function yearSelected(mode: 'single' | 'multi', value: string | string[], year: string) {
  if (mode === 'multi') return Array.isArray(value) && value.includes(year)
  return value === year
}

function allActive(mode: 'single' | 'multi', value: string | string[]) {
  if (mode === 'multi') return Array.isArray(value) && value.length === 0
  return !value
}

export default function ToolbarYearChips({
  years,
  mode = 'single',
  value,
  onChange,
  showAll = true,
  allLabel = 'Все',
  onClear,
}: ToolbarYearChipsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const refresh = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const next = updateScrollState(el)
    setCanLeft(next.canLeft)
    setCanRight(next.canRight)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    refresh()
    const ro = new ResizeObserver(() => refresh())
    ro.observe(el)
    el.addEventListener('scroll', refresh, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', refresh)
    }
  }, [refresh, years])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const selected = el.querySelector<HTMLElement>('[data-year-chip][aria-pressed="true"]')
    selected?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
    const t = window.setTimeout(refresh, 320)
    return () => window.clearTimeout(t)
  }, [value, refresh])

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const step = Math.max(Math.round(el.clientWidth * 0.75), 140)
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const navBtn =
    'inline-flex min-h-[44px] min-w-[44px] h-7 w-7 shrink-0 items-center justify-center rounded-full border border-old-money-200 bg-white text-charcoal-700 shadow-sm transition-colors hover:bg-old-money-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-200 dark:hover:bg-charcoal-700'

  const handleAll = () => {
    if (mode === 'multi') onClear?.()
    else onChange('')
  }

  const handleYear = (year: string) => {
    if (mode === 'single') onChange(yearSelected(mode, value, year) ? '' : year)
    else onChange(year)
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      {canLeft ? (
        <button type="button" aria-label="Более новые годы" onClick={() => scrollByPage(-1)} className={navBtn}>
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
      ) : null}

      <div className="relative min-w-0 flex-1">
        {canLeft ? (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-cream-50 to-transparent dark:from-charcoal-800"
            aria-hidden
          />
        ) : null}
        {canRight ? (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-cream-50 to-transparent dark:from-charcoal-800"
            aria-hidden
          />
        ) : null}
        <div
          ref={scrollerRef}
          className="flex flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {showAll ? (
            <button
              type="button"
              data-year-chip
              aria-pressed={allActive(mode, value)}
              onClick={handleAll}
              className={`${TOOLBAR_FILTER_YEAR_CHIP} ${
                allActive(mode, value) ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE
              }`}
            >
              {allLabel}
            </button>
          ) : null}
          {years.map((year) => {
            const selected = yearSelected(mode, value, year)
            return (
              <button
                key={year}
                type="button"
                data-year-chip
                aria-pressed={selected}
                onClick={() => handleYear(year)}
                className={`${TOOLBAR_FILTER_YEAR_CHIP} ${selected ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}`}
              >
                {year}
              </button>
            )
          })}
        </div>
      </div>

      {canRight ? (
        <button type="button" aria-label="Более старые годы" onClick={() => scrollByPage(1)} className={navBtn}>
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  )
}
