import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { localEventPath } from '../lib/env'

interface ProcoursingEventLinkProps {
  eventId: number | string
  procoursingUrl?: string | null
  className?: string
  title?: string
  children: ReactNode
}

/** Ссылка на протокол: procoursing.ru на проде, /admin/event в dev. */
export default function ProcoursingEventLink({
  eventId,
  procoursingUrl,
  className,
  title,
  children,
}: ProcoursingEventLinkProps) {
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
