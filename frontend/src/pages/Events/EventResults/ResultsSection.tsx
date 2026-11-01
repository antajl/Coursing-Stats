import { useState, useMemo } from 'react'
import { X, ChevronDown } from 'lucide-react'
import TableProtocolView from './views/TableProtocolView'
import {
  groupResultsByBreedClass,
  groupRacingResults,
  isRacingFormat,
  parseRawScores,
  getBestTimesByRace,
  extractDogSex,
} from './utils'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import QuickBreedBar, { type QuickBreedItem } from '../../TopDogs/QuickBreedBar'
import { canonicalBreed, formatBreedName, matchesBreedFilter } from '../../../lib/breedMapping'
import type { DogsIndexEntry } from '../../../lib/competingBreeds'
import DogSexIcon from '../../../components/DogSexIcon'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'
import type { Result } from './types'

interface ResultsSectionProps {
  results: Result[]
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [selectedSex, setSelectedSex] = useState<string>('')
  const [sexDropdownOpen, setSexDropdownOpen] = useState(false)

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

  // Candidate breeds sorted strictly by participant count descending, then alphabetically
  const { breeds, candidateBreeds, dogIndex } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of activeResults) {
      const b = r.dog.breed
      if (b) counts.set(b, (counts.get(b) || 0) + 1)
    }
    const sortedEntries = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))

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

    const index: DogsIndexEntry[] = activeResults.map(r => ({
      breed: canonicalBreed(r.dog.breed),
      competition_count: 1,
    }))

    return { breeds: sortedBreedKeys, candidateBreeds: candidates, dogIndex: index }
  }, [activeResults])

  const filteredResults = activeResults.filter(result => {
    const matchesSearch = searchQuery === '' ||
      result.name_ru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.name_lat?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBreed = selectedBreed === '' || matchesBreedFilter(canonicalBreed(result.dog.breed), selectedBreed)
    const dogSex = extractDogSex(result)
    const matchesSex = selectedSex === '' || dogSex === selectedSex
    return matchesSearch && matchesBreed && matchesSex
  })

  const { grouped: filteredGrouped, sortedGroups: filteredSortedGroups } = isRacing
    ? groupRacingResults(filteredResults)
    : groupResultsByBreedClass(filteredResults)

  const isSexActive = Boolean(selectedSex)
  const sexTriggerLabel = selectedSex === 'm' ? 'Кобели' : selectedSex === 'f' ? 'Суки' : 'Пол'

  const sexTrigger = (
    <button
      type="button"
      className={`shrink-0 ${toolbarPillTriggerClass(isSexActive)}`}
    >
      {selectedSex === 'm' && <DogSexIcon sex="m" size={12} variant="neutral" className="shrink-0 text-current" />}
      {selectedSex === 'f' && <DogSexIcon sex="f" size={12} variant="neutral" className="shrink-0 text-current" />}
      <span>{sexTriggerLabel}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </button>
  )

  const renderSexMenu = (setOpen: (v: boolean) => void) => (
    <div className="p-1 min-w-[125px]" role="menu">
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setSelectedSex('')
          setOpen(false)
        }}
        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
          !selectedSex
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        Все
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setSelectedSex('m')
          setOpen(false)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
          selectedSex === 'm'
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        <DogSexIcon sex="m" size={14} className={selectedSex === 'm' ? 'text-charcoal-900' : 'text-slate-500'} />
        <span>Кобели</span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setSelectedSex('f')
          setOpen(false)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
          selectedSex === 'f'
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        <DogSexIcon sex="f" size={14} className={selectedSex === 'f' ? 'text-charcoal-900' : 'text-rose-500'} />
        <span>Суки</span>
      </button>
    </div>
  )

  const isFiltered = Boolean(selectedBreed || selectedSex || searchQuery.trim())

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

      {/* Панель поиска и фильтрации в стиле рейтинга (чистый ряд без внешней рамки) */}
      <div className="flex items-center gap-2 w-full max-w-full min-w-0 overflow-hidden">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Кличка собаки…"
        />

        {/* Выбор пола */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={sexTrigger}
            isOpen={sexDropdownOpen}
            onOpenChange={setSexDropdownOpen}
            width="130px"
          >
            {renderSexMenu(setSexDropdownOpen)}
          </ModernDropdown>
        </div>

        {breeds.length > 1 && (
          <>
            <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5 hidden sm:block" aria-hidden="true" />
            <div className="flex-1 min-w-0 max-w-full overflow-hidden">
              <QuickBreedBar
                selectedBreed={selectedBreed}
                onSelectBreed={(b) => setSelectedBreed(b)}
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
              setSelectedSex('')
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

      {filteredSortedGroups.length === 0 ? (
        <div className="rounded-xl border border-old-money-200 bg-cream-50 p-6 text-center text-sm text-old-money-500">
          Собаки по заданным фильтрам не найдены
        </div>
      ) : (
        <TableProtocolView
          groupedResults={filteredGrouped}
          sortedGroupKeys={filteredSortedGroups}
          bestTimesByRace={bestTimesByRace}
          isRacing={isRacing}
        />
      )}
    </div>
  )
}
