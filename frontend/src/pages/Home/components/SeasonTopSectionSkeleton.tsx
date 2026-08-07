export function SeasonTopSectionSkeleton() {
  return (
    <div className="home-v2-col">
      <div className="home-v2-col-head home-v2-col-head--tabs">
        <div className="h-4 bg-muted animate-pulse rounded w-20" />
        <div className="h-6 bg-muted animate-pulse rounded w-32" />
      </div>
      <div className="donino-home-list" role="list" aria-label="Загрузка данных о топ собаках">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}
