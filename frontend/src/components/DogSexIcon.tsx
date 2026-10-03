import { Mars, Venus } from 'lucide-react'

interface DogSexIconProps {
  sex: string
  className?: string
  size?: number
}

export default function DogSexIcon({ sex, className = '', size = 16 }: DogSexIconProps) {
  const s = sex.trim().toLowerCase()
  if (s === 'сука' || s === 'с' || s === 'female' || s === 'f') {
    return (
      <Venus
        size={size}
        strokeWidth={2}
        className={`shrink-0 text-rose-400 ${className}`}
        aria-label="Сука"
        title="Сука"
      />
    )
  }

  if (s === 'кобель' || s === 'к' || s === 'male' || s === 'm') {
    return (
      <Mars
        size={size}
        strokeWidth={2}
        className={`shrink-0 text-slate-500 ${className}`}
        aria-label="Кобель"
        title="Кобель"
      />
    )
  }

  return null
}
