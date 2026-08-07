import type { MedalVariant } from './MedalTally'

interface MedalBadgeProps {
  variant: MedalVariant
  count: number
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_STYLES = {
  sm: 'w-5 h-5 text-[10px]',
  md: 'w-6 h-6 text-xs',
}

const VARIANT_STYLES: Record<MedalVariant, { bg: string; text: string }> = {
  gold: { bg: 'var(--medal-gold-bg)', text: 'var(--medal-gold-text)' },
  silver: { bg: 'var(--medal-silver-bg)', text: 'var(--medal-silver-text)' },
  bronze: { bg: 'var(--medal-bronze-bg)', text: 'var(--medal-bronze-text)' },
}

export default function MedalBadge({ variant, count, size = 'md', className = '' }: MedalBadgeProps) {
  const styles = VARIANT_STYLES[variant]
  const sizeClass = SIZE_STYLES[size]
  const isZero = count === 0

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-bold tabular-nums ${sizeClass} ${className}`}
      style={{
        backgroundColor: isZero ? 'transparent' : styles.bg,
        color: isZero ? 'var(--charcoal-400)' : styles.text,
        border: isZero ? `1px solid ${styles.bg}` : 'none',
      }}
      role="img"
      aria-label={`${variant} medal: ${count}`}
    >
      {count}
    </div>
  )
}
