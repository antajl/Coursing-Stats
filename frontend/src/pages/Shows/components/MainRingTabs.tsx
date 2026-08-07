import { useState } from 'react'
import {
  displayShowAwardToken,
  matchShowAwardToken,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_WEIGHTS,
} from '../../../../../backend/lib/show-award-ranking'
import { ShowGradeChip, SHOW_AWARD_CHIP_CLASS } from '../../../lib/ShowGradeChip'
import { HoverTooltip } from '../../../components/ui/HoverTooltip'
import { awardTooltipForToken, awardTooltipList } from '../../../lib/awardTooltip'
import { splitShowTitleTokens } from '../showExhibitionUtils'

interface MainRingRow {
  competition_key: string
  competition_label: string
  group: number | null
  place: number
  breed: string
  catalog_number: number
  dog_name: string
  pedigree?: string
  award_badge?: string
}

type MainRingTab = {
  id: string
  label: string
  shortLabel: string
  rows: MainRingRow[]
}

const MAIN_RING_KEY_ORDER: Record<string, number> = {
  BIS: 0,
  BIS_BABY: 1,
  BIS_PUPPY: 2,
  BIS_JUNIOR: 3,
  BIS_VETERAN: 4,
  BIG: 5,
  OTHER: 6,
}

function mainRingTabShortLabel(rows: MainRingRow[]): string {
  const sample = rows[0]
  if (!sample) return '—'
  const key = sample.competition_key
  if (key === 'BIG') {
    return sample.group != null ? `BIG ${sample.group}` : 'BIG'
  }
  const fromPlace1 = rows.find((r) => r.place === 1 && r.award_badge)?.award_badge
  if (fromPlace1) return fromPlace1
  if (key === 'BIS') return SHOW_AWARD_BADGE.BIS
  if (key === 'BIS_BABY') return SHOW_AWARD_BADGE.BIS_BABY
  if (key === 'BIS_PUPPY') return SHOW_AWARD_BADGE.BIS_PUPPY
  if (key === 'BIS_JUNIOR') return SHOW_AWARD_BADGE.BIS_JUNIOR
  if (key === 'BIS_VETERAN') return SHOW_AWARD_BADGE.BIS_VETERAN
  return sample.competition_label.slice(0, 24) || key
}

function groupMainRing(rows: MainRingRow[]): MainRingTab[] {
  const byId = new Map<string, MainRingRow[]>()
  for (const row of rows) {
    const id = `${row.competition_key}:${row.group ?? ''}:${row.competition_label || row.competition_key}`
    if (!byId.has(id)) byId.set(id, [])
    byId.get(id)!.push(row)
  }

  const tabs: MainRingTab[] = [...byId.entries()].map(([id, list]) => {
    const sorted = list.slice().sort((a, b) => a.place - b.place)
    return {
      id,
      label: sorted[0]?.competition_label || sorted[0]?.competition_key || id,
      shortLabel: mainRingTabShortLabel(sorted),
      rows: sorted,
    }
  })

  tabs.sort((a, b) => {
    const ka = a.rows[0]?.competition_key || 'OTHER'
    const kb = b.rows[0]?.competition_key || 'OTHER'
    const oa = MAIN_RING_KEY_ORDER[ka] ?? 9
    const ob = MAIN_RING_KEY_ORDER[kb] ?? 9
    if (oa !== ob) return oa - ob
    const ga = a.rows[0]?.group
    const gb = b.rows[0]?.group
    if (ga != null && gb != null && ga !== gb) return ga - gb
    return a.label.localeCompare(b.label, 'ru')
  })

  return tabs
}

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
          className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent dark:from-charcoal-800"
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

  const activeTabData = tabs.find((t) => t.id === activeTab) || tabs[0]

  return (
    <div className="main-ring-tabs">
      <div className="flex gap-2 border-b border-charcoal-200 dark:border-charcoal-700 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-camel-700 border-b-2 border-camel-700 dark:text-camel-400 dark:border-camel-400'
                : 'text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200'
            }`}
          >
            {tab.shortLabel}
          </button>
        ))}
      </div>

      <div className="main-ring-content">
        <h3 className="font-serif text-lg mb-3 text-charcoal-900 dark:text-charcoal-100">
          {activeTabData?.label}
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-200 dark:border-charcoal-700">
              <th className="text-left py-2 px-3 text-charcoal-500 dark:text-charcoal-400">Место</th>
              <th className="text-left py-2 px-3 text-charcoal-500 dark:text-charcoal-400">Порода</th>
              <th className="text-left py-2 px-3 text-charcoal-500 dark:text-charcoal-400">Собака</th>
              <th className="text-left py-2 px-3 text-charcoal-500 dark:text-charcoal-400">Награда</th>
            </tr>
          </thead>
          <tbody>
            {activeTabData?.rows.map((row, idx) => (
              <tr key={idx} className="border-b border-charcoal-100 dark:border-charcoal-800">
                <td className="py-2 px-3 font-mono">{row.place}</td>
                <td className="py-2 px-3">{row.breed}</td>
                <td className="py-2 px-3">{row.dog_name}</td>
                <td className="py-2 px-3">
                  {row.award_badge ? (
                    <ShowGradeChip token={row.award_badge} />
                  ) : (
                    <TitleChips title={row.competition_label} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
