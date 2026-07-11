import { Link } from 'react-router-dom'
import StatCounter from './StatCounter'
import { Icons } from '../lib/icons'

export interface HeroStats {
  events: number
  results: number
  dogs: number
  judges: number
  breeds: number
  donino_records: number
}

const STAT_PARTS = [
  { key: 'events', label: 'соревнований' },
  { key: 'results', label: 'результатов' },
  { key: 'dogs', label: 'собак' },
  { key: 'judges', label: 'судей' },
  { key: 'breeds', label: 'пород' },
  { key: 'donino_records', label: 'рекордов Донино' },
] as const satisfies ReadonlyArray<{ key: keyof HeroStats; label: string }>

export default function HeroIntro() {
  return (
    <div className="hero-intro">
      <div className="eyebrow" data-rise>
        <span>2015 — 2026</span>
        <span className="eyebrow-sep" aria-hidden>
          ·
        </span>
        <span>курсинг · БЗМП · бега борзых</span>
      </div>

      <h1 data-rise>
        Статистика курсинга и <em>бегов борзых</em>
      </h1>

      <p className="lead" data-rise>
        Агрегированная статистика по собакам и судьям на основе протоколов соревнований.
      </p>

      <div className="cta-row" data-rise>
        <Link to="/competitions?tab=ranking" className="btn btn-primary">
          <Icons.medal className="h-4 w-4" strokeWidth={1.75} />
          Статистика
        </Link>
        <Link to="/speed-records" className="btn btn-ghost">
          <Icons.speed className="h-4 w-4" strokeWidth={1.75} />
          Рекорды Донино
        </Link>
      </div>
    </div>
  )
}

interface HeroStatsBarProps {
  stats: HeroStats | null
  loading?: boolean
}

export function HeroStatsBar({ stats, loading = false }: HeroStatsBarProps) {
  if (loading) {
    return (
      <div className="hero-stats-bar hero-stats-bar--skeleton animate-pulse" aria-hidden data-rise>
        {STAT_PARTS.map(({ key }) => (
          <div key={key} className="hero-stat">
            <div className="hero-stat-num">
              <span className="inline-block h-5 w-12 rounded bg-old-money-200 dark:bg-charcoal-600" />
            </div>
            <div className="hero-stat-lbl">
              <span className="inline-block h-3 w-16 rounded bg-old-money-100 dark:bg-charcoal-700" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="hero-stats-bar" data-rise aria-label="Масштаб базы данных">
      {STAT_PARTS.map(({ key, label }) => (
        <div key={key} className="hero-stat">
          <div className="hero-stat-num">
            <StatCounter value={stats[key]} />
          </div>
          <div className="hero-stat-lbl">{label}</div>
        </div>
      ))}
    </div>
  )
}
