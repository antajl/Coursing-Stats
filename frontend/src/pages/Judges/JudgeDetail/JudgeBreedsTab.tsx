import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ExternalLink, X } from 'lucide-react'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import ProcoursingEventLink from '../../../components/ProcoursingEventLink'
import RankBadge from '../../../components/RankBadge'
import DoninoColumnPlaque, { DoninoColumnShell } from '../../SpeedRecords/DoninoColumnPlaque'
import { formatBreedSentenceCase } from '../../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'
import type { BreedStat, DogStat } from './types'
import { CRITERIA_META } from './constants'
import { formatBreedName, formatDate, getScoreTone } from './utils'
import { handleSortToggle, type SortState } from '../../../lib/judgeSortUtils'

const INITIAL_DOGS_BATCH = 25
const BATCH_INCREMENT = 25

interface JudgeBreedDogsListProps {
  stat: BreedStat
  matchingDogs: DogStat[]
  searchQuery: string
  expandedDogs: Set<string>
  toggleDogExpand: (dogKey: string) => void
}

function JudgeBreedDogsList({
  stat,
  matchingDogs,
  searchQuery,
  expandedDogs,
  toggleDogExpand,
}: JudgeBreedDogsListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_DOGS_BATCH)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, matchingDogs.length))
        }
      },
      { rootMargin: '300px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [matchingDogs.length])

  const displayedDogs = useMemo(
    () => matchingDogs.slice(0, visibleCount),
    [matchingDogs, visibleCount],
  )

  if (matchingDogs.length === 0) {
    return (
      <div className="py-5 px-4 text-center text-xs text-charcoal-500">
        Собаки по запросу «{searchQuery}» не найдены
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y divide-old-money-100/50">
        {displayedDogs.map((dog, dogIdx) => {
          const dogKey = `${stat.breed}|${dog.name}|${dogIdx}`
          const isDogOpen = expandedDogs.has(dogKey)
          const rank = dogIdx + 1
          const startsCount = dog.total_evaluations || (dog.events ? dog.events.length : 1)
          const dogScore100 = dog.avg_score != null ? (dog.avg_score * 5).toFixed(1) : '—'

          return (
            <div key={dogKey} className="transition-colors">
              <div className="flex flex-row items-center justify-between p-3 sm:p-3.5 hover:bg-cream-100/50 transition-colors">
                {/* Left: Rank Badge */}
                <div className="w-10 sm:w-12 shrink-0 flex items-center justify-center">
                  <RankBadge rank={rank} />
                </div>

                {/* Center: Dog Info */}
                <div className="min-w-0 flex-1 px-2.5 sm:px-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Link
                      to={`/dog/${encodeURIComponent(dog.name)}/`}
                      className="font-bold text-sm sm:text-[15px] leading-snug text-charcoal-900 truncate hover:text-camel-800 hover:underline transition-colors"
                      title={dog.name_ru ? `${dog.name} / ${dog.name_ru}` : dog.name}
                    >
                      {dog.name}
                    </Link>
                  </div>

                  {/* Subtitle 1: Breed + Russian name */}
                  <div className="flex items-center gap-1 text-[10.5px] sm:text-xs text-charcoal-500 font-medium mt-0.5">
                    <span className="truncate">{formatBreedSentenceCase(stat.breed)}</span>
                    {dog.name_ru && !dog.name.includes(dog.name_ru) && (
                      <>
                        <span className="text-charcoal-300">·</span>
                        <span className="truncate text-charcoal-400">{dog.name_ru}</span>
                      </>
                    )}
                  </div>

                  {/* Subtitle 2: Average Score */}
                  <div className="flex items-center gap-1 text-[11px] sm:text-[11.5px] text-charcoal-600 font-medium mt-0.5">
                    <span>Ср. балл:</span>
                    <strong className="font-bold text-charcoal-900 tabular-nums">
                      {dogScore100}
                    </strong>
                    <span className="text-[10px] text-charcoal-400 font-normal">из 100</span>
                    {dog.avg_score != null && (
                      <span className="text-[10px] text-charcoal-400 hidden sm:inline">
                        ({dog.avg_score.toFixed(2)} из 20)
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Starts & Criteria toggle */}
                <div className="shrink-0 flex flex-col items-end justify-center gap-1 pl-2 text-right">
                  <div className="flex items-center gap-1.5 min-w-0 justify-end">
                    <span className="text-xs text-charcoal-600 font-medium">Забегов</span>
                    <strong className="font-bold text-charcoal-900 tabular-nums text-sm">
                      {startsCount}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDogExpand(dogKey)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                      isDogOpen
                        ? 'bg-camel-100 border-camel-300 text-camel-900'
                        : 'bg-cream-100/80 border-old-money-200/60 text-charcoal-700 hover:bg-cream-200/80 hover:text-camel-900'
                    }`}
                    title="Оценки по критериям и забегам"
                  >
                    <span>Оценки</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        isDogOpen ? 'rotate-180 text-camel-700' : 'text-charcoal-400'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dog Details Drawer: Criteria Breakdown & Events */}
              {isDogOpen && (
                <div className="border-t border-old-money-100/70 bg-cream-50/40 p-3 sm:p-4 space-y-3">
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
                                {ev.event_id ? (
                                  <ProcoursingEventLink
                                    eventId={ev.event_id}
                                    className="text-charcoal-900 font-semibold hover:text-camel-800 hover:underline inline-flex items-center gap-1 transition-colors"
                                    title={`Открыть протокол: ${ev.title}`}
                                  >
                                    <span>{ev.title || 'Соревнование'}</span>
                                    <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                                  </ProcoursingEventLink>
                                ) : (
                                  <span className="font-semibold text-charcoal-900">
                                    {ev.title || 'Соревнование'}
                                  </span>
                                )}
                                {ev.date && (
                                  <span className="text-charcoal-400 text-[11px]">
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

      {/* Lazy scroll sentinel and fallback control */}
      {visibleCount < matchingDogs.length && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-cream-100/40 border-t border-old-money-100/60 text-xs text-charcoal-600"
        >
          <span>
            Показано <strong className="font-semibold text-charcoal-900 tabular-nums">{displayedDogs.length}</strong> из{' '}
            <strong className="font-semibold text-charcoal-900 tabular-nums">{matchingDogs.length}</strong> собак
          </span>
          <button
            type="button"
            onClick={() =>
              setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, matchingDogs.length))
            }
            className="rounded-full border border-camel-400 bg-white px-3 py-1 text-xs font-semibold text-camel-900 shadow-3xs transition-all hover:bg-camel-50 hover:border-camel-500 active:scale-95 cursor-pointer"
          >
            Показать ещё {Math.min(BATCH_INCREMENT, matchingDogs.length - visibleCount)}
          </button>
        </div>
      )}

      {visibleCount >= matchingDogs.length && matchingDogs.length > INITIAL_DOGS_BATCH && (
        <div className="py-2 text-center text-[11px] text-charcoal-400 bg-cream-50/20 border-t border-old-money-100/40">
          Все {matchingDogs.length} собак показаны
        </div>
      )}
    </div>
  )
}

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
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (b) =>
          b.breed.toLowerCase().includes(q) ||
          (b.dogs || []).some(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              Boolean(d.name_ru && d.name_ru.toLowerCase().includes(q)),
          ),
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
      {/* Search & Sort Toolbar — строго 1 строка со скроллом */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 justify-between w-full min-w-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск по породе или кличке..."
          />

          <div className="shrink-0 flex items-center gap-1">
            <BreedSearchDropdown
              breeds={allBreedNames}
              selectedBreed={selectedBreed}
              onSelect={handleSelectBreed}
              trigger={
                <button
                  type="button"
                  className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedBreed))} cursor-pointer`}
                  title="Фильтр по породе"
                >
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {selectedBreed ? formatBreedSentenceCase(selectedBreed) : 'Все породы'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </button>
              }
            />

            {selectedBreed && (
              <button
                type="button"
                onClick={() => handleSelectBreed('')}
                className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer"
                title="Сбросить фильтр по породе"
                aria-label="Сбросить фильтр по породе"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs w-full sm:w-auto shrink-0">
          <span className="text-charcoal-400 mr-1 hidden sm:inline shrink-0">Сортировка:</span>
          <button
            type="button"
            onClick={() => setBreedSort(handleSortToggle('evaluations_count', breedSort))}
            className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors cursor-pointer ${
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
            className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors cursor-pointer ${
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
            className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-medium transition-colors cursor-pointer ${
              breedSort.field === 'breed'
                ? 'bg-camel-100 text-camel-900 font-semibold shadow-2xs'
                : 'border border-old-money-200 bg-white text-charcoal-600 hover:bg-cream-50'
            }`}
          >
            Порода {breedSort.field === 'breed' ? (breedSort.direction === 'desc' ? '↓' : '↑') : ''}
          </button>
        </div>
      </div>

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
        /* Unified Card Shell with Plaque Header */
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
            {paginatedBreeds.map((stat) => {
              const q = searchQuery.trim().toLowerCase()
              const matchingDogs = (stat.dogs || []).filter((dog) => {
                if (!q) return true
                return (
                  dog.name.toLowerCase().includes(q) ||
                  Boolean(dog.name_ru && dog.name_ru.toLowerCase().includes(q))
                )
              })
              const isExpanded = expandedBreed === stat.breed
              const tone = getScoreTone(stat.avg_score)
              const score100 = stat.avg_score != null ? (stat.avg_score * 5).toFixed(1) : '—'

              return (
                <div key={stat.breed} className="transition-colors">
                  {/* Breed Row */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleBreed(stat.breed)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleBreed(stat.breed)
                      }
                    }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 transition-colors cursor-pointer select-none ${
                      isExpanded ? 'bg-cream-100/60' : 'hover:bg-cream-50/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-charcoal-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-camel-700' : 'group-hover:text-charcoal-600'
                          }`}
                        />
                        <span className="font-bold text-sm sm:text-[15px] text-charcoal-900 group-hover:text-camel-900 transition-colors">
                          {formatBreedName(stat.breed)}
                        </span>
                      </div>
                      <div className="mt-1 ml-6 flex flex-wrap items-center gap-2 text-xs text-charcoal-500">
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
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleEventBreed(stat.breed)
                        }}
                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                          eventBreedFilter === stat.breed
                            ? 'bg-camel-100 text-camel-900 border border-camel-300'
                            : 'border border-old-money-200 bg-white text-camel-800 hover:bg-cream-50'
                        }`}
                        title="Показать соревнования по этой породе"
                      >
                        Соревнования ({stat.events_count ?? new Set(stat.dogs?.flatMap(d => d.events?.map(e => e.event_id ?? `${e.date}|${e.title}`)) || []).size})
                      </button>

                      <div
                        className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold tabular-nums ${tone.badge}`}
                        title={`Средний балл ${stat.avg_score?.toFixed(2)} из 20 за критерий`}
                      >
                        <span>{score100}</span>
                        <span className="text-[10px] font-normal opacity-80">/ 100 б.</span>
                      </div>
                    </div>
                  </div>

                  {/* Dogs Spoiler List (matching site rating style with lazy loading) */}
                  {isExpanded && (
                    <div className="bg-cream-50/25 border-t border-old-money-100/70">
                      <JudgeBreedDogsList
                        stat={stat}
                        matchingDogs={matchingDogs}
                        searchQuery={searchQuery}
                        expandedDogs={expandedDogs}
                        toggleDogExpand={toggleDogExpand}
                      />
                    </div>
                  )}
                </div>
              )
            })}
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
