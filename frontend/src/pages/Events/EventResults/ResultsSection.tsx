import { useState, useMemo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import ResultCard from './ResultCard'
import { groupResultsByBreedClass, groupRacingResults, isRacingFormat, parseRawScores, getBestTimesByRace } from './utils'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import QuickBreedBar from '../../TopDogs/QuickBreedBar'
import { formatBreedName } from '../../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'
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

  // Split results if multi-discipline event (e.g. Marathon with Racing and Coursing)
  const racingResults = useMemo(() => {
    return results.filter(r => isRacingFormat(parseRawScores(r.raw_scores_json)))
  }, [results])

  const coursingResults = useMemo(() => {
    return results.filter(r => !isRacingFormat(parseRawScores(r.raw_scores_json)))
  }, [results])

  const isMultiDiscipline = racingResults.length > 0 && coursingResults.length > 0
  const [activeTab, setActiveTab] = useState<'racing' | 'coursing'>('racing')

  const activeResults = isMultiDiscipline
    ? (activeTab === 'racing' ? racingResults : coursingResults)
    : results

  const isRacing = isMultiDiscipline
    ? activeTab === 'racing'
    : results.some(r => isRacingFormat(parseRawScores(r.raw_scores_json)))

  const bestTimesByRace = useMemo(() => {
    return isRacing ? getBestTimesByRace(activeResults) : {}
  }, [isRacing, activeResults])

  const breeds = Array.from(new Set(activeResults.map(r => r.dog.breed))).sort()

  const filteredResults = activeResults.filter(result => {
    const matchesSearch = searchQuery === '' ||
      result.name_ru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.name_lat?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBreed = selectedBreed === '' || result.dog.breed === selectedBreed
    return matchesSearch && matchesBreed
  })

  const { grouped: filteredGrouped, sortedGroups: filteredSortedGroups } = isRacing
    ? groupRacingResults(filteredResults)
    : groupResultsByBreedClass(filteredResults)

  const isFiltered = Boolean(selectedBreed || searchQuery.trim())

  return (
    <div className="space-y-3">
      {isMultiDiscipline && (
        <div className="flex border-b border-old-money-200 gap-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => {
              setActiveTab('racing')
              setSelectedBreed('')
            }}
            className={`min-h-[44px] px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'racing'
                ? 'bg-camel-100 text-camel-900 border-b-2 border-camel-700'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
            }`}
          >
            <span>1-й раунд: Рейсинг (480 м)</span>
            <span className="rounded-full bg-camel-200/70 px-2 py-0.5 text-xs text-camel-800 tabular-nums">
              {racingResults.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('coursing')
              setSelectedBreed('')
            }}
            className={`min-h-[44px] px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'coursing'
                ? 'bg-camel-100 text-camel-900 border-b-2 border-camel-700'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
            }`}
          >
            <span>2-й раунд: Курсинг</span>
            <span className="rounded-full bg-camel-200/70 px-2 py-0.5 text-xs text-camel-800 tabular-nums">
              {coursingResults.length}
            </span>
          </button>
        </div>
      )}

      {/* Панель поиска и фильтрации пород в едином стиле рейтинга соревнований */}
      <div className="rounded-xl border border-old-money-200 bg-cream-50/70 p-2 sm:p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Кличка собаки…"
          />

          <div className="shrink-0">
            <BreedSearchDropdown
              breeds={breeds}
              selectedBreed={selectedBreed}
              onSelect={(b) => setSelectedBreed(b)}
              trigger={
                <button
                  type="button"
                  className={toolbarPillTriggerClass(Boolean(selectedBreed))}
                >
                  <span>{selectedBreed ? formatBreedName(selectedBreed) : 'Все породы'}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </button>
              }
            />
          </div>

          {breeds.length > 1 && (
            <>
              <div className="hidden sm:block h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />
              <div className="hidden sm:block flex-1 min-w-0">
                <QuickBreedBar
                  selectedBreed={selectedBreed}
                  onSelectBreed={(b) => setSelectedBreed(selectedBreed === b ? '' : b)}
                  breedValues={breeds}
                />
              </div>
            </>
          )}

          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setSelectedBreed('')
                setSearchQuery('')
              }}
              className="relative shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 transition-colors before:absolute before:-inset-1.5 before:content-['']"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filteredSortedGroups.map(groupKey => {
        const groupResults = filteredGrouped[groupKey]

        return (
          <section key={groupKey} className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-3 bg-camel-100/70 py-1.5 px-3 rounded-lg border border-camel-200/80">
              <h3 className="min-w-0 flex-1 text-sm sm:text-base font-semibold tracking-tight text-camel-950">
                {groupKey}
              </h3>
              <span className="flex-shrink-0 text-xs font-medium text-camel-700">
                {breedCountLabel(groupResults.length)}
              </span>
            </div>
            <div className="space-y-1.5">
              {groupResults.map((result, idx) => (
                <ResultCard
                  key={`${result.dog_id}-${idx}`}
                  result={result}
                  index={idx}
                  bestTimesByRace={bestTimesByRace}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
