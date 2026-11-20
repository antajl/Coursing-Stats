import { Link } from 'react-router-dom'
import DogSexIcon from '../../../components/DogSexIcon'
import MedalBadge from '../../../components/MedalBadge'
import { parseDogName } from '../../../lib/dogName'
import { formatRecordDate } from '../../../lib/recordDates'
import { breedToSlug } from '../../../lib/breedMapping'
import type { AnnualDogLeader } from '../../../hooks/useStaticData'
import type { AnnualDoninoLeader } from '../../../lib/doninoAnnualLeaders'

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
  const tabParam = isRacing ? 'racing' : 'coursing'
  const slug = breedToSlug(canonicalKey)

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
      {items.map((item) => {
        const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
        const isMale = item.sex === 'M' || item.sex === 'К'
        const isFemale = item.sex === 'F' || item.sex === 'С'
        const sexVal = isMale ? 'm' : isFemale ? 'f' : ''

        return (
          <li key={item.year} className="p-3 flex flex-col gap-1.5 hover:bg-cream-50/60 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(slug)}&tab=${tabParam}`}
                className="px-2.5 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 shrink-0 transition-all shadow-2xs cursor-pointer"
                title={`Открыть рейтинг ${item.year} года`}
              >
                {item.year}
              </Link>

              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Link
                  to={`/dog/${item.dog_id}/`}
                  className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate text-sm"
                  title={primary}
                >
                  {primary}
                </Link>
                {sexVal && (
                  <span title={isMale ? 'Кобель' : 'Сука'} className="inline-flex shrink-0">
                    <DogSexIcon sex={sexVal} size={12} variant="colored" />
                  </span>
                )}
              </div>
            </div>

            {secondary && (
              <div className="text-[11px] text-charcoal-500 pl-0.5 truncate" title={secondary}>
                {secondary}
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-old-money-100/70 font-sans tabular-nums">
              <div className="text-left text-[11px] text-charcoal-600 font-medium flex items-center gap-1">
                <span>{item.total_starts} заб.</span>
                {isRacing && item.best_speed && (
                  <>
                    <span className="text-charcoal-400">·</span>
                    <span className="inline-flex items-baseline gap-0.5 font-bold text-charcoal-900 text-xs">
                      <span>{item.best_speed.toFixed(1)}</span>
                      <span className="text-[10px] font-normal text-charcoal-500">км/ч</span>
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-end gap-1">
                <MedalBadge variant="gold" count={item.gold || 0} size="sm" />
                <MedalBadge variant="silver" count={item.silver || 0} size="sm" />
                <MedalBadge variant="bronze" count={item.bronze || 0} size="sm" />
              </div>
            </div>
          </li>
        )
      })}
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
  const slug = breedToSlug(canonicalKey)

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-old-money-600 px-4">
        <p>В открытых протоколах тренировочного комплекса Донино заездов породы пока не зафиксировано.</p>
      </div>
    )
  }

  return (
    <ol className="divide-y divide-old-money-100 text-sm">
      {items.map((item) => {
        const isMale = item.sex === 'M' || item.sex === 'К'
        const isFemale = item.sex === 'F' || item.sex === 'С'
        const sexVal = isMale ? 'm' : isFemale ? 'f' : ''

        return (
          <li key={item.year} className="p-3 flex flex-col gap-1.5 hover:bg-cream-50/60 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to={`/speed-records/${item.year}/?breed=${encodeURIComponent(slug)}`}
                className="px-2.5 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 shrink-0 transition-all shadow-2xs cursor-pointer"
                title={`Открыть рекорды Донино (${item.year} г.)`}
              >
                {item.year}
              </Link>

              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Link
                  to={`/donino-dog/${encodeURIComponent(item.name)}/${encodeURIComponent(item.breed || breedNameRu)}/`}
                  state={{ from: 'speed-records' }}
                  className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate text-sm"
                  title={item.name}
                >
                  {item.name}
                </Link>
                {sexVal && (
                  <span title={isMale ? 'Кобель' : 'Сука'} className="inline-flex shrink-0">
                    <DogSexIcon sex={sexVal} size={12} variant="colored" />
                  </span>
                )}
              </div>
            </div>

            <div className="text-[11px] text-charcoal-500 pl-0.5 truncate">
              {item.trackType || 'прямая'}{item.bestDate ? ` · ${formatRecordDate(item.bestDate)}` : ''}
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-old-money-100/70 font-sans tabular-nums">
              <div className="text-left text-[11px] text-charcoal-600 font-medium flex items-center gap-1">
                <span>{item.runsCount} зам.</span>
              </div>
              <div className="flex items-center justify-end">
                <span className="inline-flex items-baseline gap-0.5 font-bold text-camel-700 text-xs sm:text-[13px]">
                  <span>{item.bestSpeed.toFixed(1)}</span>
                  <span className="text-[10px] font-normal text-charcoal-500">км/ч</span>
                </span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
