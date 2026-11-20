import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PlacementMedalBadge from '../../components/PlacementMedalBadge'
import {
  Award,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Trophy,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Scale,
  ExternalLink,
} from 'lucide-react'

export interface DogJudgeEventDetail {
  event_id: number
  title: string
  date: string
  avg_score: number | null
  scores: number[]
  role?: string
  discipline?: 'coursing' | 'racing'
}

export type DogJudgeVerdict = 'favors' | 'strict' | 'neutral' | 'racing_only'

export interface DogJudgeItem {
  judge_name: string
  judge_key: string
  starts_count: number
  starts_percent: number
  evaluations_count: number
  avg_score: number | null
  min_score: number | null
  max_score: number | null
  delta_vs_dog_avg: number | null
  co_judge_diff?: number | null
  co_judge_heats_count?: number
  avg_placement?: number | null
  best_placement?: number | null
  placements?: number[]
  win_rate?: number | null
  podium_rate?: number | null
  verdict?: DogJudgeVerdict
  disciplines?: ('coursing' | 'racing')[]
  events: DogJudgeEventDetail[]
}

export interface DogJudgesStats {
  total_starts: number
  total_events?: number
  total_coursing_events?: number
  coursing_events_with_judges?: number
  events_without_judges?: number
  racing_events_count?: number
  total_judges: number
  global_avg_score: number
  dog_avg_placement?: number | null
  highest_concentration?: {
    judge_name: string
    starts_count: number
    starts_percent: number
  } | null
  judges: DogJudgeItem[]
}

export interface DogProfileEventItem {
  event_id?: string | number | null
  event_type?: string
  competition_kind?: string | null
  date_start?: string | null
  date_end?: string | null
  title?: string | null
  location?: string | null
  placement?: number | string | null
  total_score?: number | string | null
  qualification?: string | null
  status?: string | null
  status_reason?: string | null
  judges?: string | null
  results_url?: string | null
}

interface DogJudgesSectionProps {
  judgeStats: DogJudgesStats
  competitions?: DogProfileEventItem[]
}

const PLACEMENT_STYLES: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  2: { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300' },
  3: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
}

/**
 * Склонение слова «эксперт» по правилам русского языка:
 * 1 эксперт, 2 эксперта, 5 экспертов, 21 эксперт, 22 эксперта...
 */
export function formatExpertsCount(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} экспертов`
  if (mod10 === 1) return `${count} эксперт`
  if (mod10 >= 2 && mod10 <= 4) return `${count} эксперта`
  return `${count} экспертов`
}

/**
 * Склонение для кнопки раскрытия списка:
 * 21 эксперта, 5 экспертов, 22 экспертов...
 */
export function formatAllExpertsButton(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod10 === 1 && mod100 !== 11) {
    return `Показать всех ${count} эксперта`
  }
  return `Показать всех ${count} экспертов`
}

export function formatShowMoreExperts(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod100 >= 11 && mod100 <= 19) return `Показать ещё ${count} экспертов`
  if (mod10 === 1) return `Показать ещё ${count} эксперта`
  if (mod10 >= 2 && mod10 <= 4) return `Показать ещё ${count} эксперта`
  return `Показать ещё ${count} экспертов`
}

export function DogJudgesSection({ judgeStats, competitions }: DogJudgesSectionProps) {
  const [expandedJudgeKey, setExpandedJudgeKey] = useState<string | null>(null)

  const eventPlacementMap = useMemo(() => {
    const map = new Map<string | number, number>()
    ;(competitions || []).forEach((c) => {
      if (c.event_id != null && c.placement != null) {
        const pl = typeof c.placement === 'number' ? c.placement : parseInt(String(c.placement), 10)
        if (Number.isFinite(pl) && pl > 0) {
          map.set(String(c.event_id), pl)
          map.set(Number(c.event_id), pl)
        }
      }
    })
    return map
  }, [competitions])

  // 1. Оставляем только курсинг (где оценивают баллами)
  const coursingJudges = useMemo(() => {
    return (judgeStats.judges || []).filter((j) => {
      if (j.verdict === 'racing_only') return false
      if (j.disciplines && j.disciplines.length === 1 && j.disciplines[0] === 'racing') return false
      return true
    })
  }, [judgeStats.judges])

  // Средние показатели карьеры собаки
  const careerAvgPlace = judgeStats.dog_avg_placement ?? 2.0
  const careerAvgScore = judgeStats.global_avg_score || 83.5

  // 2. Рассчитываем объективный контраст с карьерой для каждого эксперта
  const { higherThanCareer, lowerThanCareer } = useMemo(() => {
    const higher: Array<DogJudgeItem & { scoreDelta: number; placeDelta: number }> = []
    const lower: Array<DogJudgeItem & { scoreDelta: number; placeDelta: number }> = []

    coursingJudges.forEach((j) => {
      const avgScore = j.avg_score ?? careerAvgScore
      const avgPlace = j.avg_placement ?? careerAvgPlace

      const scoreDelta = avgScore - careerAvgScore
      const placeDelta = careerAvgPlace - avgPlace // положительно, если занятое место лучше (1 < 2)

      const item = { ...j, scoreDelta, placeDelta }

      // Если средний балл выше среднего карьеры (или 1 место при близких баллах) — в левую колонку
      if (scoreDelta >= 0 || placeDelta > 0) {
        higher.push(item)
      } else {
        lower.push(item)
      }
    })

    // Сортировка "Выше обычного": от максимального превышения вниз
    higher.sort((a, b) => b.scoreDelta - a.scoreDelta || b.placeDelta - a.placeDelta)

    // Сортировка "Строже обычного": от самого низкого среднего балла вверх
    lower.sort((a, b) => a.scoreDelta - b.scoreDelta || a.placeDelta - b.placeDelta)

    return { higherThanCareer: higher, lowerThanCareer: lower }
  }, [coursingJudges, careerAvgPlace, careerAvgScore])

  if (coursingJudges.length === 0) {
    return null
  }

  const toggleJudge = (judgeKey: string) => {
    setExpandedJudgeKey((prev) => (prev === judgeKey ? null : judgeKey))
  }

  const renderJudgeRow = (
    judge: DogJudgeItem & { scoreDelta: number; placeDelta: number },
    variant: 'higher' | 'lower',
  ) => {
    const isExpanded = expandedJudgeKey === judge.judge_key
    const avgScore = judge.avg_score != null ? judge.avg_score.toFixed(1) : null
    const scoreDiff = judge.scoreDelta
    const placeDiff = judge.placeDelta

    return (
      <div key={judge.judge_key} className="transition-colors hover:bg-cream-50/60">
        <button
          type="button"
          onClick={() => toggleJudge(judge.judge_key)}
          className="w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 cursor-pointer min-h-[44px]"
          aria-expanded={isExpanded}
        >
          {/* Левая часть: Имя эксперта, число состязаний, места и дельта к карьере */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-semibold text-charcoal-900 text-xs sm:text-sm truncate">
                {judge.judge_name}
              </span>
              <span className="text-[11px] text-charcoal-400 font-normal shrink-0">
                {judge.starts_count} сост.
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] leading-tight flex-wrap text-charcoal-600">
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-charcoal-500 mr-0.5">места:</span>
                {(judge.placements && judge.placements.length > 0
                  ? judge.placements
                  : judge.avg_placement != null
                    ? [Math.round(judge.avg_placement)]
                    : []
                ).map((pl, idx) => (
                  <PlacementMedalBadge key={idx} place={pl} size="xs" />
                ))}
              </div>

              <span className="text-old-money-300">•</span>

              {/* Дельта к карьере — чистый цветной текст, без фоновых пилюль */}
              {variant === 'higher' ? (
                <span className="font-medium text-forest-700">
                  {scoreDiff > 0 ? `+${scoreDiff.toFixed(1)} б. к ср.` : '= ср. карьеры'}
                </span>
              ) : (
                <span className="font-medium text-rose-700">
                  {scoreDiff < 0
                    ? `${scoreDiff.toFixed(1)} б. от ср.`
                    : placeDiff <= -1.0
                      ? `на ${Math.abs(placeDiff).toFixed(1)} м. ниже`
                      : 'строже обычного'}
                </span>
              )}
            </div>
          </div>

          {/* Правая часть: Чистый средний балл (без рамки) и шеврон */}
          <div className="flex items-center gap-2 shrink-0">
            {avgScore ? (
              <div className="text-right tabular-nums">
                <div className={`text-xs sm:text-sm font-bold leading-tight ${variant === 'higher' ? 'text-forest-900' : 'text-rose-900'}`}>
                  {avgScore} б.
                </div>
                <div className="text-[9px] text-charcoal-400 uppercase tracking-wide leading-none mt-0.5">
                  ср. балл
                </div>
              </div>
            ) : (
              <span className="text-xs text-charcoal-400">—</span>
            )}

            <div className="text-charcoal-400 ml-1">
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden />
              )}
            </div>
          </div>
        </button>

        {/* Раскрывающийся список турниров с прямыми кликабельными ссылками на протоколы */}
        {isExpanded && (
          <div className="border-t border-old-money-100 bg-cream-50/70 p-2.5 sm:p-3 space-y-1.5 text-xs">
            <div className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider px-1">
              Результаты под этим экспертом (кликните для перехода в протокол):
            </div>
            {judge.events.map((ev, eIdx) => {
              const evPlacement = eventPlacementMap.get(ev.event_id)
              return (
                <Link
                  key={eIdx}
                  to={`/event/${ev.event_id}/`}
                  className="group flex items-center justify-between gap-2.5 p-2 rounded-lg bg-white/90 hover:bg-white border border-old-money-200/70 hover:border-old-money-300 transition-colors shadow-2xs"
                  title="Открыть протокол состязания"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate flex items-center gap-1.5">
                      <span className="truncate">{ev.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-camel-600 shrink-0" aria-hidden />
                    </div>
                    <div className="text-[10px] text-charcoal-400 mt-0.5">{ev.date}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {evPlacement != null && (
                      <PlacementMedalBadge place={evPlacement} size="xs" />
                    )}
                    <div className="text-right">
                      {ev.avg_score != null ? (
                        <div className="font-bold text-charcoal-900 tabular-nums text-xs">
                          {ev.avg_score.toFixed(1)} б.
                        </div>
                      ) : (
                        <div className="text-charcoal-400">—</div>
                      )}
                      {ev.scores && ev.scores.length > 0 && (
                        <div className="text-[9px] text-charcoal-400 tabular-nums">
                          забеги: {ev.scores.join(' / ')}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Ограничение начального отображения для длинных списков
  const INITIAL_LIMIT = 5
  const EXPAND_THRESHOLD = 6

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

  const higherCard = (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs h-full flex flex-col">
      <div className="relative px-3.5 py-2.5 bg-forest-50/70 border-b border-old-money-200/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 min-w-0 pr-24 md:pr-0">
          <Trophy className="w-3.5 h-3.5 text-forest-700 shrink-0" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800 truncate">
            Выше обычного
          </h3>
          <span className="text-[11px] text-forest-800 font-semibold tabular-nums ml-0.5">
            {formatExpertsCount(higherThanCareer.length)}
          </span>
        </div>

        {/* На мобилке: правый язычок в стиле HomeSubSectionTab для перехода к «Строже обычного» */}
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
            {visibleHigher.map((judge) => renderJudgeRow(judge, 'higher'))}
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
          Все оценки соответствуют среднему уровню
        </div>
      )}
    </div>
  )

  const lowerCard = (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs h-full flex flex-col">
      <div className="relative px-3.5 py-2.5 bg-rose-50/70 border-b border-old-money-200/80 flex items-center justify-between select-none">
        {/* На мобилке: левый язычок в стиле HomeSubSectionTab для перехода к «Выше обычного» */}
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
          <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" aria-hidden />
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
            {visibleLower.map((judge) => renderJudgeRow(judge, 'lower'))}
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
          Нет явно выраженных строгих оценок
        </div>
      )}
    </div>
  )

  return (
    <section
      aria-label="Судейская статистика"
      className="card-refined p-4 sm:p-5 md:p-6 mb-6 rounded-2xl bg-gradient-to-b from-white to-cream-50/40 border border-old-money-200/90 shadow-xs"
    >
      {/* Лаконичный заголовок с базовым уровнем собаки */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-old-money-200/80">
        <div>
          <h2 className="text-base md:text-lg font-serif font-semibold text-charcoal-900 leading-tight">
            Оценки судей
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Базовый уровень: в среднем <strong>{careerAvgPlace.toFixed(1)} место</strong> ·{' '}
            <strong>{careerAvgScore.toFixed(1)} б.</strong>
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-charcoal-700 font-medium bg-cream-100/70 border border-old-money-200/80 shadow-2xs self-start sm:self-auto">
          <Scale className="w-3.5 h-3.5 text-camel-700" aria-hidden />
          <span className="tabular-nums font-semibold">{formatExpertsCount(coursingJudges.length)}</span>
        </div>
      </div>

      {/* Десктопная сетка из 2 колонок (>= md) */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 lg:gap-5 items-start">
        {higherCard}
        {lowerCard}
      </div>

      {/* Мобильная карусель со свайпом влево/вправо (< md) */}
      <div
        className="block md:hidden w-full overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onClickCapture={handleClickCapture}
      >
        <div
          ref={trackRef}
          className="flex flex-nowrap w-full items-stretch transition-transform"
          style={{
            transform: `translate3d(${activeMobileTab === 0 ? '0%' : '-100%'}, 0, 0)`,
          }}
        >
          <div className="w-full shrink-0 basis-full pr-1">{higherCard}</div>
          <div className="w-full shrink-0 basis-full pl-1">{lowerCard}</div>
        </div>

        {/* Точки-индикаторы свайпа */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5" aria-hidden="true">
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
    </section>
  )
}
