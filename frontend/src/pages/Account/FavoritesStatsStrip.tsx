import type { FavoritesAggregateStats } from './accountFavorites'

type FavoritesStatsStripProps = {
  stats: FavoritesAggregateStats
}

export function FavoritesStatsStrip({ stats }: FavoritesStatsStripProps) {
  if (stats.dogs === 0 || stats.starts === 0) return null

  const items = [
    { label: 'Участий', value: String(stats.starts) },
    { label: 'Побед', value: String(stats.gold) },
    { label: 'Серебра', value: String(stats.silver) },
    { label: 'Бронзы', value: String(stats.bronze) },
  ]

  return (
    <section className="mb-8" aria-label="Статистика избранных">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-charcoal-500 mb-3">
        Моя статистика
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-charcoal-200 bg-white/70 px-3 py-2.5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">
              {item.label}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-charcoal-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
