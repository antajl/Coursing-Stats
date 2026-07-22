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

/** Ссылка на протокол: procoursing.ru на проде, `/event/:id` в локальном Vite DEV. */
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

  if (localEventPath) {
    return (
      <Link to={`${localEventPath}/${eventId}`} className={className} title={title}>
        {children}
      </Link>
    )
  }

  if (procoursingUrl) {
    return (
      <a
        href={procoursingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={title ?? 'Результаты на procoursing.ru'}
        onClick={handleClick}
      >
        {children}
      </a>
    )
  }

  return (
    <div className={className} title={title}>
      {children}
    </div>
  )
}
