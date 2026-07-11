import HomeRankingTabs, { type HomeRankingTab } from './HomeRankingTabs'

interface HomePodiumTabsRailProps {
  value: HomeRankingTab
  onChange: (tab: HomeRankingTab) => void
}

export default function HomePodiumTabsRail({ value, onChange }: HomePodiumTabsRailProps) {
  return (
    <div className="home-podium-tabs-rail">
      <div className="home-podium-tabs-cell">
        <span className="home-podium-tab-line home-podium-tab-line--left" aria-hidden />
        <HomeRankingTabs value={value} onChange={onChange} />
        <span className="home-podium-tab-line home-podium-tab-line--right" aria-hidden />
      </div>
    </div>
  )
}
