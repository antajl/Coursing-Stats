import { TrendingUp, TrendingDown } from 'lucide-react'

export function DeltaBadge({
  delta,
  className = '',
}: {
  delta?: number | 'NEW' | null
  className?: string
}) {
  if (!delta) return null

  if (delta === 'NEW') {
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300/80 leading-none shadow-2xs ${className}`}
        title="Новый участник в сезоне"
      >
        NEW
      </span>
    )
  }

  if (typeof delta === 'number' && delta > 0) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/80 tabular-nums leading-none shadow-2xs ${className}`}
        title={`Поднялся на ${delta} ${delta === 1 ? 'позицию' : 'позиции'}`}
      >
        <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />+{delta}
      </span>
    )
  }

  if (typeof delta === 'number' && delta < 0) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300/80 tabular-nums leading-none shadow-2xs ${className}`}
        title={`Опустился на ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'позицию' : 'позиции'}`}
      >
        <TrendingDown className="h-2.5 w-2.5 stroke-[2.5]" />{delta}
      </span>
    )
  }

  return null
}

interface RankBadgeProps {
  rank: number
  delta?: number | 'NEW' | null
  className?: string
  hideDelta?: boolean
}

const RANK_IMAGES = {
  1: {
    src: '/assets/badges/coursing-stats-1.webp',
    srcSet: '/assets/badges/coursing-stats-1-40.webp 1x, /assets/badges/coursing-stats-1.webp 2x',
  },
  2: {
    src: '/assets/badges/coursing-stats-2.webp',
    srcSet: '/assets/badges/coursing-stats-2-40.webp 1x, /assets/badges/coursing-stats-2.webp 2x',
  },
  3: {
    src: '/assets/badges/coursing-stats-3.webp',
    srcSet: '/assets/badges/coursing-stats-3-40.webp 1x, /assets/badges/coursing-stats-3.webp 2x',
  },
}

export default function RankBadge({ rank, delta, className = '', hideDelta = false }: RankBadgeProps) {
  if (rank <= 0) return null

  const deltaElement = !hideDelta && delta ? <DeltaBadge delta={delta} className="mt-0.5" /> : null

  // Top 3: image badge
  if (rank <= 3) {
    const badge = RANK_IMAGES[rank as keyof typeof RANK_IMAGES]
    return (
      <div
        className={`flex flex-col items-center justify-center ${hideDelta ? 'min-h-0 min-w-0' : 'min-h-[36px] sm:min-h-[38px] min-w-[36px] sm:min-w-[38px]'} ${className}`}
        aria-label={`Rank ${rank}`}
      >
        <div className="w-8 h-8 sm:w-8.5 sm:h-8.5">
          <img
            src={badge.src}
            srcSet={badge.srcSet}
            width={34}
            height={28}
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
      className={`${hideDelta ? 'min-h-0 min-w-0' : 'min-h-[36px] sm:min-h-[38px] min-w-[36px] sm:min-w-[38px]'} flex flex-col items-center justify-center ${className}`}
      aria-label={`Rank ${rank}`}
    >
      <span className="inline-flex items-center justify-center w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-cream-200/70 border border-old-money-200/60 text-xs font-bold tabular-nums text-charcoal-700 shadow-2xs">
        {rank}
      </span>
      {deltaElement}
    </div>
  )
}
