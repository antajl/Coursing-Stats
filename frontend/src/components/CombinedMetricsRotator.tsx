import { useEffect, useState, useSyncExternalStore } from 'react'
import { prefersReducedMotion } from '../lib/motion'

type SlideId = 'cs' | 'elo'

const SLIDES: SlideId[] = ['cs', 'elo']
/** How long each metric stays visible before crossfade. */
const ROTATE_MS = 4200

// ── Shared wall-clock ticker so every card flips in sync ──────────────
let sharedSlide = Math.floor(Date.now() / ROTATE_MS) % SLIDES.length
const listeners = new Set<() => void>()
let timeoutId: ReturnType<typeof setTimeout> | null = null
let intervalId: ReturnType<typeof setInterval> | null = null

function publishSlide() {
  sharedSlide = Math.floor(Date.now() / ROTATE_MS) % SLIDES.length
  listeners.forEach((l) => l())
}

function startSharedTicker() {
  if (timeoutId != null || intervalId != null) return
  const msUntilNext = ROTATE_MS - (Date.now() % ROTATE_MS)
  timeoutId = setTimeout(() => {
    timeoutId = null
    publishSlide()
    intervalId = setInterval(publishSlide, ROTATE_MS)
  }, msUntilNext)
}

function stopSharedTickerIfIdle() {
  if (listeners.size > 0) return
  if (timeoutId != null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  if (intervalId != null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function subscribeSharedSlide(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  startSharedTicker()
  return () => {
    listeners.delete(onStoreChange)
    stopSharedTickerIfIdle()
  }
}

function getSharedSlide() {
  return sharedSlide
}

function MutedMetric({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="text-[10px] font-medium tabular-nums text-charcoal-400 dark:text-charcoal-500">
        {value}
      </span>
      <span className="text-[7px] font-medium uppercase tracking-wide text-charcoal-400/90 dark:text-charcoal-500">
        {label}
      </span>
    </span>
  )
}

function BigMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline justify-end gap-1 leading-none">
      <span className="text-lg font-bold tabular-nums text-camel-700 dark:text-camel-400">{value}</span>
      <span className="text-[8px] font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        {label}
      </span>
    </div>
  )
}

const CROSSFADE =
  'absolute inset-y-0 right-0 flex items-center whitespace-nowrap transition-opacity duration-700 ease-in-out'

/**
 * На карточке combined: синхронно по всем строкам CS ↔ Elo с мягким кроссфейдом.
 * Hover / focus / tap — оба сразу. Медали не дублируем (они слева на карточке).
 */
export default function CombinedMetricsRotator({
  csValue,
  eloValue,
}: {
  csValue: string
  eloValue: string
}) {
  const reduceMotion = prefersReducedMotion()
  const slide = useSyncExternalStore(subscribeSharedSlide, getSharedSlide, () => 0)
  const [expanded, setExpanded] = useState(false)

  // Keep snapshot fresh on first paint even before first tick
  useEffect(() => {
    publishSlide()
  }, [])

  const expand = () => setExpanded(true)
  const collapse = () => setExpanded(false)

  const showCs = !expanded && !reduceMotion && SLIDES[slide] === 'cs'
  const showElo = !expanded && !reduceMotion && SLIDES[slide] === 'elo'
  const showAll = expanded || reduceMotion

  return (
    <div
      className="relative flex h-7 w-full items-center justify-end overflow-hidden"
      onMouseEnter={expand}
      onMouseLeave={collapse}
      onFocusCapture={expand}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) collapse()
      }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setExpanded((v) => !v)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
          e.stopPropagation()
          setExpanded((v) => !v)
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label="CS и Elo. Наведите или нажмите, чтобы увидеть оба."
    >
      <div
        className={`${CROSSFADE} ${showCs ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!showCs}
      >
        <BigMetric value={csValue} label="CS" />
      </div>
      <div
        className={`${CROSSFADE} ${showElo ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!showElo}
      >
        <BigMetric value={eloValue} label="Elo" />
      </div>
      <div
        className={`${CROSSFADE} gap-2 ${showAll ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!showAll}
      >
        <MutedMetric value={csValue} label="CS" />
        <MutedMetric value={eloValue} label="Elo" />
      </div>
    </div>
  )
}
