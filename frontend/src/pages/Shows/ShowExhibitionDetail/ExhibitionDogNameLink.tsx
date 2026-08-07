import { Link } from 'react-router-dom'
import { SHOW_AWARD_CHIP_CLASS } from '../../../lib/ShowGradeChip'
import { splitDogNameDisplay, type BreedTitleRow } from '../showExhibitionUtils'
import { exhibitionDogProfilePath } from './exhibitionDetailUtils'

export function ExhibitionDogNameLink({
  dogName,
  breed,
  catalogNumber,
  className = '',
}: {
  dogName: string
  breed: string
  catalogNumber?: number
  className?: string
}) {
  const { ring, name } = splitDogNameDisplay(dogName)
  const href = exhibitionDogProfilePath(dogName, breed)
  const ringLabel =
    catalogNumber != null && catalogNumber > 0
      ? String(catalogNumber)
      : ring

  const content = (
    <>
      {ringLabel ? (
        <span className="mr-1.5 font-mono text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400">
          ({ringLabel})
        </span>
      ) : null}
      {name || dogName || '—'}
    </>
  )

  if (!href) {
    return (
      <span className={`block truncate ${className}`} title={name || dogName}>
        {content}
      </span>
    )
  }

  return (
    <Link
      to={href}
      className={`block truncate transition-colors hover:text-camel-700 hover:underline hover:underline-offset-2 dark:hover:text-camel-400 ${className}`}
      title={name || dogName}
    >
      {content}
    </Link>
  )
}

export function BreedTitleRowView({ row, breed }: { row: BreedTitleRow; breed: string }) {
  return (
    <li className="rounded-md bg-camel-50/80 px-2.5 py-2 text-sm dark:bg-camel-900/20">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={SHOW_AWARD_CHIP_CLASS}>
          {row.title_code}
        </span>
        {row.ring_number > 0 ? (
          <span className="font-mono text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400">
            ({row.ring_number})
          </span>
        ) : null}
        {exhibitionDogProfilePath(row.dog_name, breed) ? (
          <Link
            to={exhibitionDogProfilePath(row.dog_name, breed)!}
            className="font-semibold text-charcoal-900 transition-colors hover:text-camel-700 hover:underline hover:underline-offset-2 dark:text-charcoal-100 dark:hover:text-camel-400"
          >
            {row.dog_name}
          </Link>
        ) : (
          <span className="font-semibold text-charcoal-900 dark:text-charcoal-100">{row.dog_name}</span>
        )}
      </div>
      {row.owner?.trim() ? (
        <div className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
          Судья: {row.owner.trim()}
        </div>
      ) : null}
    </li>
  )
}
