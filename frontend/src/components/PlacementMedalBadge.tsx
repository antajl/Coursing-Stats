import React from 'react'

export interface PlacementMedalBadgeProps {
  place?: number | string | null | undefined
  placement?: number | string | null | undefined
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

const SIZES = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-[22px] w-[22px] text-[11px]',
  md: 'h-6 w-6 text-xs',
} as const

/**
 * Возвращает класс медали, идентичный протоколам соревнований:
 * 1-е место: золотая рамочка (placement-badge-gold)
 * 2-е место: серебряная рамочка (placement-badge-silver)
 * 3-е место: бронзовая рамочка (placement-badge-bronze)
 * 4+ место: нейтральная рамочка (placement-badge-neutral)
 */
export function getPlacementToneClass(place: number): string {
  if (place === 1) return 'placement-badge-gold border-2'
  if (place === 2) return 'placement-badge-silver border-2'
  if (place === 3) return 'placement-badge-bronze border-2'
  return 'placement-badge-neutral border border-old-money-400'
}

export function PlacementMedalBadge({
  place,
  placement,
  size = 'xs',
  className = '',
}: PlacementMedalBadgeProps) {
  const raw = place ?? placement
  const num = typeof raw === 'number' ? raw : parseInt(String(raw).replace(/^#/, ''), 10)
  if (!Number.isFinite(num) || num <= 0) return null

  const toneClass = getPlacementToneClass(num)
  const sizeClass = SIZES[size] || SIZES.xs

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums leading-none select-none shadow-3xs ${toneClass} ${sizeClass} ${className}`}
      title={`${num}-е место`}
      aria-label={`${num}-е место`}
    >
      {num}
    </span>
  )
}

export default PlacementMedalBadge
