import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useYandexGoal } from './YandexMetrica'

interface ProcoursingEventLinkProps {
  eventId: number | string
  procoursingUrl?: string | null
  className?: string
  title?: string
  children: ReactNode
}

/** Ссылка на протокол: `/event/:id` в проде и DEV, procoursing.ru как fallback. */
export default function ProcoursingEventLink({
  eventId,
  procoursingUrl,
  className,
  title,
  children,
}: ProcoursingEventLinkProps) {
  const { reachGoal } = useYandexGoal()

  const handleClick = () => {
    if (procoursingUrl) {
      reachGoal('procoursing_link')
    }
  }

  // Внутренняя страница результатов
  return (
    <Link to={`/event/${eventId}`} className={className} title={title ?? 'Результаты соревнования'}>
      {children}
    </Link>
  )
}
