interface SeasonTopSectionSkeletonProps {
  compact?: boolean
}

export function SeasonTopSectionSkeleton({ compact = false }: SeasonTopSectionSkeletonProps) {
  if (compact) {
    return (
      <section
        id="season-top"
        className="home-v2-block home-v2-season-top--compact"
        aria-label="Загрузка рейтингов сезона"
      >
        {/* Top tab mimic */}
        <div className="home-v2-stats-cockpit-tab mb-2.5 flex items-center justify-between animate-pulse">
          <div className="h-4 bg-old-money-200/50 rounded w-48" />
        </div>

        {/* 2-column podium mimic */}
        <div className="home-v2-columns">
          {/* Column 1 */}
          <div className="home-v2-col">
            <div className="home-v2-col-head home-v2-col-head--tabs flex items-center justify-between">
              <div className="h-3.5 bg-old-money-200/50 rounded w-20 animate-pulse" />
              <div className="h-3.5 bg-old-money-200/50 rounded w-28 animate-pulse" />
            </div>
            <div className="donino-home-list" role="list">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[4.25rem] sm:h-[74.25px] border-b border-old-money-100/60 px-3 sm:px-4 py-1 flex items-center justify-between animate-pulse"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-old-money-200/40 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-36 bg-old-money-200/50 rounded" />
                      <div className="h-3 w-20 bg-old-money-200/30 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-14 bg-old-money-200/40 rounded shrink-0" />
                </div>
              ))}
            </div>
            {/* Bottom pager line */}
            <div className="h-[18px] border-t border-old-money-100/60 flex items-center justify-center">
              <div className="h-1 w-12 bg-old-money-200/40 rounded-full" />
            </div>
          </div>

          {/* Column 2 */}
          <div className="home-v2-col hidden md:block">
            <div className="home-v2-col-head home-v2-col-head--tabs flex items-center justify-between">
              <div className="h-3.5 bg-old-money-200/50 rounded w-20 animate-pulse" />
              <div className="h-3.5 bg-old-money-200/50 rounded w-28 animate-pulse" />
            </div>
            <div className="donino-home-list" role="list">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[4.25rem] sm:h-[74.25px] border-b border-old-money-100/60 px-3 sm:px-4 py-1 flex items-center justify-between animate-pulse"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-old-money-200/40 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-36 bg-old-money-200/50 rounded" />
                      <div className="h-3 w-20 bg-old-money-200/30 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-14 bg-old-money-200/40 rounded shrink-0" />
                </div>
              ))}
            </div>
            {/* Bottom pager line */}
            <div className="h-[18px] border-t border-old-money-100/60 flex items-center justify-center">
              <div className="h-1 w-12 bg-old-money-200/40 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Non-compact (mobile) skeleton
  return (
    <section id="season-top" className="home-v2-block mb-4" aria-label="Загрузка рейтингов сезона">
      <div className="h-9 mb-3 bg-old-money-200/40 rounded-xl animate-pulse w-full max-w-sm" />
      <div className="home-v2-col">
        <div className="home-v2-col-head home-v2-col-head--tabs flex items-center justify-between">
          <div className="h-3.5 bg-old-money-200/50 rounded w-20 animate-pulse" />
          <div className="h-3.5 bg-old-money-200/50 rounded w-28 animate-pulse" />
        </div>
        <div className="donino-home-list" role="list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="min-h-[4.25rem] border-b border-old-money-100/60 px-3 py-2 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-old-money-200/40 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 bg-old-money-200/50 rounded" />
                  <div className="h-3 w-20 bg-old-money-200/30 rounded" />
                </div>
              </div>
              <div className="h-4 w-12 bg-old-money-200/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
