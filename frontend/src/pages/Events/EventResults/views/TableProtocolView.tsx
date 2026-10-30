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
        <thead className="select-none">
          {/* Ряд 1: Модульные функциональные блоки таблицы (стиль Scorecard / Swiss Timing) */}
          <tr className="bg-cream-200/80 border-b border-old-money-300 text-charcoal-800 text-[11px] font-bold uppercase tracking-wider">
            <th colSpan={4} className="py-1.5 px-3 border-r border-old-money-300">
              Участник
            </th>
            {Array.from({ length: maxHeats }).map((_, i) => (
              <th
                key={i}
                colSpan={isRacing ? 6 : 7}
                className="py-1.5 px-2 text-center border-r border-old-money-300 bg-cream-100/90"
              >
                {i + 1} круг {isRacing ? '(Заезд)' : '(Курсинг)'}
              </th>
            ))}
            <th colSpan={2} className="py-1.5 px-3 text-right bg-cream-200/80">
              Итог и Награды
            </th>
          </tr>

          {/* Ряд 2: Точные названия колонок (строго 1 раз в шапке, не дублируются у собак) */}
          <tr className="bg-cream-50/95 border-b border-old-money-200 text-charcoal-600 font-semibold text-[11px]">
            <th className="w-12 py-2 px-2 text-center">Место</th>
            <th className="w-12 py-2 px-1 text-center text-charcoal-400">№ кат.</th>
            <th className="py-2 px-3 min-w-[220px]">Кличка собаки</th>
            <th className="w-28 py-2 px-2 border-r border-old-money-200">Класс / Лига</th>

            {Array.from({ length: maxHeats }).map((_, i) => {
              if (isRacing) {
                return (
                  <tr key={i} className="contents">
                    <th className="w-12 py-2 px-1 text-center">Попона</th>
                    <th className="w-14 py-2 px-1 text-center">Заезд</th>
                    <th className="w-14 py-2 px-1 text-center">Дист.</th>
                    <th className="w-18 py-2 px-1 text-center">Время</th>
                    <th className="w-16 py-2 px-1 text-center">м/с</th>
                    <th className="w-20 py-2 px-1 text-center border-r border-old-money-200">км/ч</th>
                  </tr>
                )
              }

              // Coursing columns
              return (
                <tr key={i} className="contents">
                  <th className="w-16 py-2 px-1 text-center">Забег</th>
                  <th className="w-9 py-2 px-1 text-center" title="Маневренность (макс. 20)">Ман</th>
                  <th className="w-9 py-2 px-1 text-center" title="Резвость (макс. 20)">Резв</th>
                  <th className="w-9 py-2 px-1 text-center" title="Выносливость (макс. 20)">Вын</th>
                  <th className="w-9 py-2 px-1 text-center" title="Преследование (макс. 20)">Прес</th>
                  <th className="w-9 py-2 px-1 text-center" title="Энтузиазм (макс. 20)">Энт</th>
                  <th className="w-14 py-2 px-1 text-center border-r border-old-money-200">Сумма</th>
                </tr>
              )
            })}

            <th className="w-20 py-2 px-3 text-right">
              {isRacing ? 'Лучшее' : 'Итого'}
            </th>
            <th className="w-36 py-2 px-3">
              Квалификация / Переход
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-old-money-100/80">
          {results.map((result, idx) => {
            const rawScores = parseRawScores(result.raw_scores_json)
            const heats = rawScores?.heats || []
            const rawDogName = result.name_ru || result.name_lat || 'Без клички'
            const formattedDogName = toDogTitleCase(rawDogName)
            const secondaryName =
              result.name_ru && result.name_lat && result.name_ru !== result.name_lat
                ? toDogTitleCase(result.name_lat)
                : null

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
              <tr key={`${result.dog_id || 'unk'}-${idx}`} className={`hover:bg-cream-100/50 transition-colors ${rowBg}`}>
                {/* 1. Место */}
                <td className="w-12 py-2 px-2 text-center align-middle">
                  <PlacementBadge result={result} />
                </td>

                {/* 2. Номер по каталогу */}
                <td className="w-12 py-2 px-1 text-center text-charcoal-500 font-mono text-xs align-middle">
                  {result.catalog_no ? `№${result.catalog_no}` : '—'}
                </td>

                {/* 3. Кличка собаки (НЕ капс, без сокращений, полная в 1-2 строки) */}
                <td className="py-2 px-3 align-middle min-w-[220px]">
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
                    {secondaryName && (
                      <span className="text-[10px] text-charcoal-500 font-sans leading-tight">
                        {secondaryName}
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
                </td>

                {/* 4. Класс / Лига */}
                <td className="w-28 py-2 px-2 text-charcoal-600 text-xs border-r border-old-money-200 align-middle">
                  {classLabel}
                </td>

                {/* 5. Заезды / Круги */}
                {Array.from({ length: maxHeats }).map((_, heatIdx) => {
                  const heat = heats[heatIdx]
                  const dist = heat ? getHeatDistance(heat, rawScores) : null

                  if (isRacing) {
                    if (!heat) {
                      return (
                        <tr key={heatIdx} className="contents">
                          <td colSpan={6} className="py-2 px-2 text-center font-mono text-charcoal-300 border-r border-old-money-200 align-middle">
                            —
                          </td>
                        </tr>
                      )
                    }

                    const isWinner = isFastestHeat(heat, bestTimesByRace)
                    const speedMs = heat.speed_kmh ? (heat.speed_kmh / 3.6).toFixed(1) : null
                    const speedKmh = heat.speed_kmh ? heat.speed_kmh.toFixed(1) : null
                    const isHeatDq = heat.disqualified || (!heat.time && !heat.speed_kmh)

                    return (
                      <tr key={heatIdx} className="contents">
                        {/* Попона бокса */}
                        <td className="w-12 py-2 px-1 text-center align-middle">
                          <PoponaCell
                            number={heat.bib_number}
                            color={heat.bib_color}
                            compact
                            isWinner={isWinner}
                          />
                        </td>
                        {/* Номер заезда */}
                        <td className="w-14 py-2 px-1 text-center font-mono text-xs text-charcoal-600 align-middle">
                          №{heat.heat_number ?? heatIdx + 1}
                        </td>
                        {/* Дистанция */}
                        <td className="w-14 py-2 px-1 text-center text-[11px] text-charcoal-400 font-mono align-middle">
                          {dist ? `${dist}м` : '—'}
                        </td>
                        {/* Время */}
                        <td className="w-18 py-2 px-1 text-center font-mono text-xs align-middle">
                          {isHeatDq ? (
                            <span className="text-[11px] font-semibold text-rose-600 italic">
                              {heat.disqualification_reason || 'Сход'}
                            </span>
                          ) : (
                            <span className={`font-bold ${isWinner ? 'text-camel-800' : 'text-charcoal-900'}`}>
                              {heat.time ? `${heat.time}с` : '—'}
                            </span>
                          )}
                        </td>
                        {/* Скорость м/с */}
                        <td className="w-16 py-2 px-1 text-center font-mono text-[11px] text-charcoal-600 align-middle">
                          {isHeatDq ? '—' : speedMs ? `${speedMs}` : '—'}
                        </td>
                        {/* Скорость км/ч */}
                        <td className="w-20 py-2 px-1 text-center font-mono text-xs text-charcoal-800 font-semibold border-r border-old-money-200 align-middle">
                          {isHeatDq ? '—' : speedKmh ? `${speedKmh}` : '—'}
                        </td>
                      </tr>
                    )
                  }

                  // Coursing rendering
                  if (!heat) {
                    return (
                      <tr key={heatIdx} className="contents">
                        <td colSpan={7} className="py-2 px-2 text-center font-mono text-charcoal-300 border-r border-old-money-200 align-middle">
                          —
                        </td>
                      </tr>
                    )
                  }

                  const judges = heat.judges || []
                  const j1Scores = judges[0]?.scores || []
                  const j2Scores = judges[1]?.scores || []
                  const sum1 = judges[0]?.sum
                  const sum2 = judges[1]?.sum
                  const has2JudgesInHeat = judges.length >= 2
                  const heatTotal = heat.total != null ? heat.total : '—'
                  const isHeatDq = heat.disqualified

                  return (
                    <tr key={heatIdx} className="contents">
                      {/* Попона-забег: цвет попоны объединен с номером забега */}
                      <td className="w-16 py-2 px-1 text-center align-middle">
                        <CoursingHeatBadge
                          heatNumber={heat.bib_number ?? heat.heat_number ?? heatIdx + 1}
                          bibColor={heat.bib_color}
                          distance={dist}
                        />
                      </td>

                      {isHeatDq ? (
                        <td colSpan={6} className="py-2 px-2 text-center text-[11px] font-semibold text-rose-600 italic border-r border-old-money-200 align-middle">
                          {heat.disqualification_reason || 'Сход'}
                        </td>
                      ) : (
                        <>
                          {/* 5 колонок критериев: выводятся чистые цифры строго под заголовками Ман, Резв, Вын, Прес, Энт */}
                          {[0, 1, 2, 3, 4].map(cIdx => (
                            <td key={cIdx} className="w-9 py-2 px-1 text-center font-mono font-semibold tabular-nums align-middle">
                              <div className="flex flex-col items-center leading-tight">
                                <span className="text-xs text-charcoal-900">{j1Scores[cIdx] ?? '—'}</span>
                                {has2JudgesInHeat && (
                                  <span className="text-[10px] text-charcoal-500">{j2Scores[cIdx] ?? '—'}</span>
                                )}
                              </div>
                            </td>
                          ))}

                          {/* Сумма круга */}
                          <td className="w-14 py-2 px-1 text-center border-r border-old-money-200 align-middle">
                            <div className="flex flex-col items-center leading-tight">
                              <span className="font-serif font-bold text-xs text-camel-900 tabular-nums">
                                {heatTotal}
                              </span>
                              {has2JudgesInHeat && sum1 != null && sum2 != null && (
                                <span className="text-[9px] text-charcoal-400 font-mono">
                                  ({sum1}+{sum2})
                                </span>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}

                {/* 6. Итоговый балл / время */}
                <td className="w-20 py-2 px-3 text-right align-middle">
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
                </td>

                {/* 7. Квалификация / титулы / переход в лигу */}
                <td className="w-36 py-2 px-3 align-middle">
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
