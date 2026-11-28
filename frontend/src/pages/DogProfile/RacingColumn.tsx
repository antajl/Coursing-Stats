import { Link } from 'react-router-dom'
import { Medal } from 'lucide-react'
import MedalTally from '../../components/MedalTally'
import ProcoursingEventLink from '../../components/ProcoursingEventLink'
import { procoursingUrlForEventId } from '../../lib/procoursingLinks'
import { EventQualificationChips } from './EventQualificationChips'
import { formatScore } from './dogProfileStats'
import {
  DisciplineColumnShell,
  DisciplineHistoryCard,
  DisciplineStatsCard,
  HistoryExpandToggle,
} from './DisciplineColumnShell'
import { DisciplineHistoryRow } from './DisciplineHistoryRow'
import { HistoryPlacement } from './HistoryPlacement'
import {
  formatRuDate,
  formatRunsCount,
  formatShortLocation,
} from './historyFormatters'
import type { ProfileHeaderRank } from './DogProfileHeader'
import { breedToSlug } from '../../lib/breedMapping'

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
  title?: string | null
  date_start?: string | null
  location?: string | null
  placement?: number | string | null
  best_speed?: number | string | null
  speed?: number | string | null
  distance?: number | string | null
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

export function RacingColumn({
  hasRacingData,
  hasRacingMedals,
  racing,
  racingEvents,
  visibleRacingEvents,
  eventResultsUrls,
  bestSpeedEventId,
  avgSpeedEventId: _avgSpeedEventId,
  showAllRacingEvents,
  onToggleShowAll,
  rank,
  breed,
}: RacingColumnProps) {
  if (!hasRacingData && racingEvents.length === 0) return null

  const dogBreed = breed || ''
  const rankingUrl = `/competitions/ranking/2026/${dogBreed ? `?breed=${encodeURIComponent(breedToSlug(dogBreed))}` : ''}`
  const bestSpeedUrl = bestSpeedEventId
    ? procoursingUrlForEventId(eventResultsUrls, bestSpeedEventId)
    : null

  const startsCount = racingEvents.length
  const has2026 = rank?.yearBreedRank != null && rank.yearBreedRank > 0
  const hasHistory = rank?.breedRank != null && rank.breedRank > 0

  return (
    <DisciplineColumnShell>
      {hasRacingData && (
        <DisciplineStatsCard
          theme={THEME}
          title="Рейсинг"
          rankingUrl={rankingUrl}
        >
          <div className="flex flex-1 flex-col divide-y divide-old-money-100">
            {/* Верх: Подиум (Рейтинг + Медали) */}
            <Link
              to={rankingUrl}
              className="group flex items-center justify-between gap-2 bg-warm-blue-50/60 px-3.5 py-2 transition-colors hover:bg-warm-blue-100/70"
              title="Открыть рейтинг породы по бегам"
            >
              <div className="min-w-0 flex-1 leading-tight">
                <span className="text-sm font-bold text-warm-blue-950 block truncate">
                  {has2026
                    ? `#${rank.yearBreedRank} в 2026`
                    : hasHistory
                      ? `№${rank.breedRank} за всё время`
                      : 'Бега'}
                </span>
                <span className="text-[11px] text-warm-blue-700/90 block truncate">
                  {has2026 && hasHistory
                    ? `№${rank?.breedRank} за всё время`
                    : hasHistory
                      ? 'исторический зачёт'
                      : has2026
                        ? 'сезонный зачёт'
                        : 'беговой рейтинг'}
                </span>
              </div>

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
                  <span className="inline-flex items-center gap-1 rounded-md border border-warm-blue-200 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-charcoal-700">
                    <Medal className="h-3 w-3 text-warm-blue-600 shrink-0" />
                    <span>Участник</span>
                  </span>
                ) : null}
              </div>
            </Link>

            {/* Центр: Главный рекорд скорости (нативная ссылка в протокол без лишней подписи) */}
            {bestSpeedEventId ? (
              <ProcoursingEventLink
                eventId={bestSpeedEventId}
                procoursingUrl={bestSpeedUrl}
                className="group flex flex-1 flex-col items-center justify-center bg-white px-3.5 py-3 text-center transition-colors hover:bg-warm-blue-50/50"
                title="Открыть протокол лучшего забега"
              >
                <span className="text-[11px] font-medium text-charcoal-500">
                  Лучшая скорость
                </span>
                <div className="mt-0.5 flex items-baseline gap-1 text-3xl font-bold tabular-nums tracking-tight text-warm-blue-900">
                  <span>{formatScore(racing.best_speed)}</span>
                  <span className="text-sm font-normal text-charcoal-500">км/ч</span>
                </div>
              </ProcoursingEventLink>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center bg-white px-3.5 py-3 text-center">
                <span className="text-[11px] font-medium text-charcoal-500">
                  Лучшая скорость
                </span>
                <div className="mt-0.5 flex items-baseline gap-1 text-3xl font-bold tabular-nums tracking-tight text-warm-blue-900">
                  <span>{formatScore(racing.best_speed)}</span>
                  <span className="text-sm font-normal text-charcoal-500">км/ч</span>
                </div>
              </div>
            )}

            {/* Низ: Единая двойная строка агрегатных показателей */}
            <div className="grid grid-cols-2 divide-x divide-old-money-100 bg-cream-50/50 text-center text-xs shrink-0">
              <div className="px-2 py-2">
                <div className="text-[11px] font-medium text-charcoal-500">Средняя скорость</div>
                <div className="mt-0.5 font-bold tabular-nums text-charcoal-800 text-sm">
                  {formatScore(racing.avg_speed)} км/ч
                </div>
              </div>

              <div className="px-2 py-2">
                <div className="text-[11px] font-medium text-charcoal-500">Забеги</div>
                <div className="mt-0.5 font-bold tabular-nums text-charcoal-800 text-sm">
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
                'block border-b border-warm-blue-200/70 py-1.5 transition-colors last:border-b-0 hover:bg-warm-blue-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camel-500'
              const headline = (event.competition_kind || event.title || '').trim()
              const shortLoc = formatShortLocation(event.location)
              const rawSpeed = event.best_speed ?? event.speed
              const hasSpeed =
                rawSpeed != null &&
                Number.isFinite(Number(rawSpeed)) &&
                Number(rawSpeed) > 0
              const rowTooltip = [event.title || headline, event.location]
                .filter(Boolean)
                .join(' · ')
              const cardBody = (
                <DisciplineHistoryRow
                  title={headline || 'Забег'}
                  subtitle={shortLoc}
                  titleClassName="text-xs font-semibold text-warm-blue-800"
                  metric={
                    hasSpeed ? (
                      <span className="font-mono text-xs font-semibold tabular-nums text-warm-blue-800">
                        {formatScore(rawSpeed)}
                        <span className="text-[10px] font-normal text-charcoal-500"> км/ч</span>
                      </span>
                    ) : null
                  }
                  badgeSlot={<HistoryPlacement placement={event.placement} status={event.status} statusReason={event.status_reason} size="xs" />}
                  date={formatRuDate(event.date_start)}
                  metaSuffix={event.distance ? `${event.distance} м` : null}
                  chips={<EventQualificationChips qualification={event.qualification as string | null | undefined} inline />}
                />
              )
              return event.event_id ? (
                <ProcoursingEventLink
                  key={idx}
                  eventId={event.event_id}
                  procoursingUrl={procoursingUrlForEventId(eventResultsUrls, event.event_id)}
                  className={`${cardClass} text-inherit no-underline`}
                  title={rowTooltip || undefined}
                >
                  {cardBody}
                </ProcoursingEventLink>
              ) : (
                <div key={idx} className={cardClass} title={rowTooltip || undefined}>
                  {cardBody}
                </div>
              )
            })}
          </div>

          {racingEvents.length > 3 && (
            <HistoryExpandToggle
              expanded={showAllRacingEvents}
              onToggle={onToggleShowAll}
              expandLabel={`Показать все ${racingEvents.length} забегов`}
            />
          )}
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
