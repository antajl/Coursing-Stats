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

export interface HeroShowStats {
  exhibitions: number
  appearances: number
  dogs: number
  judges: number
  breeds: number
}

const COMPETITION_STAT_PARTS = [
  { key: 'events', label: 'соревнований' },
  { key: 'results', label: 'результатов' },
  { key: 'dogs', label: 'собак' },
  { key: 'judges', label: 'судей' },
  { key: 'breeds', label: 'пород' },
] as const satisfies ReadonlyArray<{ key: keyof Omit<HeroStats, 'donino_records'>; label: string }>

const SHOW_STAT_PARTS = [
  { key: 'exhibitions', label: 'выставок' },
  { key: 'appearances', label: 'результатов' },
  { key: 'dogs', label: 'собак' },
  { key: 'judges', label: 'судей' },
  { key: 'breeds', label: 'пород' },
] as const satisfies ReadonlyArray<{ key: keyof HeroShowStats; label: string }>

export default function HeroIntro() {
  return (
    <div className="hero-intro">
      <div className="eyebrow" data-rise>
        <span>2015 — 2026</span>
        <span className="eyebrow-sep" aria-hidden>
          ·
        </span>
        <span>курсинг · БЗМП · бега · выставки</span>
      </div>

      <h1 data-rise>
        Статистика курсинга, бегов и <em>выставок</em>
      </h1>

      <p className="lead" data-rise>
        Вся карьера вашей собаки — в одном месте. История выступлений, награды, рейтинги и статистика судей по
        курсингу, бегам и выставкам.
      </p>

      <div className="cta-row" data-rise>
        <Link to="/competitions?tab=ranking" className="btn btn-primary">
          <Icons.medal className="h-4 w-4" strokeWidth={1.75} />
          Соревнования
        </Link>
        <Link to="/speed-records" className="btn btn-ghost">
          <Icons.speed className="h-4 w-4" strokeWidth={1.75} />
          Курсинг Донино
        </Link>
      </div>
    </div>
  )
}

interface HeroStatsBarProps {
  stats: HeroStats | null
  showStats?: HeroShowStats | null
  loading?: boolean
}

function StatsRowSkeleton({ count }: { count: number }) {
  return (
    <div className="hero-stats-bar hero-stats-bar--skeleton animate-pulse" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="hero-stat">
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

export function HeroStatsBar({ stats, showStats = null, loading = false }: HeroStatsBarProps) {
  if (loading) {
    return (
      <div className="hero-stats" data-rise aria-hidden>
        <div className="hero-stats-group">
          <StatsRowSkeleton count={COMPETITION_STAT_PARTS.length} />
        </div>
        <div className="hero-stats-group">
          <StatsRowSkeleton count={SHOW_STAT_PARTS.length} />
        </div>
      </div>
    )
  }

  if (!stats && !showStats) return null

  return (
    <div className="hero-stats" data-rise aria-label="Масштаб базы данных">
      {stats ? (
        <div className="hero-stats-group">
          <div className="hero-stats-bar">
            {COMPETITION_STAT_PARTS.map(({ key, label }) => (
              <div key={key} className="hero-stat">
                <div className="hero-stat-num">
                  <StatCounter value={stats[key]} />
                </div>
                <div className="hero-stat-lbl">{label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showStats ? (
        <div className="hero-stats-group">
          <div className="hero-stats-bar">
            {SHOW_STAT_PARTS.map(({ key, label }) => (
              <div key={key} className="hero-stat">
                <div className="hero-stat-num">
                  <StatCounter value={showStats[key]} />
                </div>
                <div className="hero-stat-lbl">{label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
