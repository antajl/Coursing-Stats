import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PlacementBadge from '../components/PlacementBadge'
import QualificationBadges from '../components/QualificationBadges'
import DogSexIcon from '../../../../components/DogSexIcon'
import {
  parseRawScores,
  normalizeBibColorName,
  extractDogSex,
  bibColorStyle,
  bibTextClass,
} from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'
import { normalizeQualificationAndVc } from '../ResultSummary'
import { parseDogName, toDogTitleCase } from '../../../../lib/dogName'
import HoverTooltip from '../../../../components/ui/HoverTooltip'
import type { Result, Heat, RawScores } from '../types'

interface TableProtocolViewProps {
  groupedResults?: Record<string, Result[]>
  sortedGroupKeys?: string[]
  results?: Result[]
  bestTimesByRace?: Record<string, number>
  isRacing?: boolean
}

const CRITERIA_5_LABELS = ['М', 'Р', 'В', 'П', 'Э'] as const
const CRITERIA_TITLES: Record<string, string> = {
  М: 'Маневренность (макс. 20)',
  Р: 'Резвость (макс. 20)',
  В: 'Выносливость (макс. 20)',
  П: 'Преследование (макс. 20)',
  Э: 'Энтузиазм (макс. 20)',
}

const BIB_COLOR_LABELS: Record<string, string> = {
  red: 'Красная попона',
  white: 'Белая попона',
  blue: 'Синяя попона',
  black: 'Чёрная попона',
  yellow: 'Жёлтая попона',
  green: 'Зелёная попона',
}

function breedCountLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} собака`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} собаки`
  return `${count} собак`
}

function getHeatDistance(heat: Heat, rawScores: RawScores | null): number | null {
  if (heat.time && heat.speed_kmh) {
    const t = typeof heat.time === 'number' ? heat.time : parseFloat(String(heat.time))
    if (!isNaN(t) && t > 0) {
      return Math.round((heat.speed_kmh / 3.6) * t)
    }
  }
  return (heat as any).distance || (rawScores as any)?.distance || null
}

/** Компактная плашка забега/заезда (цвет попоны с нанесенным номером забега/заезда) */
function ProtocolHeatBadge({
  heatNumber,
  bibColor,
  bibNumber,
  distance,
}: {
  heatNumber?: number | string | null
  bibColor?: string | null
  bibNumber?: number | string | null
  distance?: number | null
}) {
  const normalized = normalizeBibColorName(bibColor ?? undefined)
  const isRed = normalized === 'red'
  const isBlue = normalized === 'blue'
  const isBlack = normalized === 'black'
  const isWhite = normalized === 'white'
  const isYellow = normalized === 'yellow'
  const isGreen = normalized === 'green'

  const colorClass = isRed
    ? 'bg-rose-600 text-white border-rose-700'
    : isBlue
      ? 'bg-sky-600 text-white border-sky-700'
      : isBlack
        ? 'bg-charcoal-900 text-white border-charcoal-950'
        : isWhite
          ? 'bg-white text-charcoal-900 border-old-money-300'
          : isYellow
            ? 'bg-amber-300 text-charcoal-900 border-amber-400'
            : isGreen
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-old-money-100 text-charcoal-800 border-old-money-300'

  const label = heatNumber != null ? String(heatNumber) : '—'
  const colorName = normalized ? (BIB_COLOR_LABELS[normalized] || normalized) : 'Попона'
  const bibInfo =
    bibNumber != null && String(bibNumber) !== String(heatNumber) ? ` (попона №${bibNumber})` : ''
  const tooltipText = `${colorName}${bibInfo} · Заезд №${label}${distance ? ` (${distance}м)` : ''}`

  return (
    <HoverTooltip label={tooltipText} placement="top" portal delayMs={0}>
      <span className="relative inline-flex items-center justify-center shrink-0">
        <span
          className={`inline-flex items-center justify-center min-w-[1.5rem] h-5.5 rounded px-1.5 py-0.5 text-xs font-mono font-bold cursor-help select-none shrink-0 border shadow-2xs transition-all ${colorClass}`}
          style={!colorClass.includes('bg-') && normalized ? bibColorStyle(normalized) : undefined}
        >
          <span>{label}</span>
        </span>
      </span>
    </HoverTooltip>
  )
}

export default function TableProtocolView({
  groupedResults,
  sortedGroupKeys,
  results,
  bestTimesByRace,
  isRacing = false,
}: TableProtocolViewProps) {
  // Собираем все результаты для точного вычисления максимального числа заездов
  const allResults = useMemo(() => {
    if (results && results.length > 0) return results
    if (groupedResults && sortedGroupKeys) {
      return sortedGroupKeys.flatMap(k => groupedResults[k] || [])
    }
    return []
  }, [results, groupedResults, sortedGroupKeys])

  const maxHeats = Math.max(
    ...allResults.map(r => parseRawScores(r.raw_scores_json)?.heats?.length || 0),
    1
  )

  const renderRow = (result: Result, idx: number) => {
    const rawScores = parseRawScores(result.raw_scores_json)
    const heats = rawScores?.heats || []
    const { primary: formattedDogName, secondary: secondaryDogName } = parseDogName(
      result.name_lat || (result.dog as any)?.name_lat,
      result.name_ru || (result.dog as any)?.name_ru
    )
    const dogSex = extractDogSex(result)

    const isDns = result.status === 'dns' || result.status === 'absent'
    const isDq =
      result.status === 'disqualified' ||
      result.status === 'dismissed' ||
      result.status === 'eliminated' ||
      result.status === 'dnf'
    const statusReason = displayStatusReason(result.status_reason)

    // Нормализация наград: основные титулы идут в награды, а СС (vc) размещается у итогового балла
    const { qualification, vc } = normalizeQualificationAndVc(result)
    const qualTokens = (qualification || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const hasVcToken = qualTokens.some(p => /^(cc|сс)$/i.test(p))
    const cleanQualification = qualTokens.filter(p => !/^(cc|сс)$/i.test(p)).join(', ')
    const showVc = Boolean(vc || hasVcToken)

    const classLabel = result.class_label || (result as any).breed_class?.split(' - ')[1] || '—'

    const rowBg = isDns
      ? 'bg-old-money-50/60 opacity-60'
      : isDq
        ? 'bg-rose-50/30'
        : idx % 2 === 1
          ? 'bg-cream-50/40'
          : 'bg-white'

    return (
      <tr key={`${result.dog_id || 'unk'}-${result.id || idx}`} className={`hover:bg-cream-100/60 transition-colors ${rowBg}`}>
        {/* 1. Место */}
        <td className="w-12 py-1.5 sm:py-2 px-2 text-center align-middle">
          <PlacementBadge result={result} />
        </td>

        {/* 2. Номер по каталогу */}
        <td className="w-12 py-1.5 sm:py-2 px-1 text-center text-charcoal-500 font-mono text-xs align-middle">
          {result.catalog_no ? `№${result.catalog_no}` : '—'}
        </td>

        {/* 3. Кличка собаки (НЕ капс, без сокращений, полная; причину дисквала выводим только справа) */}
        <td className="py-1.5 sm:py-2 px-3 align-middle min-w-[220px]">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {result.dog_id ? (
              <Link
                to={`/dog/${result.dog_id}/`}
                title={secondaryDogName || undefined}
                className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 hover:text-camel-800 hover:underline leading-snug whitespace-nowrap"
              >
                {formattedDogName}
              </Link>
            ) : (
              <span
                title={secondaryDogName || undefined}
                className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 leading-snug whitespace-nowrap"
              >
                {formattedDogName}
              </span>
            )}
            {dogSex && (
              <DogSexIcon sex={dogSex} size={14} className="shrink-0" />
            )}
          </div>
        </td>

        {/* 4. Класс / Лига */}
        <td className="w-28 sm:w-32 py-1.5 sm:py-2 px-2 text-charcoal-600 text-xs hidden sm:table-cell align-middle">
          {classLabel}
        </td>

        {/* 5. Заезды / Круги (строго выровнены по ширине и горизонтали) */}
        {Array.from({ length: maxHeats }).map((_, heatIdx) => {
          const heatColClass = isRacing ? 'w-[140px] min-w-[130px]' : 'w-[205px] min-w-[205px]'
          const heat = heats[heatIdx]
          if (!heat) {
            return (
              <td
                key={heatIdx}
                className={`${heatColClass} py-1.5 sm:py-2 px-2.5 text-charcoal-300 font-mono text-xs align-middle`}
              >
                —
              </td>
            )
          }

          const dist = getHeatDistance(heat, rawScores)

          if (isRacing) {
            const speedKmh = heat.speed_kmh ? heat.speed_kmh.toFixed(1) : null
            const isHeatDq = heat.disqualified || (!heat.time && !heat.speed_kmh)
            const heatNum = heat.heat_number ?? heat.bib_number ?? heatIdx + 1

            return (
              <td
                key={heatIdx}
                className={`${heatColClass} py-1.5 sm:py-2 px-2 sm:px-2.5 align-middle`}
              >
                {isHeatDq ? (
                  <div className="flex items-center gap-1.5">
                    <ProtocolHeatBadge
                      heatNumber={heatNum}
                      bibColor={heat.bib_color}
                      bibNumber={heat.bib_number}
                      distance={dist}
                    />
                    <span className="text-[11px] font-semibold text-rose-600 italic leading-snug">
                      {heat.disqualification_reason || statusReason || 'Сход'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ProtocolHeatBadge
                      heatNumber={heatNum}
                      bibColor={heat.bib_color}
                      bibNumber={heat.bib_number}
                      distance={dist}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs sm:text-sm font-bold text-charcoal-900 whitespace-nowrap leading-tight">
                        {heat.time ? `${heat.time} сек` : '—'}
                      </span>
                      {(speedKmh || dist) && (
                        <span className="text-[10px] text-charcoal-500 font-mono leading-tight whitespace-nowrap pt-0.5">
                          {speedKmh && <span>{speedKmh} км/ч</span>}
                          {speedKmh && dist && <span> · </span>}
                          {dist && <span>{dist}м</span>}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </td>
            )
          }

          // Coursing rendering: попона впритык слева от оценок, балл забега строго без переноса над суммой судей
          const judges = heat.judges || []
          const primaryScores = judges[0]?.scores || []
          const heatTotal = heat.total != null ? heat.total : '—'
          const isHeatDq = heat.disqualified

          // Суммы судей для скобок: (82+84)
          const judgeSums = judges
            .map(j => j.sum)
            .filter((sum): sum is number | string => sum != null)

          return (
            <td
              key={heatIdx}
              className={`${heatColClass} py-1.5 sm:py-2 px-2.5 align-middle`}
            >
              {isHeatDq ? (
                <div className="flex items-center gap-1.5">
                  <ProtocolHeatBadge
                    heatNumber={heat.bib_number ?? heat.heat_number ?? heatIdx + 1}
                    bibColor={heat.bib_color}
                    distance={dist}
                  />
                  <span className="text-[11px] font-semibold text-rose-600 italic leading-snug">
                    {heat.disqualification_reason || statusReason || 'Сход'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {/* Номер попоны прямо впритык слева от оценок */}
                  <ProtocolHeatBadge
                    heatNumber={heat.bib_number ?? heat.heat_number ?? heatIdx + 1}
                    bibColor={heat.bib_color}
                    distance={dist}
                  />

                  {/* Оценки по 5 категориям (М Р В П Э + цифры) */}
                  <div className="flex flex-col shrink-0">
                    {/* Буквы критериев */}
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-charcoal-400 leading-none">
                      {CRITERIA_5_LABELS.map(c => (
                        <span key={c} className="w-3.5 text-center" title={CRITERIA_TITLES[c]}>
                          {c}
                        </span>
                      ))}
                    </div>
                    {/* Цифры оценок */}
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-charcoal-800 tabular-nums leading-tight pt-0.5">
                      {primaryScores.slice(0, 5).map((score, sIdx) => (
                        <span key={sIdx} className="w-3.5 text-center">
                          {score ?? '—'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Общий балл за один забег (154 б.) прямо над суммой (76+78), СТРОГО без переноса */}
                  <div className="flex flex-col items-end pl-1.5 shrink-0 whitespace-nowrap">
                    <span className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 tabular-nums leading-none whitespace-nowrap">
                      {heatTotal}&nbsp;б.
                    </span>
                    {judgeSums.length > 1 ? (
                      <span className="text-[10px] text-charcoal-400 font-mono tracking-tight leading-tight pt-0.5 whitespace-nowrap">
                        ({judgeSums.join('+')})
                      </span>
                    ) : (
                      <span className="text-[10px] text-transparent leading-tight pt-0.5 select-none">
                        &nbsp;
                      </span>
                    )}
                  </div>
                </div>
              )}
            </td>
          )
        })}

        {/* 6. Итоговый балл / лучшее время + ненавязчивый СС в одной строке слева от балла */}
        <td className="w-28 py-1.5 sm:py-2 px-3 text-right align-middle">
          {isDns ? (
            <span className="text-xs text-charcoal-400">Неявка</span>
          ) : isDq ? (
            <span className="text-xs font-semibold text-rose-600">
              {statusReason || 'Дисквал.'}
            </span>
          ) : (
            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap leading-none">
              {showVc && (
                <HoverTooltip
                  label="СС — сертификат соответствия высшей квалификации (≥75% баллов во всех забегах)"
                  placement="top"
                  portal
                  delayMs={0}
                >
                  <span className="inline-flex items-center px-1 py-0.5 text-[9px] font-mono font-medium text-charcoal-400 bg-old-money-100/60 border border-old-money-200/70 rounded cursor-help select-none leading-none tracking-tight">
                    СС
                  </span>
                </HoverTooltip>
              )}
              <div className="whitespace-nowrap leading-none">
                <span className="font-serif font-bold text-base sm:text-lg text-camel-800 tabular-nums">
                  {result.total_score != null ? result.total_score : '—'}
                </span>
                {isRacing && result.total_score && (
                  <span className="text-xs text-old-money-500 font-sans ml-0.5">с</span>
                )}
                {!isRacing && result.total_score && (
                  <span className="text-xs text-old-money-500 font-sans ml-0.5">б</span>
                )}
              </div>
            </div>
          )}
        </td>

        {/* 7. Квалификация / титулы / переход в лигу (только титулы, без раздувания строки по высоте) */}
        <td className="w-44 min-w-[150px] py-1.5 sm:py-2 px-3 hidden md:table-cell align-middle">
          {cleanQualification ? (
            <QualificationBadges qualification={cleanQualification} />
          ) : (
            <span className="text-old-money-300 text-xs">—</span>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-old-money-200/90 bg-white shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <colgroup>
          <col className="w-12" />
          <col className="w-12" />
          <col className="min-w-[220px]" />
          <col className="w-28 sm:w-32 hidden sm:table-column" />
          {Array.from({ length: maxHeats }).map((_, i) => (
            <col
              key={i}
              className={isRacing ? 'w-[140px] min-w-[130px]' : 'w-[205px] min-w-[205px]'}
            />
          ))}
          <col className="w-28" />
          <col className="w-44 hidden md:table-column" />
        </colgroup>
        <tbody className="divide-y divide-old-money-100/70">
          {sortedGroupKeys && groupedResults ? (
            sortedGroupKeys.map(groupKey => {
              const groupResults = groupedResults[groupKey] || []
              if (groupResults.length === 0) return null

              return (
                <Fragment key={groupKey}>
                  {/* Нативный компактный разделитель группы прямо в таблице на ВСЮ ширину таблицы */}
                  <tr className="bg-camel-100/75 border-y border-camel-200/90 first:border-t-0 select-none">
                    <td colSpan={100} className="py-1 px-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-camel-950">
                          {groupKey}
                        </span>
                        <span className="text-[11px] font-medium text-camel-700">
                          {breedCountLabel(groupResults.length)}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {groupResults.map((result, idx) => renderRow(result, idx))}
                </Fragment>
              )
            })
          ) : (
            results?.map((result, idx) => renderRow(result, idx))
          )}
        </tbody>
      </table>
    </div>
  )
}
