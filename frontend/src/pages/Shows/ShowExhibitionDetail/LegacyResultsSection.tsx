import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import type { ShowAwardKey } from '../../../../../backend/lib/show-award-ranking'
import {
  filterResultsByDogAndBreed,
  type ShowResultRow,
} from '../showExhibitionUtils'
import { BreedResultsPanel } from './CatalogResultsSection'

export function LegacyResultsSection({
  results,
  searchQuery,
  awardKey = null,
}: {
  results: ShowResultRow[]
  searchQuery: string
  awardKey?: ShowAwardKey | null
}) {
  const filtered = useMemo(
    () => filterResultsByDogAndBreed(results, searchQuery, awardKey),
    [results, searchQuery, awardKey],
  )
  const forceOpen = Boolean(searchQuery.trim() || awardKey)

  const { byGroup, hasFciGroups } = useMemo(() => {
    const map = new Map<string, Map<string, ShowResultRow[]>>()
    const hasGroups = filtered.some((row) => Boolean(row.breed_group?.trim()))
    for (const row of filtered) {
      const groupKey = hasGroups ? row.breed_group?.trim() || 'Прочие породы' : ''
      if (!map.has(groupKey)) map.set(groupKey, new Map())
      const breeds = map.get(groupKey)!
      if (!breeds.has(row.breed)) breeds.set(row.breed, [])
      breeds.get(row.breed)!.push(row)
    }
    return { byGroup: map, hasFciGroups: hasGroups }
  }, [filtered])

  if (filtered.length === 0) {
    return (
      <p className="rounded-xl border border-old-money-200 bg-cream-50 px-4 py-6 text-center text-sm text-old-money-500 dark:border-charcoal-600 dark:bg-charcoal-800/40 dark:text-old-money-400">
        Ничего не найдено по заданным фильтрам
      </p>
    )
  }

  const renderBreeds = (breedsMap: Map<string, ShowResultRow[]>) =>
    [...breedsMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'ru'))
      .map(([breed, breedResults]) => (
        <details
          key={breed}
          className="group/breed rounded-lg border border-old-money-200 bg-white/70 dark:border-charcoal-600 dark:bg-charcoal-800/40"
          open={forceOpen || breedsMap.size === 1 || undefined}
        >
          <summary className="cursor-pointer list-none px-3 py-2 font-semibold marker:content-none">
            {breed}
          </summary>
          <BreedResultsPanel results={breedResults} breed={breed} />
        </details>
      ))

  if (!hasFciGroups) {
    const only = [...byGroup.values()][0] ?? new Map()
    return <div className="space-y-2">{renderBreeds(only)}</div>
  }

  return (
    <div className="space-y-3">
      {[...byGroup.entries()]
        .sort(([a], [b]) => a.localeCompare(b, 'ru'))
        .map(([groupName, breedsMap]) => (
          <details
            key={groupName}
            className="group/fci rounded-xl border border-old-money-200 bg-cream-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/40"
            open={forceOpen || undefined}
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
              <ChevronRight className="h-5 w-5 shrink-0 text-camel-600 transition-transform group-open/fci:rotate-90" />
              <h2 className="font-serif text-base font-bold text-charcoal-900 md:text-lg">{groupName}</h2>
            </summary>
            <div className="space-y-2 border-t border-old-money-200 px-3 pb-3 pt-2 dark:border-charcoal-600">
              {renderBreeds(breedsMap)}
            </div>
          </details>
        ))}
    </div>
  )
}
