import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { DogProfileEventItem } from './DogJudgesSection'
import {
  type DogOrgItem,
  type OrgDisciplineFilter,
  computeDogOrganizationStats,
  formatOrgsCount,
  formatWinsCount,
  formatStartsCount,
  formatShowMoreOrgs,
} from './dogOrganizationsStats'
import { DogOrganizationRow } from './components/DogOrganizationRow'

export * from './dogOrganizationsStats'

interface DogOrganizationsSectionProps {
  competitions?: DogProfileEventItem[]
  initialDiscipline?: OrgDisciplineFilter
}

export function DogOrganizationsSection({
  competitions = [],
  initialDiscipline = 'all',
}: DogOrganizationsSectionProps) {
  const [selectedDiscipline, setSelectedDiscipline] = useState<OrgDisciplineFilter>(initialDiscipline)
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set())

  const toggleOrg = (orgKey: string) => {
    setExpandedOrgs((prev) => {
      const next = new Set(prev)
      if (next.has(orgKey)) {
        next.delete(orgKey)
      } else {
        next.add(orgKey)
      }
      return next
    })
  }

  // Считаем доступность дисциплин у собаки
  const { hasCoursing, hasRacing } = useMemo(() => {
    let coursing = false
    let racing = false
    for (const c of competitions) {
      if (c.event_type === 'racing') racing = true
      else coursing = true
    }
    return { hasCoursing: coursing, hasRacing: racing }
  }, [competitions])

  const showDisciplineFilter = hasCoursing && hasRacing

  // Вычисляем аналитику побед по организациям
  const orgStats = useMemo(() => {
    return computeDogOrganizationStats(competitions, selectedDiscipline)
  }, [competitions, selectedDiscipline])

  // Ограничение начального отображения для длинных списков
  const INITIAL_LIMIT = 5
  const EXPAND_THRESHOLD = 6

  const [isHigherExpanded, setIsHigherExpanded] = useState(false)
  const [isLowerExpanded, setIsLowerExpanded] = useState(false)

  // Мобильная карусель: вкладка 0 (Выше обычного) или 1 (Сложнее победить) со свайпом
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

  if (!orgStats || orgStats.total_starts === 0) {
    return null
  }

  const visibleHigher =
    isHigherExpanded || orgStats.higher_than_career.length <= EXPAND_THRESHOLD
      ? orgStats.higher_than_career
      : orgStats.higher_than_career.slice(0, INITIAL_LIMIT)

  const visibleLower =
    isLowerExpanded || orgStats.lower_than_career.length <= EXPAND_THRESHOLD
      ? orgStats.lower_than_career
      : orgStats.lower_than_career.slice(0, INITIAL_LIMIT)

  const renderOrgRow = (org: DogOrgItem, variant: 'higher' | 'lower') => (
    <DogOrganizationRow
      key={org.org_key}
      org={org}
      variant={variant}
      isExpanded={expandedOrgs.has(org.org_key)}
      onToggle={() => toggleOrg(org.org_key)}
    />
  )

  const higherCard = (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs h-full flex flex-col">
      <div className="relative px-3.5 py-2.5 bg-forest-50/70 border-b border-old-money-200/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 min-w-0 pr-24 md:pr-0">
          <Trophy className="w-3.5 h-3.5 text-forest-700 shrink-0" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800 truncate">
            Выше обычного
          </h3>
          <span className="text-[11px] text-forest-800 font-semibold tabular-nums ml-0.5">
            {formatOrgsCount(orgStats.higher_than_career.length)}
          </span>
        </div>

        {/* На мобилке: правый язычок для перехода к «Сложнее победить» */}
        <button
          type="button"
          onClick={() => setActiveMobileTab(1)}
          className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1 bg-[#fbf7f0]/95 text-camel-950 font-bold text-[11px] py-1 pl-2.5 pr-2 rounded-l-full border-y border-l border-camel-400/60 shadow-xs backdrop-blur-md transition-all hover:bg-camel-100/90 active:scale-95 cursor-pointer touch-manipulation select-none"
          title="Перейти: Сложнее победить"
          aria-label="Перейти: Сложнее победить"
        >
          <span className="tracking-tight text-rose-900 font-semibold">Сложнее</span>
          <span className="text-[9px] tabular-nums font-bold px-1 py-0 rounded-full bg-rose-200/80 text-rose-950 shrink-0">
            {orgStats.lower_than_career.length}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-rose-800 shrink-0" aria-hidden />
        </button>
      </div>

      {orgStats.higher_than_career.length > 0 ? (
        <>
          <div className="divide-y divide-old-money-100 flex-1">
            {visibleHigher.map((org) => renderOrgRow(org, 'higher'))}
          </div>
          {orgStats.higher_than_career.length > EXPAND_THRESHOLD && (
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
                    {formatShowMoreOrgs(orgStats.higher_than_career.length - INITIAL_LIMIT)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" aria-hidden />
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-xs text-charcoal-400 flex-1 flex items-center justify-center">
          Пока нет организаций с процентом побед выше среднего
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
            {orgStats.higher_than_career.length}
          </span>
        </button>

        <div className="flex items-center gap-1.5 min-w-0 md:pl-0 pl-24 justify-end md:justify-start w-full">
          <TrendingDown className="w-3.5 h-3.5 text-rose-700 shrink-0" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800 truncate">
            Сложнее победить
          </h3>
          <span className="text-[11px] text-rose-800 font-semibold tabular-nums ml-0.5">
            {formatOrgsCount(orgStats.lower_than_career.length)}
          </span>
        </div>
      </div>

      {orgStats.lower_than_career.length > 0 ? (
        <>
          <div className="divide-y divide-old-money-100 flex-1">
            {visibleLower.map((org) => renderOrgRow(org, 'lower'))}
          </div>
          {orgStats.lower_than_career.length > EXPAND_THRESHOLD && (
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
                    {formatShowMoreOrgs(orgStats.lower_than_career.length - INITIAL_LIMIT)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" aria-hidden />
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-xs text-charcoal-400 flex-1 flex items-center justify-center">
          Пока нет организаций со сложной статистикой
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Шапка секции со средним Win Rate и переключателем дисциплин */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
              Статистика побед по клубам и организациям
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50/90 text-amber-950 border border-amber-300/80 shadow-2xs whitespace-nowrap shrink-0 tabular-nums">
              <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden />
              <span>{orgStats.total_wins}</span>
              <span className="text-amber-800/80 font-normal whitespace-nowrap">из {orgStats.total_starts}</span>
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-0.5">
            {formatWinsCount(orgStats.total_wins)} в {formatOrgsCount(orgStats.orgs_count)} · общий Win Rate собаки:{' '}
            <strong className="text-charcoal-800 font-semibold">{orgStats.career_win_rate}%</strong>
          </p>
        </div>

        {/* Переключатель курсинг / рейсинг при наличии обеих дисциплин */}
        {showDisciplineFilter && (
          <div className="inline-flex items-center p-0.5 rounded-xl bg-cream-100/90 border border-old-money-200/60 text-xs shrink-0 select-none">
            <button
              type="button"
              onClick={() => setSelectedDiscipline('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDiscipline === 'all'
                  ? 'bg-white text-camel-950 shadow-xs border border-old-money-200/80 font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Все ({orgStats.total_starts})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('coursing')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDiscipline === 'coursing'
                  ? 'bg-white text-camel-950 shadow-xs border border-old-money-200/80 font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Курсинг
            </button>
            <button
              type="button"
              onClick={() => setSelectedDiscipline('racing')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDiscipline === 'racing'
                  ? 'bg-white text-camel-950 shadow-xs border border-old-money-200/80 font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Рейсинг
            </button>
          </div>
        )}
      </div>

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
            aria-label="Слайд: Сложнее победить"
          />
        </div>
      </div>
    </div>
  )
}
