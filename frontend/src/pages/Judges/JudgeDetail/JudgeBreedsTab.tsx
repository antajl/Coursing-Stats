import React, { useState } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import type { BreedStat } from './types'
import { CRITERIA_META } from './constants'
import { formatBreedName, formatDate, getScoreTone } from './utils'
import { handleSortToggle, type SortState } from '../../../lib/judgeSortUtils'

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
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null)
  const [expandedDogs, setExpandedDogs] = useState<Set<string>>(new Set())

  const toggleDogExpand = (dogKey: string) => {
    setExpandedDogs((prev) => {
      const next = new Set(prev)
      if (next.has(dogKey)) next.delete(dogKey)
      else next.add(dogKey)
      return next
    })
  }

  return (
    <>
      {/* Search & Sort Toolbar */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по породе или кличке собаки..."
            className="h-9 w-full rounded-lg border border-old-money-200/90 bg-cream-50/60 pl-9 pr-8 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 hover:border-camel-300 focus:border-camel-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
              aria-label="Очистить поиск"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs w-full sm:w-auto">
          <span className="text-charcoal-400 mr-1 hidden sm:inline shrink-0">Сортировка:</span>
          <button
            type="button"
            onClick={() => setBreedSort(handleSortToggle('evaluations_count', breedSort))}
            className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors ${
              breedSort.field === 'evaluations_count'
                ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
                : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
            }`}
          >
            Забеги {breedSort.field === 'evaluations_count' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
          </button>
          <button
            type="button"
            onClick={() => setBreedSort(handleSortToggle('avg_score', breedSort))}
            className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors ${
              breedSort.field === 'avg_score'
                ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
                : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
            }`}
          >
            Ср. балл {breedSort.field === 'avg_score' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
          </button>
          <button
            type="button"
            onClick={() => setBreedSort(handleSortToggle('breed', breedSort))}
            className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors ${
              breedSort.field === 'breed'
                ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
                : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
            }`}
          >
            Порода {breedSort.field === 'breed' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
          </button>
        </div>
      </div>

      {filteredBreeds.length === 0 ? (
        <div className="py-12 text-center text-sm text-charcoal-500">
          {searchQuery ? (
            <div>
              Ничего не найдено по запросу «<span className="font-semibold text-charcoal-800">{searchQuery}</span>».
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="font-medium text-camel-700 underline hover:text-camel-800"
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
        <div className="space-y-3">
          {(showAllBreeds || searchQuery ? filteredBreeds : filteredBreeds.slice(0, 20)).map((stat) => {
            const q = searchQuery.trim().toLowerCase()
            const breedMatches = !q || stat.breed.toLowerCase().includes(q)
            const matchingDogs = (stat.dogs || []).filter((dog) => {
              if (!q || breedMatches) return true
              return (
                dog.name.toLowerCase().includes(q) ||
                Boolean(dog.name_ru && dog.name_ru.toLowerCase().includes(q))
              )
            })
            const isOpen = expandedBreed === stat.breed || Boolean(q && !breedMatches)
            const tone = getScoreTone(stat.avg_score)
            const score100 = stat.avg_score != null ? (stat.avg_score * 5).toFixed(1) : '—'

            return (
              <div
                key={stat.breed}
                className="rounded-2xl border border-old-money-200/80 bg-white transition-all shadow-2xs hover:border-camel-300"
              >
                {/* Breed Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left group"
                    onClick={() =>
                      setExpandedBreed(expandedBreed === stat.breed ? null : stat.breed)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors">
                        {formatBreedName(stat.breed)}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-charcoal-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-camel-600' : ''
                        }`}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-charcoal-500">
                      <span>{stat.dogs?.length || 0} собак</span>
                      <span>·</span>
                      <span>{stat.evaluations_count || 0} забегов</span>
                      {stat.min_score != null && stat.max_score != null && (
                        <>
                          <span>·</span>
                          <span>диапазон {stat.min_score} – {stat.max_score} б.</span>
                        </>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleEventBreed(stat.breed)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                        eventBreedFilter === stat.breed
                          ? 'bg-camel-100 text-camel-900 border border-camel-300'
                          : 'border border-old-money-200 bg-white text-camel-800 hover:bg-cream-50'
                      }`}
                      title="Показать соревнования по этой породе"
                    >
                      Соревнования ({stat.events_count ?? new Set(stat.dogs?.flatMap(d => d.events?.map(e => e.event_id ?? `${e.date}|${e.title}`)) || []).size})
                    </button>

                    <div
                      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold tabular-nums ${tone.badge}`}
                      title={`Средний балл ${stat.avg_score?.toFixed(2)} из 20 за критерий`}
                    >
                      <span>{score100}</span>
                      <span className="text-[10px] font-normal opacity-80">/ 100 б.</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Dogs List */}
                {isOpen && matchingDogs.length > 0 && (
                  <div className="border-t border-old-money-100 bg-cream-50/30 p-3 sm:p-4 rounded-b-2xl">
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                      Оцененные собаки ({matchingDogs.length}):
                    </p>
                    <div className="space-y-2">
                      {matchingDogs.map((dog, dogIdx) => {
                        const dogKey = `${stat.breed}|${dog.name}|${dogIdx}`
                        const isDogOpen = expandedDogs.has(dogKey)
                        const dogScore100 = dog.avg_score != null ? (dog.avg_score * 5).toFixed(1) : '—'
                        const dogTone = getScoreTone(dog.avg_score)

                        return (
                          <div
                            key={dogKey}
                            className="rounded-xl border border-old-money-200/70 bg-white p-3 transition-colors hover:border-camel-300 shadow-2xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <button
                                type="button"
                                className="text-left group flex-1 min-w-0"
                                onClick={() => toggleDogExpand(dogKey)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors">
                                    {dog.name}
                                  </span>
                                  <ChevronDown
                                    className={`h-3.5 w-3.5 text-charcoal-400 transition-transform duration-200 ${
                                      isDogOpen ? 'rotate-180 text-camel-600' : ''
                                    }`}
                                  />
                                </div>
                                {dog.name_ru && !dog.name.includes(dog.name_ru) && (
                                  <p className="text-xs text-charcoal-500 mt-0.5">
                                    {dog.name_ru}
                                  </p>
                                )}
                              </button>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <span className="text-xs text-charcoal-500 tabular-nums">
                                  {dog.total_evaluations || (dog.events ? dog.events.length : 1)} заб.
                                </span>
                                <div
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold tabular-nums ${dogTone.badge}`}
                                >
                                  <span>{dogScore100} б.</span>
                                </div>
                              </div>
                            </div>

                            {/* Dog Details Drawer: Criteria Breakdown & Events */}
                            {isDogOpen && (
                              <div className="mt-3 pt-3 border-t border-old-money-100 space-y-3">
                                {dog.scores_by_criteria && (
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
                                      Оценки по критериям (шкала 0–20):
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                                      {CRITERIA_META.map((meta) => {
                                        const scores = dog.scores_by_criteria?.[meta.id] || []
                                        const valid = scores.filter((s) => s != null && !Number.isNaN(s))
                                        if (valid.length === 0) return null
                                        const cAvg = valid.reduce((a, b) => a + b, 0) / valid.length
                                        const cPct = Math.min(100, Math.max(0, (cAvg / 20) * 100))
                                        const Icon = meta.icon

                                        return (
                                          <div
                                            key={meta.id}
                                            className="rounded-lg border border-old-money-200/60 bg-cream-50/60 p-2"
                                          >
                                            <div className="flex items-center justify-between text-xs mb-1">
                                              <span className="inline-flex items-center gap-1 text-charcoal-700 font-medium">
                                                <Icon className="h-3 w-3 text-camel-600" />
                                                {meta.name}
                                              </span>
                                              <span className="font-bold tabular-nums text-charcoal-900">
                                                {cAvg.toFixed(1)}
                                              </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-old-money-100">
                                              <div
                                                className={`h-full rounded-full ${meta.color}`}
                                                style={{ width: `${cPct}%` }}
                                              />
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                {dog.events && dog.events.length > 0 && (
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-1.5">
                                      Соревнования под судейством:
                                    </p>
                                    <div className="divide-y divide-old-money-100 rounded-lg border border-old-money-200/60 bg-white">
                                      {dog.events.map((ev, evIdx) => (
                                        <div
                                          key={evIdx}
                                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 text-xs"
                                        >
                                          <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                              <span className="text-charcoal-800 font-medium">
                                                {ev.title || 'Соревнование'}
                                              </span>
                                              {ev.date && (
                                                <span className="text-charcoal-400 tabular-nums">
                                                  {formatDate(ev.date)}
                                                </span>
                                              )}
                                            </div>

                                            {ev.heats && ev.heats.length > 0 && (
                                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                {ev.heats.map((h) => (
                                                  <span
                                                    key={h.heat_number}
                                                    className="inline-flex items-center gap-1 rounded bg-old-money-50/80 px-2 py-0.5 font-mono text-[11px] text-old-money-700 border border-old-money-200/60"
                                                  >
                                                    <span className="text-charcoal-500">Забег {h.heat_number}:</span>
                                                    <span className="font-semibold text-charcoal-900">{h.total} б.</span>
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-old-money-100/60">
                                            {ev.total != null && (
                                              <span className="font-bold tabular-nums text-camel-800 text-sm">
                                                {ev.total} б.
                                              </span>
                                            )}
                                            {ev.heats && ev.heats.length > 1 && ev.avg_score != null && (
                                              <span className="text-[10px] text-charcoal-400 tabular-nums">
                                                ср. {ev.avg_score} б.
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!searchQuery && filteredBreeds.length > 20 && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowAllBreeds(!showAllBreeds)}
            className="rounded-xl border border-old-money-200 bg-white px-5 py-2 text-sm font-semibold text-charcoal-800 shadow-2xs hover:border-camel-400 hover:bg-cream-50 transition-colors"
          >
            {showAllBreeds ? 'Свернуть список' : `Показать все ${filteredBreeds.length} пород`}
          </button>
        </div>
      )}
    </>
  )
}
