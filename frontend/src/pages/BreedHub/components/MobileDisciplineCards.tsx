import { memo } from 'react'
import type { AnnualDogLeader, AnnualShowDogLeader } from '../../../hooks/useStaticData'
import type { AnnualDoninoLeader } from '../../../lib/doninoAnnualLeaders'
import {
  DesktopCoursingCell,
  DesktopRacingCell,
  DesktopShowsCacCell,
  DesktopShowsMonoCell,
  DesktopDoninoCell,
} from './DesktopRowCells'

interface MobileDogLeaderCardsProps {
  years?: number[]
  byYear?: Map<number, AnnualDogLeader>
  items?: AnnualDogLeader[]
  mode: 'coursing' | 'racing'
  canonicalKey: string
}

export const MobileDogLeaderCards = memo(function MobileDogLeaderCards({
  years,
  byYear,
  items,
  mode,
  canonicalKey,
}: MobileDogLeaderCardsProps) {
  const isRacing = mode === 'racing'

  // Если переданы годы и карта (по аналогии с десктопом), отображаем полную хронологию включая пустые сезоны
  if (years && byYear) {
    if (years.length === 0) {
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
        {years.map((year) => {
          const item = byYear.get(year)
          return (
            <li
              key={year}
              className="px-3 py-2 min-h-[52px] flex items-center hover:bg-cream-50/60 transition-colors"
            >
              {isRacing ? (
                <DesktopRacingCell
                  item={item}
                  year={year}
                  canonicalKey={canonicalKey}
                />
              ) : (
                <DesktopCoursingCell
                  item={item}
                  year={year}
                  canonicalKey={canonicalKey}
                />
              )}
            </li>
          )
        })}
      </ol>
    )
  }

  const list = items || []
  if (list.length === 0) {
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
      {list.map((item) => (
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
})

interface MobileDoninoCardsProps {
  years?: number[]
  byYear?: Map<number, AnnualDoninoLeader>
  items?: AnnualDoninoLeader[]
  canonicalKey: string
  breedNameRu: string
}

export const MobileDoninoCards = memo(function MobileDoninoCards({
  years,
  byYear,
  items,
  canonicalKey,
  breedNameRu,
}: MobileDoninoCardsProps) {
  // Если переданы годы и карта (по аналогии с десктопом), отображаем полную хронологию включая пустые сезоны
  if (years && byYear) {
    if (years.length === 0) {
      return (
        <div className="py-8 text-center text-xs text-old-money-600 px-4">
          <p>В открытых протоколах тренировочного комплекса Донино заездов породы пока не зафиксировано.</p>
        </div>
      )
    }

    return (
      <ol className="divide-y divide-old-money-100 text-sm">
        {years.map((year) => {
          const item = byYear.get(year)
          return (
            <li
              key={year}
              className="px-3 py-2 min-h-[52px] flex items-center hover:bg-cream-50/60 transition-colors"
            >
              <DesktopDoninoCell
                item={item}
                year={year}
                canonicalKey={canonicalKey}
                breedNameRu={breedNameRu}
              />
            </li>
          )
        })}
      </ol>
    )
  }

  const list = items || []
  if (list.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-old-money-600 px-4">
        <p>В открытых протоколах тренировочного комплекса Донино заездов породы пока не зафиксировано.</p>
      </div>
    )
  }

  return (
    <ol className="divide-y divide-old-money-100 text-sm">
      {list.map((item) => (
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
})

interface MobileShowLeaderCardsProps {
  years?: number[]
  byYear?: Map<number, AnnualShowDogLeader>
  items?: AnnualShowDogLeader[]
  mode: 'shows_cac' | 'shows_mono'
  canonicalKey: string
}

export const MobileShowLeaderCards = memo(function MobileShowLeaderCards({
  years,
  byYear,
  items,
  mode,
  canonicalKey,
}: MobileShowLeaderCardsProps) {
  const isMono = mode === 'shows_mono'

  if (years && byYear) {
    if (years.length === 0) {
      return (
        <div className="py-8 text-center text-xs text-old-money-600 px-4">
          <p>
            {isMono
              ? 'В архиве монопородных выставок НКП результатов породы пока не зафиксировано.'
              : 'В открытых отчетах выставок РКФ результатов породы пока не зафиксировано.'}
          </p>
        </div>
      )
    }

    return (
      <ol className="divide-y divide-old-money-100 text-sm">
        {years.map((year) => {
          const item = byYear.get(year)
          return (
            <li
              key={year}
              className="px-3 py-2 min-h-[52px] flex items-center hover:bg-cream-50/60 transition-colors"
            >
              {isMono ? (
                <DesktopShowsMonoCell
                  item={item}
                  year={year}
                  canonicalKey={canonicalKey}
                />
              ) : (
                <DesktopShowsCacCell
                  item={item}
                  year={year}
                  canonicalKey={canonicalKey}
                />
              )}
            </li>
          )
        })}
      </ol>
    )
  }

  const list = items || []
  if (list.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-old-money-600 px-4">
        <p>
          {isMono
            ? 'В архиве монопородных выставок НКП результатов породы пока не зафиксировано.'
            : 'В открытых отчетах выставок РКФ результатов породы пока не зафиксировано.'}
        </p>
      </div>
    )
  }

  return (
    <ol className="divide-y divide-old-money-100 text-sm">
      {list.map((item) => (
        <li
          key={item.year}
          className="px-3 py-2 min-h-[52px] flex items-center hover:bg-cream-50/60 transition-colors"
        >
          {isMono ? (
            <DesktopShowsMonoCell
              item={item}
              year={item.year}
              canonicalKey={canonicalKey}
            />
          ) : (
            <DesktopShowsCacCell
              item={item}
              year={item.year}
              canonicalKey={canonicalKey}
            />
          )}
        </li>
      ))}
    </ol>
  )
})
