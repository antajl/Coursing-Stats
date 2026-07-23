import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { rkfExhibitionResultsUrl, rkfOnlineExhibitionUrl } from '../../lib/rkfLinks'
import { HISTORY_DEFAULT } from './dogProfileStats'
import {
  DisciplineColumnShell,
  DisciplineFooterRow,
  DisciplineHero,
  DisciplineHistoryCard,
  DisciplineStatsCard,
  disciplineTheme,
} from './DisciplineColumnShell'

export type ShowHistoryEntry = {
  date: string
  exhibition_id: number
  exhibition_title?: string
  placement: number
  title?: string
  grade?: string
  /** Original event page (rkf.online / LC). */
  url?: string
  /** Original PDF report when available. */
  reports_link?: string
}

type ShowsColumnProps = {
  dog: ShowDogCardData & { history?: ShowHistoryEntry[] }
}

const THEME = 'camel' as const

function resolveBestGradeLabel(dog: ShowsColumnProps['dog']): string | null {
  if (dog.best_grade?.trim()) return dog.best_grade.trim()
  const history = Array.isArray(dog.history) ? dog.history : []
  return bestShowGradeLabel(history.map((h) => h.grade))
}

function ProfileShowAwardsFooter({ titles }: { titles: ShowDogCardData['titles'] }) {
  const awards = presentShowAwards(titles)
  const rowRef = useRef<HTMLDivElement>(null)
  // 0 до measure — иначе чипы раздувают ширину и RO видит «бесконечный» budget
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

  if (awards.length === 0) {
    return (
      <span className="text-sm text-old-money-500 dark:text-old-money-400">Нет наград</span>
    )
  }

  return (
    <div
      ref={rowRef}
      className="flex min-w-0 w-full max-w-full flex-nowrap items-center justify-center gap-1 overflow-hidden"
    >
      {renderShowAwardChips({
        titles,
        size: 'sm',
        maxVisible,
        nowrap: true,
      })}
    </div>
  )
}

/** Награды одной выставки в истории — по ширине строки (без ×N). */
function HistoryShowAwardsRow({
  titles,
}: {
  titles: ReturnType<typeof parseShowTitles>
}) {
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
      setMaxVisible(
        maxShowAwardsForWidth(row.clientWidth, titles, awards, { showCounts: false }),
      )
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

/** Колонка выставок — тот же каркас, что Курсинг / Бега. */
export function ShowsColumn({ dog }: ShowsColumnProps) {
  const t = disciplineTheme(THEME)
  const [showAll, setShowAll] = useState(false)
  const bestKey = (dog.best_award as ShowAwardKey | null) ?? null
  const bestLabel = bestKey ? SHOW_AWARD_LABELS[bestKey] : null
  const bestBadge = bestKey ? SHOW_AWARD_BADGE[bestKey] : null
  const history = Array.isArray(dog.history) ? dog.history : []
  const visible = showAll ? history : history.slice(0, HISTORY_DEFAULT)
  const bestGrade = resolveBestGradeLabel(dog)

  const cellClass = `min-h-[5.5rem] min-w-0 rounded-xl border p-4 text-center ${t.cellBorder} ${t.cellBg}`

  return (
    <DisciplineColumnShell>
      <DisciplineStatsCard theme={THEME} title="Выставки">
        <DisciplineHero
          theme={THEME}
          label="Лучшая награда"
          value={
            bestBadge && bestLabel ? (
              <HoverTooltip label={bestLabel} placement="top" delayMs={0} portal>
                <span tabIndex={0}>{bestBadge}</span>
              </HoverTooltip>
            ) : (
              bestBadge || '—'
            )
          }
          footerAlwaysVisible
          footer={'\u00a0'}
        />

        <div className="mb-4 grid shrink-0 grid-cols-2 gap-3">
          <div className={cellClass}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Выставок
            </div>
            <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
              {dog.total_shows}
            </div>
          </div>
          <div className={cellClass}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Лучшая оценка
            </div>
            <div className="flex justify-center pt-1">
              <ShowGradeChip grade={bestGrade} size="md" />
            </div>
          </div>
        </div>

        <DisciplineFooterRow>
          <ProfileShowAwardsFooter titles={dog.titles} />
        </DisciplineFooterRow>
      </DisciplineStatsCard>

      {history.length > 0 && (
        <DisciplineHistoryCard theme={THEME}>
          <div>
            {visible.map((entry, idx) => {
              const entryTitles = parseShowTitles(entry.title || '')
              const rowKey = `${entry.exhibition_id}-${idx}`
              const rowClass =
                'block border-b border-camel-200/80 py-3 text-inherit no-underline transition-colors last:border-b-0 hover:bg-camel-50/60 dark:border-camel-700/60 dark:hover:bg-charcoal-700/40'
              const rowBody = (
                <>
                  <div className="min-w-0 break-words text-xs font-bold uppercase tracking-wide text-camel-700 dark:text-camel-400">
                    {entry.exhibition_title || 'Выставка'}
                  </div>
                  <HistoryShowAwardsRow titles={entryTitles} />
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <ShowGradeChip grade={entry.grade} />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">
                      {entry.date || '—'}
                    </div>
                    {entry.placement > 0 && (
                      <span className="shrink-0 text-base font-bold text-camel-700 dark:text-camel-400">
                        #{entry.placement}
                      </span>
                    )}
                  </div>
                </>
              )
              if (localExhibitionPath) {
                return (
                  <Link
                    key={rowKey}
                    to={`${localExhibitionPath}/${entry.exhibition_id}`}
                    className={rowClass}
                  >
                    {rowBody}
                  </Link>
                )
              }
              const externalUrl =
                entry.reports_link?.trim() ||
                entry.url?.trim() ||
                // RKF catalog ids are large; LC scraped shows use small ids (≤~1e4).
                (entry.exhibition_id >= 10_000
                  ? rkfOnlineExhibitionUrl(entry.exhibition_id)
                  : rkfExhibitionResultsUrl(entry.exhibition_id))
              if (externalUrl) {
                return (
                  <a
                    key={rowKey}
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClass}
                    title={
                      entry.reports_link
                        ? 'Оригинальный отчёт (PDF)'
                        : entry.exhibition_id >= 10_000
                          ? 'Страница мероприятия на rkf.online'
                          : 'Результаты на lc.rkfshow.ru'
                    }
                  >
                    {rowBody}
                  </a>
                )
              }
              return (
                <div key={rowKey} className={rowClass}>
                  {rowBody}
                </div>
              )
            })}
            {history.length > HISTORY_DEFAULT && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-sm font-semibold text-camel-700 dark:text-camel-400"
              >
                {showAll ? 'Свернуть' : `Показать все ${history.length} выставок`}
              </button>
            )}
          </div>
        </DisciplineHistoryCard>
      )}
    </DisciplineColumnShell>
  )
}
