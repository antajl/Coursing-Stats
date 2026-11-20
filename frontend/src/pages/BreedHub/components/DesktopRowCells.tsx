import { Link } from 'react-router-dom'
import DogSexIcon from '../../../components/DogSexIcon'
import MedalBadge from '../../../components/MedalBadge'
import { parseDogName } from '../../../lib/dogName'
import { formatRecordDate } from '../../../lib/recordDates'
import { breedToSlug } from '../../../lib/breedMapping'
import type { AnnualDogLeader } from '../../../hooks/useStaticData'
import type { AnnualDoninoLeader } from '../../../lib/doninoAnnualLeaders'

interface DesktopCellProps<T> {
  item?: T
  year?: number
  canonicalKey: string
}

function DesktopEmptyCell({ year }: { year?: number }) {
  if (year == null) return null
  return (
    <div className="flex items-center gap-2 w-full min-w-0 opacity-40">
      <div className="w-14 shrink-0 text-center">
        <span className="inline-block px-2 py-0.5 rounded-full font-medium font-sans tabular-nums text-xs text-old-money-400 bg-cream-50 border border-old-money-200/50">
          {year}
        </span>
      </div>
      <div className="flex-1 min-w-0 text-xs text-old-money-400 italic">
        —
      </div>
    </div>
  )
}

export function DesktopCoursingCell({
  item,
  year,
  canonicalKey,
}: DesktopCellProps<AnnualDogLeader>) {
  if (!item) {
    return <DesktopEmptyCell year={year} />
  }

  const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
  const isMale = item.sex === 'M' || item.sex === 'К'
  const isFemale = item.sex === 'F' || item.sex === 'С'
  const sexVal = isMale ? 'm' : isFemale ? 'f' : ''
  const tooltipTitle = `Чемпион курсинга ${item.year} года: ${item.gold} золотых побед из ${item.total_starts} стартов`
  const slug = breedToSlug(canonicalKey)

  return (
    <div className="flex items-center gap-2 w-full min-w-0" title={tooltipTitle}>
      <div className="w-14 shrink-0 text-center">
        <Link
          to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(slug)}&tab=coursing`}
          className="inline-block px-2 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 transition-all shadow-2xs cursor-pointer"
          title={`Открыть рейтинг ${item.year} года`}
        >
          {item.year}
        </Link>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1 min-w-0">
          <Link
            to={`/dog/${item.dog_id}/`}
            className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block text-sm"
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
        {secondary && (
          <span className="text-[11px] text-charcoal-500 block leading-tight truncate" title={secondary}>
            {secondary}
          </span>
        )}
      </div>

      <div className="w-[114px] xl:w-[124px] shrink-0 text-right flex flex-col items-end gap-0.5">
        <div className="text-[11px] font-sans font-medium text-charcoal-600 leading-tight">
          {item.total_starts} заб.
        </div>
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          <MedalBadge variant="gold" count={item.gold || 0} size="sm" />
          <MedalBadge variant="silver" count={item.silver || 0} size="sm" />
          <MedalBadge variant="bronze" count={item.bronze || 0} size="sm" />
        </div>
      </div>
    </div>
  )
}

export function DesktopRacingCell({
  item,
  year,
  canonicalKey,
}: DesktopCellProps<AnnualDogLeader>) {
  if (!item) {
    return <DesktopEmptyCell year={year} />
  }

  const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
  const isMale = item.sex === 'M' || item.sex === 'К'
  const isFemale = item.sex === 'F' || item.sex === 'С'
  const sexVal = isMale ? 'm' : isFemale ? 'f' : ''
  const tooltipTitle = `Чемпион рейсинга ${item.year} года: ${item.gold} золотых побед из ${item.total_starts} стартов${item.best_speed ? `, пиковая скорость ${item.best_speed.toFixed(1)} км/ч` : ''}`
  const slug = breedToSlug(canonicalKey)

  return (
    <div className="flex items-center gap-2 w-full min-w-0" title={tooltipTitle}>
      <div className="w-14 shrink-0 text-center">
        <Link
          to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(slug)}&tab=racing`}
          className="inline-block px-2 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 transition-all shadow-2xs cursor-pointer"
          title={`Открыть рейтинг ${item.year} года`}
        >
          {item.year}
        </Link>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1 min-w-0">
          <Link
            to={`/dog/${item.dog_id}/`}
            className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block text-sm"
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
        {secondary && (
          <span className="text-[11px] text-charcoal-500 block leading-tight truncate" title={secondary}>
            {secondary}
          </span>
        )}
      </div>

      <div className="w-[114px] xl:w-[124px] shrink-0 text-right flex flex-col items-end gap-0.5">
        <div className="flex items-center justify-end gap-1 text-[11px] leading-tight font-sans">
          <span className="text-charcoal-600 font-medium">{item.total_starts} заб.</span>
          {item.best_speed && (
            <>
              <span className="text-charcoal-300">·</span>
              <span className="inline-flex items-baseline gap-0.5 font-bold text-charcoal-900 text-xs">
                <span>{item.best_speed.toFixed(1)}</span>
                <span className="text-[10px] font-normal text-charcoal-500">км/ч</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          <MedalBadge variant="gold" count={item.gold || 0} size="sm" />
          <MedalBadge variant="silver" count={item.silver || 0} size="sm" />
          <MedalBadge variant="bronze" count={item.bronze || 0} size="sm" />
        </div>
      </div>
    </div>
  )
}

interface DesktopDoninoCellProps extends DesktopCellProps<AnnualDoninoLeader> {
  breedNameRu: string
}

export function DesktopDoninoCell({
  item,
  year,
  canonicalKey,
  breedNameRu,
}: DesktopDoninoCellProps) {
  if (!item) {
    return <DesktopEmptyCell year={year} />
  }

  const isMale = item.sex === 'M' || item.sex === 'К'
  const isFemale = item.sex === 'F' || item.sex === 'С'
  const sexVal = isMale ? 'm' : isFemale ? 'f' : ''
  const tooltipTitle = `Лидер скорости Донино ${item.year} года: ${item.bestSpeed.toFixed(1)} км/ч (${item.runsCount} зам.)`
  const slug = breedToSlug(canonicalKey)

  return (
    <div className="flex items-center gap-2 w-full min-w-0" title={tooltipTitle}>
      <div className="w-14 shrink-0 text-center">
        <Link
          to={`/speed-records/${item.year}/?breed=${encodeURIComponent(slug)}`}
          className="inline-block px-2 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 transition-all shadow-2xs cursor-pointer"
          title={`Открыть рекорды Донино (${item.year} г.)`}
        >
          {item.year}
        </Link>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1 min-w-0">
          <Link
            to={`/donino-dog/${encodeURIComponent(item.name)}/${encodeURIComponent(item.breed || breedNameRu)}/`}
            state={{ from: 'speed-records' }}
            className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block text-sm"
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
        <span className="text-[11px] text-charcoal-500 block leading-tight truncate">
          {item.trackType || 'прямая'}{item.bestDate ? ` · ${formatRecordDate(item.bestDate)}` : ''}
        </span>
      </div>

      <div className="w-[114px] xl:w-[124px] shrink-0 text-right flex flex-col items-end gap-0.5">
        <div className="text-[11px] font-sans font-medium text-charcoal-600 leading-tight">
          {item.runsCount} зам.
        </div>
        <div className="flex items-center justify-end">
          <span className="inline-flex items-baseline gap-0.5 font-bold text-camel-700 text-xs sm:text-[13px] tabular-nums">
            <span>{item.bestSpeed.toFixed(1)}</span>
            <span className="text-[10px] font-normal text-charcoal-500">км/ч</span>
          </span>
        </div>
      </div>
    </div>
  )
}
