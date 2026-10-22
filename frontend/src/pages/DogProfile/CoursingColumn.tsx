import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import MedalTally from '../../components/MedalTally'
import ProcoursingEventLink from '../../components/ProcoursingEventLink'
import { procoursingUrlForEventId } from '../../lib/procoursingLinks'
import { EventQualificationChips } from './EventQualificationChips'
import { HISTORY_DEFAULT, formatScore } from './dogProfileStats'
import {
  DisciplineColumnShell,
  DisciplineFooterRow,
  DisciplineHistoryCard,
  DisciplineHeroLinkHint,
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
  const rankBadge = rank && (rank.yearBreedRank != null || rank.breedRank != null || rank.rank != null) ? (
    <Link
      to={`/competitions?tab=ranking${dogBreed ? `&breed=${encodeURIComponent(dogBreed)}` : ''}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-forest-200/90 bg-forest-50/90 px-2.5 py-0.5 text-xs font-semibold text-forest-800 transition-colors hover:bg-forest-100 hover:border-forest-300"
      title="Открыть рейтинг курсинга"
    >
      {rank.yearBreedRank != null ? (
        <span>
          В породе: <strong className="text-forest-950 font-bold">#{rank.yearBreedRank}</strong>
          <span className="text-[10px] font-normal text-forest-700 ml-1">2026</span>
          {rank.breedRank != null && (
            <span className="text-[10px] font-normal text-forest-600 ml-1">· #{rank.breedRank} все</span>
          )}
        </span>
      ) : rank.breedRank != null ? (
        <span>
          В породе: <strong className="text-forest-950 font-bold">#{rank.breedRank}</strong>
          <span className="text-[10px] font-normal text-forest-600 ml-1">все время</span>
        </span>
      ) : rank.rank != null ? (
        <span>
          Общий: <strong className="text-forest-950 font-bold">#{rank.rank}</strong>
        </span>
      ) : null}
      <ArrowRight className="h-3 w-3 text-forest-600 shrink-0" />
    </Link>
  ) : null

  const heroInner = (
    <>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
        Лучший результат
      </div>
      <div className={`text-4xl font-bold tracking-tight tabular-nums ${t.heroValue}`}>
        {formatScore(coursing.best_score)}
      </div>
      <DisciplineHeroLinkHint theme={THEME} />
    </>
  )

  const cellClass = `group min-h-[5.5rem] rounded-xl border p-4 text-center transition-colors ${t.cellBorder} ${t.cellBg}`

  return (
    <DisciplineColumnShell>
      {hasCoursingData && (
        <DisciplineStatsCard theme={THEME} title="Курсинг / БЗМП" rankBadge={rankBadge}>
          {bestScoreEventId ? (
            <ProcoursingEventLink
              eventId={bestScoreEventId}
              procoursingUrl={procoursingUrlForEventId(eventResultsUrls, bestScoreEventId)}
              className={`group mb-4 block h-[7.25rem] shrink-0 overflow-hidden rounded-lg border p-4 text-center transition-colors hover:brightness-[0.98] ${t.heroBorder} ${t.heroBg}`}
            >
              {heroInner}
            </ProcoursingEventLink>
          ) : (
            <div className={`mb-4 h-[7.25rem] shrink-0 overflow-hidden rounded-lg border p-4 text-center ${t.heroBorder} ${t.heroBg}`}>
              {heroInner}
            </div>
          )}

          <div className="mb-4 grid shrink-0 grid-cols-2 gap-3">
            {bestJudgeScoreEventId ? (
              <ProcoursingEventLink
                eventId={bestJudgeScoreEventId}
                procoursingUrl={procoursingUrlForEventId(eventResultsUrls, bestJudgeScoreEventId)}
                className={`${cellClass} hover:brightness-[0.98]`}
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500">
                  Лучшая оценка
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800">
                  {formatScore(coursing.best_judge_score)}
                </div>
              </ProcoursingEventLink>
            ) : (
              <div className={cellClass}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500">
                  Лучшая оценка
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800">
                  {formatScore(coursing.best_judge_score)}
                </div>
              </div>
            )}
            {avgJudgeScoreEventId ? (
              <ProcoursingEventLink
                eventId={avgJudgeScoreEventId}
                procoursingUrl={procoursingUrlForEventId(eventResultsUrls, avgJudgeScoreEventId)}
                className={`${cellClass} hover:brightness-[0.98]`}
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500">
                  Средняя оценка
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800">
                  {formatScore(coursing.avg_judge_score)}
                </div>
              </ProcoursingEventLink>
            ) : (
              <div className={cellClass}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500">
                  Средняя оценка
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800">
                  {formatScore(coursing.avg_judge_score)}
                </div>
              </div>
            )}
          </div>

          <DisciplineFooterRow>
            {hasCourseMedals ? (
              <MedalTally
                gold={coursing.gold}
                silver={coursing.silver}
                bronze={coursing.bronze}
                size="xl"
                showZero
              />
            ) : null}
          </DisciplineFooterRow>
        </DisciplineStatsCard>
      )}

      {coursingEvents.length > 0 && (
        <DisciplineHistoryCard theme={THEME} participations={coursingEvents.length}>
          <div>
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
            {coursingEvents.length > HISTORY_DEFAULT && (
              <button
                type="button"
                onClick={onToggleShowAll}
                className="text-sm font-semibold text-camel-700"
              >
                {showAllCoursingEvents
                  ? 'Свернуть'
                  : `Показать все ${coursingEvents.length} участий`}
              </button>
            )}
          </div>
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
