import React, { useState, useMemo, useEffect } from 'react'
import DoninoColumnPlaque, { DoninoColumnShell } from '../../SpeedRecords/DoninoColumnPlaque'
import { matchesBreedSearch } from '../../../lib/breedMapping'
import { matchesDog } from '../../../lib/searchEngine'
import type { BreedStat } from './types'
import type { SortState } from '../../../lib/judgeSortUtils'
import { JudgeBreedsToolbar } from './BreedsTab/JudgeBreedsToolbar'
import { JudgeBreedAccordion } from './BreedsTab/JudgeBreedAccordion'

interface JudgeBreedsTabProps {
  filteredBreeds: BreedStat[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  breedSort: SortState
  setBreedSort: (sort: SortState) => void
  eventBreedFilter: string
  toggleEventBreed: (breed: string) => void
  showAllBreeds: boolean
  setShowAllBreeds: (show: boolean) => void
}

export const JudgeBreedsTab: React.FC<JudgeBreedsTabProps> = ({
  filteredBreeds,
  searchQuery,
  setSearchQuery,
  breedSort,
  setBreedSort,
  eventBreedFilter,
  toggleEventBreed,
  showAllBreeds,
  setShowAllBreeds,
}) => {
  const [selectedBreed, setSelectedBreed] = useState<string>('')
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null)
  const [expandedDogs, setExpandedDogs] = useState<Set<string>>(new Set())

  const handleSelectBreed = (b: string) => {
    setSelectedBreed(b)
    if (b) {
      setExpandedBreed(b)
    }
  }

  useEffect(() => {
    if (selectedBreed) {
      setExpandedBreed(selectedBreed)
    }
  }, [selectedBreed])

  const toggleBreed = (breed: string) => {
    setExpandedBreed((prev) => (prev === breed ? null : breed))
  }

  const toggleDogExpand = (dogKey: string) => {
    setExpandedDogs((prev) => {
      const next = new Set(prev)
      if (next.has(dogKey)) next.delete(dogKey)
      else next.add(dogKey)
      return next
    })
  }

  const allBreedNames = useMemo(
    () => filteredBreeds.map((b) => b.breed),
    [filteredBreeds],
  )

  const displayedBreeds = useMemo(() => {
    let list = filteredBreeds
    if (selectedBreed) {
      list = list.filter((b) => b.breed.toLowerCase() === selectedBreed.toLowerCase())
    }
    const q = searchQuery.trim()
    if (q) {
      list = list.filter(
        (b) =>
          matchesBreedSearch(b.breed, q) ||
          (b.dogs || []).some((d) => matchesDog(d, q)),
      )
    }
    return list
  }, [filteredBreeds, selectedBreed, searchQuery])

  const paginatedBreeds =
    showAllBreeds || searchQuery || selectedBreed
      ? displayedBreeds
      : displayedBreeds.slice(0, 20)

  return (
    <div className="space-y-3">
      <JudgeBreedsToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        allBreedNames={allBreedNames}
        selectedBreed={selectedBreed}
        handleSelectBreed={handleSelectBreed}
        breedSort={breedSort}
        setBreedSort={setBreedSort}
      />

      {displayedBreeds.length === 0 ? (
        <div className="py-12 text-center text-sm text-charcoal-500">
          {searchQuery ? (
            <div>
              Ничего не найдено по запросу «<span className="font-semibold text-charcoal-800">{searchQuery}</span>».
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="font-medium text-camel-700 underline hover:text-camel-800 cursor-pointer"
                >
                  Сбросить поиск
                </button>
              </div>
            </div>
          ) : (
            'Нет данных о породах'
          )}
        </div>
      ) : (
        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title="ПОРОДЫ ПОД СУДЕЙСТВОМ"
              count={displayedBreeds.length}
              countLabel={`${displayedBreeds.length} пород`}
            />
          }
        >
          <div className="divide-y divide-old-money-100/70">
            {paginatedBreeds.map((stat) => (
              <JudgeBreedAccordion
                key={stat.breed}
                stat={stat}
                searchQuery={searchQuery}
                isExpanded={expandedBreed === stat.breed}
                toggleBreed={toggleBreed}
                eventBreedFilter={eventBreedFilter}
                toggleEventBreed={toggleEventBreed}
                expandedDogs={expandedDogs}
                toggleDogExpand={toggleDogExpand}
              />
            ))}
          </div>

          {!searchQuery && !selectedBreed && filteredBreeds.length > 20 && (
            <div className="p-3 border-t border-old-money-100/70 text-center bg-cream-50/30">
              <button
                type="button"
                onClick={() => setShowAllBreeds(!showAllBreeds)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-camel-700 bg-white border border-old-money-200 hover:bg-cream-100 hover:text-camel-800 transition-colors cursor-pointer shadow-3xs"
              >
                {showAllBreeds ? 'Свернуть список' : `Показать все ${filteredBreeds.length} пород`}
              </button>
            </div>
          )}
        </DoninoColumnShell>
      )}
    </div>
  )
}
export default JudgeBreedsTab
