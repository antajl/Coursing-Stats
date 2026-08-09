import { Link } from 'react-router-dom'
import type { BreedSummaryItem } from './accountFavorites'

type BreedSummaryProps = {
  items: BreedSummaryItem[]
}

export function BreedSummary({ items }: BreedSummaryProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-charcoal-500 dark:text-charcoal-400 mb-3">
        Породы в избранном
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 8).map((item) => (
          <Link
            key={item.breed}
            to={`/competitions?breed=${encodeURIComponent(item.breed)}`}
            className="inline-flex items-center gap-2 rounded-full border border-charcoal-200 dark:border-charcoal-600 bg-white/70 dark:bg-charcoal-800/70 px-3 py-1.5 text-sm text-charcoal-800 dark:text-cream-100 hover:border-camel-500 hover:text-camel-800 dark:hover:text-camel-300 transition-colors"
          >
            <span>{item.breedDisplay}</span>
            {item.count > 1 && (
              <span className="tabular-nums text-charcoal-500 dark:text-charcoal-400">{item.count}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
