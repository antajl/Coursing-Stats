import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Crown, ArrowRight, Award } from 'lucide-react'
import {
  parseShowTitles,
  presentShowAwards,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_LABELS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import { sortShowHistory } from '../../../../backend/lib/show-dates'
import { ShowGradeChip } from '../../lib/ShowGradeChip'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import HoverTooltip from '../../components/ui/HoverTooltip'
import { localExhibitionPath } from '../../lib/env'
import { HISTORY_DEFAULT } from './dogProfileStats'
import {
  DisciplineColumnShell,
  DisciplineHistoryCard,
  DisciplineStatsCard,
  disciplineTheme,
} from './DisciplineColumnShell'
import { DisciplineHistoryRow } from './DisciplineHistoryRow'
import { HistoryPlacement } from './HistoryPlacement'
import { formatCompactShowTitle, formatShowDate } from './historyFormatters'
import { breedToSlug } from '../../lib/breedMapping'
import type { ProfileHeaderRank } from './DogProfileHeader'
import {
  formatShowsCount,
  resolveBestAwardExhibitionId,
  resolveBestGradeLabel,
  type ShowHistoryEntry,
} from './showsColumnUtils'

export type { ShowHistoryEntry }

type ShowsColumnProps = {
  dog: ShowDogCardData & { history?: ShowHistoryEntry[] }
  rank?: ProfileHeaderRank
  breed?: string
  showAll?: boolean
  onToggleShowAll?: () => void
}

const THEME = 'camel' as const

export function ShowsColumn({
  dog,
  rank,
  breed,
  showAll: controlledShowAll,
  onToggleShowAll,
}: ShowsColumnProps) {
  disciplineTheme(THEME)
  const [localShowAll, setLocalShowAll] = useState(false)
  const showAll = controlledShowAll ?? localShowAll
  const handleToggleShowAll = onToggleShowAll ?? (() => setLocalShowAll((v) => !v))
  const bestKey = (dog.best_award as ShowAwardKey | null) ?? null
  const bestLabel = bestKey ? SHOW_AWARD_LABELS[bestKey] : null
  const bestBadge = bestKey ? SHOW_AWARD_BADGE[bestKey] : null
  const history = useMemo(() => {
    const raw = Array.isArray(dog.history) ? dog.history : []
    return sortShowHistory([...raw])
  }, [dog.history])
  const visible = showAll ? history : history.slice(0, HISTORY_DEFAULT)
  const bestGrade = useMemo(() => resolveBestGradeLabel(dog), [dog.best_grade, history])
  const totalShows = history.length
  const bestExhibitionId = useMemo(
    () => resolveBestAwardExhibitionId(history, bestKey, bestBadge),
    [history, bestKey, bestBadge],
  )

  const dogBreed = breed || dog.breed || ''
  const rankingUrl = `/shows/ranking/2026/${dogBreed ? `?breed=${encodeURIComponent(breedToSlug(dogBreed))}` : ''}`

  const has2026 = rank?.yearBreedRank != null && rank.yearBreedRank > 0
  const allTimeRank = (rank?.breedRank != null && rank.breedRank > 0)
    ? rank.breedRank
    : (dog.breed_rank != null && dog.breed_rank > 0)
      ? dog.breed_rank
      : null
  const hasHistory = allTimeRank != null

  return (
    <DisciplineColumnShell>
      <DisciplineStatsCard
        theme={THEME}
        title="Выставки"
        rankingUrl={rankingUrl}
      >
        <div className="flex h-full flex-col justify-between gap-3">
          {/* Верх: Подиум со статусом в породе и числом выставок */}
          <Link
            to={rankingUrl}
            className="group block rounded-xl border border-camel-200/90 bg-camel-50/80 p-3 transition-colors hover:bg-camel-100/80"
            title="Открыть рейтинг выставок РКФ"
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              {/* Слева: Место в породе + общий зачёт */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-camel-700 text-white shadow-2xs">
                  <Crown className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-sm font-bold text-camel-950 xl:text-base truncate block">
                      {has2026
                        ? `#${rank.yearBreedRank} в 2026`
                        : hasHistory
                          ? `№${allTimeRank} за всё время`
                          : 'Выставки'}
                    </span>
                  </div>
                  <div className="text-[11px] text-camel-800 leading-tight mt-0.5 truncate">
                    {has2026 && hasHistory ? (
                      `№${allTimeRank} за всё время`
                    ) : hasHistory ? (
                      'исторический зачёт'
                    ) : has2026 ? (
                      'сезонный зачёт'
                    ) : (
                      'выставки РКФ'
                    )}
                  </div>
                </div>
              </div>

              {/* Справа: Лучшая награда или статус */}
              <div className="shrink-0 flex items-center leading-tight">
                {bestBadge ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-camel-200 bg-white/90 px-2 py-0.5 text-xs font-bold text-camel-950"
                    title={bestGrade ? `${bestBadge} · оценка: ${bestGrade}` : bestBadge}
                  >
                    <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />
                    <span>{bestBadge}</span>
                  </span>
                ) : bestGrade ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-camel-200 bg-white/90 px-2 py-0.5 text-xs font-bold text-camel-950"
                    title={`Оценка: ${bestGrade}`}
                  >
                    <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />
                    <span>{bestGrade}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-camel-200 bg-white/90 px-2 py-0.5 text-xs font-semibold text-camel-800">
                    <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />
                    <span>Участник</span>
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Центр: Высшая награда */}
          {bestExhibitionId ? (
            <Link
              to={`${localExhibitionPath}/${bestExhibitionId}`}
              className="group flex flex-1 flex-col items-center justify-center rounded-xl border border-camel-200/90 bg-white p-3 text-center transition-colors hover:bg-camel-50/50"
              title="Посмотреть протокол выставки"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
                Высшая награда
              </span>
              <div className="text-2xl font-bold text-camel-950 sm:text-3xl truncate max-w-full">
                {bestBadge && bestLabel ? (
                  <HoverTooltip label={bestLabel} placement="top" delayMs={0} portal>
                    <span tabIndex={0} className="cursor-help">{bestBadge}</span>
                  </HoverTooltip>
                ) : (
                  bestBadge || bestLabel || 'Участник рингов'
                )}
              </div>
              <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-camel-800 group-hover:underline">
                <span>Протокол выставки</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
              </span>
            </Link>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-camel-200/90 bg-white p-3 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
                Высшая награда
              </span>
              <div className="text-2xl font-bold text-camel-950 sm:text-3xl truncate max-w-full">
                {bestBadge && bestLabel ? (
                  <HoverTooltip label={bestLabel} placement="top" delayMs={0} portal>
                    <span tabIndex={0} className="cursor-help">{bestBadge}</span>
                  </HoverTooltip>
                ) : (
                  bestBadge || bestLabel || 'Участник рингов'
                )}
              </div>
              {bestGrade && (
                <span className="mt-1 text-[11px] font-medium text-charcoal-600">
                  Оценка: <strong className="text-camel-800 font-semibold">{bestGrade}</strong>
                </span>
              )}
            </div>
          )}

          {/* Низ: 2 карточки показателей */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs shrink-0">
            <div className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2">
              <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Оценка в ринге</div>
              <div className="flex justify-center pt-0.5">
                <ShowGradeChip grade={bestGrade} size="sm" />
              </div>
            </div>

            <div className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2">
              <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Выставки</div>
              <div className="font-bold tabular-nums text-charcoal-800 text-sm sm:text-base">
                {formatShowsCount(totalShows)}
              </div>
            </div>
          </div>
        </div>
      </DisciplineStatsCard>

      {history.length > 0 && (
        <DisciplineHistoryCard theme={THEME} participations={history.length}>
          <div className="flex-1">
            {visible.map((entry, idx) => {
              const entryTitles = presentShowAwards(parseShowTitles(entry.title || ''))
              const rowKey = `${entry.exhibition_id}-${idx}`
              const rowClass =
                'block border-b border-camel-200/70 py-1.5 text-inherit no-underline transition-colors last:border-b-0 hover:bg-camel-50/60'
              const compactTitle = formatCompactShowTitle(entry.exhibition_title)
              const rowBody = (
                <DisciplineHistoryRow
                  title={compactTitle}
                  titleClassName="text-xs font-semibold text-camel-900"
                  metric={entry.grade ? <ShowGradeChip grade={entry.grade} size="sm" /> : null}
                  badgeSlot={
                    entry.placement > 0 ? (
                      <HistoryPlacement placement={entry.placement} size="xs" />
                    ) : undefined
                  }
                  date={formatShowDate(entry.date)}
                  chips={
                    entryTitles.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {entryTitles.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className="inline-block rounded-md border border-camel-200 bg-camel-50/90 px-1.5 py-0 text-[10px] font-semibold leading-4 text-camel-800"
                          >
                            {SHOW_AWARD_BADGE[t] || t}
                          </span>
                        ))}
                      </div>
                    ) : null
                  }
                />
              )

              return entry.exhibition_id ? (
                <Link
                  key={rowKey}
                  to={`${localExhibitionPath}/${entry.exhibition_id}`}
                  className={rowClass}
                  title={entry.exhibition_title || 'Выставка РКФ'}
                >
                  {rowBody}
                </Link>
              ) : (
                <div key={rowKey} className={rowClass} title={entry.exhibition_title || 'Выставка РКФ'}>
                  {rowBody}
                </div>
              )
            })}
          </div>

          {history.length > 3 && (
            <div className="mt-auto pt-2 text-center shrink-0 flex items-center justify-center">
              <button
                type="button"
                onClick={handleToggleShowAll}
                className="text-xs font-semibold text-camel-700 transition-colors hover:text-camel-900 hover:underline"
              >
                {showAll ? 'Свернуть историю' : `Показать все ${history.length} выставок`}
              </button>
            </div>
          )}
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
