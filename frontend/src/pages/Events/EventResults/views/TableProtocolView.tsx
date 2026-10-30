import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, AlertCircle, Ban } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import PoponaCell from '../components/PoponaCell'
import QualificationBadges from '../components/QualificationBadges'
import DetailPanel from '../details/DetailPanel'
import { parseRawScores, normalizeBibColorName } from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'
import { normalizeQualificationAndVc } from '../ResultSummary'
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

/** Плашка забега в курсинге: номер забега объединен с цветом попоны */
export function CoursingHeatPill({
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
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono font-bold border shadow-2xs cursor-help select-none ${colorClass}`}
      >
        <span>{label}</span>
        {distance && <span className="text-[9px] font-normal opacity-80">{distance}м</span>}
      </span>
    </HoverTooltip>
  )
}

export default function TableProtocolView({
  results,
  bestTimesByRace,
  isRacing = false,
}: TableProtocolViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (key: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Determine maximum heats across the group
  const maxHeats = Math.max(
    ...results.map(r => parseRawScores(r.raw_scores_json)?.heats?.length || 0),
    2
  )

  return (
    <div className="overflow-x-auto rounded-xl border border-old-money-200/90 bg-white shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-cream-100/90 border-b border-old-money-200 text-charcoal-700 font-semibold select-none">
          <tr>
            <th className="w-12 py-2 px-2 text-center">Место</th>
            <th className="w-12 py-2 px-1 text-center text-charcoal-500">№ кат.</th>
            <th className="py-2 px-3 min-w-[170px]">Собака</th>
            <th className="py-2 px-2 hidden sm:table-cell min-w-[90px]">Класс / Лига</th>
            {Array.from({ length: maxHeats }).map((_, i) => (
              <th
                key={i}
                className={`py-2 px-2 text-center whitespace-nowrap ${
                  isRacing ? 'min-w-[120px]' : 'min-w-[180px]'
                }`}
              >
                {i + 1} круг {isRacing ? '(Заезд / Время / Скорость)' : '(Забег / 5 критериев: М Р В П Э)'}
              </th>
            ))}
            <th className="py-2 px-3 text-right min-w-[70px]">
              {isRacing ? 'Лучшее' : 'Итог'}
            </th>
            <th className="py-2 px-3 hidden md:table-cell min-w-[120px]">
              Квалификация / Переход
            </th>
            <th className="w-8 py-2 px-1 text-center"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-old-money-100/70">
          {results.map((result, idx) => {
            const rowKey = `${result.dog_id || 'unk'}-${idx}`
            const isExpanded = expandedIds.has(rowKey)
            const rawScores = parseRawScores(result.raw_scores_json)
            const heats = rawScores?.heats || []
            const dogName = result.name_ru || result.name_lat || 'Без клички'
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

            const rowBg = isExpanded
              ? 'bg-camel-50/50'
              : isDns
                ? 'bg-old-money-50/60 opacity-60'
                : isDq
                  ? 'bg-rose-50/30 hover:bg-rose-50/50'
                  : idx % 2 === 1
                    ? 'bg-cream-50/40 hover:bg-cream-100/60'
                    : 'hover:bg-cream-100/60'

            return (
              <tr key={rowKey} className="group">
                <td colSpan={maxHeats + 6} className="p-0">
                  <div
                    onClick={() => toggleExpand(rowKey)}
                    className={`flex items-center w-full py-2 px-1 cursor-pointer transition-colors ${rowBg}`}
                  >
                    {/* Место */}
                    <div className="w-12 shrink-0 flex justify-center">
                      <PlacementBadge result={result} />
                    </div>

                    {/* Номер по каталогу */}
                    <div className="w-12 shrink-0 text-center text-charcoal-500 font-mono text-xs">
                      {result.catalog_no ? `№${result.catalog_no}` : '—'}
                    </div>

                    {/* Собака: кличка + пол */}
                    <div className="flex-1 min-w-[170px] px-2 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 truncate">
                        {result.dog_id ? (
                          <Link
                            to={`/dog/${result.dog_id}/`}
                            onClick={e => e.stopPropagation()}
                            className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 hover:text-camel-800 hover:underline truncate"
                          >
                            {dogName}
                          </Link>
                        ) : (
                          <span className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 truncate">
                            {dogName}
                          </span>
                        )}
                        {genderSymbol && (
                          <span className={`text-xs font-bold shrink-0 ${genderColor}`}>
                            {genderSymbol}
                          </span>
                        )}
                      </div>

                      {/* Если есть DQ причина или DNS, выводим заметно под кличкой */}
                      {isDq && statusReason && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 pt-0.5">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span className="truncate">{statusReason}</span>
                        </div>
                      )}
                      {isDns && (
                        <div className="flex items-center gap-1 text-[11px] text-charcoal-500 pt-0.5">
                          <Ban className="h-3 w-3 shrink-0" />
                          <span>Неявка</span>
                        </div>
                      )}
                    </div>

                    {/* Класс / Лига */}
                    <div className="w-24 shrink-0 hidden sm:block px-2 text-charcoal-600 text-xs truncate">
                      {result.class_label || (result as any).breed_class?.split(' - ')[1] || '—'}
                    </div>

                    {/* Ячейки забегов */}
                    {Array.from({ length: maxHeats }).map((_, i) => {
                      const heat = heats[i]
                      if (!heat) {
                        return (
                          <div
                            key={i}
                            className={`shrink-0 text-center font-mono text-xs text-charcoal-300 ${
                              isRacing ? 'w-32' : 'w-48'
                            }`}
                          >
                            —
                          </div>
                        )
                      }

                      const dist = getHeatDistance(heat, rawScores)

                      if (isRacing) {
                        const isWinner = isFastestHeat(heat, bestTimesByRace)
                        const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null
                        const speedKmh = heat.speed_kmh ? heat.speed_kmh.toFixed(1) : null
                        const isHeatDq = heat.disqualified || (!heat.time && !heat.speed_kmh)

                        return (
                          <div
                            key={i}
                            className="w-32 shrink-0 px-1 flex flex-col items-center justify-center text-center"
                          >
                            <div className="flex items-center gap-1.5">
                              {/* В рейсинге: цвет попоны идет с номером бокса/попоны */}
                              <PoponaCell
                                number={heat.bib_number}
                                color={heat.bib_color}
                                compact
                                isWinner={isWinner}
                              />
                              <span className="text-[10px] text-charcoal-400 font-mono">
                                №{heat.heat_number ?? i + 1}
                                {dist ? ` (${dist}м)` : ''}
                              </span>
                            </div>

                            {isHeatDq ? (
                              <span className="text-[11px] font-semibold text-rose-600 italic">
                                {heat.disqualification_reason || 'Сход'}
                              </span>
                            ) : (
                              <div className="flex flex-col items-center leading-tight">
                                <span className={`font-mono text-xs font-bold ${isWinner ? 'text-camel-800' : 'text-charcoal-900'}`}>
                                  {heat.time ? `${heat.time}с` : '—'}
                                </span>
                                <span className="text-[10px] text-charcoal-500 tabular-nums">
                                  {speedKmh ? `${speedKmh} км/ч` : ''}
                                  {speedMs ? ` · ${speedMs} м/с` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      }

                      // Coursing heat cell: номер забега объединен с цветом попоны + 5 критериев
                      const judges = heat.judges || []
                      const heatTotal = heat.total != null ? heat.total : '—'
                      const isHeatDq = heat.disqualified

                      // Extract criteria scores from the primary judge (or judge 1)
                      const primaryJudgeScores = judges[0]?.scores || []

                      return (
                        <div
                          key={i}
                          className="w-48 shrink-0 px-1 flex flex-col items-center justify-center text-center"
                        >
                          <div className="flex items-center gap-2">
                            {/* В курсинге: цвет попоны объединен с номером забега */}
                            <CoursingHeatPill
                              heatNumber={heat.bib_number ?? heat.heat_number ?? i + 1}
                              bibColor={heat.bib_color}
                              distance={dist}
                            />
                            <span className="font-serif font-bold text-xs text-camel-900">
                              {heatTotal} б.
                            </span>
                          </div>

                          {isHeatDq ? (
                            <span className="text-[11px] font-semibold text-rose-600 italic">
                              {heat.disqualification_reason || 'Сход'}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 pt-0.5">
                              {CRITERIA_5_LABELS.map((crit, cIdx) => {
                                const score = primaryJudgeScores[cIdx]
                                return (
                                  <HoverTooltip
                                    key={crit}
                                    label={`${CRITERIA_TITLES[crit]}: ${score ?? '—'}`}
                                    placement="top"
                                    portal
                                    delayMs={0}
                                  >
                                    <div className="flex flex-col items-center cursor-help">
                                      <span className="text-[8px] font-semibold text-charcoal-400">
                                        {crit}
                                      </span>
                                      <span className="font-mono text-[11px] font-semibold text-charcoal-800">
                                        {score ?? '—'}
                                      </span>
                                    </div>
                                  </HoverTooltip>
                                )
                              })}
                              {judges.length > 1 && (
                                <span className="text-[9px] text-charcoal-400 ml-1">
                                  ({judges.map(j => j.sum ?? '—').join('+')})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Итоговый балл / время */}
                    <div className="w-20 shrink-0 px-2 text-right">
                      {isDns ? (
                        <span className="text-xs text-charcoal-400">Неявка</span>
                      ) : isDq && !result.total_score ? (
                        <span className="text-xs font-semibold text-rose-600">
                          {statusReason || 'Дисквал.'}
                        </span>
                      ) : (
                        <div>
                          <span className="font-serif font-bold text-sm sm:text-base text-camel-800 tabular-nums">
                            {result.total_score != null ? result.total_score : '—'}
                          </span>
                          {isRacing && result.total_score && (
                            <span className="text-[10px] text-old-money-500 ml-0.5">с</span>
                          )}
                          {!isRacing && result.total_score && (
                            <span className="text-[10px] text-old-money-500 ml-0.5">б</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Квалификация / титулы / переход в лигу */}
                    <div className="w-32 shrink-0 hidden md:flex items-center px-2">
                      {qualification || vc ? (
                        <QualificationBadges qualification={qualification || vc} />
                      ) : (
                        <span className="text-old-money-300 text-xs">—</span>
                      )}
                    </div>

                    {/* Шеврон раскрытия деталей */}
                    <div className="w-8 shrink-0 flex justify-center text-charcoal-400 hover:text-charcoal-800">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-camel-700" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Развернутая панель детального протокола */}
                  {isExpanded && (
                    <div className="border-t border-old-money-200/70 bg-cream-50/70 p-3 sm:px-6">
                      <DetailPanel
                        rawScores={rawScores}
                        result={result}
                        bestTimesByRace={bestTimesByRace}
                      />
                    </div>
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
