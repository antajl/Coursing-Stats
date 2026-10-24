import { Link } from 'react-router-dom'
import { Crown, ArrowRight, Medal } from 'lucide-react'
import MedalTally from '../../components/MedalTally'
import ProcoursingEventLink from '../../components/ProcoursingEventLink'
import { procoursingUrlForEventId } from '../../lib/procoursingLinks'
import { EventQualificationChips } from './EventQualificationChips'
import { formatScore } from './dogProfileStats'
import {
  DisciplineColumnShell,
  DisciplineHistoryCard,
  DisciplineStatsCard,
  disciplineTheme,
} from './DisciplineColumnShell'
import { HistoryMetaRow } from './HistoryPlacement'
import type { ProfileHeaderRank } from './DogProfileHeader'

type CoursingStats = {
  best_score?: number | string | null
  best_judge_score?: number | string | null
  avg_judge_score?: number | string | null
  gold?: number
  silver?: number
  bronze?: number
}

type DogEvent = {
  event_id?: string | number | null
  event_type?: string
  competition_kind?: string | null
  date_start?: string | null
  placement?: number | string | null
  total_score?: number | string | null
  qualification?: string | null
  status?: string | null
  status_reason?: string | null
}

type CoursingColumnProps = {
  hasCoursingData: boolean
  hasCourseMedals: boolean
  coursing: CoursingStats
  coursingEvents: DogEvent[]
  visibleCoursingEvents: DogEvent[]
  eventResultsUrls: Map<number, string>
  bestScoreEventId: string | number | null
  bestJudgeScoreEventId: string | number | null
  avgJudgeScoreEventId: string | number | null
  showAllCoursingEvents: boolean
  onToggleShowAll: () => void
  rank?: ProfileHeaderRank
  breed?: string
}

const THEME = 'forest' as const

function formatCompetitionsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} состязаний`
  if (mod10 === 1) return `${count} состязание`
  if (mod10 >= 2 && mod10 <= 4) return `${count} состязания`
  return `${count} состязаний`
}

export function CoursingColumn({
  hasCoursingData,
  hasCourseMedals,
  coursing,
  coursingEvents,
  visibleCoursingEvents,
  eventResultsUrls,
  bestScoreEventId,
  bestJudgeScoreEventId,
  avgJudgeScoreEventId,
  showAllCoursingEvents,
  onToggleShowAll,
  rank,
  breed,
}: CoursingColumnProps) {
  const t = disciplineTheme(THEME)
  if (!hasCoursingData && coursingEvents.length === 0) return null

  const dogBreed = breed || ''
  const rankingUrl = `/competitions?tab=ranking${dogBreed ? `&breed=${encodeURIComponent(dogBreed)}` : ''}`
  const bestScoreUrl = bestScoreEventId
    ? procoursingUrlForEventId(eventResultsUrls, bestScoreEventId)
    : null
  const bestJudgeUrl = bestJudgeScoreEventId
    ? procoursingUrlForEventId(eventResultsUrls, bestJudgeScoreEventId)
    : null
  const avgJudgeUrl = avgJudgeScoreEventId
    ? procoursingUrlForEventId(eventResultsUrls, avgJudgeScoreEventId)
    : null

  const has2026 = rank?.yearBreedRank != null
  const hasHistory = rank?.breedRank != null
  const hasAnyRank = has2026 || hasHistory || rank?.rank != null
  const startsCount = coursingEvents.length
  const competitionsCount = startsCount || (typeof coursing.total_starts === 'number' ? coursing.total_starts : 0)

  const headerLink = (
    <Link
      to={rankingUrl}
      className="shrink-0 inline-flex items-center gap-1 rounded-full border border-forest-200/90 bg-forest-50/80 px-2.5 py-0.5 text-xs font-semibold text-forest-800 transition-colors hover:bg-forest-100 hover:border-forest-300"
      title="Открыть рейтинг курсинга"
    >
      <span>Рейтинг</span>
      <ArrowRight className="h-3 w-3 text-forest-600 shrink-0" />
    </Link>
  )

  return (
    <DisciplineColumnShell>
      {hasCoursingData && (
        <DisciplineStatsCard theme={THEME} title="Курсинг / БЗМП" rankBadge={headerLink}>
          <div className="flex h-full flex-col justify-between gap-3">
            {/* Верх: Подиум (Рейтинг + Медали) */}
            <Link
              to={rankingUrl}
              className="group block rounded-xl border border-forest-200/90 bg-forest-50/80 p-3 transition-colors hover:bg-forest-100/80"
              title="Открыть рейтинг породы по курсингу"
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                {/* Слева: Место в породе + исторический зачёт */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-700 text-white shadow-2xs">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-sm font-bold text-forest-950 xl:text-base truncate block">
                        {has2026
                          ? `#${rank.yearBreedRank} в сезоне 2026`
                          : hasHistory
                            ? `№${rank.breedRank} за всё время`
                            : 'Состязания'}
                      </span>
                    </div>
                    <div className="text-[11px] text-forest-700 leading-tight mt-0.5 truncate">
                      {has2026 && hasHistory ? (
                        `№${rank?.breedRank} за всё время`
                      ) : hasHistory ? (
                        'исторический зачёт'
                      ) : has2026 ? (
                        'сезонный зачёт'
                      ) : (
                        'состязания РКФ'
                      )}
                    </div>
                  </div>
                </div>

                {/* Справа: Медали и количество стартов */}
                <div className="shrink-0 flex items-center leading-tight">
                  {hasCourseMedals ? (
                    <MedalTally
                      gold={coursing.gold}
                      silver={coursing.silver}
                      bronze={coursing.bronze}
                      size="sm"
                      showZero
                    />
                  ) : startsCount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-forest-200 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-charcoal-700">
                      <Medal className="h-3 w-3 text-forest-600 shrink-0" />
                      <span>Участник</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>

            {/* Центр: Главный рекорд */}
            {bestScoreEventId ? (
              <ProcoursingEventLink
                eventId={bestScoreEventId}
                procoursingUrl={bestScoreUrl}
                className="group flex flex-1 flex-col items-center justify-center rounded-xl border border-forest-200/90 bg-white p-3 text-center transition-colors hover:bg-forest-50/50"
                title="Посмотреть протокол лучшего состязания"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
                  Лучший результат
                </span>
                <span className="text-3xl font-bold tabular-nums text-forest-900 sm:text-4xl">
                  {formatScore(coursing.best_score)}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-forest-700 group-hover:underline">
                  <span>Протокол состязания</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                </span>
              </ProcoursingEventLink>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-forest-200/90 bg-white p-3 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
                  Лучший результат
                </span>
                <span className="text-3xl font-bold tabular-nums text-forest-900 sm:text-4xl">
                  {formatScore(coursing.best_score)}
                </span>
              </div>
            )}

            {/* Низ: 2 карточки показателей */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs shrink-0">
              {avgJudgeScoreEventId || bestJudgeScoreEventId ? (
                <ProcoursingEventLink
                  eventId={(avgJudgeScoreEventId ?? bestJudgeScoreEventId)!}
                  procoursingUrl={avgJudgeUrl ?? bestJudgeUrl}
                  className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2 transition-colors hover:bg-cream-100/90"
                  title="Открыть состязание со средней оценкой"
                >
                  <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Средняя оценка</div>
                  <div className="font-bold tabular-nums text-charcoal-800 text-sm sm:text-base">
                    {formatScore(coursing.avg_judge_score ?? coursing.best_judge_score)}
                  </div>
                </ProcoursingEventLink>
              ) : (
                <div className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2">
                  <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Средняя оценка</div>
                  <div className="font-bold tabular-nums text-charcoal-800 text-sm sm:text-base">
                    {formatScore(coursing.avg_judge_score ?? coursing.best_judge_score)}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2">
                <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Состязания</div>
                <div className="font-bold tabular-nums text-charcoal-800 text-sm sm:text-base">
                  {formatCompetitionsCount(competitionsCount)}
                </div>
              </div>
            </div>
          </div>
        </DisciplineStatsCard>
      )}

      {coursingEvents.length > 0 && (
        <DisciplineHistoryCard theme={THEME} participations={coursingEvents.length}>
          <div className="flex-1">
            {visibleCoursingEvents.map((event, idx) => {
              const cardClass =
                'block border-b border-forest-200/80 py-3 h-[6.5rem] transition-colors last:border-b-0 hover:bg-forest-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camel-500'
              const cardBody = (
                <>
                  <div className="min-w-0 flex-shrink-0">
                    {event.competition_kind ? (
                      <div className="break-words text-xs font-bold uppercase tracking-wide text-forest-700">
                        {event.competition_kind}
                      </div>
                    ) : null}
                  </div>
                  <HistoryMetaRow
                    date={
                      event.date_start
                        ? (() => {
                            const [year, month, day] = event.date_start.split('-')
                            return `${day}.${month}.${year}`
                          })()
                        : '—'
                    }
                    placement={event.placement}
                    status={event.status}
                    statusReason={event.status_reason}
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <EventQualificationChips qualification={event.qualification as string | null | undefined} />
                  </div>
                </>
              )
              return event.event_id ? (
                <ProcoursingEventLink
                  key={idx}
                  eventId={event.event_id}
                  procoursingUrl={procoursingUrlForEventId(eventResultsUrls, event.event_id)}
                  className={`${cardClass} text-inherit no-underline`}
                >
                  {cardBody}
                </ProcoursingEventLink>
              ) : (
                <div key={idx} className={cardClass}>
                  {cardBody}
                </div>
              )
            })}
          </div>

          {coursingEvents.length > 3 && (
            <div className="mt-auto pt-3 text-center shrink-0 min-h-[2.25rem] flex items-center justify-center">
              <button
                type="button"
                onClick={onToggleShowAll}
                className="text-xs font-semibold text-forest-700 transition-colors hover:text-forest-900 hover:underline"
              >
                {showAllCoursingEvents ? 'Свернуть историю' : `Показать все ${coursingEvents.length} состязаний`}
              </button>
            </div>
          )}
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
