import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  presentShowAwards,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_LABELS,
  SHOW_AWARD_CATEGORY,
  matchShowAwardToken,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import { splitShowTitleTokens } from '../Shows/showExhibitionUtils'
import { titleBadgeClass } from '../../lib/qualificationTitles'
import { renderShowAwardChips } from '../../lib/awardChipRender'
import HoverTooltip from '../../components/ui/HoverTooltip'
import {
  classifyCompetitionTitle,
  classifyShowCumulativeTitle,
  groupItemsByCategory,
} from '../../lib/awardCategories'
import { HISTORY_DEFAULT } from './dogProfileStats'
import {
  DisciplineColumnShell,
  DisciplineFooterRow,
  DisciplineHero,
  DisciplineHistoryCard,
  DisciplineStatsCard,
  disciplineTheme,
} from './DisciplineColumnShell'

/** Сколько чипов влезает в одну строку футера карточки профиля. */
const PROFILE_AWARD_MAX_VISIBLE = 5

export type ShowHistoryEntry = {
  date: string
  exhibition_id: number
  exhibition_title?: string
  placement: number
  title?: string
}

type ShowsColumnProps = {
  dog: ShowDogCardData & { history?: ShowHistoryEntry[] }
}

const THEME = 'camel' as const

/** Колонка выставок — тот же каркас, что Курсинг / Бега. */
export function ShowsColumn({ dog }: ShowsColumnProps) {
  const t = disciplineTheme(THEME)
  const [showAll, setShowAll] = useState(false)
  const awardKeys = presentShowAwards(dog.titles)
  const bestKey = (dog.best_award as ShowAwardKey | null) ?? null
  const bestLabel = bestKey ? SHOW_AWARD_LABELS[bestKey] : null
  const bestBadge = bestKey ? SHOW_AWARD_BADGE[bestKey] : null
  const history = Array.isArray(dog.history) ? dog.history : []
  const visible = showAll ? history : history.slice(0, HISTORY_DEFAULT)

  const cellClass = `min-h-[5.5rem] rounded-xl border p-4 text-center ${t.cellBorder} ${t.cellBg}`

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
              Лучшее место
            </div>
            <div className="text-2xl font-bold tabular-nums text-charcoal-800 dark:text-charcoal-100">
              {dog.best_placement || '—'}
            </div>
          </div>
        </div>

        <DisciplineFooterRow>
          {awardKeys.length > 0 ? (
            <div className="flex w-full max-w-full flex-nowrap items-center justify-center gap-1 overflow-hidden">
              {renderShowAwardChips({
                titles: dog.titles,
                size: 'sm',
                maxVisible: PROFILE_AWARD_MAX_VISIBLE,
                nowrap: true,
              })}
            </div>
          ) : (
            <span className="text-sm text-old-money-500 dark:text-old-money-400">
              Рейтинг: {dog.rank_score ?? '—'}
            </span>
          )}
        </DisciplineFooterRow>
      </DisciplineStatsCard>

      {history.length > 0 && (
        <DisciplineHistoryCard theme={THEME}>
          <div>
            {visible.map((entry, idx) => {
              const tokens = splitShowTitleTokens(entry.title)
              return (
                <Link
                  key={`${entry.exhibition_id}-${idx}`}
                  to={`/shows/exhibition/${entry.exhibition_id}`}
                  className="block border-b border-camel-200/80 py-3 text-inherit no-underline transition-colors last:border-b-0 hover:bg-camel-50/60 dark:border-camel-700/60 dark:hover:bg-charcoal-700/40"
                >
                  <div className="min-w-0 break-words text-xs font-bold uppercase tracking-wide text-camel-700 dark:text-camel-400">
                    {entry.exhibition_title || 'Выставка'}
                  </div>
                  {tokens.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {groupItemsByCategory(tokens, (token) => {
                        const key = matchShowAwardToken(token)
                        if (key) return SHOW_AWARD_CATEGORY[key]
                        const cum = classifyShowCumulativeTitle(token)
                        if (cum) return cum
                        return classifyCompetitionTitle(token)
                      }).map((group, gi) => (
                        <span key={group.category} className="inline-flex flex-wrap items-center gap-1">
                          {gi > 0 ? (
                            <span
                              className="mx-0.5 h-3 w-px shrink-0 self-center bg-old-money-300 dark:bg-charcoal-500"
                              aria-hidden
                            />
                          ) : null}
                          {group.items.map((token, i) => (
                            <span
                              key={`${token}-${i}`}
                              className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${titleBadgeClass(token)}`}
                            >
                              {token}
                            </span>
                          ))}
                        </span>
                      ))}
                    </div>
                  ) : null}
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
                </Link>
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
