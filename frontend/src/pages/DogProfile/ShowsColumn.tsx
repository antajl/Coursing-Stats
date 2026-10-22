import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, ArrowRight, Award } from 'lucide-react'
import {
  parseShowTitles,
  presentShowAwards,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_LABELS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import { bestShowGradeLabel } from '../../../../backend/lib/show-grades'
import { ShowGradeChip } from '../../lib/ShowGradeChip'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import { maxShowAwardsForWidth } from '../Shows/ShowDogCard'
import { renderShowAwardChips } from '../../lib/awardChipRender'
import HoverTooltip from '../../components/ui/HoverTooltip'
import { localExhibitionPath } from '../../lib/env'
import { HISTORY_DEFAULT } from './dogProfileStats'
import {
  DisciplineColumnShell,
  DisciplineFooterRow,
  DisciplineHistoryCard,
  DisciplineStatsCard,
  disciplineTheme,
} from './DisciplineColumnShell'
import { HistoryMetaRow } from './HistoryPlacement'
import type { ProfileHeaderRank } from './DogProfileHeader'

export type ShowHistoryEntry = {
  date: string
  exhibition_id: number
  exhibition_title?: string
  placement: number
  title?: string
  grade?: string
}

type ShowsColumnProps = {
  dog: ShowDogCardData & { history?: ShowHistoryEntry[] }
  rank?: ProfileHeaderRank
  breed?: string
}

const THEME = 'camel' as const

function formatShowsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} выставок`
  if (mod10 === 1) return `${count} выставка`
  if (mod10 >= 2 && mod10 <= 4) return `${count} выставки`
  return `${count} выставок`
}

function resolveBestGradeLabel(dog: ShowsColumnProps['dog']): string | null {
  if (dog.best_grade?.trim()) return dog.best_grade.trim()
  const history = Array.isArray(dog.history) ? dog.history : []
  return bestShowGradeLabel(history.map((h) => h.grade))
}

function ProfileShowAwardsFooter({ titles }: { titles: ShowDogCardData['titles'] }) {
  const awards = presentShowAwards(titles)
  const rowRef = useRef<HTMLDivElement>(null)
  const [maxVisible, setMaxVisible] = useState(0)
  const awardKey = awards.join(',')

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row || awards.length === 0) {
      setMaxVisible(0)
      return
    }
    const update = () => {
      setMaxVisible(maxShowAwardsForWidth(row.clientWidth, titles, awards))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(row)
    return () => ro.disconnect()
  }, [awardKey, titles])

  if (awards.length === 0) return null

  return (
    <div
      ref={rowRef}
      className="mt-1.5 flex min-w-0 w-full flex-nowrap items-center gap-1 overflow-hidden"
    >
      {renderShowAwardChips({
        titles,
        size: 'sm',
        showCounts: false,
        maxVisible,
        nowrap: true,
      })}
    </div>
  )
}

export function ShowsColumn({ dog, rank, breed }: ShowsColumnProps) {
  const t = disciplineTheme(THEME)
  const [showAll, setShowAll] = useState(false)
  const bestKey = (dog.best_award as ShowAwardKey | null) ?? null
  const bestLabel = bestKey ? SHOW_AWARD_LABELS[bestKey] : null
  const bestBadge = bestKey ? SHOW_AWARD_BADGE[bestKey] : null
  const history = Array.isArray(dog.history) ? dog.history : []
  const visible = showAll ? history : history.slice(0, HISTORY_DEFAULT)
  const bestGrade = resolveBestGradeLabel(dog)
  const totalShows = history.length

  const dogBreed = breed || dog.breed || ''
  const rankingUrl = `/shows?tab=ranking${dogBreed ? `&breed=${encodeURIComponent(dogBreed)}` : ''}`

  const hasBreedRank = rank?.breedRank != null
  const hasOverallRank = rank?.rank != null

  const headerLink = (
    <Link
      to={rankingUrl}
      className="shrink-0 inline-flex items-center gap-1 rounded-full border border-camel-200/90 bg-camel-100/70 px-2.5 py-0.5 text-xs font-semibold text-camel-900 transition-colors hover:bg-camel-100 hover:border-camel-300"
      title="Открыть рейтинг выставок"
    >
      <span>Рейтинг</span>
      <ArrowRight className="h-3 w-3 text-camel-700 shrink-0" />
    </Link>
  )

  return (
    <DisciplineColumnShell>
      <DisciplineStatsCard theme={THEME} title="Выставки" rankBadge={headerLink}>
        <div className="flex h-full flex-col justify-between gap-3">
          {/* Верх: Подиум со статусом в породе и числом выставок */}
          <Link
            to={rankingUrl}
            className="group block rounded-xl border border-camel-200/90 bg-camel-50/80 p-3 transition-colors hover:bg-camel-100/80"
            title="Открыть рейтинг выставок РКФ"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-camel-700 text-white shadow-2xs">
                  <Crown className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5 leading-tight">
                    <span className="text-base font-bold text-camel-950 sm:text-lg">
                      {hasBreedRank ? `#${rank.breedRank} в породе` : 'Рейтинг выставок'}
                    </span>
                  </div>
                  <div className="text-[11px] text-camel-800 truncate">
                    {hasOverallRank ? `№${rank?.rank} среди всех пород` : 'Рейтинг РКФ'}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 rounded-full border border-camel-200 bg-white/90 px-2.5 py-1 text-xs font-semibold text-charcoal-700">
                  <Award className="h-3.5 w-3.5 text-camel-700" />
                  <span>{formatShowsCount(totalShows)}</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Центр: Высшая награда */}
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

          {/* Низ: 2 карточки показателей */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs shrink-0">
            <div className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2">
              <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Лучшая оценка</div>
              <div className="flex justify-center pt-0.5">
                <ShowGradeChip grade={bestGrade} size="sm" />
              </div>
            </div>

            <div className="rounded-lg border border-old-money-200 bg-cream-50/80 p-2">
              <div className="text-[10px] uppercase text-charcoal-500 mb-0.5">Ринги РКФ</div>
              <div className="font-bold tabular-nums text-charcoal-800 text-sm sm:text-base">
                {formatShowsCount(totalShows)}
              </div>
            </div>
          </div>
        </div>

        <ProfileShowAwardsFooter titles={dog.titles} />
      </DisciplineStatsCard>

      {history.length > 0 && (
        <DisciplineHistoryCard theme={THEME} participations={history.length}>
          <div>
            {visible.map((entry, idx) => {
              const entryTitles = parseShowTitles(entry.title || '')
              const rowKey = `${entry.exhibition_id}-${idx}`
              const rowClass =
                'block border-b border-camel-200/80 py-3 h-[6.5rem] text-inherit no-underline transition-colors last:border-b-0 hover:bg-camel-50/60'
              const rowBody = (
                <>
                  <div className="min-w-0 flex-shrink-0 break-words text-xs font-bold uppercase tracking-wide text-camel-700">
                    {entry.exhibition_title || 'Выставка РКФ'}
                  </div>
                  <HistoryMetaRow
                    date={
                      entry.date
                        ? (() => {
                            const [day, month, year] = entry.date.split('.')
                            return `${day}.${month}.${year}`
                          })()
                        : '—'
                    }
                    placement={entry.placement}
                    grade={entry.grade}
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    {entryTitles.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {entryTitles.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className="inline-block rounded-md border border-camel-200 bg-camel-50/90 px-1.5 py-0.5 text-[10px] font-semibold text-camel-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )

              return entry.exhibition_id ? (
                <Link
                  key={rowKey}
                  to={`${localExhibitionPath}/${entry.exhibition_id}`}
                  className={rowClass}
                >
                  {rowBody}
                </Link>
              ) : (
                <div key={rowKey} className={rowClass}>
                  {rowBody}
                </div>
              )
            })}
          </div>

          {history.length > 4 && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
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
