import { Link } from 'react-router-dom'
import StatCounter from './StatCounter'
import type { HeroStats } from './Hero'

interface StatsStripProps {
  stats: HeroStats | null
  loading?: boolean
}

const ITEMS = [
  { key: 'events', label: 'событий', href: '/competitions?tab=calendar' },
  { key: 'dogs', label: 'собак в базе', href: '/competitions?tab=ranking' },
  { key: 'results', label: 'результатов', href: '/competitions?tab=ranking' },
  { key: 'breeds', label: 'пород', href: '/guide' },
] as const

export default function StatsStrip({ stats, loading = false }: StatsStripProps) {
  return (
    <div className="stats-strip-wrap">
      <div className="stats-strip">
        {ITEMS.map(({ key, label, href }) => (
          <Link key={key} to={href} className="stat-chip stat-chip-link">
            <div className="stat-chip-num">
              {loading ? '—' : <StatCounter value={stats?.[key] ?? 0} />}
            </div>
            <div className="stat-chip-lbl">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
