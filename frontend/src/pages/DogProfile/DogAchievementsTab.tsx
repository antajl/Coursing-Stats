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
            <span
              className={`inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums whitespace-nowrap ${chipClass}`}
            >
              {item.title} {item.count > 1 ? `×${item.count}` : ''}
            </span>
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
          className="px-4 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-cream-100/50 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="min-w-0">
            <div className={`text-xs font-bold uppercase tracking-wider ${themeText}`}>
              {title}
            </div>
            <p className="text-xs text-charcoal-600 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-bold text-charcoal-900 tabular-nums">
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

        {extraNote && !isExpanded && (
          <div className="px-4 pb-3 text-xs text-charcoal-500">{extraNote}</div>
        )}

        {isExpanded && eventsList.length > 0 && (
          <div className="px-4 pb-4 pt-2 border-t border-cream-200/80 bg-white space-y-2 animate-in fade-in duration-150">
            {extraNote && <div className="text-xs text-charcoal-500 mb-2">{extraNote}</div>}
            <div className="space-y-1.5">
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
              const isSupreme = title.domain === 'supreme'

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
                    className="px-4 py-2.5 sm:px-5 sm:py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-amber-100/30 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums whitespace-nowrap ${chipClass}`}
                      >
                        {title.badge}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-charcoal-900 leading-snug">
                            {title.title}
                          </h3>
                          {isSupreme && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold rounded-md px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300">
                              Высшее звание
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-600 leading-snug mt-0.5">
                          {title.rulesSummary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-900 tabular-nums">
                          {title.progressPercent}%
                        </span>
                        <div className="text-[10px] text-charcoal-400 uppercase tracking-wide leading-none">
                          выполнено
                        </div>
                      </div>
                      <div className="p-1 rounded-lg text-charcoal-400 flex items-center justify-center">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-amber-800' : 'text-charcoal-400'
                          }`}
                          aria-hidden
                        />
                      </div>
                    </div>
                  </div>

                  {/* Шкала прогресса */}
                  <div className="px-4 sm:px-5 pb-2.5">
                    <div className="w-full bg-cream-200/70 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          title.progressPercent >= 75
                            ? 'bg-gradient-to-r from-forest-500 to-forest-600'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600'
                        }`}
                        style={{ width: `${title.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Детали условий и следующий шаг (скрыто по умолчанию) */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-amber-200/40 space-y-2.5 animate-in fade-in duration-150">
                      <div className="space-y-1.5 pt-2">
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
                        <div className="mt-3 rounded-xl bg-amber-100/70 border border-amber-300/80 p-3 text-xs text-amber-950">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
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

      {/* РАЗДЕЛ 3: ОФИЦИАЛЬНЫЕ СЕРТИФИКАТЫ И ДОПУСКИ РКФ */}
      <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
            Официальные сертификаты и квалификационные допуски
          </h2>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* CACL Курсинг */}
            {renderCertificateCard(
              'cert-cacl-coursing',
              'CACL · Курсинг борзых',
              `${certs.caclEventsCoursing.length} серт.`,
              'Кандидат в чемпионы России по рабочим качествам собак (курсинг)',
              certs.caclEventsCoursing,
              'forest',
            )}

            {/* CACL Бега борзых */}
            {renderCertificateCard(
              'cert-cacl-racing',
              'CACL · Бега борзых',
              `${certs.caclEventsRacing.length} серт.`,
              'Кандидат в чемпионы России по рабочим качествам собак (рейсинг)',
              certs.caclEventsRacing,
              'sky',
            )}

            {/* CAC Выставки */}
            {renderCertificateCard(
              'cert-cac-shows',
              'CAC · Выставки РКФ',
              `${totalCac} серт.`,
              'Кандидат в чемпионы России по красоте (экстерьер)',
              certs.cacShowEvents,
              'camel',
              certs.uniqueCacJudgesCount > 0
                ? `Подтверждено под ${certs.uniqueCacJudgesCount} разными судьями РКФ`
                : undefined,
            )}

            {/* Беговой допуск РКФ */}
            <div className="rounded-xl border border-old-money-200/80 px-4 py-3 sm:py-3.5 bg-cream-50/30">
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
        <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
            Достижения и рекорды в рейтинге CoursingStats
          </h2>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Курсинг рейтинг */}
          <div className="rounded-xl border border-forest-200/80 bg-forest-50/20 p-4">
            <div className="text-forest-800 text-xs font-bold uppercase tracking-wider">
              <span>Курсинг / БЗМП</span>
            </div>
            <div className="mt-2.5">
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
            <div className="text-sky-800 text-xs font-bold uppercase tracking-wider">
              <span>Бега борзых (рейсинг)</span>
            </div>
            <div className="mt-2.5">
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
            <div className="text-camel-800 text-xs font-bold uppercase tracking-wider">
              <span>Выставки РКФ</span>
            </div>
            <div className="mt-2.5">
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
