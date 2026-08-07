export default function SkeletonLoader({
  message = 'Загрузка...',
  variant = 'default',
  count = 1,
}: {
  message?: string
  variant?: 'default' | 'card'
  count?: number
}) {
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-old-money-200 bg-white p-4 dark:border-charcoal-600 dark:bg-charcoal-800"
          >
            <div className="cs-skeleton-shimmer mb-3 h-4 w-3/4 rounded" />
            <div className="cs-skeleton-shimmer h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-old-money-300 border-t-camel-500 dark:border-charcoal-600 dark:border-t-camel-400" />
      <p className="text-sm text-old-money-500 dark:text-old-money-400">{message}</p>
    </div>
  )
}
