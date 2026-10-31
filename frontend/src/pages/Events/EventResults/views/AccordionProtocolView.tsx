import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ChevronsUpDown, AlertCircle, Ban } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import PoponaCell from '../components/PoponaCell'
import QualificationBadges from '../components/QualificationBadges'
import DetailPanel from '../details/DetailPanel'
import { parseRawScores, normalizeBibColorName } from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'
import { normalizeQualificationAndVc } from '../ResultSummary'
import { parseDogName } from '../../../../lib/dogName'
import HoverTooltip from '../../../../components/ui/HoverTooltip'
import type { Result, Heat, RawScores } from '../types'

interface AccordionProtocolViewProps {
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
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono font-bold border shadow-2xs cursor-help select-none ${colorClass}`}
      >
        <span>{label}</span>
        {distance && <span className="text-[10px] font-normal opacity-85">{distance}м</span>}
      </span>
    </HoverTooltip>
  )
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
    <div className="space-y-1.5">
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
          const { primary: dogName, secondary: secondaryDogName } = parseDogName(
            result.name_lat || (result.dog as any)?.name_lat,
            result.name_ru || (result.dog as any)?.name_ru
          )
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
              {/* Строка-полоса собаки */}
              <div
                onClick={() => toggleExpand(rowKey)}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-2.5 sm:px-3 cursor-pointer gap-2.5 select-none"
              >
                {/* 1. Идентичность: Место + Номер + Кличка + Пол + Класс */}
                <div className="flex items-center gap-2.5 min-w-0 lg:w-[280px] shrink-0">
                  <div className="shrink-0">
                    <PlacementBadge result={result} />
                  </div>

                  {result.catalog_no && (
                    <span className="shrink-0 text-xs font-mono text-charcoal-400">
                      №{result.catalog_no}
                    </span>
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      {result.dog_id ? (
                        <Link
                          to={`/dog/${result.dog_id}/`}
                          onClick={e => e.stopPropagation()}
                          title={secondaryDogName || undefined}
                          className="font-serif font-bold text-sm text-charcoal-900 hover:text-camel-800 hover:underline truncate"
                        >
                          {dogName}
                        </Link>
                      ) : (
                        <span title={secondaryDogName || undefined} className="font-serif font-bold text-sm text-charcoal-900 truncate">
                          {dogName}
                        </span>
                      )}
                      {genderSymbol && (
                        <span className={`text-xs font-bold shrink-0 ${genderColor}`}>
                          {genderSymbol}
                        </span>
                      )}
                    </div>
                    {classLabel && (
                      <span className="text-[10px] text-charcoal-500 font-sans truncate">
                        {classLabel}
                      </span>
                    )}

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
                </div>

                {/* 2. Дорожка заездов (Heats Telemetry Strip) */}
                <div className="flex items-center gap-2 overflow-x-auto py-0.5 flex-1 min-w-0">
                  {heats.map((heat, hIdx) => {
                    const dist = getHeatDistance(heat, rawScores)

                    if (isRacing) {
                      const isWinner = isFastestHeat(heat, bestTimesByRace)
                      const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null
                      const speedKmh = heat.speed_kmh ? heat.speed_kmh.toFixed(1) : null
                      const isHeatDq = heat.disqualified || (!heat.time && !heat.speed_kmh)

                      return (
                        <div
                          key={hIdx}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs shrink-0 ${
                            isHeatDq
                              ? 'border-rose-200 bg-rose-50/70 text-rose-700'
                              : 'border-old-money-200 bg-cream-50/70'
                          }`}
                        >
                          {/* В рейсинге: цвет попоны идет с номером бокса/попоны */}
                          <PoponaCell
                            number={heat.bib_number}
                            color={heat.bib_color}
                            compact
                            isWinner={isWinner}
                          />

                          <div className="flex flex-col text-[11px] leading-tight">
                            <span className="text-[10px] text-charcoal-400 font-mono">
                              №{heat.heat_number ?? hIdx + 1}
                              {dist ? ` · ${dist}м` : ''}
                            </span>
                            {isHeatDq ? (
                              <span className="font-semibold text-rose-600 italic">
                                {heat.disqualification_reason || 'Сход'}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className={`font-bold ${isWinner ? 'text-camel-800' : 'text-charcoal-900'}`}>
                                  {heat.time ? `${heat.time}с` : '—'}
                                </span>
                                <span className="text-[10px] text-charcoal-500 tabular-nums">
                                  {speedKmh ? `${speedKmh} км/ч` : ''}
                                  {speedMs ? ` · ${speedMs} м/с` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }

                    // Coursing: цвет попоны объединен с номером забега + 5 категорий
                    const judges = heat.judges || []
                    const heatTotal = heat.total != null ? heat.total : '—'
                    const isHeatDq = heat.disqualified
                    const primaryScores = judges[0]?.scores || []

                    return (
                      <div
                        key={hIdx}
                        className="flex items-center gap-2 rounded-lg border border-old-money-200 bg-cream-50/70 px-2.5 py-1 text-xs shrink-0"
                      >
                        {/* Номер забега на цвете попоны */}
                        <CoursingHeatBadge
                          heatNumber={heat.bib_number ?? heat.heat_number ?? hIdx + 1}
                          bibColor={heat.bib_color}
                          distance={dist}
                        />

                        {isHeatDq ? (
                          <span className="font-semibold text-rose-600 italic">
                            {heat.disqualification_reason || 'Сход'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {/* 5 критериев */}
                            <div className="flex items-center gap-1.5">
                              {CRITERIA_5_LABELS.map((crit, cIdx) => {
                                const val = primaryScores[cIdx]
                                return (
                                  <HoverTooltip
                                    key={crit}
                                    label={`${CRITERIA_TITLES[crit]}: ${val ?? '—'}`}
                                    placement="top"
                                    portal
                                    delayMs={0}
                                  >
                                    <div className="flex flex-col items-center cursor-help">
                                      <span className="text-[8px] font-semibold text-charcoal-400">
                                        {crit}
                                      </span>
                                      <span className="font-mono text-xs font-bold text-charcoal-800">
                                        {val ?? '—'}
                                      </span>
                                    </div>
                                  </HoverTooltip>
                                )
                              })}
                            </div>

                            {/* Итог забега */}
                            <div className="border-l border-old-money-200 pl-2 flex flex-col items-end">
                              <span className="text-[9px] text-charcoal-400 uppercase font-semibold">
                                Сумма
                              </span>
                              <span className="font-serif font-bold text-xs text-camel-900 tabular-nums">
                                {heatTotal} б.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* 3. Итог + Квалификация + Шеврон */}
                <div className="flex items-center justify-end gap-3 shrink-0 pt-1 lg:pt-0">
                  {(qualification || vc) && (
                    <div className="hidden sm:block">
                      <QualificationBadges qualification={qualification || vc} />
                    </div>
                  )}

                  <div className="text-right min-w-[70px]">
                    {isDns ? (
                      <span className="text-xs text-charcoal-400">Неявка</span>
                    ) : isDq ? (
                      <span className="text-xs font-semibold text-rose-600">
                        {statusReason || 'Дисквал.'}
                      </span>
                    ) : (
                      <div className="flex items-baseline justify-end gap-0.5">
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
