import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ChevronsUpDown, AlertCircle, Ban } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import PoponaCell from '../components/PoponaCell'
import QualificationBadges from '../components/QualificationBadges'
import DetailPanel from '../details/DetailPanel'
import { parseRawScores } from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'
import { normalizeQualificationAndVc } from '../ResultSummary'
import type { Result, Heat, RawScores } from '../types'

interface AccordionProtocolViewProps {
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

export default function AccordionProtocolView({
  results,
  bestTimesByRace,
  isRacing = false,
}: AccordionProtocolViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (key: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleAll = () => {
    if (expandedIds.size === results.length) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(results.map((r, i) => `${r.dog_id || 'unk'}-${i}`)))
    }
  }

  return (
    <div className="space-y-2">
      {/* Кнопка массового раскрытия/скрытия */}
      <div className="flex justify-end pr-1">
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-charcoal-500 hover:text-camel-800 transition-colors cursor-pointer"
        >
          <ChevronsUpDown className="h-3.5 w-3.5" />
          <span>{expandedIds.size === results.length ? 'Свернуть все' : 'Развернуть все'}</span>
        </button>
      </div>

      <div className="space-y-1.5">
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
          const classLabel = result.class_label || (result as any).breed_class?.split(' - ')[1]

          return (
            <div
              key={rowKey}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-camel-300 bg-cream-50 shadow-xs'
                  : isDns
                    ? 'border-old-money-200/60 bg-old-money-50/40 opacity-60'
                    : isDq
                      ? 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
                      : 'border-old-money-200/80 bg-white hover:border-camel-300 hover:bg-cream-50/50'
              }`}
            >
              {/* Строка-сводка собаки */}
              <div
                onClick={() => toggleExpand(rowKey)}
                className="flex flex-col md:flex-row md:items-center justify-between p-2.5 sm:px-3.5 cursor-pointer gap-2 select-none"
              >
                {/* Левая часть: Место + Номер + Кличка + Пол + Класс */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="shrink-0">
                    <PlacementBadge result={result} />
                  </div>

                  {result.catalog_no && (
                    <span className="shrink-0 text-xs font-mono text-charcoal-400">
                      №{result.catalog_no}
                    </span>
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {result.dog_id ? (
                        <Link
                          to={`/dog/${result.dog_id}/`}
                          onClick={e => e.stopPropagation()}
                          className="font-serif font-bold text-sm sm:text-base text-charcoal-900 hover:text-camel-800 hover:underline truncate"
                        >
                          {dogName}
                        </Link>
                      ) : (
                        <span className="font-serif font-bold text-sm sm:text-base text-charcoal-900 truncate">
                          {dogName}
                        </span>
                      )}
                      {genderSymbol && (
                        <span className={`text-xs font-bold shrink-0 ${genderColor}`}>
                          {genderSymbol}
                        </span>
                      )}
                      {classLabel && (
                        <span className="text-[11px] text-charcoal-500 font-sans">
                          · {classLabel}
                        </span>
                      )}
                    </div>

                    {isDq && statusReason && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-rose-700 pt-0.5">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{statusReason}</span>
                      </div>
                    )}
                    {isDns && (
                      <div className="flex items-center gap-1 text-xs text-charcoal-500 pt-0.5">
                        <Ban className="h-3 w-3 shrink-0" />
                        <span>Неявка</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Центр: Плашки каждого забега (Heats) */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {heats.map((heat, hIdx) => {
                    const dist = getHeatDistance(heat, rawScores)
                    const isWinner = isFastestHeat(heat, bestTimesByRace)
                    const hasBib = Boolean(heat.bib_color || heat.bib_number != null)

                    if (isRacing) {
                      const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null
                      const speedKmh = heat.speed_kmh ? heat.speed_kmh.toFixed(1) : null
                      const isHeatDq = heat.disqualified || (!heat.time && !heat.speed_kmh)

                      return (
                        <div
                          key={hIdx}
                          className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs shrink-0 ${
                            isHeatDq
                              ? 'border-rose-200 bg-rose-50/70 text-rose-700'
                              : 'border-old-money-200 bg-white/90 text-charcoal-800'
                          }`}
                        >
                          {hasBib && (
                            <PoponaCell
                              number={heat.bib_number}
                              color={heat.bib_color}
                              compact
                              isWinner={isWinner}
                            />
                          )}
                          <div className="flex flex-col text-[11px] leading-tight">
                            <span className="text-[10px] text-charcoal-400">
                              №{heat.heat_number ?? hIdx + 1}
                              {dist ? ` · ${dist}м` : ''}
                            </span>
                            {isHeatDq ? (
                              <span className="font-semibold text-rose-600 italic">
                                {heat.disqualification_reason || 'Сход'}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className={`font-mono font-bold ${isWinner ? 'text-camel-800' : 'text-charcoal-900'}`}>
                                  {heat.time ? `${heat.time}с` : '—'}
                                </span>
                                {speedKmh && (
                                  <span className="text-charcoal-500 tabular-nums text-[10px]">
                                    ({speedKmh} км/ч)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }

                    // Coursing heat pill
                    const heatTotal = heat.total != null ? heat.total : '—'
                    const judges = heat.judges || []

                    return (
                      <div
                        key={hIdx}
                        className="flex items-center gap-1.5 rounded-lg border border-old-money-200 bg-white/90 px-2 py-1 text-xs shrink-0"
                      >
                        {hasBib && (
                          <PoponaCell
                            number={heat.bib_number}
                            color={heat.bib_color}
                            compact
                          />
                        )}
                        <div className="flex flex-col text-[11px] leading-tight">
                          <span className="text-[10px] text-charcoal-400">
                            №{heat.heat_number ?? hIdx + 1}
                            {dist ? ` · ${dist}м` : ''}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-serif font-bold text-charcoal-900">
                              {heatTotal} б.
                            </span>
                            {judges.length > 0 && (
                              <span className="text-[10px] text-charcoal-500 tabular-nums">
                                ({judges.map(j => j.sum ?? '—').join('+')})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Правая часть: Итоговый результат + Квалификация + Шеврон */}
                <div className="flex items-center justify-end gap-3 shrink-0 pt-1 md:pt-0">
                  {(qualification || vc) && (
                    <div className="hidden sm:block">
                      <QualificationBadges qualification={qualification || vc} />
                    </div>
                  )}

                  <div className="text-right min-w-[70px]">
                    {isDns ? (
                      <span className="text-xs text-charcoal-400">Неявка</span>
                    ) : isDq && !result.total_score ? (
                      <span className="text-xs font-semibold text-rose-600">
                        {statusReason || 'Дисквал.'}
                      </span>
                    ) : (
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-serif font-bold text-base sm:text-lg text-camel-800 tabular-nums">
                          {result.total_score != null ? result.total_score : '—'}
                        </span>
                        {isRacing && result.total_score && (
                          <span className="text-xs text-old-money-500 font-sans">с</span>
                        )}
                        {!isRacing && result.total_score && (
                          <span className="text-xs text-old-money-500 font-sans">б</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-charcoal-400 hover:text-charcoal-800">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-camel-700" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Развернутая панель детального протокола */}
              {isExpanded && (
                <div className="border-t border-old-money-200/70 bg-white/70 p-3 sm:px-6 rounded-b-xl">
                  <DetailPanel
                    rawScores={rawScores}
                    result={result}
                    bestTimesByRace={bestTimesByRace}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
