interface RankBadgeProps {
  rank: number
  className?: string
}

const RANK_IMAGES = {
  1: '/assets/badges/coursing-stats-1.webp',
  2: '/assets/badges/coursing-stats-2.webp',
  3: '/assets/badges/coursing-stats-3.webp',
}

export default function RankBadge({ rank, className = '' }: RankBadgeProps) {
  if (rank <= 0) return null

  // Top 3: image badge
  if (rank <= 3) {
    const imageSrc = RANK_IMAGES[rank as keyof typeof RANK_IMAGES]
    return (
      <div
        className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] w-8 h-8 ${className}`}
        aria-label={`Rank ${rank}`}
      >
        <img
          src={imageSrc}
          alt={`Rank ${rank}`}
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }

  // Rank 4+: text-based, centered, no hash
  return (
    <div
      className={`min-h-[44px] min-w-[44px] w-8 flex items-center justify-center text-center text-sm font-bold tabular-nums text-charcoal-400 dark:text-charcoal-500 ${className}`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </div>
  )
}
