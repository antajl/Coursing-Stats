interface SpeedStatusBadgeProps {
  variant: 'new' | 'upd'
}

const badgeBase =
  'absolute -right-2 -top-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-md border'

export default function SpeedStatusBadge({ variant }: SpeedStatusBadgeProps) {
  if (variant === 'new') {
    return (
      <span
        className={`${badgeBase} border-green-700 bg-green-600 text-white dark:border-green-500 dark:bg-green-500 dark:text-white`}
      >
        new
      </span>
    )
  }

  return (
    <span
      className={`${badgeBase} border-blue-700 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-500 dark:text-white`}
    >
      upd
    </span>
  )
}
