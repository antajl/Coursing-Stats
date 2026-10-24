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

type RacingStats = {
  best_speed?: number | string | null
  avg_speed?: number | string | null
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
  speed?: number | string | null
  qualification?: string | null
  status?: string | null
  status_reason?: string | null
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

function formatRunsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} забегов`
  if (mod10 === 1) return `${count} забег`
  if (mod10 >= 2 && mod10 <= 4) return `${count} забега`
  return `${count} забегов`
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
  const rankingUrl = `/competitions?tab=ranking${dogBreed ? `&breed=${encodeURIComponent(dogBreed)}` : ''}`
  const bestSpeedUrl = bestSpeedEventId
    ? procoursingUrlForEventId(eventResultsUrls, bestSpeedEventId)
    : null
  const avgSpeedUrl = avgSpeedEventId
    ? procoursingUrlForEventId(eventResultsUrls, avgSpeedEventId)
    : null

  const has2026 = rank?.yearBreedRank != null
  const hasHistory = rank?.breedRank != null
  const hasAnyRank = has2026 || hasHistory || rank?.rank != null
  const startsCount = racingEvents.length

  const headerLink = (
    <Link
      to={rankingUrl}
      className="shrink-0 inline-flex items-center gap-1 rounded-full border border-warm-blue-200/90 bg-warm-blue-50/80 px-2.5 py-0.5 text-xs font-semibold text-warm-blue-800 transition-colors hover:bg-warm-blue-100 hover:border-warm-blue-300"
      title="Открыть рейтинг бегов"
    >
      <span>Рейтинг</span>
      <ArrowRight className="h-3 w-3 text-warm-blue-600 shrink-0" />
    </Link>
  )

  return (
    <DisciplineColumnShell>
      {hasRacingData && (
        <DisciplineStatsCard theme={THEME} title="Бега борзых" rankBadge={headerLink}>
          <div className="flex h-full flex-col justify-between gap-3">
            {/* Верх: Подиум (Рейтинг + Медали) */}
            <Link
              to={rankingUrl}
              className="group block rounded-xl border border-warm-blue-200/90 bg-warm-blue-50/80 p-3 transition-colors hover:bg-warm-blue-100/80"
              title="Открыть рейтинг породы по бегам"
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                {/* Слева: Место в породе + исторический зачёт */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warm-blue-700 text-white shadow-2xs">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-sm font-bold text-warm-blue-950 xl:text-base truncate block">
                        {has2026
                          ? `#${rank.yearBreedRank} в сезоне 2026`
                          : hasHistory
                            ? `№${rank.breedRank} за всё время`
                            : 'Бега'}
                      </span>
                    </div>
                    <div className="text-[11px] text-warm-blue-700 leading-tight mt-0.5 truncate">
                      {has2026 && hasHistory ? (
                        `№${rank?.breedRank} за всё время`
                      ) : hasHistory ? (
                        'исторический зачёт'
                      ) : has2026 ? (
                        'сезонный зачёт'
                      ) : (
                        'беговой рейтинг'
                      )}
                    </div>
                  </div>
                </div>

                {/* Справа: Медали и количество стартов */}
                <div className="shrink-0 flex items-center leading-tight">
                  {hasRacingMedals ? (
                    <MedalTally
                      gold={racing.gold}
                      silver={racing.silver}
                      bronze={racing.bronze}
                      size="sm"
                      showZero
                    />
                  ) : startsCount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-warm-blue-200 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-charcoal-700">
                      <Medal className="h-3 w-3 text-warm-blue-600 shrink-0" />
                      <span>Участник</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>

            {/* Центр: Главный рекорд скорости */}
            {bestSpeedEventId ? (
              <ProcoursingEventLink
                eventId={bestSpeedEventId}
                procoursingUrl={bestSpeedUrl}
                className="group flex flex-1 flex-col items-center justify-center rounded-xl border border-warm-blue-200/90 bg-white p-3 text-center transition-colors hover:bg-warm-blue-50/50"
                title="Посмотреть протокол лучшего забега"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
                  Лучшая скорость
                </span>
                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums text-warm-blue-900 sm:text-4xl">
                  <span>{formatScore(racing.best_speed)}</span>
                  <span className="text-sm font-normal text-charcoal-400">км/ч</span>
                </div>
                <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-warm-blue-700 group-hover:underline">
                  <span>Протокол забега</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                </span>
              </ProcoursingEventLink>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-warm-blue-200/90 bg-white p-3 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
                  Лучшая скорость
                </span>
                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums text-warm-blue-900 sm:text-4xl">
                  <span>{formatScore(racing.best_speed)}</span>
                  <span className="text-sm font-normal text-charcoal-400">км/ч</span>
                </div>
              </div>
            )}

            {/* Низ: 2 карточки показателей */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs shrink-0">
              {avgSpeedEventId ? (
                <ProcoursingEventLink
                  eventId={avgSpeedEventId}
                  procoursingUrl={avgSpeedUrl}
                  className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2 transition-colors hover:bg-cream-100/90"
                  title="Открыть забег со средней скоростью"
                >
                  <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Средняя скорость</div>
                  <div className="font-bold tabular-nums text-charcoal-800 text-sm sm:text-base">
                    {formatScore(racing.avg_speed)} км/ч
                  </div>
                </ProcoursingEventLink>
              ) : (
                <div className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2">
                  <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Средняя скорость</div>
                  <div className="font-bold tabular-nums text-charcoal-800 text-sm sm:text-base">
                    {formatScore(racing.avg_speed)} км/ч
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2">
                <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Забеги</div>
                <div className="font-bold tabular-nums text-charcoal-800 text-sm sm:text-base">
                  {formatRunsCount(startsCount)}
                </div>
              </div>
            </div>
          </div>
        </DisciplineStatsCard>
      )}

      {racingEvents.length > 0 && (
        <DisciplineHistoryCard theme={THEME} participations={racingEvents.length}>
          <div className="flex-1">
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
                    statusReason={event.status_reason}
                    speed={event.speed}
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

          {racingEvents.length > 3 && (
            <div className="mt-auto pt-3 text-center shrink-0 min-h-[2.25rem] flex items-center justify-center">
              <button
                type="button"
                onClick={onToggleShowAll}
                className="text-xs font-semibold text-warm-blue-700 transition-colors hover:text-warm-blue-900 hover:underline"
              >
                {showAllRacingEvents ? 'Свернуть историю' : `Показать все ${racingEvents.length} забегов`}
              </button>
            </div>
          )}
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
