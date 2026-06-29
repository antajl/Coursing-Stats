export default function SkeletonLoader({ 
  message = 'Загрузка...', 
  variant = 'default',
  count = 1
}: { 
  message?: string
  variant?: 'default' | 'card'
  count?: number 
}) {
  if (variant === 'card') {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-4 animate-pulse">
            <div className="h-4 bg-old-money-200 dark:bg-charcoal-600 rounded w-3/4 mb-3" />
            <div className="h-3 bg-old-money-100 dark:bg-charcoal-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-8 h-8 border-4 border-old-money-300 border-t-camel-500 rounded-full animate-spin" />
      <p className="text-old-money-500 dark:text-old-money-400 text-sm">{message}</p>
    </div>
  )
}
