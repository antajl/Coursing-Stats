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
  const trackRef = useRef<HTMLDivElement>(null)
  const [isNudging, setIsNudging] = useState(false)
  const hasInteractedRef = useRef(false)
  const nudgeTimerRef = useRef<number | null>(null)
  const nudgeEndTimerRef = useRef<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const hadMovedRef = useRef(false)
  const gapPx = 16

  const getSlideOffset = useCallback(
    (slideIndex: number) => {
      return slideIndex === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
    },
    [gapPx],
  )

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
    if (hasInteractedRef.current) return
    cancelNudge()
    setIsNudging(true)
    nudgeEndTimerRef.current = window.setTimeout(() => {
      setIsNudging(false)
      nudgeEndTimerRef.current = null
    }, 750)
  }, [cancelNudge])

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

  const currentSlideRef = useRef<number>(mobileTab === 'speed' ? 0 : 1)

  const handleTabChange = useCallback(
    (targetTab: 'speed' | 'coursing') => {
      hasInteractedRef.current = true
      cancelNudge()
      const targetSlide = targetTab === 'speed' ? 0 : 1
      currentSlideRef.current = targetSlide
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${getSlideOffset(targetSlide)}, 0, 0)`
      }
      setMobileTab(targetTab)
    },
    [getSlideOffset, cancelNudge],
  )

  // Плавная анимация скольжения колонок при изменении активной дисциплины
  useEffect(() => {
    const slideIndex = mobileTab === 'speed' ? 0 : 1
    if (currentSlideRef.current !== slideIndex) {
      currentSlideRef.current = slideIndex
      if (trackRef.current && (typeof window === 'undefined' || window.innerWidth < 1024)) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${getSlideOffset(slideIndex)}, 0, 0)`
      }
    }
  }, [mobileTab, getSlideOffset])

  const startDrag = (clientX: number, clientY: number) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    hasInteractedRef.current = true
    cancelNudge()
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const moveDrag = (clientX: number, clientY: number) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const touch = touchStartRef.current
    const dx = clientX - touch.x
    const dy = clientY - touch.y

    if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
      hadMovedRef.current = true
    }

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 7 && absDy < 7) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal' && trackRef.current) {
      const currentSlide = mobileTab === 'speed' ? 0 : 1
      const isAtLeftEdge = currentSlide === 0 && dx > 0
      const isAtRightEdge = currentSlide === 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      const base = currentSlide === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
      trackRef.current.style.transform = `translate3d(calc(${base} + ${appliedDx}px), 0, 0)`
    }
  }

  const endDrag = (clientX: number, nativeEvent?: any) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return

    const isHorizontal = gestureLockRef.current === 'horizontal'
    const dx = clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    const track = trackRef.current
    const currentSlide = mobileTab === 'speed' ? 0 : 1

    if (isHorizontal && track) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)
      let targetSlide: 0 | 1 = currentSlide

      if (isSwipeLeft && currentSlide === 0) {
        targetSlide = 1
        if (nativeEvent) nativeEvent._doninoSwipeConsumed = true
      } else if (isSwipeRight && currentSlide === 1) {
        targetSlide = 0
        if (nativeEvent) nativeEvent._doninoSwipeConsumed = true
      }

      currentSlideRef.current = targetSlide
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(targetSlide)}, 0, 0)`

      if (targetSlide !== currentSlide) {
        setMobileTab(targetSlide === 0 ? 'speed' : 'coursing')
      }
    } else if (track) {
      currentSlideRef.current = currentSlide
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
  }

  const cancelDrag = () => {
    hasInteractedRef.current = true
    cancelNudge()
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current) {
      const currentSlide = mobileTab === 'speed' ? 0 : 1
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    moveDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    endDrag(e.changedTouches[0].clientX, e.nativeEvent)
  }

  const handleTouchCancel = () => {
    cancelDrag()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    startDrag(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    moveDrag(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    endDrag(e.clientX)
  }

  const handleMouseLeave = () => {
    if (touchStartRef.current) {
      cancelDrag()
    }
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
        onClick={() => handleTabChange('coursing')}
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
        onClick={() => handleTabChange('speed')}
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
        className="w-full relative overflow-x-clip lg:overflow-visible touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClickCapture={(e) => {
          if (hadMovedRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <div
          ref={trackRef}
          className={`flex flex-nowrap w-full min-w-0 items-start gap-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:!transform-none ${
            isNudging
              ? mobileTab === 'speed'
                ? 'animate-silk-nudge-left'
                : 'animate-silk-nudge-right'
              : ''
          }`}
          style={{
            transform:
              typeof window !== 'undefined' && window.innerWidth >= 1024
                ? 'none'
                : isNudging
                ? undefined
                : `translate3d(${getSlideOffset(mobileTab === 'speed' ? 0 : 1)}, 0, 0)`,
            willChange: 'transform',
          }}
        >
          {/* Слайд 1: Замер скорости */}
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto">
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
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto">
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
