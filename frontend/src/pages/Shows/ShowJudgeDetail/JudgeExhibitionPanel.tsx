import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAvailableExhibitionIds } from '../../../lib/staticData'
import { matchesSearchText } from '../../../lib/searchEngine'
import { ExternalLink, Calendar, ArrowUpDown } from 'lucide-react'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import { formatDate, compareExhibitionDates, type GradeFilterKey } from './judgeDetailAggregates'

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
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const { data: availableIds } = useQuery({
    queryKey: ['available-exhibitions'],
    queryFn: getAvailableExhibitionIds,
    staleTime: Infinity,
  })

  const filteredAndSorted = useMemo(() => {
    let list = exhibitions
    const q = searchQuery.trim()
    if (q) {
      list = list.filter((ex) =>
        matchesSearchText([ex.title, ex.date, String(ex.id)], q)
      )
    }
    return [...list].sort((a, b) => compareExhibitionDates(a, b, sortOrder))
  }, [exhibitions, searchQuery, sortOrder])

  if (exhibitions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-charcoal-500">
        {gradeFilter ? 'Нет выставок с этой оценкой за выбранный период' : 'Нет выставок'}
      </div>
    )
  }

  const isFiltering = Boolean(searchQuery.trim())
  const displayed = isFiltering || showAll ? filteredAndSorted : filteredAndSorted.slice(0, 25)

  return (
    <div className="space-y-4">
      {/* Controls: Search and Sort — строго в стиле Old Money */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 justify-between w-full min-w-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 max-w-sm">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск по названию или дате..."
          />
        </div>

        <button
          type="button"
          onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          className="shrink-0 inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-lg border border-old-money-200 bg-white text-xs font-semibold text-charcoal-700 hover:bg-cream-50 hover:border-camel-300 transition-colors cursor-pointer"
          title={
            sortOrder === 'desc'
              ? 'Сортировка: сначала новые (нажмите для переключения)'
              : 'Сортировка: сначала старые (нажмите для переключения)'
          }
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-camel-600" />
          <span>{sortOrder === 'desc' ? 'Сначала новые' : 'Сначала старые'}</span>
        </button>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="py-8 text-center text-sm text-charcoal-500">
          Выставки по запросу «{searchQuery}» не найдены
        </div>
      ) : (
        <div className="divide-y divide-old-money-100/70 rounded-xl border border-old-money-200/80 bg-white overflow-hidden shadow-2xs">
          {displayed.map((ex) => {
            const hasLocalPage = Boolean(availableIds && availableIds.has(Number(ex.id)))
            const internalHref = hasLocalPage ? `/shows/exhibition/${ex.id}/` : null
            const rkfHref = ex.rkf_url || (ex.id ? `https://rkf.online/exhibitions/${ex.id}` : null)

            return (
              <div
                key={ex.id}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-cream-50/60 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {internalHref ? (
                      <Link
                        to={internalHref}
                        className="font-medium text-sm text-charcoal-900 hover:text-camel-800 transition-colors truncate"
                      >
                        {ex.title}
                      </Link>
                    ) : (
                      <span className="font-medium text-sm text-charcoal-900 truncate">
                        {ex.title}
                      </span>
                    )}
                    {rkfHref && (
                      <a
                        href={rkfHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-charcoal-400 hover:text-camel-700 transition-colors shrink-0"
                        title="Открыть на сайте РКФ"
                        aria-label="Открыть на сайте РКФ"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(ex.date)}</span>
                  </div>
                </div>

                {gradeFilter && ex.grade_counts?.[gradeFilter] ? (
                  <div className="shrink-0">
                    <span className="inline-flex min-w-[2rem] justify-center rounded-md bg-cream-100 px-2 py-0.5 text-xs font-bold tabular-nums text-camel-800">
                      {ex.grade_counts[gradeFilter]}
                    </span>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {!isFiltering && filteredAndSorted.length > 25 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onToggleShowAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-camel-700 bg-cream-50 border border-old-money-200 hover:bg-cream-100 hover:text-camel-800 transition-colors cursor-pointer"
          >
            {showAll ? 'Свернуть список выставок' : `Показать все выставки (${filteredAndSorted.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
