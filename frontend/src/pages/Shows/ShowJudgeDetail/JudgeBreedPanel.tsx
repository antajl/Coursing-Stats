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
  if (breeds.length === 0) {
    return <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Нет данных о породах</p>
  }

  return (
    <>
      <div className="mb-2 flex gap-4 text-xs uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
        <span className="flex-1">Порода</span>
        <span className="shrink-0">Оценок</span>
      </div>
      <ul className="divide-y divide-old-money-100 dark:divide-charcoal-700">
        {(showAll ? breeds : breeds.slice(0, 20)).map((row) => (
          <li key={row.breed} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0 text-charcoal-800 dark:text-charcoal-100">{row.breed}</span>
            <span
              className="shrink-0 tabular-nums font-semibold text-charcoal-600 dark:text-charcoal-300"
              title="Записей в протоколах по породе"
            >
              {row.count}
            </span>
          </li>
        ))}
      </ul>
      {breeds.length > 20 && (
        <button
          type="button"
          onClick={onToggleShowAll}
          className="mt-3 text-sm text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300"
        >
          {showAll ? 'Свернуть' : `Показать все (${breeds.length})`}
        </button>
      )}
    </>
  )
}
