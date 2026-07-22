import MedalTally from '../../components/MedalTally'
import ProcoursingEventLink from '../../components/ProcoursingEventLink'
import { procoursingUrlForEventId } from '../../lib/procoursingLinks'
import { EventQualificationChips } from './EventQualificationChips'
import { HISTORY_DEFAULT, formatScore } from './dogProfileStats'
import {
  DisciplineColumnShell,
  DisciplineFooterRow,
  DisciplineHistoryCard,
  DisciplineStatsCard,
  disciplineTheme,
} from './DisciplineColumnShell'

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
}: CoursingColumnProps) {
  const t = disciplineTheme(THEME)
  if (!hasCoursingData && coursingEvents.length === 0) return null

  const heroInner = (
    <>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        Лучший результат
      </div>
      <div className={`text-4xl font-bold tracking-tight tabular-nums ${t.heroValue}`}>
        {formatScore(coursing.best_score)}
      </div>
      <div className="mt-2 min-h-[1.25rem] text-sm font-medium text-forest-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-forest-500">
        открыть результаты →
      </div>
    </>
  )

  const cellClass = `group min-h-[5.5rem] rounded-xl border p-4 text-center transition-colors ${t.cellBorder} ${t.cellBg}`

  return (
    <DisciplineColumnShell>
      {hasCoursingData && (
        <DisciplineStatsCard theme={THEME} title="Курсинг / БЗМП">
          {bestScoreEventId ? (
            <ProcoursingEventLink
              eventId={bestScoreEventId}
              procoursingUrl={procoursingUrlForEventId(eventResultsUrls, bestScoreEventId)}
              className={`group mb-4 block h-[7.25rem] shrink-0 overflow-hidden rounded-lg border p-4 text-center transition-colors hover:brightness-[0.98] dark:hover:bg-charcoal-600 ${t.heroBorder} ${t.heroBg}`}
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
                className={`${cellClass} hover:brightness-[0.98] dark:hover:bg-charcoal-600`}
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                  Лучшая оценка
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                  {formatScore(coursing.best_judge_score)}
                </div>
              </ProcoursingEventLink>
            ) : (
              <div className={cellClass}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                  Лучшая оценка
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                  {formatScore(coursing.best_judge_score)}
                </div>
              </div>
            )}
            {avgJudgeScoreEventId ? (
              <ProcoursingEventLink
                eventId={avgJudgeScoreEventId}
                procoursingUrl={procoursingUrlForEventId(eventResultsUrls, avgJudgeScoreEventId)}
                className={`${cellClass} hover:brightness-[0.98] dark:hover:bg-charcoal-600`}
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                  Средняя оценка
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                  {formatScore(coursing.avg_judge_score)}
                </div>
              </ProcoursingEventLink>
            ) : (
              <div className={cellClass}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                  Средняя оценка
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
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
        <DisciplineHistoryCard theme={THEME}>
          <div>
            {visibleCoursingEvents.map((event, idx) => {
              const cardClass =
                'block border-b border-forest-200/80 py-3 transition-colors last:border-b-0 hover:bg-forest-50/60 dark:border-forest-700/60 dark:hover:bg-charcoal-700/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camel-500'
              const cardBody = (
                <>
                  <div className="min-w-0">
                    {event.competition_kind ? (
                      <div className="break-words text-xs font-bold uppercase tracking-wide text-forest-700 dark:text-forest-400">
                        {event.competition_kind}
                      </div>
                    ) : null}
                    <div className="mt-1 inline-flex rounded-full border border-old-money-200 bg-white px-2 py-0.5 text-xs font-medium text-charcoal-600 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300">
                      {event.event_type === 'coursing' ? 'Курсинг' : 'БЗМП'}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">
                      {event.date_start
                        ? (() => {
                            const [year, month, day] = event.date_start.split('-')
                            return `${day}.${month}.${year}`
                          })()
                        : '—'}
                    </div>
                    <div className="flex shrink-0 items-baseline gap-2 text-right">
                      {event.placement && (
                        <span className="text-base font-bold text-forest-700 dark:text-forest-400">
                          #{event.placement}
                        </span>
                      )}
                      {event.total_score != null && event.total_score !== '' && (
                        <span className="text-sm font-medium text-old-money-600 dark:text-old-money-400">
                          {formatScore(event.total_score)} баллов
                        </span>
                      )}
                    </div>
                  </div>
                  <EventQualificationChips qualification={event.qualification as string | null | undefined} />
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
                className="text-sm font-semibold text-camel-700 dark:text-camel-400"
              >
                {showAllCoursingEvents
                  ? 'Свернуть'
                  : `Показать все ${coursingEvents.length} стартов`}
              </button>
            )}
          </div>
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
