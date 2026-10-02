import { useMemo, useState } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'
import { formatBreedSentenceCase } from '../../../lib/breedMapping'

type BreedRow = { breed: string; count: number }

export function JudgeBreedPanel({
  breeds,
  showAll,
  onToggleShowAll,
}: {
  breeds: BreedRow[]
  showAll: boolean
  onToggleShowAll: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<'count' | 'alpha'>('count')

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
    if (q) {
      list = list.filter((b) => b.breed.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      if (sortMode === 'alpha') {
        return a.breed.localeCompare(b.breed, 'ru')
      }
      return b.count - a.count || a.breed.localeCompare(b.breed, 'ru')
    })
  }, [breeds, searchQuery, sortMode])

  if (breeds.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-charcoal-500">
        Нет данных о породах
      </div>
    )
  }

  const isFiltering = Boolean(searchQuery.trim())
  const displayed = isFiltering || showAll ? filteredAndSorted : filteredAndSorted.slice(0, 25)

  return (
    <div className="space-y-4">
      {/* Controls: search and sort */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти породу..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-old-money-200/90 bg-cream-50/60 text-sm text-charcoal-800 placeholder-charcoal-400 hover:border-camel-300 focus:border-camel-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel-100 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-charcoal-400 hover:text-charcoal-700"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSortMode((prev) => (prev === 'count' ? 'alpha' : 'count'))}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg border border-old-money-200 bg-white text-xs font-semibold text-charcoal-700 hover:bg-cream-50 hover:border-camel-300 transition-colors"
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
        <div className="space-y-1.5">
          <div className="hidden sm:flex items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">
            <span>Порода</span>
            <span>Оценок в ринге</span>
          </div>

          <div className="divide-y divide-old-money-100/70 rounded-xl border border-old-money-200/80 bg-white overflow-hidden shadow-2xs">
            {displayed.map((row) => {
              const pct = maxBreedCount > 0 ? (row.count / maxBreedCount) * 100 : 0
              const shareOfAll = totalEvaluations > 0 ? ((row.count / totalEvaluations) * 100).toFixed(1) : null

              return (
                <div
                  key={row.breed}
                  className="group relative flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-cream-50/60 transition-colors"
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
                  </div>
                </div>
              )
            })}
          </div>

          {!isFiltering && filteredAndSorted.length > 25 && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onToggleShowAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-camel-700 bg-cream-50 border border-old-money-200 hover:bg-cream-100 hover:text-camel-800 transition-colors"
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
