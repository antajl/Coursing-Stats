import { parseDogName } from '../lib/dogName'

type DogNameLinesProps = {
  name_lat?: string | null
  name_ru?: string | null
  primaryClassName?: string
  secondaryClassName?: string
}

export default function DogNameLines({
  name_lat,
  name_ru,
  primaryClassName = '',
  secondaryClassName = 'text-xs text-old-money-500 dark:text-old-money-400 font-normal',
}: DogNameLinesProps) {
  const { primary, secondary } = parseDogName(name_lat, name_ru)

  return (
    <span className="inline-flex flex-col items-start leading-snug">
      <span className={primaryClassName}>{primary}</span>
      {secondary && <span className={secondaryClassName}>{secondary}</span>}
    </span>
  )
}
