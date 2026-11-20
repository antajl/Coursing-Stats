import { useState, useRef, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { RankedJudgeItem } from '../dogJudgesStats'
import { formatExpertsCount, formatShowMoreExperts } from '../dogJudgesStats'
import { DogJudgeRow } from '../DogJudgeRow'

export interface DogJudgesCarouselProps {
  higherThanCareer: RankedJudgeItem[]
  lowerThanCareer: RankedJudgeItem[]
  expandedJudgeKey: string | null
  onToggleJudge: (key: string) => void
  eventPlacementMap: Map<string | number, number>
}

const INITIAL_LIMIT = 5
const EXPAND_THRESHOLD = 6

export function DogJudgesCarousel({
  higherThanCareer,
  lowerThanCareer,
  expandedJudgeKey,
  onToggleJudge,
  eventPlacementMap,
}: DogJudgesCarouselProps) {
  const [isHigherExpanded, setIsHigherExpanded] = useState(false)
  const [isLowerExpanded, setIsLowerExpanded] = useState(false)

  // Мобильная карусель: вкладка 0 (Выше обычного) или 1 (Строже обычного) со свайпом
  const [activeMobileTab, setActiveMobileTab] = useState<0 | 1>(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const hadMovedRef = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.touches[0].clientX - touchStartRef.current.x
    const dy = e.touches[0].clientY - touchStartRef.current.y

    if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
      hadMovedRef.current = true
    }

    if (!gestureLockRef.current) {
      if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return
      if (Math.abs(dy) >= Math.abs(dx)) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal' && trackRef.current) {
      const isAtLeftEdge = activeMobileTab === 0 && dx > 0
      const isAtRightEdge = activeMobileTab === 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      const baseOffset = activeMobileTab === 0 ? '0%' : '-100%'
      trackRef.current.style.transform = `translate3d(calc(${baseOffset} + ${appliedDx}px), 0, 0)`
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const isHorizontal = gestureLockRef.current === 'horizontal'
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    if (isHorizontal && trackRef.current) {
      let target: 0 | 1 = activeMobileTab
      if ((dx < -35 || (dx < -15 && velocity > 0.2)) && activeMobileTab === 0) {
        target = 1
      } else if ((dx > 35 || (dx > 15 && velocity > 0.2)) && activeMobileTab === 1) {
        target = 0
      }
      setActiveMobileTab(target)
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${target === 0 ? '0%' : '-100%'}, 0, 0)`
    } else if (trackRef.current) {
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${activeMobileTab === 0 ? '0%' : '-100%'}, 0, 0)`
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${activeMobileTab === 0 ? '0%' : '-100%'}, 0, 0)`
    }
  }

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hadMovedRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${activeMobileTab === 0 ? '0%' : '-100%'}, 0, 0)`
    }
  }, [activeMobileTab])

  const visibleHigher =
    isHigherExpanded || higherThanCareer.length <= EXPAND_THRESHOLD
      ? higherThanCareer
      : higherThanCareer.slice(0, INITIAL_LIMIT)

  const visibleLower =
    isLowerExpanded || lowerThanCareer.length <= EXPAND_THRESHOLD
      ? lowerThanCareer
      : lowerThanCareer.slice(0, INITIAL_LIMIT)

  const renderJudgeRow = (judge: RankedJudgeItem, variant: 'higher' | 'lower') => (
    <DogJudgeRow
      key={judge.judge_key}
      judge={judge}
      variant={variant}
      isExpanded={expandedJudgeKey === judge.judge_key}
      onToggle={() => onToggleJudge(judge.judge_key)}
      eventPlacementMap={eventPlacementMap}
    />
  )

  const higherCard = (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs h-full flex flex-col">
      <div className="relative px-3.5 py-2.5 bg-forest-50/70 border-b border-old-money-200/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 min-w-0 pr-24 md:pr-0">
          <TrendingUp className="w-3.5 h-3.5 text-forest-700 shrink-0" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800 truncate">
            Выше обычного
          </h3>
          <span className="text-[11px] text-forest-800 font-semibold tabular-nums ml-0.5">
            {formatExpertsCount(higherThanCareer.length)}
          </span>
        </div>

        {/* На мобилке: правый язычок для перехода к «Строже обычного» */}
        <button
          type="button"
          onClick={() => setActiveMobileTab(1)}
          className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/95 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-2 rounded-l-full border-y border-l border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
          title="Перейти: Строже обычного"
          aria-label="Перейти: Строже обычного"
        >
          <span className="tracking-tight text-rose-900 font-semibold">Строже</span>
          <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-rose-200/80 text-rose-950 shrink-0">
            {lowerThanCareer.length}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-rose-800 shrink-0" aria-hidden />
        </button>
      </div>

      {higherThanCareer.length > 0 ? (
        <>
          <div className="divide-y divide-old-money-100 flex-1">
            {visibleHigher.map((j) => renderJudgeRow(j, 'higher'))}
          </div>
          {higherThanCareer.length > EXPAND_THRESHOLD && (
            <button
              type="button"
              onClick={() => setIsHigherExpanded((prev) => !prev)}
              className="w-full py-2.5 px-3 bg-cream-50/70 hover:bg-cream-100/80 border-t border-old-money-200/70 text-xs font-semibold text-charcoal-700 hover:text-camel-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
            >
              {isHigherExpanded ? (
                <>
                  <span>Свернуть</span>
                  <ChevronUp className="w-3.5 h-3.5 text-charcoal-500" aria-hidden />
                </>
              ) : (
                <>
                  <span>
                    {formatShowMoreExperts(higherThanCareer.length - INITIAL_LIMIT)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" aria-hidden />
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-xs text-charcoal-400 flex-1 flex items-center justify-center">
          Пока нет экспертов с оценками выше средних
        </div>
      )}
    </div>
  )

  const lowerCard = (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs h-full flex flex-col">
      <div className="relative px-3.5 py-2.5 bg-rose-50/70 border-b border-old-money-200/80 flex items-center justify-between select-none">
        {/* На мобилке: левый язычок для перехода к «Выше обычного» */}
        <button
          type="button"
          onClick={() => setActiveMobileTab(0)}
          className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/95 text-camel-950 font-bold text-[11px] py-1 pl-2 pr-2.5 rounded-r-full border-y border-r border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
          title="Перейти: Выше обычного"
          aria-label="Перейти: Выше обычного"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-forest-800 shrink-0" aria-hidden />
          <span className="tracking-tight text-forest-900 font-semibold">Выше</span>
          <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-forest-200/80 text-forest-950 shrink-0">
            {higherThanCareer.length}
          </span>
        </button>

        <div className="flex items-center gap-1.5 min-w-0 md:pl-0 pl-24 justify-end md:justify-start w-full">
          <TrendingDown className="w-3.5 h-3.5 text-rose-700 shrink-0" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800 truncate">
            Строже обычного
          </h3>
          <span className="text-[11px] text-rose-800 font-semibold tabular-nums ml-0.5">
            {formatExpertsCount(lowerThanCareer.length)}
          </span>
        </div>
      </div>

      {lowerThanCareer.length > 0 ? (
        <>
          <div className="divide-y divide-old-money-100 flex-1">
            {visibleLower.map((j) => renderJudgeRow(j, 'lower'))}
          </div>
          {lowerThanCareer.length > EXPAND_THRESHOLD && (
            <button
              type="button"
              onClick={() => setIsLowerExpanded((prev) => !prev)}
              className="w-full py-2.5 px-3 bg-cream-50/70 hover:bg-cream-100/80 border-t border-old-money-200/70 text-xs font-semibold text-charcoal-700 hover:text-camel-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
            >
              {isLowerExpanded ? (
                <>
                  <span>Свернуть</span>
                  <ChevronUp className="w-3.5 h-3.5 text-charcoal-500" aria-hidden />
                </>
              ) : (
                <>
                  <span>
                    {formatShowMoreExperts(lowerThanCareer.length - INITIAL_LIMIT)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" aria-hidden />
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-xs text-charcoal-400 flex-1 flex items-center justify-center">
          Пока нет экспертов со строгими оценками
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Десктоп: 2 колонки рядом */}
      <div className="hidden md:grid md:grid-cols-2 gap-3 items-start">
        {higherCard}
        {lowerCard}
      </div>

      {/* Мобильный вид: горизонтальный свайп между колонками */}
      <div
        className="block md:hidden relative overflow-x-clip touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onClickCapture={handleClickCapture}
      >
        <div
          ref={trackRef}
          className="flex flex-nowrap w-full min-w-0 items-stretch gap-0"
          style={{
            transform: activeMobileTab === 0 ? 'translate3d(0%, 0, 0)' : 'translate3d(-100%, 0, 0)',
            willChange: 'transform',
          }}
        >
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full">{higherCard}</div>
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full">{lowerCard}</div>
        </div>

        {/* Точки-индикаторы положения свайпа */}
        <div className="flex items-center justify-center gap-1.5 pt-2" aria-hidden="true">
          <button
            type="button"
            onClick={() => setActiveMobileTab(0)}
            className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeMobileTab === 0 ? 'w-5 bg-camel-600' : 'w-1.5 bg-old-money-300'
            }`}
            aria-label="Слайд: Выше обычного"
          />
          <button
            type="button"
            onClick={() => setActiveMobileTab(1)}
            className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeMobileTab === 1 ? 'w-5 bg-camel-600' : 'w-1.5 bg-old-money-300'
            }`}
            aria-label="Слайд: Строже обычного"
          />
        </div>
      </div>
    </>
  )
}
