import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  ChevronDown,
  ChevronUp,
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

export function DogJudgesSection({ judgeStats }: DogJudgesSectionProps) {
  const [expandedJudgeKey, setExpandedJudgeKey] = useState<string | null>(null)
  const [showAllJudges, setShowAllJudges] = useState(false)

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
              <span className="text-charcoal-500">
                места:{' '}
                <strong className="text-charcoal-800 font-semibold">
                  {(judge.placements && judge.placements.length > 0
                    ? judge.placements
                    : judge.avg_placement != null
                      ? [Math.round(judge.avg_placement)]
                      : []
                  ).join(', ')}
                </strong>
              </span>

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
            {judge.events.map((ev, eIdx) => (
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
                <div className="text-right shrink-0">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Определяем, сколько экспертов показывать в компактном виде (по 4 в каждой колонке)
  const maxVisibleCount = 4
  const visibleHigher = showAllJudges ? higherThanCareer : higherThanCareer.slice(0, maxVisibleCount)
  const visibleLower = showAllJudges ? lowerThanCareer : lowerThanCareer.slice(0, maxVisibleCount)
  const hasMore = higherThanCareer.length > maxVisibleCount || lowerThanCareer.length > maxVisibleCount

  return (
    <section
      aria-label="Судейская статистика"
      className="card-refined p-4 sm:p-5 md:p-6 mb-6 rounded-2xl bg-gradient-to-b from-white to-cream-50/40 border border-old-money-200/90 shadow-xs"
    >
      {/* Заголовок с карьерными ориентирами собаки */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-old-money-200/80">
        <div>
          <h2 className="text-base md:text-lg font-serif font-semibold text-charcoal-900 leading-tight">
            Оценки судей в сравнении с карьерой собаки
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Базовый уровень собаки: в среднем <strong>{careerAvgPlace.toFixed(1)} место</strong> и{' '}
            <strong>{careerAvgScore.toFixed(1)} б.</strong> по всем турнирам
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-charcoal-600 font-medium bg-cream-100/70 px-3 py-1.5 rounded-xl border border-old-money-200/70 self-start sm:self-auto">
          <Scale className="w-3.5 h-3.5 text-camel-700" aria-hidden />
          <span>{formatExpertsCount(coursingJudges.length)}</span>
        </div>
      </div>

      {/* 2 цельных списка в стиле сайта (без отдельных карточек и дыр) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-start">
        {/* Колонка 1: Выше карьерного уровня */}
        <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
          <div className="px-3.5 py-2.5 bg-forest-50/70 border-b border-old-money-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-forest-700" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                Оценки выше обычного
              </h3>
            </div>
            <span className="text-[11px] text-forest-800 font-semibold tabular-nums">
              {formatExpertsCount(higherThanCareer.length)}
            </span>
          </div>

          {visibleHigher.length > 0 ? (
            <div className="divide-y divide-old-money-100">
              {visibleHigher.map((judge) => renderJudgeRow(judge, 'higher'))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-charcoal-400">
              Все оценки соответствуют среднему уровню
            </div>
          )}
        </div>

        {/* Колонка 2: Ниже карьерного уровня (Строже обычного) */}
        <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
          <div className="px-3.5 py-2.5 bg-rose-50/70 border-b border-old-money-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-700" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                Оценки строже обычного
              </h3>
            </div>
            <span className="text-[11px] text-rose-800 font-semibold tabular-nums">
              {formatExpertsCount(lowerThanCareer.length)}
            </span>
          </div>

          {visibleLower.length > 0 ? (
            <div className="divide-y divide-old-money-100">
              {visibleLower.map((judge) => renderJudgeRow(judge, 'lower'))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-charcoal-400">
              Нет явно выраженных строгих оценок
            </div>
          )}
        </div>
      </div>

      {/* Кнопка Показать всех / Свернуть в едином стиле сайта */}
      {hasMore && (
        <div className="mt-4 pt-3 text-center border-t border-old-money-100 flex items-center justify-center min-h-[44px]">
          <button
            type="button"
            onClick={() => setShowAllJudges((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-camel-700 hover:text-camel-900 transition-colors cursor-pointer group"
          >
            <span className="group-hover:underline">
              {showAllJudges
                ? 'Свернуть до основных'
                : formatAllExpertsButton(coursingJudges.length)}
            </span>
            {showAllJudges ? (
              <ChevronUp className="w-3.5 h-3.5 text-camel-600 transition-transform group-hover:-translate-y-0.5" aria-hidden />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-camel-600 transition-transform group-hover:translate-y-0.5" aria-hidden />
            )}
          </button>
        </div>
      )}
    </section>
  )
}
