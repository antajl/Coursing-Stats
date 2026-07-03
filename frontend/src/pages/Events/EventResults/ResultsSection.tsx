import ResultCard from './ResultCard'
import { groupResultsByBreedClass } from './utils'
import type { Result } from './types'

interface ResultsSectionProps {
  results: Result[]
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-2xl bg-old-money-50 dark:bg-charcoal-700 p-4 md:p-6">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-xl">Результаты</h2>
        <div className="text-sm text-old-money-500 dark:text-old-money-400">Нет данных о результатах</div>
      </div>
    )
  }

  const { grouped, sortedGroups } = groupResultsByBreedClass(results)

  return (
    <div className="rounded-2xl bg-old-money-50 dark:bg-charcoal-700 p-4 md:p-6">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-xl">Результаты</h2>

      <div className="space-y-6">
        {sortedGroups.map(groupKey => {
          const groupResults = grouped[groupKey]

          return (
            <div key={groupKey}>
              <h3 className="mb-3 border-b border-old-money-200 dark:border-charcoal-600 pb-2 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100">
                {groupKey}
              </h3>
              <div className="space-y-2">
                {groupResults.map((result, idx) => (
                  <ResultCard key={`${result.dog_id}-${idx}`} result={result} index={idx} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
