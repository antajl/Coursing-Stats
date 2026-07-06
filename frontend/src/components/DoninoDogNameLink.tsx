import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'

interface DoninoDogNameLinkProps {
  name: string
  breed: string
  from?: string
  className?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

const baseClassName =
  'font-semibold text-camel-700 dark:text-camel-400 underline decoration-camel-400/60 underline-offset-2 transition-colors hover:text-camel-800 dark:hover:text-camel-300 hover:decoration-camel-600 dark:hover:decoration-camel-400'

export default function DoninoDogNameLink({ name, breed, from, className = '', onClick }: DoninoDogNameLinkProps) {
  return (
    <Link
      to={`/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`}
      state={from ? { from } : undefined}
      className={`${baseClassName} ${className}`.trim()}
      onClick={onClick}
    >
      {name}
    </Link>
  )
}
