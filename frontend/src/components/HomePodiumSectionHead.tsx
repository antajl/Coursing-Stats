import { Icons } from '../lib/icons'
import HomePodiumTabsRail from './HomePodiumTabsRail'
import type { HomeRankingTab } from './HomeRankingTabs'

interface HomePodiumSectionHeadProps {
  title: string
  value: HomeRankingTab
  onChange: (tab: HomeRankingTab) => void
}

export default function HomePodiumSectionHead({ title, value, onChange }: HomePodiumSectionHeadProps) {
  return (
    <div className="home-section-head home-section-head--podium" data-rise>
      <div className="home-podium-head-row">
        <div className="home-podium-head-title">
          <Icons.medal className="h-5 w-5 shrink-0 text-camel-500" strokeWidth={1.75} />
          <h2>{title}</h2>
        </div>
        <HomePodiumTabsRail value={value} onChange={onChange} />
      </div>
    </div>
  )
}
