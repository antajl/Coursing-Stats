import { useState, useMemo } from 'react'
import TableProtocolView from './views/TableProtocolView'
import MobileCardsProtocolView from './views/MobileCardsProtocolView'
import {
  groupResultsByBreedClass,
  groupRacingResults,
  isRacingFormat,
  isCoursingFormat,
  parseRawScores,
  getBestTimesByRace,
  extractDogSex,
  extractDoninoLeague,
} from './utils'
import type { QuickBreedItem } from '../../TopDogs/QuickBreedBar'
import { canonicalBreed, formatBreedName, matchesBreedFilter } from '../../../lib/breedMapping'
import type { DogsIndexEntry } from '../../../lib/competingBreeds'
import type { Result } from './types'
import { ResultsToolbar } from './ResultsToolbar'

interface ResultsSectionProps {
  results: Result[]
  trailing?: React.ReactNode
}

export default function ResultsSection({ results, trailing }: ResultsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [selectedSex, setSelectedSex] = useState<string>('')
  const [selectedLeague, setSelectedLeague] = useState<string>('all')

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-old-money-200 bg-cream-50 p-4 md:p-6">
        <div className="text-sm text-old-money-500">Нет данных о результатах</div>
      </div>
    )
  }

  // Multi-discipline detection (e.g. Marathon with genuine Racing and Coursing rounds)
  const isMultiDiscipline = useMemo(() => {
    const hasRacing = results.some((r) => isRacingFormat(parseRawScores(r.raw_scores_json)))
    const hasCoursing = results.some((r) => isCoursingFormat(parseRawScores(r.raw_scores_json)))
    return hasRacing && hasCoursing
  }, [results])

  const racingResults = useMemo(() => {
    if (!isMultiDiscipline) return results
    return results.filter((r) => {
      if (r.breed_class?.includes('Курсинг') && !r.breed_class?.includes('Рейсинг')) return false
      if (isCoursingFormat(parseRawScores(r.raw_scores_json))) return false
      return true
    })
  }, [results, isMultiDiscipline])

  const coursingResults = useMemo(() => {
    if (!isMultiDiscipline) return results
    return results.filter((r) => {
      if (r.breed_class?.includes('Рейсинг') && !r.breed_class?.includes('Курсинг')) return false
      if (isRacingFormat(parseRawScores(r.raw_scores_json))) return false
      return true
    })
  }, [results, isMultiDiscipline])

  const [activeTab, setActiveTab] = useState<'racing' | 'coursing'>('racing')

  const activeResults = isMultiDiscipline
    ? activeTab === 'racing'
      ? racingResults
      : coursingResults
    : results

  const isRacing = isMultiDiscipline
    ? activeTab === 'racing'
    : results.some((r) => isRacingFormat(parseRawScores(r.raw_scores_json)))

  const bestTimesByRace = useMemo(() => {
    return isRacing ? getBestTimesByRace(activeResults) : {}
  }, [isRacing, activeResults])

  // Candidate breeds sorted strictly by participant count descending, then alphabetically
  const { breeds, candidateBreeds, dogIndex } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of activeResults) {
      const b = canonicalBreed(r.dog.breed)
      if (b) counts.set(b, (counts.get(b) || 0) + 1)
    }
    const sortedEntries = Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'),
    )

    const sortedBreedKeys = sortedEntries.map(([breedKey]) => breedKey)

    const candidates: QuickBreedItem[] = sortedEntries.map(([breedKey]) => {
      const fullName = formatBreedName(breedKey)
      let label = fullName
      if (breedKey === 'РОДЕЗИЙСКИЙ РИДЖБЕК') label = 'Риджбек'
      else if (breedKey === 'РУССКАЯ ПСОВАЯ БОРЗАЯ') label = 'РПБ'
      else if (breedKey === 'ФАРАОНОВА СОБАКА') label = 'Фараон'
      else if (breedKey === 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ' || breedKey === 'ЛЕВРЕТКА') label = 'Левретка'
      else if (breedKey === 'ЧИРНЕКО ДЕЛЬ ЭТНА') label = 'Чирнеко'
      else if (breedKey === 'ИРЛАНДСКИЙ ВОЛКОДАВ') label = 'Ирл. волкодав'
      else if (breedKey === 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР') label = 'АСТ'
      else if (breedKey === 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА') label = 'Малинуа'
      else if (breedKey === 'ИСПАНСКИЙ ГАЛЬГО') label = 'Гальго'
      return {
        key: breedKey,
        label,
        fullName,
        estWidth: label.length * 9 + 32,
      }
    })

    const index: DogsIndexEntry[] = activeResults.map((r) => ({
      breed: canonicalBreed(r.dog.breed),
      competition_count: 1,
    }))

    return { breeds: sortedBreedKeys, candidateBreeds: candidates, dogIndex: index }
  }, [activeResults])

  const availableLeagues = useMemo(() => {
    const set = new Set<string>()
    for (const r of activeResults) {
      const l = extractDoninoLeague(r.breed_class)
      if (l) set.add(l)
    }
    const ORDER = ['Чемпионов', 'Абсолют', 'Прогресс', 'Юниоры']
    return ORDER.filter((l) => set.has(l))
  }, [activeResults])

  const leagueCounts = useMemo(() => {
    if (availableLeagues.length === 0) return {}
    const counts: Record<string, number> = { all: 0 }
    for (const l of availableLeagues) counts[l] = 0

    for (const r of activeResults) {
      const matchesSearch =
        searchQuery === '' ||
        r.name_ru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name_lat?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesBreed =
        selectedBreed === '' || matchesBreedFilter(canonicalBreed(r.dog.breed), selectedBreed)
      const dogSex = extractDogSex(r)
      const matchesSex = selectedSex === '' || dogSex === selectedSex

      if (matchesSearch && matchesBreed && matchesSex) {
        counts.all++
        const l = extractDoninoLeague(r.breed_class)
        if (l && counts[l] !== undefined) {
          counts[l]++
        }
      }
    }
    return counts
  }, [activeResults, availableLeagues, searchQuery, selectedBreed, selectedSex])

  const filteredResults = activeResults.filter((result) => {
    const matchesSearch =
      searchQuery === '' ||
      result.name_ru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.name_lat?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBreed =
      selectedBreed === '' || matchesBreedFilter(canonicalBreed(result.dog.breed), selectedBreed)
    const dogSex = extractDogSex(result)
    const matchesSex = selectedSex === '' || dogSex === selectedSex
    const dogLeague = extractDoninoLeague(result.breed_class)
    const matchesLeague = selectedLeague === 'all' || dogLeague === selectedLeague
    return matchesSearch && matchesBreed && matchesSex && matchesLeague
  })

  const { grouped: filteredGrouped, sortedGroups: filteredSortedGroups } = isRacing
    ? groupRacingResults(filteredResults)
    : groupResultsByBreedClass(filteredResults)

  const isFiltered = Boolean(
    selectedBreed || selectedSex || selectedLeague !== 'all' || searchQuery.trim(),
  )

  const handleResetFilters = () => {
    setSelectedBreed('')
    setSelectedSex('')
    setSelectedLeague('all')
    setSearchQuery('')
  }

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

      <ResultsToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSex={selectedSex}
        setSelectedSex={setSelectedSex}
        breeds={breeds}
        candidateBreeds={candidateBreeds}
        dogIndex={dogIndex}
        selectedBreed={selectedBreed}
        setSelectedBreed={setSelectedBreed}
        availableLeagues={availableLeagues}
        selectedLeague={selectedLeague}
        setSelectedLeague={setSelectedLeague}
        leagueCounts={leagueCounts}
        activeResultsCount={activeResults.length}
        isFiltered={isFiltered}
        handleResetFilters={handleResetFilters}
        trailing={trailing}
      />

      {filteredSortedGroups.length === 0 ? (
        <div className="rounded-xl border border-old-money-200 bg-cream-50 p-6 text-center text-sm text-old-money-500">
          Собаки по заданным фильтрам не найдены
        </div>
      ) : (
        <>
          {/* Мобильная версия (< 640px): бесшовные монолитные карточки без отступов между собаками и заголовками */}
          <div className="block sm:hidden">
            <MobileCardsProtocolView
              groupedResults={filteredGrouped}
              sortedGroupKeys={filteredSortedGroups}
              bestTimesByRace={bestTimesByRace}
              isRacing={isRacing}
            />
          </div>

          {/* Десктопная версия (≥ 640px): монолитная таблица с фиксированной сеткой колонок */}
          <div className="hidden sm:block">
            <TableProtocolView
              groupedResults={filteredGrouped}
              sortedGroupKeys={filteredSortedGroups}
              bestTimesByRace={bestTimesByRace}
              isRacing={isRacing}
            />
          </div>
        </>
      )}
    </div>
  )
}
