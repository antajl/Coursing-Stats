import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import DogSexIcon from './DogSexIcon'
import OwnerCrownName from './OwnerCrownName'

interface HomeSeasonTopRowProps {
  to: string
  name: string
  breed?: string
  sex?: string
  dogId?: number | null
  meta?: string
  metric: ReactNode
}

export default function HomeSeasonTopRow({
  to,
  name,
  breed,
  sex,
  dogId,
  meta,
  metric,
}: HomeSeasonTopRowProps) {
  const sub = [meta, breed].filter(Boolean).join(' · ')

  return (
    <Link to={to} className="donino-home-row group">
      <div className="donino-home-row-main min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1">
            <OwnerCrownName name={name} breed={breed} dogId={dogId} kind="competition">
              <span
                className="block truncate font-serif text-base font-bold leading-snug text-charcoal-900 dark:text-charcoal-100"
                title={name}
              >
                {name}
              </span>
            </OwnerCrownName>
          </span>
          {sex ? <DogSexIcon sex={sex} /> : null}
        </div>
        {sub ? (
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-old-money-500 dark:text-old-money-400">
            <span className="donino-home-row-breed truncate">{sub}</span>
          </div>
        ) : null}
      </div>
      <div className="relative shrink-0">
        <span className="donino-home-metric">{metric}</span>
      </div>
    </Link>
  )
}
