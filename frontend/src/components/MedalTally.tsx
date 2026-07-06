export type MedalVariant = 'gold' | 'silver' | 'bronze'

const MEDAL_STYLES: Record<MedalVariant, { fill: string; ribbon: string }> = {
  gold: { fill: '#c79c56', ribbon: '#9b6720' },
  silver: { fill: '#bcb7ad', ribbon: '#81796e' },
  bronze: { fill: '#efc8b4', ribbon: '#bb6148' },
}

const MEDAL_SIZES = { sm: 15, md: 19, lg: 22, xl: 26 } as const

const TALLY_STYLES: Record<
  keyof typeof MEDAL_SIZES,
  { count: string; rowGap: string; itemGap: string }
> = {
  sm: {
    count: 'text-xs font-semibold tabular-nums',
    rowGap: 'gap-x-2',
    itemGap: 'gap-1',
  },
  md: {
    count: 'text-sm font-semibold tabular-nums',
    rowGap: 'gap-x-2.5',
    itemGap: 'gap-1',
  },
  lg: {
    count: 'text-sm font-bold tabular-nums',
    rowGap: 'gap-x-3',
    itemGap: 'gap-1.5',
  },
  xl: {
    count:
      'text-base font-bold tabular-nums text-old-money-800 dark:text-old-money-200',
    rowGap: 'gap-x-3.5',
    itemGap: 'gap-1.5',
  },
}

export function MedalIcon({
  variant,
  size = 'md',
}: {
  variant: MedalVariant
  size?: keyof typeof MEDAL_SIZES
}) {
  const { fill, ribbon } = MEDAL_STYLES[variant]
  const px = MEDAL_SIZES[size]
  return (
    <svg width={px} height={px} viewBox="0 0 16 16" className="shrink-0" aria-hidden>
      <path d="M5.5 9.5 4 14.5h8L10.5 9.5" fill={ribbon} />
      <circle cx="8" cy="6" r="4.25" fill={fill} stroke={ribbon} strokeWidth="0.75" />
      <circle cx="8" cy="6" r="2.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
    </svg>
  )
}

interface MedalTallyProps {
  gold?: number
  silver?: number
  bronze?: number
  className?: string
  size?: keyof typeof MEDAL_SIZES
  showZero?: boolean
  /** Одна строка — для подиума, чтобы карточки не разъезжались по высоте */
  nowrap?: boolean
}

export default function MedalTally({
  gold = 0,
  silver = 0,
  bronze = 0,
  className = '',
  size = 'md',
  showZero = false,
  nowrap = false,
}: MedalTallyProps) {
  const items: { variant: MedalVariant; count: number }[] = [
    { variant: 'gold' as const, count: gold },
    { variant: 'silver' as const, count: silver },
    { variant: 'bronze' as const, count: bronze },
  ].filter((item) => showZero || item.count > 0)

  const styles = TALLY_STYLES[size]

  if (items.length === 0) {
    return <span className={className}>—</span>
  }

  return (
    <div
      className={`inline-flex items-center justify-center ${nowrap ? 'flex-nowrap' : 'flex-wrap gap-y-1.5'} ${styles.rowGap} ${className}`}
    >
      {items.map(({ variant, count }) => (
        <span key={variant} className={`inline-flex items-center ${styles.itemGap}`}>
          <MedalIcon variant={variant} size={size} />
          <span className={styles.count}>{count}</span>
        </span>
      ))}
    </div>
  )
}

interface MedalCountProps {
  variant: MedalVariant
  count?: number
  size?: keyof typeof MEDAL_SIZES
  className?: string
}

export function MedalCount({ variant, count = 0, size = 'md', className = '' }: MedalCountProps) {
  return (
    <span className={`inline-flex items-center justify-center gap-1.5 ${className}`}>
      <MedalIcon variant={variant} size={size} />
      <span className="font-semibold tabular-nums">{count}</span>
    </span>
  )
}
