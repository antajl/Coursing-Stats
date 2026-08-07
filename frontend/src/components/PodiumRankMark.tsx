export type PodiumPlace = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

const SIZES = {
  sm: 'h-[26px] w-[26px] text-[11px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
} as const

const TONE: Record<PodiumPlace, string> = {
  1: 'placement-badge-gold',
  2: 'placement-badge-silver',
  3: 'placement-badge-bronze',
  4: 'placement-badge-neutral',
  5: 'placement-badge-neutral',
  6: 'placement-badge-neutral',
  7: 'placement-badge-neutral',
  8: 'placement-badge-neutral',
  9: 'placement-badge-neutral',
  10: 'placement-badge-neutral',
}

/** Место 1–10: круглый бейдж в палитре сайта (как PlacementBadge). */
export default function PodiumRankMark({
  place,
  size = 'md',
  className = '',
  muted = false,
}: {
  place: PodiumPlace
  size?: keyof typeof SIZES
  className?: string
  muted?: boolean
}) {
  return (
    <span
      className={[
        TONE[place],
        SIZES[size],
        'inline-flex shrink-0 items-center justify-center rounded-full border-2 font-bold tabular-nums leading-none',
        muted ? 'opacity-25' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={`${place}-е место`}
      title={`${place}-е место`}
    >
      {place}
    </span>
  )
}
