import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { localEventPath } from '../lib/env'
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
    if (procoursingUrl && !localEventPath) {
      reachGoal('procoursing_link')
    }
  }

  // В DEV: локальный admin сервер
  if (localEventPath) {
    return (
      <Link to={`${localEventPath}/${eventId}`} className={className} title={title}>
        {children}
      </Link>
    )
  }

  // В проде: внутренняя страница результатов
  return (
    <Link to={`/event/${eventId}`} className={className} title={title ?? 'Результаты соревнования'}>
      {children}
    </Link>
  )
}
