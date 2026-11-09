import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DoninoListRecordRow from './DoninoListRecordRow'
import DoninoColumnPlaque, { DoninoColumnShell } from './DoninoColumnPlaque'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'

interface SpeedRecord {
  id: string | number
  name: string
  sex: string
  breed: string
  speed_km_h: number
  date: string
  screenshot_url?: string
  status?: string
  history?: unknown[]
  track_type?: string | null
  rank?: number
  delta?: number | 'NEW' | null
}

interface CoursingRecord {
  id: string | number
  name: string
  breed: string
  sex?: string
  time_seconds: number
  date: string
  status?: string
  history?: unknown[]
  rank?: number
  delta?: number | 'NEW' | null
}

interface DoninoRecordsColumnsProps {
  speedRecords: SpeedRecord[]
  coursingRecords: CoursingRecord[]
  sortField: string
  sortDirection: string
  onSort: (field: string) => void
  resetScrollKey: string
}

export default function DoninoRecordsColumns({
  speedRecords,
  coursingRecords,
  sortField,
  sortDirection,
  onSort,
  resetScrollKey,
}: DoninoRecordsColumnsProps) {
  const [mobileTab, setMobileTab] = useState<'speed' | 'coursing'>('speed')
  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isNudging, setIsNudging] = useState(false)
  const hasInteractedRef = useRef(false)
  const nudgeTimerRef = useRef<number | null>(null)
  const nudgeEndTimerRef = useRef<number | null>(null)
  const hadMovedRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  const cancelNudge = useCallback(() => {
    if (nudgeTimerRef.current !== null) {
      clearTimeout(nudgeTimerRef.current)
      nudgeTimerRef.current = null
    }
    if (nudgeEndTimerRef.current !== null) {
      clearTimeout(nudgeEndTimerRef.current)
      nudgeEndTimerRef.current = null
    }
    setIsNudging(false)
  }, [])

  const triggerNudge = useCallback(() => {
    if (hasInteractedRef.current || (dragOffset !== null && dragOffset !== 0)) return
    cancelNudge()
    setIsNudging(true)
    nudgeEndTimerRef.current = window.setTimeout(() => {
      setIsNudging(false)
      nudgeEndTimerRef.current = null
    }, 750)
  }, [cancelNudge, dragOffset])

  // Auto-play invitation nudge on page load (after 600ms) only if not interacted
  useEffect(() => {
    if (hasInteractedRef.current) return
    nudgeTimerRef.current = window.setTimeout(() => {
      triggerNudge()
    }, 600)
    return () => {
      cancelNudge()
    }
  }, [triggerNudge, cancelNudge])

  // Touch handlers for mobile swipe
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    hasInteractedRef.current = true
    cancelNudge()
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || typeof window !== 'undefined' && window.innerWidth >= 1024) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      hadMovedRef.current = true
    }

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 8 && absDy < 8) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal') {
      const isAtLeftEdge = mobileTab === 'speed' && dx > 0
      const isAtRightEdge = mobileTab === 'coursing' && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      setDragOffset(appliedDx)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)
    const isHorizontal = gestureLockRef.current === 'horizontal'
    touchStartRef.current = null
    gestureLockRef.current = null

    if (isHorizontal) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)

      setIsTransitioning(true)
      setDragOffset(null)

      if (isSwipeLeft && mobileTab === 'speed') {
        setMobileTab('coursing')
        ;(e.nativeEvent as any)._doninoSwipeConsumed = true
      } else if (isSwipeRight && mobileTab === 'coursing') {
        setMobileTab('speed')
        ;(e.nativeEvent as any)._doninoSwipeConsumed = true
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false)
        transitionTimeoutRef.current = null
      }, 380)
    } else {
      setDragOffset(null)
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    setDragOffset(null)
    setIsTransitioning(false)
  }

  const listLength = Math.max(speedRecords.length, coursingRecords.length)
  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(listLength, [resetScrollKey])

  const latestSpeedDate = useMemo(() => {
    let max = ''
    for (const r of speedRecords) {
      if (r.date && r.date > max) max = r.date
    }
    return max || null
  }, [speedRecords])

  const latestCoursingDate = useMemo(() => {
    let max = ''
    for (const r of coursingRecords) {
      if (r.date && r.date > max) max = r.date
    }
    return max || null
  }, [coursingRecords])

  const visibleSpeed = speedRecords.slice(0, visibleCount)
  const visibleCoursing = coursingRecords.slice(0, visibleCount)

  const emptyBoth = speedRecords.length === 0 && coursingRecords.length === 0

  if (emptyBoth) {
    return <div className="py-12 text-center text-old-money-600">Нет данных</div>
  }

  const isDragging = dragOffset !== null && dragOffset !== 0
  const isAnimating = isDragging || isTransitioning
  const mobileTransform = `translateX(calc(${mobileTab === 'speed' ? '0%' : '-100%'} + ${dragOffset ?? 0}px))`

  const speedPlaque = (
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title="Замер скорости"
        count={speedRecords.length}
        countClassName="pr-28 lg:pr-0"
      />
      <button
        type="button"
        onClick={() => {
          hasInteractedRef.current = true
          cancelNudge()
          setMobileTab('coursing')
        }}
        className={`lg:hidden absolute top-1/2 -translate-y-1/2 right-0 z-20 inline-flex items-center gap-1 rounded-l-full border-y border-l border-camel-400/90 bg-camel-100/80 pl-3 pr-2 py-1 text-[11px] font-bold text-camel-950 shadow-md backdrop-blur-md transition-all hover:bg-camel-200 active:scale-95 cursor-pointer touch-manipulation ${
          isNudging ? 'animate-tab-nudge-left' : ''
        }`}
        title="Смахните экран или нажмите для перехода к бегам 350 м"
        aria-label="Перейти к бегам 350 м"
      >
        <span>Бега 350 м</span>
        <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" />
      </button>
    </div>
  )

  const coursingPlaque = (
    <div className="relative">
      <DoninoColumnPlaque
        asHeader
        title="Бега 350 м"
        count={coursingRecords.length}
        titleClassName="pl-20 lg:pl-0"
      />
      <button
        type="button"
        onClick={() => {
          hasInteractedRef.current = true
          cancelNudge()
          setMobileTab('speed')
        }}
        className={`lg:hidden absolute top-1/2 -translate-y-1/2 left-0 z-20 inline-flex items-center gap-1 rounded-r-full border-y border-r border-camel-400/90 bg-camel-100/80 pr-3 pl-2 py-1 text-[11px] font-bold text-camel-950 shadow-md backdrop-blur-md transition-all hover:bg-camel-200 active:scale-95 cursor-pointer touch-manipulation ${
          isNudging ? 'animate-tab-nudge-right' : ''
        }`}
        title="Смахните экран или нажмите для перехода к замерам"
        aria-label="Перейти к замерам"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" />
        <span>Замер</span>
      </button>
    </div>
  )

  return (
    <div className="space-y-2.5 sm:space-y-4">
      {/* Мобильный свайп-контейнер и десктопная двухколоночная сетка */}
      <div
        className="w-full relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onClickCapture={(e) => {
          if (hadMovedRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        {/* GPU Keyframes for ultra-smooth spring nudge */}
        <style>{`
          @keyframes silkNudgeLeft {
            0% { transform: translate3d(0, 0, 0); }
            22% { transform: translate3d(-34px, 0, 0); }
            38% { transform: translate3d(-34px, 0, 0); }
            66% { transform: translate3d(4px, 0, 0); }
            82% { transform: translate3d(-1px, 0, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }
          @keyframes silkNudgeRight {
            0% { transform: translate3d(-100%, 0, 0); }
            22% { transform: translate3d(calc(-100% + 34px), 0, 0); }
            38% { transform: translate3d(calc(-100% + 34px), 0, 0); }
            66% { transform: translate3d(calc(-100% - 4px), 0, 0); }
            82% { transform: translate3d(calc(-100% + 1px), 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
          }
          .animate-silk-nudge-left {
            animation: silkNudgeLeft 750ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
          .animate-silk-nudge-right {
            animation: silkNudgeRight 750ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
        `}</style>

        <div
          className="flex w-full items-start lg:grid lg:grid-cols-2 lg:gap-8 lg:!transform-none"
          style={{
            transform: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'none' : mobileTransform,
            transition: isDragging
              ? 'none'
              : 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          {/* Слайд 1: Замер скорости */}
          <div
            className={`w-full shrink-0 lg:w-auto lg:shrink transition-opacity duration-200 ${
              !isAnimating && mobileTab === 'coursing'
                ? 'h-0 overflow-hidden opacity-0 lg:h-auto lg:overflow-visible lg:opacity-100'
                : 'h-auto opacity-100'
            }`}
          >
            <DoninoColumnShell plaque={speedPlaque}>
              {visibleSpeed.length > 0 ? (
                visibleSpeed.map((record) => (
                  <DoninoListRecordRow
                    key={`speed-${record.breed}-${record.name}`}
                    mode="speed"
                    name={record.name}
                    breed={record.breed}
                    sex={record.sex}
                    date={record.date}
                    status={record.status}
                    history={record.history}
                    speedKmh={record.speed_km_h}
                    screenshotUrl={record.screenshot_url}
                    trackType={record.track_type}
                    rank={record.rank}
                    delta={record.delta}
                    latestDateInDataset={latestSpeedDate}
                  />
                ))
              ) : (
                <p className="donino-home-empty">Нет данных</p>
              )}
            </DoninoColumnShell>
          </div>

          {/* Слайд 2: Бега 350 м */}
          <div
            className={`w-full shrink-0 lg:w-auto lg:shrink transition-opacity duration-200 ${
              !isAnimating && mobileTab === 'speed'
                ? 'h-0 overflow-hidden opacity-0 lg:h-auto lg:overflow-visible lg:opacity-100'
                : 'h-auto opacity-100'
            }`}
          >
            <DoninoColumnShell plaque={coursingPlaque}>
              {visibleCoursing.length > 0 ? (
                visibleCoursing.map((record) => (
                  <DoninoListRecordRow
                    key={`coursing-${record.breed}-${record.name}`}
                    mode="coursing"
                    name={record.name}
                    breed={record.breed}
                    sex={record.sex}
                    date={record.date}
                    status={record.status}
                    history={record.history}
                    timeSeconds={record.time_seconds}
                    rank={record.rank}
                    delta={record.delta}
                    latestDateInDataset={latestCoursingDate}
                  />
                ))
              ) : (
                <p className="donino-home-empty">Нет данных</p>
              )}
            </DoninoColumnShell>
          </div>
        </div>
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="py-4 text-center text-sm text-charcoal-500"
        >
          Загрузка…
        </div>
      )}
    </div>
  )
}
