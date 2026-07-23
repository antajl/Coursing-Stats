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

type RacingStats = {
  best_speed?: number | string | null
  avg_speed?: number | string | null
  total_starts?: number
  gold?: number
  silver?: number
  bronze?: number
}

type DogEvent = {
  event_id?: string | number | null
  competition_kind?: string | null
  date_start?: string | null
  placement?: number | string | null
  qualification?: string | null
}

type RacingColumnProps = {
  hasRacingData: boolean
  hasRacingMedals: boolean
  racing: RacingStats
  racingEvents: DogEvent[]
  visibleRacingEvents: DogEvent[]
  eventResultsUrls: Map<number, string>
  bestSpeedEventId: string | number | null
  avgSpeedEventId: string | number | null
  showAllRacingEvents: boolean
  onToggleShowAll: () => void
}

const THEME = 'warm-blue' as const

function SpeedValue({ value, size = 'hero' }: { value: unknown; size?: 'hero' | 'cell' }) {
  const formatted = formatScore(value)
  if (formatted === '—') return <>—</>
  return (
    <>
      {formatted}
      <span
        className={`ml-1 font-normal text-charcoal-400 dark:text-charcoal-500 ${
          size === 'hero' ? 'text-base' : 'text-sm'
        }`}
      >
        км/ч
      </span>
    </>
  )
}

export function RacingColumn({
  hasRacingData,
  hasRacingMedals,
  racing,
  racingEvents,
  visibleRacingEvents,
  eventResultsUrls,
  bestSpeedEventId,
  avgSpeedEventId,
  showAllRacingEvents,
  onToggleShowAll,
}: RacingColumnProps) {
  const t = disciplineTheme(THEME)
  if (!hasRacingData && racingEvents.length === 0) return null

  const heroInner = (
    <>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        Лучшая скорость
      </div>
      <div
        className={`flex flex-wrap items-baseline justify-center gap-x-1 text-4xl font-bold tracking-tight tabular-nums ${t.heroValue}`}
      >
        <SpeedValue value={racing.best_speed} />
      </div>
      <div className="mt-2 min-h-[1.25rem] text-sm font-medium text-warm-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
        открыть результаты →
      </div>
    </>
  )

  const cellClass = `group min-h-[5.5rem] rounded-xl border p-4 text-center transition-colors ${t.cellBorder} ${t.cellBg}`

  return (
    <DisciplineColumnShell>
      {hasRacingData && (
        <DisciplineStatsCard theme={THEME} title="Бега борзых">
          {bestSpeedEventId ? (
            <ProcoursingEventLink
              eventId={bestSpeedEventId}
              procoursingUrl={procoursingUrlForEventId(eventResultsUrls, bestSpeedEventId)}
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
            <div className={cellClass}>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                Участий
              </div>
              <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                {racing.total_starts ?? '—'}
              </div>
            </div>
            {avgSpeedEventId ? (
              <ProcoursingEventLink
                eventId={avgSpeedEventId}
                procoursingUrl={procoursingUrlForEventId(eventResultsUrls, avgSpeedEventId)}
                className={`${cellClass} hover:brightness-[0.98] dark:hover:bg-charcoal-600`}
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                  Средняя
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                  <SpeedValue value={racing.avg_speed} size="cell" />
                </div>
              </ProcoursingEventLink>
            ) : (
              <div className={cellClass}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                  Средняя
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                  <SpeedValue value={racing.avg_speed} size="cell" />
                </div>
              </div>
            )}
          </div>

          <DisciplineFooterRow>
            {hasRacingMedals ? (
              <MedalTally
                gold={racing.gold}
                silver={racing.silver}
                bronze={racing.bronze}
                size="xl"
                showZero
              />
            ) : null}
          </DisciplineFooterRow>
        </DisciplineStatsCard>
      )}

      {racingEvents.length > 0 && (
        <DisciplineHistoryCard theme={THEME}>
          <div>
            {visibleRacingEvents.map((event, idx) => {
              const cardClass =
                'block border-b border-warm-blue-200/80 py-3 transition-colors last:border-b-0 hover:bg-warm-blue-50/60 dark:border-warm-blue-700/60 dark:hover:bg-charcoal-700/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camel-500'
              const cardBody = (
                <>
                  <div className="min-w-0">
                    {event.competition_kind ? (
                      <div className="break-words text-xs font-bold uppercase tracking-wide text-warm-blue-700 dark:text-warm-blue-400">
                        {event.competition_kind}
                      </div>
                    ) : null}
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
                    {event.placement && (
                      <span className="shrink-0 text-base font-bold text-warm-blue-700 dark:text-warm-blue-400">
                        #{event.placement}
                      </span>
                    )}
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
            {racingEvents.length > HISTORY_DEFAULT && (
              <button
                type="button"
                onClick={onToggleShowAll}
                className="text-sm font-semibold text-camel-700 dark:text-camel-400"
              >
                {showAllRacingEvents
                  ? 'Свернуть'
                  : `Показать все ${racingEvents.length} стартов`}
              </button>
            )}
          </div>
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
