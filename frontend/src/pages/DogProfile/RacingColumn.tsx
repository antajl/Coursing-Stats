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
  best_speed?: string | null
  distance?: number | null
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
  rank?: ProfileHeaderRank
  breed?: string
}

const THEME = 'warm-blue' as const

function SpeedValue({ value, size = 'hero' }: { value: unknown; size?: 'hero' | 'cell' }) {
  const formatted = formatScore(value)
  if (formatted === '—') return <>—</>
  return (
    <>
      {formatted}
      <span
        className={`ml-1 font-normal text-charcoal-400 ${
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
  rank,
  breed,
}: RacingColumnProps) {
  const t = disciplineTheme(THEME)
  if (!hasRacingData && racingEvents.length === 0) return null

  const dogBreed = breed || ''
  const rankBadge = rank && (rank.yearBreedRank != null || rank.breedRank != null || rank.rank != null) ? (
    <Link
      to={`/competitions?tab=ranking${dogBreed ? `&breed=${encodeURIComponent(dogBreed)}` : ''}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-warm-blue-200/90 bg-warm-blue-50/90 px-2.5 py-0.5 text-xs font-semibold text-warm-blue-800 transition-colors hover:bg-warm-blue-100 hover:border-warm-blue-300"
      title="Открыть рейтинг бегов"
    >
      {rank.yearBreedRank != null ? (
        <span>
          В породе: <strong className="text-warm-blue-950 font-bold">#{rank.yearBreedRank}</strong>
          <span className="text-[10px] font-normal text-warm-blue-700 ml-1">2026</span>
          {rank.breedRank != null && (
            <span className="text-[10px] font-normal text-warm-blue-600 ml-1">· #{rank.breedRank} все</span>
          )}
        </span>
      ) : rank.breedRank != null ? (
        <span>
          В породе: <strong className="text-warm-blue-950 font-bold">#{rank.breedRank}</strong>
          <span className="text-[10px] font-normal text-warm-blue-600 ml-1">все время</span>
        </span>
      ) : rank.rank != null ? (
        <span>
          Общий: <strong className="text-warm-blue-950 font-bold">#{rank.rank}</strong>
        </span>
      ) : null}
      <ArrowRight className="h-3 w-3 text-warm-blue-600 shrink-0" />
    </Link>
  ) : null

  const heroInner = (
    <>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
        Лучшая скорость
      </div>
      <div
        className={`flex flex-wrap items-baseline justify-center gap-x-1 text-4xl font-bold tracking-tight tabular-nums ${t.heroValue}`}
      >
        <SpeedValue value={racing.best_speed} />
      </div>
      <DisciplineHeroLinkHint theme={THEME} />
    </>
  )

  const cellClass = `group min-h-[5.5rem] rounded-xl border p-4 text-center transition-colors ${t.cellBorder} ${t.cellBg}`

  return (
    <DisciplineColumnShell>
      {hasRacingData && (
        <DisciplineStatsCard theme={THEME} title="Бега борзых" rankBadge={rankBadge}>
          {bestSpeedEventId ? (
            <ProcoursingEventLink
              eventId={bestSpeedEventId}
              procoursingUrl={procoursingUrlForEventId(eventResultsUrls, bestSpeedEventId)}
              className={`group mb-4 block h-[7.25rem] shrink-0 overflow-hidden rounded-lg border p-4 text-center transition-colors hover:brightness-[0.98] ${t.heroBorder} ${t.heroBg}`}
            >
              {heroInner}
            </ProcoursingEventLink>
          ) : (
            <div className={`mb-4 h-[7.25rem] shrink-0 overflow-hidden rounded-lg border p-4 text-center ${t.heroBorder} ${t.heroBg}`}>
              {heroInner}
            </div>
          )}

          <div className="mb-4 shrink-0">
            {avgSpeedEventId ? (
              <ProcoursingEventLink
                eventId={avgSpeedEventId}
                procoursingUrl={procoursingUrlForEventId(eventResultsUrls, avgSpeedEventId)}
                className={`${cellClass} block hover:brightness-[0.98]`}
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500">
                  Средняя
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800">
                  <SpeedValue value={racing.avg_speed} size="cell" />
                </div>
              </ProcoursingEventLink>
            ) : (
              <div className={cellClass}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500">
                  Средняя
                </div>
                <div className="text-2xl font-bold tabular-nums text-charcoal-800">
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
        <DisciplineHistoryCard theme={THEME} participations={racingEvents.length}>
          <div>
            {visibleRacingEvents.map((event, idx) => {
              const cardClass =
                'block border-b border-warm-blue-200/80 py-3 h-[6.5rem] transition-colors last:border-b-0 hover:bg-warm-blue-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camel-500'
              const cardBody = (
                <>
                  <div className="min-w-0 flex-shrink-0">
                    {event.competition_kind ? (
                      <div className="break-words text-xs font-bold uppercase tracking-wide text-warm-blue-700">
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
                    trailing={
                      event.best_speed || event.distance ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          {event.best_speed && (
                            <span className="font-medium tabular-nums text-old-money-600">
                              {event.best_speed} км/ч
                            </span>
                          )}
                          {event.best_speed && event.distance && (
                            <span className="text-old-money-300">•</span>
                          )}
                          {event.distance && (
                            <span className="font-medium tabular-nums text-old-money-600">
                              {event.distance} м
                            </span>
                          )}
                        </div>
                      ) : null
                    }
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
            {racingEvents.length > HISTORY_DEFAULT && (
              <button
                type="button"
                onClick={onToggleShowAll}
                className="text-sm font-semibold text-camel-700"
              >
                {showAllRacingEvents
                  ? 'Свернуть'
                  : `Показать все ${racingEvents.length} участий`}
              </button>
            )}
          </div>
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
