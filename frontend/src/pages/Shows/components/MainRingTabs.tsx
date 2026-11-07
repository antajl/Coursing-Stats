import { useState } from 'react'
import {
  displayShowAwardToken,
  matchShowAwardToken,
  SHOW_AWARD_WEIGHTS,
} from '../../../../../backend/lib/show-award-ranking'
import { ShowGradeChip, SHOW_AWARD_CHIP_CLASS } from '../../../lib/ShowGradeChip'
import { HoverTooltip } from '../../../components/ui/HoverTooltip'
import { awardTooltipForToken, awardTooltipList } from '../../../lib/awardTooltip'
import { splitShowTitleTokens } from '../showExhibitionUtils'
import { groupMainRing } from '../ShowExhibitionDetail/exhibitionDetailUtils'
import type { MainRingRow } from '../ShowExhibitionDetail/types'

function TitleChips({ title }: { title: string }) {
  const [offset, setOffset] = useState(0)

  const tokens = splitShowTitleTokens(title)
  if (tokens.length === 0) return null

  const ranked = [...tokens].sort((a, b) => {
    const ka = matchShowAwardToken(a)
    const kb = matchShowAwardToken(b)
    const wa = ka ? SHOW_AWARD_WEIGHTS[ka] : 0
    const wb = kb ? SHOW_AWARD_WEIGHTS[kb] : 0
    return wb - wa
  })

  const scrollToEnd = () => {
    const track = document.getElementById(`title-chips-track-${title}`)
    const viewport = document.getElementById(`title-chips-viewport-${title}`)
    if (!track || !viewport) return
    setOffset(Math.max(0, track.scrollWidth - viewport.clientWidth))
  }

  const scrollHome = () => setOffset(0)

  const chips = (
    <div
      id={`title-chips-track-${title}`}
      className="flex w-max flex-nowrap items-center gap-1 transition-transform duration-700 ease-out"
      style={{ transform: `translateX(-${offset}px)` }}
    >
      {ranked.map((token, i) => (
        <span key={`${token}-${i}`} className={SHOW_AWARD_CHIP_CLASS}>
          {displayShowAwardToken(token)}
        </span>
      ))}
    </div>
  )

  if (ranked.length === 1) {
    return (
      <HoverTooltip
        label={awardTooltipForToken(ranked[0]!)}
        placement="top"
        variant="site"
        delayMs={0}
        portal
      >
        <span className="inline-flex" tabIndex={0}>
          {chips}
        </span>
      </HoverTooltip>
    )
  }

  return (
    <HoverTooltip
      label={awardTooltipList(ranked.map((token) => ({ token })))}
      placement="top"
      variant="site"
      delayMs={120}
      portal
      className="block w-full min-w-0 max-w-full"
    >
      <div
        id={`title-chips-viewport-${title}`}
        className="relative w-full min-w-0 overflow-hidden"
        tabIndex={0}
        onMouseEnter={scrollToEnd}
        onMouseLeave={scrollHome}
        onFocus={scrollToEnd}
        onBlur={scrollHome}
      >
        {chips}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent"
          aria-hidden
        />
      </div>
    </HoverTooltip>
  )
}

interface MainRingTabsProps {
  rows: MainRingRow[]
}

export function MainRingTabs({ rows }: MainRingTabsProps) {
  const tabs = groupMainRing(rows)
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || null)

  if (tabs.length === 0) return null

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0]
  if (!currentTab) return null

  return (
    <div className="space-y-4">
      {/* Tab Selector */}
      <div className="flex gap-2 border-b border-old-money-200 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-camel-500 text-charcoal-900 shadow-sm'
                  : 'bg-old-money-100 text-charcoal-600 hover:bg-old-money-200/80 hover:text-charcoal-800'
              }`}
            >
              {tab.shortLabel}
            </button>
          )
        })}
      </div>

      {/* Tab Content: Title and Table */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-charcoal-800">
          {currentTab.label}
        </h4>

        <div className="overflow-x-auto rounded-lg border border-old-money-200">
          <table className="w-full text-left text-xs text-charcoal-700">
            <thead className="bg-old-money-100 text-charcoal-900 border-b border-old-money-200">
              <tr>
                <th className="py-2 px-3 font-semibold text-center w-12">Место</th>
                <th className="py-2 px-3 font-semibold w-16">Каталог</th>
                <th className="py-2 px-3 font-semibold">Кличка собаки</th>
                <th className="py-2 px-3 font-semibold">Порода</th>
                <th className="py-2 px-3 font-semibold">Награды</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-old-money-100 bg-white">
              {currentTab.rows.map((row) => (
                <tr
                  key={`${row.catalog_number}-${row.place}-${row.dog_name}`}
                  className="hover:bg-old-money-50/50 transition-colors"
                >
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                        row.place === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : row.place === 2
                            ? 'bg-slate-100 text-slate-700 border border-slate-300'
                            : row.place === 3
                              ? 'bg-orange-100 text-orange-800 border border-orange-300'
                              : 'text-charcoal-600'
                      }`}
                    >
                      {row.place}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-charcoal-500">
                    №{row.catalog_number}
                  </td>
                  <td className="py-2 px-3 font-medium text-charcoal-900">
                    {row.dog_name}
                  </td>
                  <td className="py-2 px-3 text-charcoal-600">
                    {row.breed}
                  </td>
                  <td className="py-2 px-3">
                    <TitleChips title={row.competition_label} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
