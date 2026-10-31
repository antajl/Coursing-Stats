import { Link } from 'react-router-dom'
import { AlertCircle, Ban } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import PoponaCell from '../components/PoponaCell'
import QualificationBadges from '../components/QualificationBadges'
import { parseRawScores, normalizeBibColorName } from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'
import { normalizeQualificationAndVc } from '../ResultSummary'
import { parseDogName, toDogTitleCase } from '../../../../lib/dogName'
import HoverTooltip from '../../../../components/ui/HoverTooltip'
import type { Result, Heat, RawScores } from '../types'

interface ScorecardProtocolViewProps {
  results: Result[]
  bestTimesByRace?: Record<string, number>
  isRacing?: boolean
}

const CRITERIA_5_LABELS = ['Ман', 'Резв', 'Вын', 'Прес', 'Энт'] as const
const CRITERIA_TITLES: Record<string, string> = {
  Ман: 'Маневренность (макс. 20)',
  Резв: 'Резвость (макс. 20)',
  Вын: 'Выносливость (макс. 20)',
  Прес: 'Преследование (макс. 20)',
  Энт: 'Энтузиазм (макс. 20)',
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

function CoursingHeatBadge({
  heatNumber,
  bibColor,
  distance,
}: {
  heatNumber?: number | string | null
  bibColor?: string | null
  distance?: number | null
}) {
  const normalized = normalizeBibColorName(bibColor ?? undefined, false)
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

export default function ScorecardProtocolView({
  results,
  bestTimesByRace,
  isRacing = false,
}: ScorecardProtocolViewProps) {
  // Determine maximum heats across the group
  const maxHeats = Math.max(
    ...results.map(r => parseRawScores(r.raw_scores_json)?.heats?.length || 0),
    1
  )

  return (
    <div className="space-y-1.5">
      {/* Шапка модулей для Scorecard (выводится только 1 раз наверху) */}
      <div className="hidden md:flex items-center rounded-lg bg-cream-200/80 border border-old-money-300 text-[11px] font-bold uppercase tracking-wider text-charcoal-700 divide-x divide-old-money-300">
        <div className="w-[280px] lg:w-[320px] shrink-0 py-1.5 px-3">
          Участник
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-x divide-old-money-300 text-center">
          {Array.from({ length: maxHeats }).map((_, i) => (
            <div key={i} className="py-1.5 px-2">
              {i + 1} круг {isRacing ? '(Заезд / Время / Скорость)' : '(Забег / Ман Резв Вын Прес Энт)'}
            </div>
          ))}
        </div>
        <div className="w-[180px] shrink-0 py-1.5 px-3 text-right">
          Итог и Награды
        </div>
      </div>

      {results.map((result, idx) => {
        const rawScores = parseRawScores(result.raw_scores_json)
        const heats = rawScores?.heats || []
        const { primary: formattedDogName, secondary: secondaryName } = parseDogName(
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
            key={`${result.dog_id || 'unk'}-${idx}`}
            className={`rounded-xl border transition-all ${
              isDns
                ? 'border-old-money-200/60 bg-old-money-50/40 opacity-60'
                : isDq
                  ? 'border-rose-200 bg-rose-50/30'
                  : 'border-old-money-200/80 bg-white hover:border-camel-300'
            }`}
          >
            {/* Карточка-бланк: разделена на монолитные столбцы-отсеки */}
            <div className="flex flex-col md:flex-row md:items-stretch divide-y md:divide-y-0 md:divide-x divide-old-money-200/70">
              {/* Отсек 1: Идентичность собаки */}
              <div className="p-2.5 sm:px-3 flex items-center gap-2.5 min-w-0 md:w-[280px] lg:w-[320px] shrink-0">
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
                      <span className={`text-xs font-bold shrink-0 ${genderColor}`}>
                        {genderSymbol}
                      </span>
                    )}
                  </div>
                  {secondaryName && (
                    <span className="text-[10px] text-charcoal-500 font-sans leading-tight">
                      {secondaryName}
                    </span>
                  )}
                  {classLabel && (
                    <span className="text-[10px] text-charcoal-500 font-sans leading-tight">
                      {classLabel}
                    </span>
                  )}

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
              </div>

              {/* Отсек 2: Круги / Забеги */}
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-old-money-200/50">
                {Array.from({ length: maxHeats }).map((_, i) => {
                  const heat = heats[i]
                  if (!heat) {
                    return (
                      <div
                        key={i}
                        className="p-2 flex items-center justify-center text-charcoal-300 font-mono text-xs"
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
                      <div key={i} className="p-2 sm:px-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* В рейсинге: цвет попоны с цифрой */}
                          <PoponaCell
                            number={heat.bib_number}
                            color={heat.bib_color}
                            compact
                            isWinner={isWinner}
                          />
                          <div className="flex flex-col text-[10px] font-mono leading-tight text-charcoal-400">
                            <span>Заезд {heat.heat_number ?? i + 1}</span>
                            {dist && <span>{dist} м</span>}
                          </div>
                        </div>

                        {isHeatDq ? (
                          <span className="text-[11px] font-semibold text-rose-600 italic">
                            {heat.disqualification_reason || 'Сход'}
                          </span>
                        ) : (
                          <div className="flex flex-col items-end font-mono leading-tight">
                            <span className={`text-xs font-bold ${isWinner ? 'text-camel-800' : 'text-charcoal-900'}`}>
                              {heat.time ? `${heat.time} сек` : '—'}
                            </span>
                            <span className="text-[10px] text-charcoal-500 tabular-nums">
                              {speedKmh ? `${speedKmh} км/ч` : ''}
                              {speedMs ? ` (${speedMs} м/с)` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  }

                  // Coursing round
                  const judges = heat.judges || []
                  const j1Scores = judges[0]?.scores || []
                  const j2Scores = judges[1]?.scores || []
                  const sum1 = judges[0]?.sum
                  const sum2 = judges[1]?.sum
                  const has2JudgesInHeat = judges.length >= 2
                  const heatTotal = heat.total != null ? heat.total : '—'
                  const isHeatDq = heat.disqualified

                  return (
                    <div key={i} className="p-2 sm:px-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* В курсинге: цвет попоны объединен с номером забега */}
                        <CoursingHeatBadge
                          heatNumber={heat.bib_number ?? heat.heat_number ?? i + 1}
                          bibColor={heat.bib_color}
                          distance={dist}
                        />
                      </div>

                      {isHeatDq ? (
                        <span className="text-[11px] font-semibold text-rose-600 italic">
                          {heat.disqualification_reason || 'Сход'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 font-mono">
                            {[0, 1, 2, 3, 4].map(cIdx => (
                              <HoverTooltip
                                key={cIdx}
                                label={`${CRITERIA_TITLES[CRITERIA_5_LABELS[cIdx]]}: ${j1Scores[cIdx] ?? '—'}`}
                                placement="top"
                                portal
                                delayMs={0}
                              >
                                <div className="flex flex-col items-center cursor-help leading-tight">
                                  <span className="text-xs font-semibold text-charcoal-900 tabular-nums">
                                    {j1Scores[cIdx] ?? '—'}
                                  </span>
                                  {has2JudgesInHeat && (
                                    <span className="text-[10px] text-charcoal-500 tabular-nums">
                                      {j2Scores[cIdx] ?? '—'}
                                    </span>
                                  )}
                                </div>
                              </HoverTooltip>
                            ))}
                          </div>

                          <div className="border-l border-old-money-200 pl-2 text-right">
                            <span className="font-serif font-bold text-xs text-camel-900 tabular-nums">
                              {heatTotal}
                            </span>
                            {has2JudgesInHeat && sum1 != null && sum2 != null && (
                              <div className="text-[9px] text-charcoal-400 font-mono">
                                ({sum1}+{sum2})
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Отсек 3: Итог и Квалификация */}
              <div className="p-2.5 sm:px-3 flex items-center justify-between md:justify-end gap-3 md:w-[180px] shrink-0 bg-cream-50/40">
                {(qualification || vc) && (
                  <div className="hidden sm:block">
                    <QualificationBadges qualification={qualification || vc} />
                  </div>
                )}

                <div className="text-right">
                  {isDns ? (
                    <span className="text-xs text-charcoal-400">Неявка</span>
                  ) : isDq ? (
                    <span className="text-xs font-semibold text-rose-600">
                      {statusReason || 'Дисквал.'}
                    </span>
                  ) : (
                    <div className="flex items-baseline justify-end gap-0.5">
                      <span className="font-serif font-bold text-base text-camel-800 tabular-nums">
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
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
