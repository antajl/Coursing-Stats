import { useState } from 'react'
import ResultCard from './ResultCard'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-old-money-200 bg-cream-50 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/40 md:p-6">
        <div className="text-sm text-old-money-500 dark:text-old-money-400">Нет данных о результатах</div>
      </div>
    )
  }

  const { grouped, sortedGroups } = groupResultsByBreedClass(results)

  const breeds = Array.from(new Set(results.map(r => r.dog.breed))).sort()

  const filteredResults = results.filter(result => {
    const matchesSearch = searchQuery === '' ||
      result.name_ru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.name_lat?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBreed = selectedBreed === '' || result.dog.breed === selectedBreed
    return matchesSearch && matchesBreed
  })

  const allBreedsCount = breeds.length

  const { grouped: filteredGrouped, sortedGroups: filteredSortedGroups } = groupResultsByBreedClass(filteredResults)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-camel-200 bg-white px-4 py-2.5 pl-10 text-sm transition-colors focus:border-camel-400 focus:ring-2 focus:ring-camel-100 dark:border-camel-800 dark:bg-charcoal-800 dark:text-charcoal-100 dark:focus:border-camel-600 dark:focus:ring-camel-900/30"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-old-money-400 dark:text-old-money-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="relative">
          <select
            value={selectedBreed}
            onChange={(e) => setSelectedBreed(e.target.value)}
            className="appearance-none rounded-lg border border-camel-200 bg-white px-4 py-2.5 pr-10 text-sm transition-colors focus:border-camel-400 focus:ring-2 focus:ring-camel-100 dark:border-camel-800 dark:bg-charcoal-800 dark:text-charcoal-100 dark:focus:border-camel-600 dark:focus:ring-camel-900/30 cursor-pointer"
          >
            <option value="">Все породы</option>
            {breeds.map(breed => (
              <option key={breed} value={breed}>{breed}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-old-money-400 dark:text-old-money-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {filteredSortedGroups.map(groupKey => {
        const groupResults = filteredGrouped[groupKey]

        return (
          <section key={groupKey}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100">
                {groupKey}
              </h3>
              <span className="flex-shrink-0 text-xs font-medium text-old-money-500 dark:text-old-money-400">
                {breedCountLabel(groupResults.length)}
              </span>
            </div>
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
