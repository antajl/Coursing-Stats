interface MetricsSkeletonProps {
  variant?: 'full' | 'events' | 'metrics'
}

export default function MetricsSkeleton({ variant = 'full' }: MetricsSkeletonProps) {
  if (variant === 'events') {
    return (
      <div className="bg-gradient-to-br from-camel-100/95 to-cream-50/95 dark:from-camel-900/80 dark:to-charcoal-800/80 backdrop-blur-md rounded-xl p-4 md:p-5 border border-camel-200/50 dark:border-camel-700/50">
        <div className="flex items-center justify-center mb-3 pb-3 border-b border-charcoal-200 dark:border-charcoal-700">
          <div className="h-4 w-32 bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-start">
          <div className="flex-1 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 p-1.5">
                <div className="h-3 w-12 bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-px bg-charcoal-200 dark:bg-charcoal-700 mx-2 self-stretch hidden md:block" />
          <div className="flex-1 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 p-1.5">
                <div className="h-3 w-12 bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'metrics') {
    return (
      <div className="flex flex-col gap-3 md:gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gradient-to-br from-camel-100/95 to-cream-50/95 dark:from-camel-900/80 dark:to-charcoal-800/80 backdrop-blur-md rounded-xl p-4 md:p-5 border border-camel-200/50 dark:border-camel-700/50">
            <div className="flex items-center justify-center mb-3 pb-3 border-b border-charcoal-200 dark:border-charcoal-700">
              <div className="h-4 w-24 bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-0 items-center relative">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex flex-col items-center px-4 md:px-6">
                  <div className="h-6 w-12 bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-charcoal-200 dark:bg-charcoal-700 rounded animate-pulse" />
                </div>
              ))}
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-charcoal-200 dark:bg-charcoal-700" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-charcoal-200 dark:bg-charcoal-700" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch">
      <MetricsSkeleton variant="events" />
      <MetricsSkeleton variant="metrics" />
    </div>
  )
}
