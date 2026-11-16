import { useMemo, useState, useEffect } from 'react'
import { ArrowUpDown, ChevronDown, ChevronRight, X } from 'lucide-react'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import ShowJudgeGradeScopeDropdown from '../ShowJudgeGradeScopeDropdown'
import DoninoColumnPlaque, { DoninoColumnShell } from '../../SpeedRecords/DoninoColumnPlaque'
import { formatBreedSentenceCase } from '../../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'
import type { GradeScope } from '../../../components/ShowJudgeCard'
import { ShowJudgeBreedDogsList } from './ShowJudgeBreedDogsList'

type BreedRow = { breed: string; count: number }
type ExhibitionItem = {
  id: number
  date: string
  title: string
  rkf_url?: string
  breed_counts?: Record<string, number>
}

export function JudgeBreedPanel({
  breeds,
  showAll,
  onToggleShowAll,
  judgeId,
  judgeName,
  periodExhibitions,
  selectedBreed,
  onSelectBreed,
  gradeScope = 'adult',
  onGradeScopeChange,
}: {
  breeds: BreedRow[]
  showAll: boolean
  onToggleShowAll: () => void
  judgeId?: string
  judgeName?: string
  periodExhibitions?: ExhibitionItem[]
  selectedBreed?: string
  onSelectBreed?: (breed: string) => void
  gradeScope?: GradeScope
  onGradeScopeChange?: (scope: GradeScope) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<'count' | 'alpha'>('count')
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null)
  const [internalBreed, setInternalBreed] = useState('')

  const activeBreed = selectedBreed !== undefined ? selectedBreed : internalBreed
  const handleSelectBreed = (b: string) => {
    if (onSelectBreed) onSelectBreed(b)
    else setInternalBreed(b)
    if (b) {
      setExpandedBreed(b)
    }
  }

  // When activeBreed changes externally, auto-expand it
  useEffect(() => {
    if (activeBreed) {
      setExpandedBreed(activeBreed)
    }
  }, [activeBreed])

  const toggleBreed = (breed: string) => {
    setExpandedBreed((prev) => (prev === breed ? null : breed))
  }

  const breedNames = useMemo(() => breeds.map((b) => b.breed), [breeds])

  const totalEvaluations = useMemo(
    () => breeds.reduce((sum, b) => sum + b.count, 0),
    [breeds],
  )

  const maxBreedCount = useMemo(
    () => Math.max(1, ...breeds.map((b) => b.count)),
    [breeds],
  )

  const filteredAndSorted = useMemo(() => {
    let list = breeds
    if (activeBreed) {
      list = list.filter((b) => b.breed.toLowerCase() === activeBreed.toLowerCase())
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((b) => b.breed.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      if (sortMode === 'alpha') {
        return a.breed.localeCompare(b.breed, 'ru')
      }
      return b.count - a.count || a.breed.localeCompare(b.breed, 'ru')
    })
  }, [breeds, searchQuery, activeBreed, sortMode])

  if (breeds.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-charcoal-500">
        Нет данных о породах
      </div>
    )
  }

  const isFiltering = Boolean(searchQuery.trim()) || Boolean(activeBreed)
  const displayed = isFiltering || showAll ? filteredAndSorted : filteredAndSorted.slice(0, 25)

  return (
    <div className="space-y-3">
      {/* Controls: Search, Breed filter dropdown, and Sort */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 justify-between w-full min-w-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Найти породу..."
          />

          <div className="shrink-0 flex items-center gap-1">
            <BreedSearchDropdown
              breeds={breedNames}
              selectedBreed={activeBreed}
              onSelect={handleSelectBreed}
              trigger={
                <button
                  type="button"
                  className={`shrink-0 ${toolbarPillTriggerClass(Boolean(activeBreed))} cursor-pointer`}
                  title="Выбрать породу"
                >
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {activeBreed ? formatBreedSentenceCase(activeBreed) : 'Все породы'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </button>
              }
            />

            {activeBreed && (
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

          {onGradeScopeChange && (
            <ShowJudgeGradeScopeDropdown
              gradeScope={gradeScope}
              onGradeScopeChange={onGradeScopeChange}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setSortMode((prev) => (prev === 'count' ? 'alpha' : 'count'))}
          className="shrink-0 inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-lg border border-old-money-200 bg-white text-xs font-semibold text-charcoal-700 hover:bg-cream-50 hover:border-camel-300 transition-colors cursor-pointer"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-camel-600" />
          <span>
            {sortMode === 'count' ? 'По количеству (Топ)' : 'По алфавиту (А–Я)'}
          </span>
        </button>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="py-8 text-center text-sm text-charcoal-500">
          Породы по запросу «{searchQuery}» не найдены
        </div>
      ) : (
        /* Unified card shell with plaque header matching the site rating */
        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title={
                gradeScope === 'puppy'
                  ? 'ПОРОДЫ В РИНГЕ · ЩЕНКИ И БЭБИ'
                  : gradeScope === 'all'
                    ? 'ПОРОДЫ В РИНГЕ · ВСЕ КЛАССЫ'
                    : 'ПОРОДЫ В РИНГЕ · ВЗРОСЛЫЕ КЛАССЫ'
              }
              count={filteredAndSorted.length}
              countLabel={`${filteredAndSorted.length} пород`}
            />
          }
        >
          <div className="divide-y divide-old-money-100/70">
            {displayed.map((row) => {
              const isExpanded = expandedBreed === row.breed
              const pct = maxBreedCount > 0 ? (row.count / maxBreedCount) * 100 : 0
              const shareOfAll =
                totalEvaluations > 0 ? ((row.count / totalEvaluations) * 100).toFixed(1) : null

              return (
                <div key={row.breed} className="transition-colors">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleBreed(row.breed)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleBreed(row.breed)
                      }
                    }}
                    className={`group relative flex items-center justify-between gap-3 px-3.5 py-3 transition-colors cursor-pointer select-none ${
                      isExpanded ? 'bg-cream-100/60' : 'hover:bg-cream-50/60'
                    }`}
                  >
                    {/* Clean bottom micro-progress bar: no cut-off background block */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-old-money-100/40 pointer-events-none">
                      <div
                        className="h-full bg-camel-400/60 transition-all duration-300 group-hover:bg-camel-600"
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>

                    <div className="relative min-w-0 flex-1 flex items-center gap-2.5">
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-charcoal-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90 text-camel-700' : 'group-hover:text-charcoal-600'
                        }`}
                      />
                      <span className="font-bold text-sm sm:text-[15px] text-charcoal-900 group-hover:text-camel-900 transition-colors">
                        {formatBreedSentenceCase(row.breed)}
                      </span>
                      {shareOfAll && Number(shareOfAll) >= 1 && (
                        <span
                          className="ml-1 text-[11px] text-charcoal-400 font-normal cursor-help hover:text-camel-700 transition-colors"
                          title={`${shareOfAll}% от всех ${gradeScope === 'puppy' ? 'щенков' : 'собак'} в экспертизе судьи`}
                        >
                          ({shareOfAll}%)
                        </span>
                      )}
                    </div>

                    {/* Clean badge without repeating word "Оценок" */}
                    <div className="relative shrink-0 flex items-center">
                      <span
                        className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums transition-colors ${
                          isExpanded
                            ? 'bg-camel-700 text-white shadow-3xs'
                            : 'bg-cream-100/90 text-camel-900 border border-camel-200/80 group-hover:bg-camel-100 group-hover:text-camel-950'
                        }`}
                        title={
                          gradeScope === 'puppy'
                            ? `Щенков в ринге: ${row.count}`
                            : `Оценок в ринге: ${row.count}`
                        }
                      >
                        {row.count}
                      </span>
                    </div>
                  </div>

                  {/* Spoiler: dogs evaluated under this breed */}
                  {isExpanded && (
                    <ShowJudgeBreedDogsList
                      judgeId={judgeId || ''}
                      judgeName={judgeName || ''}
                      breed={row.breed}
                      periodExhibitions={periodExhibitions || []}
                      searchQuery={searchQuery}
                      gradeScope={gradeScope}
                      embedded={true}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {!isFiltering && filteredAndSorted.length > 25 && (
            <div className="p-3 border-t border-old-money-100/70 text-center bg-cream-50/30">
              <button
                type="button"
                onClick={onToggleShowAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-camel-700 bg-white border border-old-money-200 hover:bg-cream-100 hover:text-camel-800 transition-colors cursor-pointer shadow-3xs"
              >
                {showAll
                  ? 'Свернуть список пород'
                  : `Показать все породы (${filteredAndSorted.length})`}
              </button>
            </div>
          )}
        </DoninoColumnShell>
      )}
    </div>
  )
}
