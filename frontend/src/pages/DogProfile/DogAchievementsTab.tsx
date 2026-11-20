import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Medal,
  Award,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Rabbit,
  Target,
  ShieldCheck,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { titleBadgeClass } from '../../lib/qualificationTitles'
import { getFullTitleLabel } from '../../lib/awardTooltip'
import type { CumulativeEvaluationResult, CumulativeTitle } from '../../lib/cumulativeTitles'
import type { ProfileHeaderRank } from './DogProfileHeader'
import type { ShowDogCardData } from '../Shows/ShowDogCard'

export interface DogAchievementsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dog: any
  cumulativeTitles: CumulativeEvaluationResult
  ranks?: ProfileHeaderRank[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursingStats?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  racingStats?: any
  showDog?: ShowDogCardData | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: any[]
  eventResultsUrls?: Record<string | number, string>
  breed?: string
}

export function DogAchievementsTab({
  dog,
  cumulativeTitles,
  ranks = [],
  coursingStats = {},
  racingStats = {},
  showDog,
  events = [],
  eventResultsUrls = {},
  breed,
}: DogAchievementsTabProps) {
  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({})

  const toggleTitle = (id: string) => {
    setExpandedTitles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // 1. Оформленные титулы
  const supremeTitles = cumulativeTitles.officialSupremeTitles || []
  const coursingTitles = cumulativeTitles.officialCoursingTitles || []
  const racingTitles = cumulativeTitles.officialRacingTitles || []
  const showTitles = cumulativeTitles.officialShowTitles || []

  const totalTitlesCount =
    supremeTitles.length + coursingTitles.length + racingTitles.length + showTitles.length

  // 2. Титулы в процессе (отсортированы по проценту готовности, максимальный сверху)
  const inProgressTitles = useMemo(() => {
    return [...(cumulativeTitles.inProgress || [])].sort(
      (a, b) => b.progressPercent - a.progressPercent,
    )
  }, [cumulativeTitles.inProgress])

  // 3. Сертификаты
  const certs = cumulativeTitles.certificates || {
    caclEventsCoursing: [],
    caclEventsRacing: [],
    cacilEvents: [],
    cacShowEvents: [],
    uniqueCacJudgesCount: 0,
    hasRunningClearanceCoursing: false,
    hasRunningClearanceRacing: false,
  }

  const totalCacl = certs.caclEventsCoursing.length + certs.caclEventsRacing.length
  const totalCac = certs.cacShowEvents.length || (showDog?.titles?.CAC ?? 0)

  // 4. Рейтинги на сайте
  const coursingRank = ranks.find((r) => r.key === 'coursing')
  const racingRank = ranks.find((r) => r.key === 'racing')
  const showRank = ranks.find((r) => r.key === 'shows')

  return (
    <div className="space-y-6">
      {/* ПАНЕЛЬ СВОДКИ ДОСТИЖЕНИЙ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-old-money-200/90 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-charcoal-400 text-xs font-medium">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" aria-hidden />
            <span>Титулы РКФ</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 tabular-nums">
            {totalTitlesCount}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5">
            {supremeTitles.length > 0 ? `${supremeTitles.length} высших званий` : 'официальных наград'}
          </div>
        </div>

        <div className="rounded-2xl border border-old-money-200/90 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-charcoal-400 text-xs font-medium">
            <FileText className="w-4 h-4 text-camel-700 shrink-0" aria-hidden />
            <span>Сертификаты</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 tabular-nums">
            {totalCacl + totalCac + certs.cacilEvents.length}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5">
            {totalCacl > 0 ? `${totalCacl} CACL` : ''} {totalCac > 0 ? `${totalCac} CAC` : ''}
          </div>
        </div>

        <div className="rounded-2xl border border-old-money-200/90 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-charcoal-400 text-xs font-medium">
            <Target className="w-4 h-4 text-forest-700 shrink-0" aria-hidden />
            <span>В шаге от звания</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 tabular-nums">
            {inProgressTitles.length}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5">
            {inProgressTitles.length > 0 ? 'титулов в процессе' : 'все нормы закрыты'}
          </div>
        </div>

        <div className="rounded-2xl border border-old-money-200/90 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-charcoal-400 text-xs font-medium">
            <Medal className="w-4 h-4 text-amber-700 shrink-0" aria-hidden />
            <span>Побед (1-е места)</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 tabular-nums">
            {(coursingStats?.gold || 0) + (racingStats?.gold || 0)}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5">
            {coursingStats?.gold ? `${coursingStats.gold} курсинг` : ''}{' '}
            {racingStats?.gold ? `${racingStats.gold} бега` : ''}
          </div>
        </div>
      </div>

      {/* РАЗДЕЛ 1: ТИТУЛЫ В ПРОЦЕССЕ («ПОЧТИ ПОЛУЧИЛ» / ПЕРСПЕКТИВЫ) */}
      {inProgressTitles.length > 0 && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b border-amber-200/60 bg-amber-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-700 shrink-0" aria-hidden />
              <div>
                <h2 className="text-base font-bold text-amber-950">
                  В шаге от титула (перспективы оформления)
                </h2>
                <p className="text-xs text-amber-800/80">
                  Звания РКФ, нормативы по которым частично выполнены: осталось завершить 1–2 шага
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold px-2.5 py-0.5">
              {inProgressTitles.length}
            </span>
          </div>

          <div className="divide-y divide-amber-200/50 bg-white/70">
            {inProgressTitles.map((title) => {
              const isExpanded = expandedTitles[title.id] ?? true
              const chipClass = titleBadgeClass(title.badge)
              const isSupreme = title.domain === 'supreme'

              return (
                <div key={title.id} className="p-4 sm:p-5 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums whitespace-nowrap ${chipClass}`}
                      >
                        {title.badge}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-charcoal-900">
                            {title.title}
                          </h3>
                          {isSupreme && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold rounded-md px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300">
                              Высшее звание
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-600 mt-0.5 leading-relaxed">
                          {title.rulesSummary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-900 tabular-nums">
                          {title.progressPercent}%
                        </span>
                        <div className="text-[10px] text-charcoal-400 uppercase tracking-wide">
                          выполнено
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleTitle(title.id)}
                        className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        aria-label={isExpanded ? 'Свернуть детали' : 'Развернуть детали'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Шкала прогресса */}
                  <div className="mt-3 w-full bg-cream-200/70 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        title.progressPercent >= 75
                          ? 'bg-gradient-to-r from-forest-500 to-forest-600'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${title.progressPercent}%` }}
                    />
                  </div>

                  {/* Детали условий и следующий шаг */}
                  {isExpanded && (
                    <div className="mt-4 pt-3.5 border-t border-cream-200/70 space-y-2.5">
                      <div className="space-y-1.5">
                        {title.requirements.map((req, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-start gap-2.5 text-xs text-charcoal-700"
                          >
                            {req.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" aria-hidden />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className={req.completed ? 'font-medium text-charcoal-900' : 'text-charcoal-700'}>
                                {req.text}
                              </span>
                              {req.details && (
                                <span className="text-charcoal-500 text-[11px] block mt-0.5">
                                  {req.details}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {title.nextStepAdvice && (
                        <div className="mt-3 rounded-xl bg-amber-100/60 border border-amber-300/80 p-3 text-xs text-amber-950 flex items-start gap-2">
                          <Target className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                          <div>
                            <span className="font-semibold text-amber-900">Что осталось сделать: </span>
                            <span>{title.nextStepAdvice}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* РАЗДЕЛ 2: ОФОРМЛЕННЫЕ ОФИЦИАЛЬНЫЕ ЗВАНИЯ И ТИТУЛЫ (РКФ / FCI) */}
      <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600 shrink-0" aria-hidden />
            <div>
              <h2 className="text-base font-bold text-charcoal-900">
                Оформленные официальные чемпионские звания
              </h2>
              <p className="text-xs text-charcoal-500">
                Титулы системы РКФ и FCI с подтверждёнными основаниями выдачи
              </p>
            </div>
          </div>
          <span className="rounded-full bg-cream-200/80 text-charcoal-800 text-xs font-bold px-2.5 py-0.5">
            {totalTitlesCount}
          </span>
        </div>

        {totalTitlesCount === 0 ? (
          <div className="p-8 text-center text-charcoal-500 text-sm">
            У собаки пока нет оформленных чемпионских титулов. Выполняйте квалификационные нормативы в состязаниях и выставках!
          </div>
        ) : (
          <div className="divide-y divide-old-money-100">
            {/* 1. Высшие звания */}
            {supremeTitles.length > 0 && (
              <div className="p-4 sm:p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden />
                  <span>Высшие звания (междисциплинарные и пожизненные)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supremeTitles.map((item) => {
                    const explanation =
                      cumulativeTitles.titleExplanations[`supreme:${item.title}`] ||
                      cumulativeTitles.titleExplanations[item.title]
                    const chipClass = titleBadgeClass(item.title)
                    const fullLabel = getFullTitleLabel(item.title, false)

                    return (
                      <div
                        key={`supreme-${item.title}`}
                        className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-3.5 flex items-start gap-3"
                      >
                        <span className={`inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums whitespace-nowrap ${chipClass}`}>
                          {item.title}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-charcoal-900">{fullLabel}</h4>
                          {explanation && (
                            <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                              {explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 2. Курсинг борзых */}
            {coursingTitles.length > 0 && (
              <div className="p-4 sm:p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-forest-800 mb-3 flex items-center gap-1.5">
                  <Rabbit className="w-3.5 h-3.5 text-forest-600 shrink-0" aria-hidden />
                  <span>Курсинг борзых</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {coursingTitles.map((item) => {
                    const explanation =
                      cumulativeTitles.titleExplanations[`coursing:${item.title}`] ||
                      cumulativeTitles.titleExplanations[item.title]
                    const chipClass = titleBadgeClass(item.title)
                    const fullLabel = getFullTitleLabel(item.title, false)

                    return (
                      <div
                        key={`coursing-${item.title}`}
                        className="rounded-xl border border-old-money-200/80 bg-white p-3.5 flex items-start gap-3"
                      >
                        <span className={`inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums whitespace-nowrap ${chipClass}`}>
                          {item.title} {item.count > 1 ? `×${item.count}` : ''}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-charcoal-900">{fullLabel}</h4>
                          {explanation && (
                            <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                              {explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. Бега борзых (рейсинг) */}
            {racingTitles.length > 0 && (
              <div className="p-4 sm:p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-800 mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-600 shrink-0" aria-hidden />
                  <span>Бега борзых (рейсинг)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {racingTitles.map((item) => {
                    const explanation =
                      cumulativeTitles.titleExplanations[`racing:${item.title}`] ||
                      cumulativeTitles.titleExplanations[item.title]
                    const chipClass = titleBadgeClass(item.title)
                    const fullLabel = getFullTitleLabel(item.title, false)

                    return (
                      <div
                        key={`racing-${item.title}`}
                        className="rounded-xl border border-old-money-200/80 bg-white p-3.5 flex items-start gap-3"
                      >
                        <span className={`inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums whitespace-nowrap ${chipClass}`}>
                          {item.title} {item.count > 1 ? `×${item.count}` : ''}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-charcoal-900">{fullLabel}</h4>
                          {explanation && (
                            <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                              {explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. Выставки РКФ */}
            {showTitles.length > 0 && (
              <div className="p-4 sm:p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800 mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                  <span>Выставки РКФ (экстерьер)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {showTitles.map((item) => {
                    const chipClass = titleBadgeClass(item.title)
                    const fullLabel = getFullTitleLabel(item.title, true)

                    return (
                      <div
                        key={`show-${item.title}`}
                        className="rounded-xl border border-old-money-200/80 bg-white p-3.5 flex items-start gap-3"
                      >
                        <span className={`inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums whitespace-nowrap ${chipClass}`}>
                          {item.title} {item.count > 1 ? `×${item.count}` : ''}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-charcoal-900">{fullLabel}</h4>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* РАЗДЕЛ 3: ОФИЦИАЛЬНЫЕ СЕРТИФИКАТЫ И ДОПУСКИ РКФ */}
      <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest-700 shrink-0" aria-hidden />
            <div>
              <h2 className="text-base font-bold text-charcoal-900">
                Официальные сертификаты и квалификационные допуски
              </h2>
              <p className="text-xs text-charcoal-500">
                Квалификационные сертификаты кандидата в чемпионы (CACL, CACIL, CAC) и рабочий допуск
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CACL Курсинг */}
            <div className="rounded-xl border border-old-money-200/80 p-4 bg-cream-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                  CACL · Курсинг борзых
                </span>
                <span className="text-sm font-bold text-charcoal-900 tabular-nums">
                  {certs.caclEventsCoursing.length} серт.
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-1">
                Кандидат в чемпионы России по рабочим качествам собак (курсинг)
              </p>
              {certs.caclEventsCoursing.length > 0 && (
                <div className="mt-3 space-y-1.5 pt-2 border-t border-cream-200">
                  {certs.caclEventsCoursing.map((ev, i) => (
                    <div key={i} className="text-xs text-charcoal-700 flex items-center justify-between gap-2">
                      <span className="truncate">{ev.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {ev.date && <span className="text-[11px] text-charcoal-400">{ev.date}</span>}
                        {ev.eventId && eventResultsUrls[ev.eventId] && (
                          <Link
                            to={eventResultsUrls[ev.eventId]}
                            className="text-camel-700 hover:text-camel-900"
                            title="Открыть протокол состязания"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CACL Бега борзых */}
            <div className="rounded-xl border border-old-money-200/80 p-4 bg-cream-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  CACL · Бега борзых
                </span>
                <span className="text-sm font-bold text-charcoal-900 tabular-nums">
                  {certs.caclEventsRacing.length} серт.
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-1">
                Кандидат в чемпионы России по рабочим качествам собак (рейсинг)
              </p>
              {certs.caclEventsRacing.length > 0 && (
                <div className="mt-3 space-y-1.5 pt-2 border-t border-cream-200">
                  {certs.caclEventsRacing.map((ev, i) => (
                    <div key={i} className="text-xs text-charcoal-700 flex items-center justify-between gap-2">
                      <span className="truncate">{ev.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {ev.date && <span className="text-[11px] text-charcoal-400">{ev.date}</span>}
                        {ev.eventId && eventResultsUrls[ev.eventId] && (
                          <Link
                            to={eventResultsUrls[ev.eventId]}
                            className="text-camel-700 hover:text-camel-900"
                            title="Открыть протокол забега"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CAC Выставки */}
            <div className="rounded-xl border border-old-money-200/80 p-4 bg-cream-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-camel-800">
                  CAC · Выставки РКФ
                </span>
                <span className="text-sm font-bold text-charcoal-900 tabular-nums">
                  {totalCac} серт.
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-1">
                Кандидат в чемпионы России по красоте (экстерьер)
              </p>
              {certs.uniqueCacJudgesCount > 0 && (
                <div className="mt-2 text-xs text-charcoal-500">
                  Подтверждено под {certs.uniqueCacJudgesCount} разными судьями РКФ
                </div>
              )}
            </div>

            {/* Беговой допуск РКФ */}
            <div className="rounded-xl border border-old-money-200/80 p-4 bg-cream-50/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                  Беговой допуск РКФ
                </span>
                <span className="text-xs font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                  {certs.hasRunningClearanceCoursing || certs.hasRunningClearanceRacing
                    ? 'Оформлен'
                    : 'Не подтверждён'}
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-1">
                Квалификационная беговая книжка борзой для участия в официальных состязаниях
              </p>
              <div className="mt-2 text-xs text-charcoal-500 space-y-0.5">
                <div>Курсинг (КБ): {certs.hasRunningClearanceCoursing ? 'квалифицирован' : '—'}</div>
                <div>Бега (ББ): {certs.hasRunningClearanceRacing ? 'квалифицирован' : '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* РАЗДЕЛ 4: ДОСТИЖЕНИЯ И РЕКОРДЫ В РЕЙТИНГЕ COURSINGSTATS */}
      <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-700 shrink-0" aria-hidden />
            <div>
              <h2 className="text-base font-bold text-charcoal-900">
                Достижения и рекорды в рейтинге CoursingStats
              </h2>
              <p className="text-xs text-charcoal-500">
                Места в сезоне {coursingRank?.yearRank ? '2026' : ''}, подиумы в породе и пиковые показатели карьеры
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Курсинг рейтинг */}
          <div className="rounded-xl border border-forest-200/80 bg-forest-50/20 p-4">
            <div className="flex items-center gap-2 text-forest-800 text-xs font-bold uppercase tracking-wider">
              <Rabbit className="w-4 h-4 text-forest-600" aria-hidden />
              <span>Курсинг / БЗМП</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-charcoal-900">
                {coursingRank?.yearBreedRank
                  ? `#${coursingRank.yearBreedRank} в сезоне`
                  : coursingRank?.breedRank
                    ? `#${coursingRank.breedRank} в породе`
                    : 'В зачёте состязаний'}
              </div>
              <div className="text-xs text-charcoal-500 mt-0.5">
                {breed || 'порода'} · {coursingRank?.rank ? `№${coursingRank.rank} за всё время` : ''}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-forest-200/60 text-xs text-charcoal-700 space-y-1">
              <div className="flex justify-between">
                <span>Побед (1-е место):</span>
                <strong className="text-charcoal-900">{coursingStats?.gold || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>Лучший балл:</span>
                <strong className="text-charcoal-900">{coursingStats?.best_judge_score || '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Средний балл:</span>
                <strong className="text-charcoal-900">{coursingStats?.avg_judge_score || '—'}</strong>
              </div>
            </div>
            <Link
              to="/competitions/"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-950 transition-colors"
            >
              <span>Рейтинг сезона</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Бега борзых рейтинг */}
          <div className="rounded-xl border border-sky-200/80 bg-sky-50/20 p-4">
            <div className="flex items-center gap-2 text-sky-800 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-sky-600" aria-hidden />
              <span>Бега борзых (рейсинг)</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-charcoal-900">
                {racingRank?.yearBreedRank
                  ? `#${racingRank.yearBreedRank} по скорости`
                  : racingStats?.best_speed
                    ? `${racingStats.best_speed} км/ч`
                    : 'В зачёте бегов'}
              </div>
              <div className="text-xs text-charcoal-500 mt-0.5">
                {breed || 'порода'} · {racingRank?.rank ? `№${racingRank.rank} за всё время` : ''}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-sky-200/60 text-xs text-charcoal-700 space-y-1">
              <div className="flex justify-between">
                <span>Побед (1-е место):</span>
                <strong className="text-charcoal-900">{racingStats?.gold || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>Рекорд скорости:</span>
                <strong className="text-charcoal-900">{racingStats?.best_speed ? `${racingStats.best_speed} км/ч` : '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Средняя скорость:</span>
                <strong className="text-charcoal-900">{racingStats?.avg_speed ? `${racingStats.avg_speed} км/ч` : '—'}</strong>
              </div>
            </div>
            <Link
              to="/competitions/"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-800 hover:text-sky-950 transition-colors"
            >
              <span>Рейтинг скорости</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Выставки рейтинг */}
          <div className="rounded-xl border border-camel-200/80 bg-camel-50/20 p-4">
            <div className="flex items-center gap-2 text-camel-800 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-camel-700" aria-hidden />
              <span>Выставки РКФ</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-charcoal-900">
                {showDog?.best_award || (showDog?.total_shows ? `${showDog.total_shows} выставок` : 'В каталоге')}
              </div>
              <div className="text-xs text-charcoal-500 mt-0.5">
                {showRank?.rank ? `№${showRank.rank} за всё время` : 'Рейтинг экстерьера'}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-camel-200/60 text-xs text-charcoal-700 space-y-1">
              <div className="flex justify-between">
                <span>Всего выставок:</span>
                <strong className="text-charcoal-900">{showDog?.total_shows || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>Побед в ринге:</span>
                <strong className="text-charcoal-900">{(showDog?.bis_count || 0) + (showDog?.big_count || 0) + (showDog?.bob_count || 0)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Рейтинговый балл:</span>
                <strong className="text-charcoal-900">{showDog?.rank_score || '—'}</strong>
              </div>
            </div>
            <Link
              to="/shows/"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors"
            >
              <span>Рейтинг выставок</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
