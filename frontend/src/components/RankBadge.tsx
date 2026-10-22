import { TrendingUp, TrendingDown } from 'lucide-react'

interface RankBadgeProps {
  rank: number
  delta?: number | 'NEW' | null
  className?: string
}

const RANK_IMAGES = {
  1: '/assets/badges/coursing-stats-1.webp',
  2: '/assets/badges/coursing-stats-2.webp',
  3: '/assets/badges/coursing-stats-3.webp',
}

export default function RankBadge({ rank, delta, className = '' }: RankBadgeProps) {
  if (rank <= 0) return null

  const deltaElement =
    delta === 'NEW' ? (
      <span
        className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300/80 leading-none shadow-2xs"
        title="Новый участник в сезоне"
      >
        NEW
      </span>
    ) : typeof delta === 'number' && delta > 0 ? (
      <span
        className="mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/80 tabular-nums leading-none shadow-2xs"
        title={`Поднялся на ${delta} ${delta === 1 ? 'позицию' : 'позиции'}`}
      >
        <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />+{delta}
      </span>
    ) : typeof delta === 'number' && delta < 0 ? (
      <span
        className="mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300/80 tabular-nums leading-none shadow-2xs"
        title={`Опустился на ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'позицию' : 'позиции'}`}
      >
        <TrendingDown className="h-2.5 w-2.5 stroke-[2.5]" />{delta}
      </span>
    ) : null

  // Top 3: image badge
  if (rank <= 3) {
    const imageSrc = RANK_IMAGES[rank as keyof typeof RANK_IMAGES]
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] ${className}`}
        aria-label={`Rank ${rank}`}
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10">
          <img
            src={imageSrc}
            width={256}
            height={213}
            alt={`Rank ${rank}`}
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
        {deltaElement}
      </div>
    )
  }

  // Rank 4+: text-based, centered, subtle Old Money rounded badge
  return (
    <div
      className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center ${className}`}
      aria-label={`Rank ${rank}`}
    >
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cream-200/70 border border-old-money-200/60 text-xs font-bold tabular-nums text-charcoal-700 shadow-2xs">
        {rank}
      </span>
      {deltaElement}
    </div>
  )
}
