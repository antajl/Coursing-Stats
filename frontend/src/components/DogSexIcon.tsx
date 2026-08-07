import { Mars, Venus } from 'lucide-react'

interface DogSexIconProps {
  sex: string
  className?: string
  size?: number
}

export default function DogSexIcon({ sex, className = '', size = 16 }: DogSexIconProps) {
  if (sex === 'С') {
    return (
      <Venus
        size={size}
        strokeWidth={2}
        className={`shrink-0 text-rose-400 dark:text-rose-500 ${className}`}
        aria-label="Сука"
        title="Сука"
      />
    )
  }

  if (sex === 'К') {
    return (
      <Mars
        size={size}
        strokeWidth={2}
        className={`shrink-0 text-slate-500 dark:text-slate-400 ${className}`}
        aria-label="Кабель"
        title="Кабель"
      />
    )
  }

  return null
}
