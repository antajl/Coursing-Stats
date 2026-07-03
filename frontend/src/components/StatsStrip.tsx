import StatCounter from './StatCounter'
import type { HeroStats } from './Hero'

interface StatsStripProps {
  stats: HeroStats | null
  loading?: boolean
}

export default function StatsStrip({ stats, loading = false }: StatsStripProps) {
  const items = [
    { value: stats?.events ?? 0, label: 'событий · 2023–2026' },
    { value: stats?.dogs ?? 0, label: 'собак в базе' },
    { value: stats?.results ?? 0, label: 'результатов' },
    { value: stats?.breeds ?? 0, label: 'пород' },
  ]

  return (
    <div className="stats-strip">
      {items.map(({ value, label }) => (
        <div key={label} className="stat-chip">
          <div className="stat-chip-num">
            {loading ? '—' : <StatCounter value={value} />}
          </div>
          <div className="stat-chip-lbl">{label}</div>
        </div>
      ))}
    </div>
  )
}
