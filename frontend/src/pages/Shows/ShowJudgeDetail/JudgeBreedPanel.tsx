import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpDown, ChevronDown, ChevronRight, X } from 'lucide-react'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import { formatBreedSentenceCase } from '../../../lib/breedMapping'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'
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
}: {
  breeds: BreedRow[]
  showAll: boolean
  onToggleShowAll: () => void
  judgeId?: string
  judgeName?: string
  periodExhibitions?: ExhibitionItem[]
  selectedBreed?: string
  onSelectBreed?: (breed: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<'count' | 'alpha'>('count')
  const [internalBreed, setInternalBreed] = useState('')

  const activeBreed = selectedBreed !== undefined ? selectedBreed : internalBreed
  const handleSelectBreed = (b: string) => {
    if (onSelectBreed) onSelectBreed(b)
    else setInternalBreed(b)
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
    const q = searchQuery.trim().toLowerCase()
    if (q && !activeBreed) {
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

  const isFiltering = Boolean(searchQuery.trim()) && !activeBreed
  const displayed = isFiltering || showAll ? filteredAndSorted : filteredAndSorted.slice(0, 25)

  return (
    <div className="space-y-4">
      {/* Controls: Search, Breed filter dropdown, and Sort */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 justify-between w-full min-w-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={activeBreed ? 'Поиск по кличке собаки...' : 'Найти породу...'}
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
        </div>

        {!activeBreed && (
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
        )}
      </div>

      {/* Main content: Selected breed dogs list OR table of all breeds */}
      {activeBreed ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => handleSelectBreed('')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-camel-700 hover:text-camel-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Назад ко всем породам ({breeds.length})</span>
            </button>
            <span className="text-xs text-charcoal-500">
              Оценок в ринге:{' '}
              <strong className="font-bold text-charcoal-900">
                {breeds.find((b) => b.breed === activeBreed)?.count || '—'}
              </strong>
            </span>
          </div>

          <ShowJudgeBreedDogsList
            judgeId={judgeId || ''}
            judgeName={judgeName || ''}
            breed={activeBreed}
            periodExhibitions={periodExhibitions || []}
            searchQuery={searchQuery}
          />
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="py-8 text-center text-sm text-charcoal-500">
          Породы по запросу «{searchQuery}» не найдены
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="hidden sm:flex items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">
            <span>Порода (нажмите для просмотра собак)</span>
            <span>Оценок в ринге</span>
          </div>

          <div className="divide-y divide-old-money-100/70 rounded-xl border border-old-money-200/80 bg-white overflow-hidden shadow-2xs">
            {displayed.map((row) => {
              const pct = maxBreedCount > 0 ? (row.count / maxBreedCount) * 100 : 0
              const shareOfAll = totalEvaluations > 0 ? ((row.count / totalEvaluations) * 100).toFixed(1) : null

              return (
                <button
                  type="button"
                  key={row.breed}
                  onClick={() => handleSelectBreed(row.breed)}
                  className="group relative flex w-full items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-cream-50/80 transition-colors text-left cursor-pointer"
                >
                  {/* Subtle bar indicator */}
                  <div
                    className="absolute inset-y-0 left-0 bg-camel-100/35 transition-all group-hover:bg-camel-200/40 pointer-events-none"
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />

                  <div className="relative min-w-0 flex-1">
                    <span className="font-medium text-sm text-charcoal-900 group-hover:text-camel-900 transition-colors">
                      {formatBreedSentenceCase(row.breed)}
                    </span>
                    {shareOfAll && Number(shareOfAll) >= 1 && (
                      <span className="ml-2 text-[11px] text-charcoal-400 font-normal">
                        ({shareOfAll}%)
                      </span>
                    )}
                  </div>

                  <div className="relative shrink-0 flex items-center gap-2">
                    <span
                      className="inline-flex min-w-[2.25rem] justify-center rounded-md bg-cream-100/90 px-2 py-0.5 text-xs font-bold tabular-nums text-camel-800"
                      title="Количество оценок по породе"
                    >
                      {row.count}
                    </span>
                    <ChevronRight className="h-4 w-4 text-charcoal-400 group-hover:text-camel-700 transition-colors" />
                  </div>
                </button>
              )
            })}
          </div>

          {!isFiltering && filteredAndSorted.length > 25 && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onToggleShowAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-camel-700 bg-cream-50 border border-old-money-200 hover:bg-cream-100 hover:text-camel-800 transition-colors cursor-pointer"
              >
                {showAll
                  ? 'Свернуть список пород'
                  : `Показать все породы (${filteredAndSorted.length})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
