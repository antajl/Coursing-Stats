import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ExternalLink, Calendar } from 'lucide-react'
import { formatDate, type GradeFilterKey } from './judgeDetailAggregates'

type ExhibitionRow = {
  id: number
  date: string
  title: string
  rkf_url?: string
  grade_counts?: Partial<Record<GradeFilterKey, number>>
}

export function JudgeExhibitionPanel({
  exhibitions,
  gradeFilter,
  showAll,
  onToggleShowAll,
}: {
  exhibitions: ExhibitionRow[]
  gradeFilter: GradeFilterKey | null
  showAll: boolean
  onToggleShowAll: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return exhibitions
    return exhibitions.filter(
      (ex) =>
        (ex.title && ex.title.toLowerCase().includes(q)) ||
        (ex.date && ex.date.includes(q)) ||
        String(ex.id).includes(q),
    )
  }, [exhibitions, searchQuery])

  if (exhibitions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-charcoal-500">
        {gradeFilter ? 'Нет выставок с этой оценкой за выбранный период' : 'Нет выставок'}
      </div>
    )
  }

  const isFiltering = Boolean(searchQuery.trim())
  const displayed = isFiltering || showAll ? filtered : filtered.slice(0, 25)

  return (
    <div className="space-y-4">
      {/* Search exhibitions */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по названию или дате..."
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-old-money-200 bg-white text-sm text-charcoal-800 placeholder-charcoal-400 focus:border-camel-500 focus:outline-none focus:ring-2 focus:ring-camel-100"
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

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-charcoal-500">
          Выставки по запросу «{searchQuery}» не найдены
        </div>
      ) : (
        <div className="divide-y divide-old-money-100/70 rounded-xl border border-old-money-200/80 bg-white overflow-hidden shadow-2xs">
          {displayed.map((ex) => {
            const internalHref = ex.id ? `/shows/exhibition/${ex.id}` : null
            const rkfHref = ex.rkf_url || (ex.id ? `https://rkf.online/exhibitions/${ex.id}` : null)
            const gradeN = gradeFilter ? ex.grade_counts?.[gradeFilter] || 0 : 0

            return (
              <div
                key={`${ex.id}-${ex.date}`}
                className="flex flex-col gap-1.5 p-3.5 sm:flex-row sm:items-center sm:gap-4 hover:bg-cream-50/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-semibold tabular-nums text-charcoal-500 shrink-0 sm:w-28">
                  <Calendar className="h-3.5 w-3.5 text-camel-600 shrink-0" />
                  <span>{formatDate(ex.date)}</span>
                </div>

                <div className="min-w-0 flex-1">
                  {internalHref ? (
                    <Link
                      to={internalHref}
                      className="font-medium text-sm text-charcoal-900 hover:text-camel-800 transition-colors line-clamp-2"
                    >
                      {ex.title || `Выставка ${ex.id}`}
                    </Link>
                  ) : (
                    <span className="font-medium text-sm text-charcoal-900 line-clamp-2">
                      {ex.title || `Выставка ${ex.id}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {gradeFilter && gradeN > 0 && (
                    <span className="rounded-md bg-cream-100 px-2 py-0.5 text-xs font-bold tabular-nums text-camel-800">
                      {gradeN} оценок
                    </span>
                  )}
                  {rkfHref && (
                    <a
                      href={rkfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-old-money-200/80 bg-white px-2 py-1 text-[11px] font-medium text-charcoal-600 hover:border-camel-300 hover:bg-cream-50 hover:text-camel-800 transition-colors"
                      title="Открыть страницу на RKF.online"
                    >
                      <span>РКФ</span>
                      <ExternalLink className="h-3 w-3 text-charcoal-400" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!isFiltering && filtered.length > 25 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onToggleShowAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-camel-700 bg-cream-50 border border-old-money-200 hover:bg-cream-100 hover:text-camel-800 transition-colors"
          >
            {showAll
              ? 'Свернуть список выставок'
              : `Показать все выставки (${filtered.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
