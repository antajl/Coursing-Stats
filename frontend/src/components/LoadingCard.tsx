interface LoadingCardProps {
  count?: number;
  height?: string;
  variant?: 'card' | 'list' | 'profile' | 'table';
}

export default function LoadingCard({ count = 1, height = 'h-36', variant = 'card' }: LoadingCardProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-xl border border-old-money-200 bg-cream-50 dark:border-charcoal-600 dark:bg-charcoal-800 animate-pulse"
            aria-hidden="true"
          >
            <div className="w-10 h-10 rounded-full bg-old-money-300 dark:bg-charcoal-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-old-money-300 dark:bg-charcoal-700" />
              <div className="h-3 w-1/2 rounded bg-old-money-300 dark:bg-charcoal-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="space-y-4 p-4 rounded-xl border border-old-money-200 bg-cream-50 dark:border-charcoal-600 dark:bg-charcoal-800 animate-pulse" aria-hidden="true">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-old-money-300 dark:bg-charcoal-700" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/2 rounded bg-old-money-300 dark:bg-charcoal-700" />
            <div className="h-4 w-1/3 rounded bg-old-money-300 dark:bg-charcoal-700" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-old-money-300 dark:bg-charcoal-700" />
          <div className="h-4 w-5/6 rounded bg-old-money-300 dark:bg-charcoal-700" />
          <div className="h-4 w-4/6 rounded bg-old-money-300 dark:bg-charcoal-700" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-2" aria-hidden="true">
        <div className="flex gap-4 p-3 border-b border-old-money-200 dark:border-charcoal-600">
          <div className="h-4 w-1/4 rounded bg-old-money-300 dark:bg-charcoal-700 animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-old-money-300 dark:bg-charcoal-700 animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-old-money-300 dark:bg-charcoal-700 animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-old-money-300 dark:bg-charcoal-700 animate-pulse" />
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i}
            className="flex gap-4 p-3 border-b border-old-money-200 dark:border-charcoal-600 animate-pulse"
          >
            <div className="h-4 w-1/4 rounded bg-old-money-300 dark:bg-charcoal-700" />
            <div className="h-4 w-1/4 rounded bg-old-money-300 dark:bg-charcoal-700" />
            <div className="h-4 w-1/4 rounded bg-old-money-300 dark:bg-charcoal-700" />
            <div className="h-4 w-1/4 rounded bg-old-money-300 dark:bg-charcoal-700" />
          </div>
        ))}
      </div>
    );
  }

  // Default card variant
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className={`${height} rounded-xl border border-old-money-200 bg-cream-50 dark:border-charcoal-600 dark:bg-charcoal-800 animate-pulse`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
