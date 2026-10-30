import { useState, useMemo } from 'react'
import { X, Table, List, LayoutGrid, Layers } from 'lucide-react'
import ResultCard from './ResultCard'
import TableProtocolView from './views/TableProtocolView'
import AccordionProtocolView from './views/AccordionProtocolView'
import GridProtocolView from './views/GridProtocolView'
import { groupResultsByBreedClass, groupRacingResults, isRacingFormat, parseRawScores, getBestTimesByRace } from './utils'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import QuickBreedBar from '../../TopDogs/QuickBreedBar'
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
  const [viewMode, setViewMode] = useState<'table' | 'accordion' | 'grid' | 'current'>('table')

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

      {/* Панель переключения вида отображения протокола */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-old-money-200/80 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="font-semibold text-charcoal-700 mr-1">Вид протокола:</span>
          <div className="inline-flex rounded-full border border-old-money-200 bg-cream-50 p-0.5 text-xs">
            {[
              { id: 'table', label: '1. Таблица (Swiss Timing)', icon: Table },
              { id: 'accordion', label: '2. Лидерборд-строки', icon: List },
              { id: 'grid', label: '3. Двухколоночная сетка', icon: LayoutGrid },
              { id: 'current', label: '4. Подробные карточки (текущий)', icon: Layers },
            ].map((tab) => {
              const active = viewMode === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition-all cursor-pointer ${
                    active
                      ? 'border border-camel-400 bg-camel-100 text-camel-950 shadow-2xs'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Панель поиска и фильтрации пород в стиле рейтинга (чистый ряд без внешней рамки) */}
      <div className="flex items-center gap-2 w-full max-w-full min-w-0 overflow-hidden">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Кличка собаки…"
        />

        {breeds.length > 1 && (
          <div className="flex-1 min-w-0 max-w-full overflow-hidden">
            <QuickBreedBar
              selectedBreed={selectedBreed}
              onSelectBreed={(b) => setSelectedBreed(b)}
              breedValues={breeds}
            />
          </div>
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

            {viewMode === 'table' && (
              <TableProtocolView
                results={groupResults}
                bestTimesByRace={bestTimesByRace}
                isRacing={isRacing}
              />
            )}

            {viewMode === 'accordion' && (
              <AccordionProtocolView
                results={groupResults}
                bestTimesByRace={bestTimesByRace}
                isRacing={isRacing}
              />
            )}

            {viewMode === 'grid' && (
              <GridProtocolView
                results={groupResults}
                bestTimesByRace={bestTimesByRace}
                isRacing={isRacing}
              />
            )}

            {viewMode === 'current' && (
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
            )}
          </section>
        )
      })}
    </div>
  )
}
