import type { AnnualDogLeader } from '../../../hooks/useStaticData'
import type { AnnualDoninoLeader } from '../../../lib/doninoAnnualLeaders'
import {
  DesktopCoursingCell,
  DesktopRacingCell,
  DesktopDoninoCell,
} from './DesktopRowCells'

interface MobileDogLeaderCardsProps {
  items: AnnualDogLeader[]
  mode: 'coursing' | 'racing'
  canonicalKey: string
}

export function MobileDogLeaderCards({
  items,
  mode,
  canonicalKey,
}: MobileDogLeaderCardsProps) {
  const isRacing = mode === 'racing'

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-old-money-600 px-4">
        <p>
          {isRacing
            ? 'В открытых протоколах рейсинга с 2018 года забегов породы пока не зафиксировано.'
            : 'В открытых протоколах состязаний с 2015 года забегов породы пока не зафиксировано.'}
        </p>
      </div>
    )
  }

  return (
    <ol className="divide-y divide-old-money-100 text-sm">
      {items.map((item) => (
        <li
          key={item.year}
          className="px-3 py-2 min-h-[52px] flex items-center hover:bg-cream-50/60 transition-colors"
        >
          {isRacing ? (
            <DesktopRacingCell
              item={item}
              year={item.year}
              canonicalKey={canonicalKey}
            />
          ) : (
            <DesktopCoursingCell
              item={item}
              year={item.year}
              canonicalKey={canonicalKey}
            />
          )}
        </li>
      ))}
    </ol>
  )
}

interface MobileDoninoCardsProps {
  items: AnnualDoninoLeader[]
  canonicalKey: string
  breedNameRu: string
}

export function MobileDoninoCards({
  items,
  canonicalKey,
  breedNameRu,
}: MobileDoninoCardsProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-old-money-600 px-4">
        <p>В открытых протоколах тренировочного комплекса Донино заездов породы пока не зафиксировано.</p>
      </div>
    )
  }

  return (
    <ol className="divide-y divide-old-money-100 text-sm">
      {items.map((item) => (
        <li
          key={item.year}
          className="px-3 py-2 min-h-[52px] flex items-center hover:bg-cream-50/60 transition-colors"
        >
          <DesktopDoninoCell
            item={item}
            year={item.year}
            canonicalKey={canonicalKey}
            breedNameRu={breedNameRu}
          />
        </li>
      ))}
    </ol>
  )
}
