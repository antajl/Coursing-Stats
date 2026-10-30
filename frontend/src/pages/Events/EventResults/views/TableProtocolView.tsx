import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, AlertCircle, Ban } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import PoponaCell from '../components/PoponaCell'
import QualificationBadges from '../components/QualificationBadges'
import DetailPanel from '../details/DetailPanel'
import { parseRawScores, isRacingFormat } from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'
import { normalizeQualificationAndVc } from '../ResultSummary'
import HoverTooltip from '../../../../components/ui/HoverTooltip'
import type { Result, Heat, RawScores } from '../types'

interface TableProtocolViewProps {
  results: Result[]
  bestTimesByRace?: Record<string, number>
  isRacing?: boolean
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
            <th className="py-2 px-3 min-w-[180px]">Собака</th>
            <th className="py-2 px-2 hidden sm:table-cell min-w-[100px]">Класс / Лига</th>
            {Array.from({ length: maxHeats }).map((_, i) => (
              <th key={i} className="py-2 px-2 text-center whitespace-nowrap min-w-[110px]">
                {i + 1} круг
              </th>
            ))}
            <th className="py-2 px-3 text-right min-w-[80px]">
              {isRacing ? 'Лучшее' : 'Итог'}
            </th>
            <th className="py-2 px-3 hidden md:table-cell min-w-[130px]">
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
                    <div className="flex-1 min-w-[180px] px-2 flex flex-col justify-center">
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
                    <div className="w-28 shrink-0 hidden sm:block px-2 text-charcoal-600 text-xs truncate">
                      {result.class_label || (result as any).breed_class?.split(' - ')[1] || '—'}
                    </div>

                    {/* Ячейки забегов */}
                    {Array.from({ length: maxHeats }).map((_, i) => {
                      const heat = heats[i]
                      if (!heat) {
                        return (
                          <div
                            key={i}
                            className="w-28 shrink-0 text-center font-mono text-xs text-charcoal-300"
                          >
                            —
                          </div>
                        )
                      }

                      const dist = getHeatDistance(heat, rawScores)
                      const isWinner = isFastestHeat(heat, bestTimesByRace)
                      const hasBib = Boolean(heat.bib_color || heat.bib_number != null)

                      if (isRacing) {
                        const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null
                        const speedKmh = heat.speed_kmh ? heat.speed_kmh.toFixed(1) : null
                        const isHeatDq = heat.disqualified || (!heat.time && !heat.speed_kmh)

                        return (
                          <div
                            key={i}
                            className="w-28 shrink-0 px-1 flex flex-col items-center justify-center text-center"
                          >
                            <div className="flex items-center gap-1">
                              {hasBib && (
                                <PoponaCell
                                  number={heat.bib_number}
                                  color={heat.bib_color}
                                  compact
                                  isWinner={isWinner}
                                />
                              )}
                              <span className="text-[10px] text-charcoal-400">
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

                      // Coursing heat cell
                      const judges = heat.judges || []
                      const heatTotal = heat.total != null ? heat.total : '—'

                      return (
                        <div
                          key={i}
                          className="w-28 shrink-0 px-1 flex flex-col items-center justify-center text-center"
                        >
                          <div className="flex items-center gap-1">
                            {hasBib && (
                              <PoponaCell
                                number={heat.bib_number}
                                color={heat.bib_color}
                                compact
                              />
                            )}
                            <span className="text-[10px] text-charcoal-400">
                              №{heat.heat_number ?? i + 1}
                              {dist ? ` (${dist}м)` : ''}
                            </span>
                          </div>

                          <div className="flex flex-col items-center leading-tight">
                            <span className="font-serif font-bold text-xs text-charcoal-900">
                              {heatTotal} б.
                            </span>
                            {judges.length > 0 && (
                              <span className="text-[10px] text-charcoal-500 tabular-nums">
                                {judges.map(j => j.sum ?? '—').join(' + ')}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Итоговый балл / время */}
                    <div className="w-24 shrink-0 px-2 text-right">
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
                        </div>
                      )}
                    </div>

                    {/* Квалификация / титулы / переход в лигу */}
                    <div className="w-36 shrink-0 hidden md:flex items-center px-2">
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
