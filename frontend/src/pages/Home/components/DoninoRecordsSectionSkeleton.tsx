export function DoninoRecordsSectionSkeleton() {
  return (
    <div className="home-v2-col">
      <div className="home-v2-col-head">
        <div className="h-4 bg-muted animate-pulse rounded w-20" />
      </div>
      <div className="donino-home-list" role="list" aria-label="Загрузка рекордов">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}
