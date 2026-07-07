import { useRef } from 'react'
import { Link } from 'react-router-dom'
import StatCounter from './StatCounter'
import type { HeroStats } from './Hero'
import { useGsapRiseIn } from '../hooks/useGsapRiseIn'

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
  const scope = useRef<HTMLDivElement>(null)

  useGsapRiseIn({
    scope,
    selector: '[data-rise]',
    enabled: !loading,
    delay: 0.3,
    stagger: 0.065,
    dependencies: [loading],
  })

  return (
    <div className="stats-strip-wrap" ref={scope}>
      {loading ? (
        <div className="stats-strip" aria-hidden>
          {ITEMS.map((item) => (
            <div key={item.key} className="stat-chip animate-pulse">
              <div className="mx-auto h-7 w-16 rounded bg-old-money-200 dark:bg-charcoal-600" />
              <div className="mx-auto mt-2 h-3 w-20 rounded bg-old-money-100 dark:bg-charcoal-700" />
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-strip">
          {ITEMS.map(({ key, label, href }) => (
            <Link key={key} to={href} className="stat-chip stat-chip-link" data-rise>
              <div className="stat-chip-num">
                <StatCounter value={stats?.[key] ?? 0} />
              </div>
              <div className="stat-chip-lbl">{label}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
