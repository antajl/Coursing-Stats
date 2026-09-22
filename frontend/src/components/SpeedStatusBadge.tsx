interface SpeedStatusBadgeProps {
  variant: 'new' | 'upd'
}

const badgeBase =
  'absolute -right-1 -top-1 rounded-sm px-1 py-px text-[8px] font-bold uppercase leading-none tracking-tight shadow-sm border'

export default function SpeedStatusBadge({ variant }: SpeedStatusBadgeProps) {
  if (variant === 'new') {
    return (
      <span
        className={`${badgeBase} border-green-700 bg-green-600 text-white`}
      >
        new
      </span>
    )
  }

  return (
    <span
      className={`${badgeBase} border-blue-700 bg-blue-600 text-white`}
    >
      upd
    </span>
  )
}
