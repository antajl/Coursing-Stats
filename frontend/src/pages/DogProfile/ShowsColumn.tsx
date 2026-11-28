import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
  HistoryExpandToggle,
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
        <div className="flex flex-1 flex-col divide-y divide-old-money-100">
          {/* Верх: Подиум со статусом в породе и главной наградой */}
          <Link
            to={rankingUrl}
            className="group flex items-center justify-between gap-2 bg-camel-100/60 px-3.5 py-2 transition-colors hover:bg-camel-100"
            title="Открыть рейтинг выставок РКФ"
          >
            <div className="min-w-0 flex-1 leading-tight">
              <span className="text-sm font-bold text-camel-950 block truncate">
                {has2026
                  ? `#${rank.yearBreedRank} в 2026`
                  : hasHistory
                    ? `№${allTimeRank} за всё время`
                    : 'Выставки'}
              </span>
              <span className="text-[11px] text-camel-800 block truncate">
                {has2026 && hasHistory
                  ? `№${allTimeRank} за всё время`
                  : hasHistory
                    ? 'исторический зачёт'
                    : has2026
                      ? 'сезонный зачёт'
                      : 'выставки РКФ'}
              </span>
            </div>

            <div className="shrink-0 flex items-center leading-tight">
              {bestBadge ? (
                <span
                  className="inline-flex items-center rounded-md border border-camel-200 bg-white/90 px-2 py-0.5 text-xs font-bold text-camel-950"
                  title={bestGrade ? `${bestBadge} · оценка: ${bestGrade}` : bestBadge}
                >
                  {bestBadge}
                </span>
              ) : bestGrade ? (
                <span
                  className="inline-flex items-center rounded-md border border-camel-200 bg-white/90 px-2 py-0.5 text-xs font-bold text-camel-950"
                  title={`Оценка: ${bestGrade}`}
                >
                  {bestGrade}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md border border-camel-200 bg-white/90 px-2 py-0.5 text-xs font-semibold text-camel-800">
                  Участник
                </span>
              )}
            </div>
          </Link>

          {/* Центр: Высшая награда (нативная ссылка на выставку без лишней подписи) */}
          {bestExhibitionId ? (
            <Link
              to={`${localExhibitionPath}/${bestExhibitionId}`}
              className="group flex flex-1 flex-col items-center justify-center bg-white px-3.5 py-3 text-center transition-colors hover:bg-camel-50/50"
              title="Открыть протокол выставки"
            >
              <span className="text-[11px] font-medium text-charcoal-500">
                Высшая награда
              </span>
              <div className="mt-0.5 text-3xl font-bold tracking-tight text-camel-950 truncate max-w-full">
                {bestBadge && bestLabel ? (
                  <HoverTooltip label={bestLabel} placement="top" delayMs={0} portal>
                    <span tabIndex={0} className="cursor-help">{bestBadge}</span>
                  </HoverTooltip>
                ) : (
                  bestBadge || bestLabel || 'Участник рингов'
                )}
              </div>
            </Link>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-white px-3.5 py-3 text-center">
              <span className="text-[11px] font-medium text-charcoal-500">
                Высшая награда
              </span>
              <div className="mt-0.5 text-3xl font-bold tracking-tight text-camel-950 truncate max-w-full">
                {bestBadge && bestLabel ? (
                  <HoverTooltip label={bestLabel} placement="top" delayMs={0} portal>
                    <span tabIndex={0} className="cursor-help">{bestBadge}</span>
                  </HoverTooltip>
                ) : (
                  bestBadge || bestLabel || 'Участник рингов'
                )}
              </div>
            </div>
          )}

          {/* Низ: Единая двойная строка показателей */}
          <div className="grid grid-cols-2 divide-x divide-old-money-100 bg-cream-50/50 text-center text-xs shrink-0">
            <div className="px-2 py-2">
              <div className="text-[11px] font-medium text-charcoal-500">Оценка в ринге</div>
              <div className="mt-0.5 flex justify-center">
                <ShowGradeChip grade={bestGrade} size="sm" />
              </div>
            </div>

            <div className="px-2 py-2">
              <div className="text-[11px] font-medium text-charcoal-500">Выставки</div>
              <div className="mt-0.5 font-bold tabular-nums text-charcoal-800 text-sm">
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
            <HistoryExpandToggle
              expanded={showAll}
              onToggle={handleToggleShowAll}
              expandLabel={`Показать все ${history.length} выставок`}
            />
          )}
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
