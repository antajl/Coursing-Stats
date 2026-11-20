import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { titleBadgeClass } from '../../lib/qualificationTitles'
import { getFullTitleLabel } from '../../lib/awardTooltip'
import type { CumulativeEvaluationResult } from '../../lib/cumulativeTitles'
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
  // По умолчанию ВСЕ спойлеры скрыты: {}
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
  const totalCertificates = totalCacl + totalCac

  // 4. Рейтинги на сайте
  const coursingRank = ranks.find((r) => r.key === 'coursing')
  const racingRank = ranks.find((r) => r.key === 'racing')
  const showRank = ranks.find((r) => r.key === 'shows')

  // Хелпер для отрисовки спойлера оформленного титула
  const renderCompletedTitleCard = (
    item: { title: string; count: number },
    category: 'supreme' | 'coursing' | 'racing' | 'show',
    borderColor: string,
    bgColor: string,
  ) => {
    const key = `completed-${category}-${item.title}`
    const isExpanded = Boolean(expandedTitles[key])
    const isShow = category === 'show'
    const explanation =
      cumulativeTitles.titleExplanations[`${category}:${item.title}`] ||
      cumulativeTitles.titleExplanations[item.title]
    const chipClass = titleBadgeClass(item.title)
    const fullLabel = getFullTitleLabel(item.title, isShow)

    return (
      <div
        key={key}
        className={`rounded-xl border transition-colors overflow-hidden ${borderColor} ${bgColor}`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleTitle(key)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleTitle(key)
            }
          }}
          className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative inline-flex shrink-0">
              <span
                className={`inline-flex shrink-0 items-center justify-center w-[92px] sm:w-[96px] rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums text-center whitespace-nowrap tracking-tight ${chipClass}`}
              >
                {item.title}
              </span>
              {item.count > 1 && (
                <span
                  className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-1 min-w-[17px] h-4 text-[9.5px] font-extrabold leading-none rounded-full bg-charcoal-800 text-white shadow-2xs border border-white"
                  title={`Оформлено ${item.count} раза`}
                >
                  ×{item.count}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-charcoal-900 leading-snug">{fullLabel}</h4>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-charcoal-400">
            <span className="text-[11px] hidden sm:inline text-charcoal-500 font-normal">
              {isExpanded ? 'Свернуть' : 'Подробнее'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-charcoal-700' : 'text-charcoal-400'
              }`}
              aria-hidden
            />
          </div>
        </div>

        {isExpanded && explanation && (
          <div className="px-3.5 pb-2.5 pt-1.5 text-xs text-charcoal-600 border-t border-old-money-100/70 bg-cream-50/40 leading-relaxed animate-in fade-in duration-150">
            <span className="font-semibold text-charcoal-800">Нормативное основание: </span>
            <span>{explanation}</span>
          </div>
        )}
      </div>
    )
  }

  // Хелпер для отрисовки спойлера сертификатов
  const renderCertificateCard = (
    id: string,
    title: string,
    badgeText: string,
    subtitle: string,
    eventsList: Array<{ eventId?: number | string; title: string; date?: string }>,
    disciplineTheme: 'forest' | 'sky' | 'camel',
    extraNote?: string,
  ) => {
    const isExpanded = Boolean(expandedTitles[id])
    const themeText =
      disciplineTheme === 'forest'
        ? 'text-forest-800'
        : disciplineTheme === 'sky'
          ? 'text-sky-800'
          : 'text-camel-800'

    return (
      <div className="rounded-xl border border-old-money-200/80 bg-cream-50/30 overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleTitle(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleTitle(id)
            }
          }}
          className="px-3.5 py-2 sm:px-4 sm:py-2 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-cream-100/50 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="min-w-0">
            <div className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>
              {title}
            </div>
            <p className="text-xs text-charcoal-600 truncate mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
              {badgeText}
            </span>
            {eventsList.length > 0 && (
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180 text-charcoal-700' : 'text-charcoal-400'
                }`}
                aria-hidden
              />
            )}
          </div>
        </div>

        {extraNote && isExpanded && (
          <div className="px-3.5 pb-2 text-xs text-charcoal-500">{extraNote}</div>
        )}

        {isExpanded && eventsList.length > 0 && (
          <div className="px-3.5 pb-3 pt-2 border-t border-cream-200/80 bg-white space-y-1.5 animate-in fade-in duration-150">
            {eventsList.map((ev, i) => (
              <div
                key={i}
                className="text-xs text-charcoal-700 flex items-center justify-between gap-2"
              >
                <span className="truncate">{ev.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ev.date && <span className="text-[11px] text-charcoal-400">{ev.date}</span>}
                  {ev.eventId && eventResultsUrls[ev.eventId] && (
                    <Link
                      to={eventResultsUrls[ev.eventId]}
                      className="text-camel-700 hover:text-camel-900 inline-flex items-center p-0.5"
                      title="Открыть протокол"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* РАЗДЕЛ 1: ТИТУЛЫ В ПРОЦЕССЕ («ПОЧТИ ПОЛУЧИЛ» / ПЕРСПЕКТИВЫ) */}
      {inProgressTitles.length > 0 && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 overflow-hidden shadow-2xs">
          <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-amber-200/60 bg-amber-50/60 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-amber-950">
              В шаге от титула
            </h2>
            <span className="rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold px-2.5 py-0.5">
              {inProgressTitles.length}
            </span>
          </div>

          <div className="divide-y divide-amber-200/50 bg-white/70">
            {inProgressTitles.map((title) => {
              // ВСЕ СПОЙЛЕРЫ СКРЫТЫ ПО УМОЛЧАНИЮ
              const isExpanded = Boolean(expandedTitles[title.id])
              const chipClass = titleBadgeClass(title.badge)
              const roundedPercent = Math.round(title.progressPercent)

              return (
                <div key={title.id} className="transition-colors">
                  {/* КЛИК НА ВСЮ СТРОКУ ТИТУЛА */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleTitle(title.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleTitle(title.id)
                      }
                    }}
                    className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-amber-100/30 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`inline-flex shrink-0 items-center justify-center w-[92px] sm:w-[96px] rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums text-center whitespace-nowrap tracking-tight ${chipClass}`}
                      >
                        {title.badge}
                      </span>
                      <h3 className="text-sm font-bold text-charcoal-900 leading-snug">
                        {title.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 sm:w-16 h-1.5 bg-amber-200/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              roundedPercent >= 75
                                ? 'bg-forest-600'
                                : 'bg-amber-600'
                            }`}
                            style={{ width: `${roundedPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-amber-900 tabular-nums min-w-[28px] text-right">
                          {roundedPercent}%
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-amber-800' : 'text-charcoal-400'
                        }`}
                        aria-hidden
                      />
                    </div>
                  </div>

                  {/* Детали условий и норматив (скрыто по умолчанию) */}
                  {isExpanded && (
                    <div className="px-3.5 sm:px-4 pb-3.5 pt-1.5 border-t border-amber-200/40 space-y-2 bg-amber-50/40 animate-in fade-in duration-150">
                      {title.rulesSummary && (
                        <div className="text-xs text-charcoal-600 leading-relaxed">
                          <span className="font-semibold text-charcoal-800">Нормативное основание: </span>
                          <span>{title.rulesSummary}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-1">
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
                        <div className="mt-2.5 rounded-xl bg-amber-100/70 border border-amber-300/80 p-2.5 text-xs text-amber-950">
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

      {/* СЕТКА: ОФОРМЛЕННЫЕ ЗВАНИЯ (СЛЕВА) И СЕРТИФИКАТЫ / ДОПУСКИ (СПРАВА) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* РАЗДЕЛ 2: ОФОРМЛЕННЫЕ ОФИЦИАЛЬНЫЕ ЗВАНИЯ И ТИТУЛЫ (РКФ / FCI) */}
        <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
          <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
              Оформленные официальные чемпионские звания
            </h2>
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
                <div className="px-4 py-3 sm:px-5 sm:py-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-2">
                    Высшие звания
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                    {supremeTitles.map((item) =>
                      renderCompletedTitleCard(
                        item,
                        'supreme',
                        'border-amber-200/90',
                        'bg-amber-50/40',
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* 2. Курсинг борзых */}
              {coursingTitles.length > 0 && (
                <div className="px-4 py-3 sm:px-5 sm:py-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-forest-800 mb-2">
                    Курсинг борзых
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                    {coursingTitles.map((item) =>
                      renderCompletedTitleCard(
                        item,
                        'coursing',
                        'border-old-money-200/80',
                        'bg-white',
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* 3. Бега борзых (рейсинг) */}
              {racingTitles.length > 0 && (
                <div className="px-4 py-3 sm:px-5 sm:py-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-sky-800 mb-2">
                    Бега борзых (рейсинг)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                    {racingTitles.map((item) =>
                      renderCompletedTitleCard(
                        item,
                        'racing',
                        'border-old-money-200/80',
                        'bg-white',
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* 4. Выставки РКФ */}
              {showTitles.length > 0 && (
                <div className="px-4 py-3 sm:px-5 sm:py-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800 mb-2">
                    Выставки РКФ (экстерьер)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                    {showTitles.map((item) =>
                      renderCompletedTitleCard(
                        item,
                        'show',
                        'border-old-money-200/80',
                        'bg-white',
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ПРАВАЯ КОЛОНКА: СЕРТИФИКАТЫ + ДОСТИЖЕНИЯ В РЕЙТИНГЕ */}
        <div className="space-y-6">
          {/* РАЗДЕЛ 3: ОФИЦИАЛЬНЫЕ СЕРТИФИКАТЫ РКФ */}
          <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
            <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
                Официальные сертификаты и квалификационные допуски
              </h2>
              {totalCertificates > 0 && (
                <span className="rounded-full bg-cream-200/80 text-charcoal-800 text-xs font-bold px-2.5 py-0.5">
                  {totalCertificates}
                </span>
              )}
            </div>

            <div className="p-2.5 sm:p-3 space-y-2">
              {/* CACL Курсинг */}
              {renderCertificateCard(
                'cert-cacl-coursing',
                'CACL · Курсинг борзых',
                `${certs.caclEventsCoursing.length} серт.`,
                'Кандидат в чемпионы России (курсинг)',
                certs.caclEventsCoursing,
                'forest',
              )}

              {/* CACL Бега борзых */}
              {renderCertificateCard(
                'cert-cacl-racing',
                'CACL · Бега борзых',
                `${certs.caclEventsRacing.length} серт.`,
                'Кандидат в чемпионы России (рейсинг)',
                certs.caclEventsRacing,
                'sky',
              )}

              {/* CAC Выставки */}
              {renderCertificateCard(
                'cert-cac-shows',
                'CAC · Выставки РКФ',
                `${totalCac} серт.`,
                certs.uniqueCacJudgesCount > 0
                  ? `Кандидат в ЧР по красоте · ${certs.uniqueCacJudgesCount} судей`
                  : 'Кандидат в чемпионы России по красоте',
                certs.cacShowEvents,
                'camel',
                certs.uniqueCacJudgesCount > 0
                  ? `Подтверждено под ${certs.uniqueCacJudgesCount} разными судьями РКФ`
                  : undefined,
              )}
            </div>
          </div>

          {/* РАЗДЕЛ 4: ДОСТИЖЕНИЯ И РЕКОРДЫ В РЕЙТИНГЕ COURSINGSTATS */}
          <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
            <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
                Достижения и рекорды в рейтинге CoursingStats
              </h2>
            </div>

            <div className="p-2.5 sm:p-3 space-y-2">
              {/* Курсинг рейтинг */}
              <div className="rounded-xl border border-forest-200/80 bg-forest-50/20 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-flex shrink-0 items-center justify-center w-[82px] rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-forest-100/90 text-forest-900 border border-forest-200/80">
                    Курсинг
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                        {coursingRank?.yearBreedRank
                          ? `#${coursingRank.yearBreedRank} в сезоне`
                          : coursingRank?.breedRank
                            ? `#${coursingRank.breedRank} в породе`
                            : 'В зачёте'}
                      </span>
                      {coursingStats?.gold ? (
                        <span className="text-[11px] text-forest-800 font-semibold tabular-nums hidden sm:inline">
                          • {coursingStats.gold} {coursingStats.gold === 1 ? 'победа' : 'побед'}
                        </span>
                      ) : null}
                      {coursingStats?.best_judge_score ? (
                        <span className="text-[11px] text-charcoal-500 tabular-nums hidden md:inline">
                          • макс: {coursingStats.best_judge_score} б.
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-charcoal-500 truncate mt-0.5">
                      {breed || 'порода'}{coursingRank?.rank ? ` · №${coursingRank.rank} за всё время` : ''}
                      {coursingStats?.avg_judge_score ? ` · ср. балл: ${coursingStats.avg_judge_score}` : ''}
                    </div>
                  </div>
                </div>

                <Link
                  to="/competitions/"
                  className="shrink-0 p-1.5 text-forest-800 hover:text-forest-950 hover:bg-forest-100/60 rounded-md transition-colors"
                  title="Рейтинг сезона"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Бега борзых рейтинг */}
              <div className="rounded-xl border border-sky-200/80 bg-sky-50/20 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-flex shrink-0 items-center justify-center w-[82px] rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-sky-100/90 text-sky-900 border border-sky-200/80">
                    Рейсинг
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                        {racingRank?.yearBreedRank
                          ? `#${racingRank.yearBreedRank} по скорости`
                          : racingStats?.best_speed
                            ? `${racingStats.best_speed} км/ч`
                            : 'В зачёте'}
                      </span>
                      {racingStats?.gold ? (
                        <span className="text-[11px] text-sky-800 font-semibold tabular-nums hidden sm:inline">
                          • {racingStats.gold} {racingStats.gold === 1 ? 'победа' : 'побед'}
                        </span>
                      ) : null}
                      {racingStats?.best_speed ? (
                        <span className="text-[11px] text-charcoal-500 tabular-nums hidden md:inline">
                          • рекорд: {racingStats.best_speed} км/ч
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-charcoal-500 truncate mt-0.5">
                      {breed || 'порода'}{racingRank?.rank ? ` · №${racingRank.rank} за всё время` : ''}
                      {racingStats?.avg_speed ? ` · ср. скорость: ${racingStats.avg_speed} км/ч` : ''}
                    </div>
                  </div>
                </div>

                <Link
                  to="/competitions/"
                  className="shrink-0 p-1.5 text-sky-800 hover:text-sky-950 hover:bg-sky-100/60 rounded-md transition-colors"
                  title="Рейтинг скорости"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Выставки рейтинг */}
              <div className="rounded-xl border border-camel-200/80 bg-camel-50/20 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-flex shrink-0 items-center justify-center w-[82px] rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-camel-100/90 text-camel-900 border border-camel-200/80">
                    Выставки
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                        {showDog?.best_award || (showDog?.total_shows ? `${showDog.total_shows} выставок` : 'В каталоге')}
                      </span>
                      {showDog?.total_shows ? (
                        <span className="text-[11px] text-camel-800 font-semibold tabular-nums hidden sm:inline">
                          • {showDog.total_shows} {showDog.total_shows === 1 ? 'выставка' : 'выставок'}
                        </span>
                      ) : null}
                      {(showDog?.bis_count || 0) + (showDog?.big_count || 0) + (showDog?.bob_count || 0) > 0 ? (
                        <span className="text-[11px] text-charcoal-500 tabular-nums hidden md:inline">
                          • побед в ринге: {(showDog?.bis_count || 0) + (showDog?.big_count || 0) + (showDog?.bob_count || 0)}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-charcoal-500 truncate mt-0.5">
                      {showRank?.rank ? `№${showRank.rank} за всё время` : 'Рейтинг экстерьера'}
                      {showDog?.rank_score ? ` · рейтинговый балл: ${showDog.rank_score}` : ''}
                    </div>
                  </div>
                </div>

                <Link
                  to="/shows/"
                  className="shrink-0 p-1.5 text-camel-800 hover:text-camel-950 hover:bg-camel-100/60 rounded-md transition-colors"
                  title="Рейтинг выставок"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
