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
  if (exhibitions.length === 0) {
    return (
      <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
        {gradeFilter ? 'Нет выставок с этой оценкой за выбранный период' : 'Нет выставок'}
      </p>
    )
  }

  return (
    <>
      <ul className="divide-y divide-old-money-100 dark:divide-charcoal-700">
        {(showAll ? exhibitions : exhibitions.slice(0, 20)).map((ex) => {
          const href = ex.rkf_url || (ex.id ? `https://rkf.online/exhibitions/${ex.id}` : null)
          const gradeN = gradeFilter ? ex.grade_counts?.[gradeFilter] || 0 : 0
          return (
            <li
              key={`${ex.id}-${ex.date}`}
              className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
            >
              <span className="shrink-0 text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400 sm:w-24">
                {formatDate(ex.date)}
              </span>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 text-sm font-medium text-camel-700 hover:underline dark:text-camel-400"
                >
                  {ex.title || `Выставка ${ex.id}`}
                </a>
              ) : (
                <span className="min-w-0 flex-1 text-sm text-charcoal-800 dark:text-charcoal-100">
                  {ex.title || `Выставка ${ex.id}`}
                </span>
              )}
              {gradeFilter && gradeN > 0 && (
                <span className="shrink-0 text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400">
                  {gradeN}
                </span>
              )}
            </li>
          )
        })}
      </ul>
      {exhibitions.length > 20 && (
        <button
          type="button"
          onClick={onToggleShowAll}
          className="mt-3 text-sm text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
        >
          {showAll ? 'Свернуть' : `Показать все (${exhibitions.length})`}
        </button>
      )}
    </>
  )
}
