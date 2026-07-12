export type HomeRankingTab = 'placement' | 'score' | 'speed'

const SEGMENTS: { id: HomeRankingTab; label: string }[] = [
  { id: 'score', label: 'Очки' },
  { id: 'placement', label: 'Медали' },
  { id: 'speed', label: 'Скорость' },
]

interface HomeRankingTabsProps {
  value: HomeRankingTab
  onChange: (tab: HomeRankingTab) => void
}

export default function HomeRankingTabs({ value, onChange }: HomeRankingTabsProps) {
  return (
    <div className="home-ranking-tabs" role="group" aria-label="Тип рейтинга">
      {SEGMENTS.map((segment) => {
        const active = value === segment.id
        return (
          <button
            key={segment.id}
            type="button"
            className={`home-ranking-tab${active ? ' home-ranking-tab--active' : ''}`}
            onClick={() => onChange(segment.id)}
            aria-pressed={active}
          >
            {segment.label}
          </button>
        )
      })}
    </div>
  )
}
