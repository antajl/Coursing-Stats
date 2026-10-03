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
        className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] w-9 h-9 sm:w-10 sm:h-10 ${className}`}
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

  // Rank 4+: text-based, centered, subtle Old Money rounded badge
  return (
    <div
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center ${className}`}
      aria-label={`Rank ${rank}`}
    >
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cream-200/70 border border-old-money-200/60 text-xs font-bold tabular-nums text-charcoal-700 shadow-2xs">
        {rank}
      </span>
    </div>
  )
}
