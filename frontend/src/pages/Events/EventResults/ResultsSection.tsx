import ResultCard from './ResultCard'
import BreedGroupDivider from './components/BreedGroupDivider'
import { groupResultsByBreedClass } from './utils'
import type { Result } from './types'

interface ResultsSectionProps {
  results: Result[]
}

function breedCountLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} собака`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} собаки`
  return `${count} собак`
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-old-money-200 bg-cream-50 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/40 md:p-6">
        <div className="text-sm text-old-money-500 dark:text-old-money-400">Нет данных о результатах</div>
      </div>
    )
  }

  const { grouped, sortedGroups } = groupResultsByBreedClass(results)

  return (
    <div className="space-y-4">
      {sortedGroups.map(groupKey => {
        const groupResults = grouped[groupKey]

        return (
          <section
            key={groupKey}
            className="breed-section-card rounded-xl border border-old-money-200 bg-cream-50 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/40 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100">
                {groupKey}
              </h3>
              <span className="flex-shrink-0 pt-0.5 text-xs font-medium text-old-money-500 dark:text-old-money-400">
                {breedCountLabel(groupResults.length)}
              </span>
            </div>
            <BreedGroupDivider />
            <div className="space-y-2">
              {groupResults.map((result, idx) => (
                <ResultCard key={`${result.dog_id}-${idx}`} result={result} index={idx} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
