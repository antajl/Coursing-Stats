import { Link } from 'react-router-dom'
import { AlertCircle, Ban } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import PoponaCell from '../components/PoponaCell'
import QualificationBadges from '../components/QualificationBadges'
import { parseRawScores, normalizeBibColorName } from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'
import { normalizeQualificationAndVc } from '../ResultSummary'
import { toDogTitleCase } from '../../../../lib/dogName'
import HoverTooltip from '../../../../components/ui/HoverTooltip'
import type { Result, Heat, RawScores } from '../types'

interface TableProtocolViewProps {
  results: Result[]
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

function isFastestHeat(heat: Heat, bestTimesByRace?: Record<string, number>): boolean {
  if (heat.bib_number == null || heat.disqualified || !bestTimesByRace) return false
  const t = typeof heat.time === 'number' ? heat.time : parseFloat(String(heat.time || ''))
  if (isNaN(t) || t <= 0) return false
  const best = bestTimesByRace[String(heat.bib_number)]
  return best != null && Math.abs(t - best) < 0.001
}

/** Компактная плашка забега в курсинге (цвет попоны объединен с номером забега) */
function CoursingHeatBadge({
  heatNumber,
  bibColor,
  distance,
}: {
  heatNumber?: number | string | null
  bibColor?: string | null
  distance?: number | null
}) {
  const normalized = normalizeBibColorName(bibColor ?? undefined)
  const isRed = normalized === 'red'
  const isBlue = normalized === 'blue'
  const isBlack = normalized === 'black'
  const isWhite = normalized === 'white'

  const colorClass = isRed
    ? 'bg-rose-600 text-white border-rose-700'
    : isBlue
      ? 'bg-sky-600 text-white border-sky-700'
      : isBlack
        ? 'bg-charcoal-900 text-white border-charcoal-950'
        : isWhite
          ? 'bg-white text-charcoal-900 border-old-money-300'
          : 'bg-old-money-100 text-charcoal-800 border-old-money-300'

  const label = heatNumber != null ? `№${heatNumber}` : '—'
  const colorName = normalized ? (BIB_COLOR_LABELS[normalized] || normalized) : 'Попона'
  const tooltipText = `${colorName} · Забег ${label}${distance ? ` (${distance}м)` : ''}`

  return (
    <HoverTooltip label={tooltipText} placement="top" portal delayMs={0}>
      <span
        className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-mono font-bold border shadow-2xs cursor-help select-none shrink-0 ${colorClass}`}
      >
        <span>{label}</span>
      </span>
    </HoverTooltip>
  )
}

export default function TableProtocolView({
  results,
  bestTimesByRace,
  isRacing = false,
}: TableProtocolViewProps) {
  // Determine maximum heats across the group
  const maxHeats = Math.max(
    ...results.map(r => parseRawScores(r.raw_scores_json)?.heats?.length || 0),
    1
  )

  return (
    <div className="overflow-x-auto rounded-xl border border-old-money-200/90 bg-white shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <tbody className="divide-y divide-old-money-100/70">
          {results.map((result, idx) => {
            const rawScores = parseRawScores(result.raw_scores_json)
            const heats = rawScores?.heats || []
            let rawDogName = result.name_ru || result.name_lat || 'Без клички'
            if (rawDogName.includes('/')) {
              rawDogName = rawDogName.split('/')[0].trim()
            }
            const formattedDogName = toDogTitleCase(rawDogName)

            const genderSymbol =
              result.dog?.gender === 'M' ? '♂' : result.dog?.gender === 'F' ? '♀' : ''
            const genderColor =
              result.dog?.gender === 'M'
                ? 'text-sky-700'
                : result.dog?.gender === 'F'
                  ? 'text-rose-700'
                  : 'text-charcoal-400'

            const isDns = result.status === 'dns' || result.status === 'absent'
            const isDq =
              result.status === 'disqualified' ||
              result.status === 'dismissed' ||
              result.status === 'eliminated' ||
              result.status === 'dnf'
            const statusReason = displayStatusReason(result.status_reason)
            const { qualification, vc } = normalizeQualificationAndVc(result)
            const classLabel = result.class_label || (result as any).breed_class?.split(' - ')[1] || '—'

            const rowBg = isDns
              ? 'bg-old-money-50/60 opacity-60'
              : isDq
                ? 'bg-rose-50/30'
                : idx % 2 === 1
                  ? 'bg-cream-50/40'
                  : 'bg-white'

            return (
              <tr key={`${result.dog_id || 'unk'}-${idx}`} className={`hover:bg-cream-100/60 transition-colors ${rowBg}`}>
                {/* 1. Место */}
                <td className="w-12 py-2.5 px-2 text-center align-middle">
                  <PlacementBadge result={result} />
                </td>

                {/* 2. Номер по каталогу */}
                <td className="w-12 py-2.5 px-1 text-center text-charcoal-500 font-mono text-xs align-middle">
                  {result.catalog_no ? `№${result.catalog_no}` : '—'}
                </td>

                {/* 3. Кличка собаки (НЕ капс, без сокращений, полная в 1-2 строки) */}
                <td className="py-2.5 px-3 align-middle min-w-[210px]">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {result.dog_id ? (
                        <Link
                          to={`/dog/${result.dog_id}/`}
                          className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 hover:text-camel-800 hover:underline leading-snug"
                        >
                          {formattedDogName}
                        </Link>
                      ) : (
                        <span className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 leading-snug">
                          {formattedDogName}
                        </span>
                      )}
                      {genderSymbol && (
                        <span className={`text-xs font-bold shrink-0 ${genderColor}`} title={result.dog?.gender === 'M' ? 'Кобель' : 'Сука'}>
                          {genderSymbol}
                        </span>
                      )}
                    </div>

                    {isDq && statusReason && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 pt-0.5">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{statusReason}</span>
                      </div>
                    )}
                    {isDns && (
                      <div className="flex items-center gap-1 text-[11px] text-charcoal-500 pt-0.5">
                        <Ban className="h-3 w-3 shrink-0" />
                        <span>Неявка</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* 4. Класс / Лига */}
                <td className="w-28 py-2.5 px-2 text-charcoal-600 text-xs hidden sm:table-cell align-middle">
                  {classLabel}
                </td>

                {/* 5. Заезды / Круги */}
                {Array.from({ length: maxHeats }).map((_, heatIdx) => {
                  const heat = heats[heatIdx]
                  if (!heat) {
                    return (
                      <td key={heatIdx} className="py-2.5 px-3 text-charcoal-300 font-mono text-xs align-middle">
                        —
                      </td>
                    )
                  }

                  const dist = getHeatDistance(heat, rawScores)

                  if (isRacing) {
                    const isWinner = isFastestHeat(heat, bestTimesByRace)
                    const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null
                    const speedKmh = heat.speed_kmh ? heat.speed_kmh.toFixed(1) : null
                    const isHeatDq = heat.disqualified || (!heat.time && !heat.speed_kmh)

                    return (
                      <td key={heatIdx} className="py-2.5 px-3 align-middle min-w-[190px]">
                        <div className="flex flex-col gap-0.5">
                          {/* Верхний ряд: Попона + Время */}
                          <div className="flex items-center gap-2">
                            <PoponaCell
                              number={heat.bib_number}
                              color={heat.bib_color}
                              compact
                              isWinner={isWinner}
                            />
                            {isHeatDq ? (
                              <span className="text-[11px] font-semibold text-rose-600 italic">
                                {heat.disqualification_reason || 'Сход'}
                              </span>
                            ) : (
                              <span className={`font-mono text-sm font-bold ${isWinner ? 'text-camel-800' : 'text-charcoal-900'}`}>
                                {heat.time ? `${heat.time} сек` : '—'}
                              </span>
                            )}
                          </div>

                          {/* Нижний ряд: Заезд, Дистанция и Скорости */}
                          {!isHeatDq && (
                            <div className="text-[10px] text-charcoal-500 font-mono leading-tight">
                              <span>Заезд {heat.heat_number ?? heatIdx + 1}</span>
                              {dist && <span> · {dist}м</span>}
                              {speedKmh && <span> · {speedKmh} км/ч</span>}
                              {speedMs && <span className="opacity-80"> ({speedMs} м/с)</span>}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  }

                  // Coursing rendering: точный дизайн как на скриншоте пользователя
                  const judges = heat.judges || []
                  const primaryScores = judges[0]?.scores || []
                  const heatTotal = heat.total != null ? heat.total : '—'
                  const isHeatDq = heat.disqualified

                  // Суммы судей для скобок: (82+84)
                  const judgeSums = judges
                    .map(j => j.sum)
                    .filter((sum): sum is number | string => sum != null)

                  return (
                    <td key={heatIdx} className="py-2.5 px-3 align-middle min-w-[190px]">
                      <div className="flex flex-col gap-0.5">
                        {/* Верхний ряд: [🔴 №6]  166 б. */}
                        <div className="flex items-center gap-2">
                          <CoursingHeatBadge
                            heatNumber={heat.bib_number ?? heat.heat_number ?? heatIdx + 1}
                            bibColor={heat.bib_color}
                            distance={dist}
                          />
                          {isHeatDq ? (
                            <span className="text-[11px] font-semibold text-rose-600 italic">
                              {heat.disqualification_reason || 'Сход'}
                            </span>
                          ) : (
                            <span className="font-serif font-bold text-sm text-charcoal-900 tabular-nums">
                              {heatTotal} б.
                            </span>
                          )}
                        </div>

                        {/* Нижний ряд:
                            М  Р  В  П  Э   (82+84)
                            16 17 16 16 17
                        */}
                        {!isHeatDq && (
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <div className="flex flex-col">
                              {/* Буквы критериев */}
                              <div className="flex items-center gap-2 text-[9px] font-semibold text-charcoal-400">
                                {CRITERIA_5_LABELS.map(c => (
                                  <span key={c} className="w-3.5 text-center" title={CRITERIA_TITLES[c]}>
                                    {c}
                                  </span>
                                ))}
                              </div>
                              {/* Цифры оценок */}
                              <div className="flex items-center gap-2 font-mono text-xs font-bold text-charcoal-800 tabular-nums">
                                {primaryScores.slice(0, 5).map((score, sIdx) => (
                                  <span key={sIdx} className="w-3.5 text-center">
                                    {score ?? '—'}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Разбивка по судьям: (82+84) */}
                            {judgeSums.length > 1 && (
                              <span className="text-[10px] text-charcoal-400 font-mono tracking-tight self-end pb-0.5">
                                ({judgeSums.join('+')})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  )
                })}

                {/* 6. Итоговый балл / лучшее время */}
                <td className="w-24 py-2.5 px-3 text-right align-middle">
                  {isDns ? (
                    <span className="text-xs text-charcoal-400">Неявка</span>
                  ) : isDq && !result.total_score ? (
                    <span className="text-xs font-semibold text-rose-600">
                      {statusReason || 'Дисквал.'}
                    </span>
                  ) : (
                    <div>
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
                  )}
                </td>

                {/* 7. Квалификация / титулы / переход в лигу */}
                <td className="w-36 py-2.5 px-3 hidden md:table-cell align-middle">
                  {qualification || vc ? (
                    <QualificationBadges qualification={qualification || vc} />
                  ) : (
                    <span className="text-old-money-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
