import { useState } from 'react'
import ResultCard from './ResultCard'
import { groupResultsByBreedClass, groupRacingResults, isRacingFormat, parseRawScores } from './utils'
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
      <div className="rounded-xl border border-old-money-200 bg-cream-50 p-4 md:p-6">
        <div className="text-sm text-old-money-500">Нет данных о результатах</div>
      </div>
    )
  }

  // Detect if this is a racing event
  const isRacing = results.some(r => {
    const rawScores = parseRawScores(r.raw_scores_json)
    return isRacingFormat(rawScores)
  })

  const { grouped, sortedGroups } = isRacing 
    ? groupRacingResults(results)
    : groupResultsByBreedClass(results)

  const breeds = Array.from(new Set(results.map(r => r.dog.breed))).sort()

  const filteredResults = results.filter(result => {
    const matchesSearch = searchQuery === '' ||
      result.name_ru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.name_lat?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBreed = selectedBreed === '' || result.dog.breed === selectedBreed
    return matchesSearch && matchesBreed
  })

  const allBreedsCount = breeds.length

  const { grouped: filteredGrouped, sortedGroups: filteredSortedGroups } = isRacing
    ? groupRacingResults(filteredResults)
    : groupResultsByBreedClass(filteredResults)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-camel-200 bg-white px-4 py-2.5 pl-10 text-sm transition-colors focus:border-camel-400 focus:ring-2 focus:ring-camel-100"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-old-money-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="relative">
          <select
            value={selectedBreed}
            onChange={(e) => setSelectedBreed(e.target.value)}
            className="appearance-none rounded-lg border border-camel-200 bg-white px-4 py-2.5 pr-10 text-sm transition-colors focus:border-camel-400 focus:ring-2 focus:ring-camel-100 cursor-pointer"
          >
            <option value="">Все породы</option>
            {breeds.map(breed => (
              <option key={breed} value={breed}>{breed}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-old-money-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {filteredSortedGroups.map(groupKey => {
        const groupResults = filteredGrouped[groupKey]

        // For racing, show sub-groups by breed and class
        if (isRacing && groupKey !== 'Неприбывшие участники') {
          // Group by breed first
          const breedGroups = groupResults.reduce<Record<string, Result[]>>((acc, r) => {
            const breed = r.dog?.breed || 'Другие'
            if (!acc[breed]) acc[breed] = []
            acc[breed].push(r)
            return acc
          }, {})

          const sortedBreeds = Object.keys(breedGroups).sort()

          return (
            <section key={groupKey} className="space-y-4 mb-6 overflow-hidden">
              <div className="flex items-center justify-between gap-3 bg-camel-100 pl-4 py-2 pr-3 rounded-lg border-t border-b border-r border-camel-200 rounded-tl-lg rounded-tr-lg">
                <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-camel-800">
                  {groupKey}
                </h3>
                <span className="flex-shrink-0 text-xs font-medium text-camel-600">
                  {breedCountLabel(groupResults.length)}
                </span>
              </div>
              <div className="pl-4 border-l-2 border-camel-300 space-y-4 -mt-0.5">
              
              {sortedBreeds.map(breed => {
                const breedResults = breedGroups[breed]
                // Sort by class (from breed_class: "Порода - Класс")
                const classOrder = ['стандарт', 'спринтер', 'юниор', 'ветеран']
                const sortedResults = breedResults.sort((a, b) => {
                  const breedClassA = a.breed_class || ''
                  const breedClassB = b.breed_class || ''
                  const partsA = breedClassA.split(' - ')
                  const partsB = breedClassB.split(' - ')
                  const classA = partsA.length >= 2 ? partsA[1] : breedClassA
                  const classB = partsB.length >= 2 ? partsB[1] : breedClassB
                  
                  const aIndex = classOrder.indexOf(classA.toLowerCase())
                  const bIndex = classOrder.indexOf(classB.toLowerCase())
                  
                  // Both in predefined order
                  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
                  // Only a in predefined order
                  if (aIndex !== -1) return -1
                  // Only b in predefined order
                  if (bIndex !== -1) return 1
                  // Neither in predefined order - alphabetical
                  return classA.localeCompare(classB)
                })

                return (
                  <div key={breed} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="min-w-0 flex-1 text-sm font-semibold text-charcoal-700">
                        {breed}
                      </h4>
                      <span className="flex-shrink-0 text-xs text-old-money-500">
                        {breedCountLabel(breedResults.length)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sortedResults.map((result, idx) => (
                        <ResultCard key={`${result.dog_id}-${idx}`} result={result} index={idx} />
                      ))}
                    </div>
                  </div>
                )
              })}
              </div>
            </section>
          )
        }

        // Standard grouping for non-racing or DNS
        return (
          <section key={groupKey} className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-camel-100 py-2 px-3 rounded-lg border border-camel-200">
              <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-camel-800">
                {groupKey}
              </h3>
              <span className="flex-shrink-0 text-xs font-medium text-camel-600">
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
