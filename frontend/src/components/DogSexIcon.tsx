import { Mars, Venus } from 'lucide-react'

interface DogSexIconProps {
  sex: string
  className?: string
  size?: number
  strokeWidth?: number
  variant?: 'colored' | 'neutral'
}

export default function DogSexIcon({
  sex,
  className = '',
  size = 16,
  strokeWidth = 2,
  variant = 'colored',
}: DogSexIconProps) {
  const s = sex.trim().toLowerCase()
  const isFemale = s === 'сука' || s === 'с' || s === 'female' || s === 'f'
  const isMale = s === 'кобель' || s === 'к' || s === 'male' || s === 'm'

  if (!isFemale && !isMale) return null

  const hasCustomTextColor = /\btext-/.test(className)
  const colorClass = hasCustomTextColor
    ? ''
    : variant === 'neutral'
      ? 'text-charcoal-500'
      : isFemale
        ? 'text-rose-400'
        : 'text-slate-500'

  const mergedClass = `shrink-0 ${colorClass} ${className}`.trim().replace(/\s+/g, ' ')

  if (isFemale) {
    return (
      <Venus
        size={size}
        strokeWidth={strokeWidth}
        className={mergedClass}
        aria-label="Сука"
        title="Сука"
      />
    )
  }

  return (
    <Mars
      size={size}
      strokeWidth={strokeWidth}
      className={mergedClass}
      aria-label="Кобель"
      title="Кобель"
    />
  )
}
