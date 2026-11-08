import { useMemo, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Award } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import ProtocolHeatBadge, { getHeatDistance } from '../components/ProtocolHeatBadge'
import QualificationBadges from '../components/QualificationBadges'
import DogSexIcon from '../../../../components/DogSexIcon'
import {
  parseRawScores,
  extractDogSex,
} from '../utils'
import { displayStatusReason } from '../../../../lib/statusReason'
import { normalizeQualificationAndVc } from '../ResultSummary'
import { parseDogName } from '../../../../lib/dogName'
import { useInfiniteScroll } from '../../../../hooks/useInfiniteScroll'
import type { Result } from '../types'

interface MobileCardsProtocolViewProps {
  groupedResults?: Record<string, Result[]>
  sortedGroupKeys?: string[]
  results?: Result[]
  bestTimesByRace?: Record<string, number>
  isRacing?: boolean
}

const CRITERIA_5_LABELS = ['М', 'Р', 'В', 'П', 'Э'] as const

function breedCountLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} собака`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} собаки`
  return `${count} собак`
}

export default function MobileCardsProtocolView({
  groupedResults,
  sortedGroupKeys,
  results,
  bestTimesByRace,
  isRacing = false,
}: MobileCardsProtocolViewProps) {
  const allResults = useMemo(() => {
    if (results && results.length > 0) return results
    if (groupedResults && sortedGroupKeys) {
      return sortedGroupKeys.flatMap(k => groupedResults[k] || [])
    }
    return []
  }, [results, groupedResults, sortedGroupKeys])

  const { visibleCount, loadMoreRef } = useInfiniteScroll(
    allResults.length,
    [sortedGroupKeys, results],
    25
  )

  const visibleGroupKeys = useMemo(() => {
    if (!sortedGroupKeys || !groupedResults) return []
    let accumulated = 0
    const keys: string[] = []
    for (const key of sortedGroupKeys) {
      const groupDogs = groupedResults[key] || []
      keys.push(key)
      accumulated += groupDogs.length
      if (accumulated >= visibleCount) break
    }
    return keys
  }, [sortedGroupKeys, groupedResults, visibleCount])

  const visibleResults = useMemo(() => {
    if (!results) return []
    return results.slice(0, visibleCount)
  }, [results, visibleCount])

  const effectiveHasMore = sortedGroupKeys
    ? visibleGroupKeys.length < sortedGroupKeys.length
    : Boolean(results && visibleCount < results.length)

  const renderCard = (result: Result, idx: number) => {
    const cardKey = `${result.dog_id || 'unk'}-${result.id || idx}`
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

    const { qualification, vc } = normalizeQualificationAndVc(result)
    const qualTokens = (qualification || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const hasVcToken = qualTokens.some(p => /^(cc|сс)$/i.test(p))
    const cleanTokens = qualTokens.filter(p => !/^(cc|сс)$/i.test(p))
    const showVc = Boolean(vc || hasVcToken)

    // Собираем все награды собаки для мобильной карточки (включая СС при его наличии)
    const cardAwardsTokens = [...cleanTokens]
    if (showVc && !cardAwardsTokens.some(p => /^(cc|сс)$/i.test(p))) {
      cardAwardsTokens.push('СС')
    }
    const cardAwards = (!isDns && !isDq) ? cardAwardsTokens.join(', ') : ''

    const classLabel = result.class_label || (result as any).breed_class?.split(' - ')[1] || ''

    // Подиумный акцент (элегантная левая цветная полоса, без внешних рамок и разрывов)
    const isGold = result.placement === 1
    const isSilver = result.placement === 2
    const isBronze = result.placement === 3

    const podiumBorder = isGold
      ? 'border-l-[3.5px] border-l-amber-500 bg-amber-50/15'
      : isSilver
        ? 'border-l-[3.5px] border-l-slate-400 bg-slate-50/15'
        : isBronze
          ? 'border-l-[3.5px] border-l-amber-700/60 bg-amber-50/10'
          : isDns
            ? 'border-l-[3.5px] border-l-transparent bg-old-money-50/50 opacity-60'
            : isDq
              ? 'border-l-[3.5px] border-l-rose-500 bg-rose-50/20'
              : idx % 2 === 1
                ? 'border-l-[3.5px] border-l-transparent bg-cream-50/30'
                : 'border-l-[3.5px] border-l-transparent bg-white'

    return (
      <div
        key={cardKey}
        className={`p-2.5 sm:p-3 space-y-1.5 transition-colors ${podiumBorder}`}
      >
        {/* Шапка карточки: [Место] Кличка + № ··· Итог [СС] */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="shrink-0">
              <PlacementBadge result={result} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                {result.dog_id ? (
                  <Link
                    to={`/dog/${result.dog_id}/`}
                    title={secondaryDogName || undefined}
                    className="font-serif font-bold text-xs sm:text-sm text-charcoal-900 hover:text-camel-800 hover:underline"
                  >
                    {formattedDogName}
                  </Link>
                ) : (
                  <span
                    title={secondaryDogName || undefined}
                    className="font-serif font-bold text-xs sm:text-sm text-charcoal-900"
                  >
                    {formattedDogName}
                  </span>
                )}
                {dogSex && (
                  <span className="inline-flex items-center select-none -translate-y-px">
                    <DogSexIcon sex={dogSex} size={12} />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 font-mono pt-0.5">
                {result.catalog_no && <span>№{result.catalog_no}</span>}
                {classLabel && <span className="font-sans text-charcoal-600">· {classLabel}</span>}
              </div>
            </div>
          </div>

          {/* Итоговый результат */}
          <div className="shrink-0 text-right leading-none">
            {isDns ? (
              <span className="text-[11px] font-semibold text-charcoal-500 bg-old-money-100 px-1.5 py-0.5 rounded">
                Неявка
              </span>
            ) : isDq ? (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                {statusReason || 'Дисквал.'}
              </span>
            ) : (
              <div className="flex items-center justify-end gap-1">
                {showVc && (
                  <span className="inline-flex items-center px-1 py-0.5 text-[9px] font-mono font-medium text-charcoal-600 bg-old-money-100 border border-old-money-200 rounded leading-none">
                    СС
                  </span>
                )}
                <span className="font-serif font-bold text-sm sm:text-base text-camel-800 tabular-nums">
                  {result.total_score != null ? result.total_score : '—'}
                </span>
                {isRacing && result.total_score && <span className="text-[11px] font-sans text-old-money-500">с</span>}
                {!isRacing && result.total_score && <span className="text-[11px] font-sans text-old-money-500">б</span>}
              </div>
            )}
          </div>
        </div>

        {/* Сетка кругов / заездов: ВСЕГДА в один горизонтальный ряд (2 колонки для 2 кругов, 3 колонки для 3 кругов) */}
        {!isDns && heats.length > 0 && (
          <div className={`grid gap-1.5 ${heats.length === 1 ? 'grid-cols-1' : heats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {heats.map((heat, hIdx) => {
              const dist = getHeatDistance(heat, rawScores)
              const isHeatDq = heat.disqualified || (isRacing && !heat.time && !heat.speed_kmh)

              if (isRacing) {
                const speedKmh = heat.speed_kmh ? heat.speed_kmh.toFixed(1) : null
                const heatNum = heat.heat_number ?? heat.bib_number ?? hIdx + 1
                const isFinal = heats.length >= 3 && hIdx === heats.length - 1
                const heatLabel = isFinal ? 'Финал' : `${hIdx + 1}-й круг`

                return (
                  <div key={hIdx} className="bg-cream-50/80 border border-old-money-200/60 rounded-md p-1.5 text-xs space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 font-semibold text-charcoal-800 text-[11px] min-w-0">
                        <ProtocolHeatBadge
                          heatNumber={heatNum}
                          bibColor={heat.bib_color}
                          bibNumber={heat.bib_number}
                          isRacing={true}
                          size="sm"
                        />
                        <span className="truncate text-[10px] sm:text-[11px]">{heatLabel}</span>
                      </div>
                      {dist && <span className="text-[9px] text-charcoal-400 font-mono shrink-0 hidden xs:inline">{dist}м</span>}
                    </div>
                    {isHeatDq ? (
                      <div className="text-rose-600 text-[11px] italic font-semibold">Сход</div>
                    ) : (
                      <div className="flex items-baseline justify-between gap-1 pt-0.5 font-mono">
                        <span className="font-bold text-xs sm:text-sm text-charcoal-900 whitespace-nowrap">{heat.time}&nbsp;с</span>
                        {speedKmh && (
                          <span className="text-[10px] text-charcoal-500 whitespace-nowrap">{speedKmh} км/ч</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              // Курсинг плашка забега
              const judges = heat.judges || []
              const primaryScores = judges[0]?.scores || []
              const judgeSums = judges
                .map(j => j.sum)
                .filter((sum): sum is number | string => sum != null)

              return (
                <div key={hIdx} className="bg-cream-50/80 border border-old-money-200/60 rounded-md p-1.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-semibold text-charcoal-800 text-[11px]">
                      <ProtocolHeatBadge
                        heatNumber={heat.bib_number ?? heat.heat_number ?? hIdx + 1}
                        bibColor={heat.bib_color}
                        size="sm"
                      />
                      <span>{hIdx + 1}-й забег</span>
                    </div>
                    <div className="font-serif font-bold text-charcoal-900 text-xs">
                      {heat.total != null ? `${heat.total} б.` : '—'}
                      {judgeSums.length > 1 && (
                        <span className="text-[9px] text-charcoal-400 font-mono font-normal ml-0.5">
                          ({judgeSums.join('+')})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5 критериев прямо на карточке */}
                  <div className="grid grid-cols-5 gap-0.5 pt-0.5 text-center bg-white rounded p-1 border border-old-money-100/70">
                    {CRITERIA_5_LABELS.map((lbl, cIdx) => (
                      <div key={lbl} className="flex flex-col items-center leading-none">
                        <span className="text-[9px] font-semibold text-charcoal-400 pb-0.5">{lbl}</span>
                        <span className="font-mono text-[10px] sm:text-[11px] font-bold text-charcoal-800 tabular-nums">
                          {primaryScores[cIdx] ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Подвал карточки: Награды и переход в лигу в обособленной плашке с рамкой */}
        {cardAwards && (
          <div className="mt-2 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-cream-50/80 border border-old-money-200/70 text-[11px]">
            <div className="flex items-center gap-1.5 shrink-0 text-charcoal-600 font-medium">
              <Award className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden="true" />
              <span className="text-[10.5px] text-charcoal-700 font-semibold tracking-wide">
                Награды:
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1">
              <QualificationBadges qualification={cardAwards} />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedGroupKeys && groupedResults ? (
        visibleGroupKeys.map(groupKey => {
          const groupResults = groupedResults[groupKey] || []
          if (groupResults.length === 0) return null

          return (
            <div
              key={groupKey}
              className="overflow-hidden rounded-xl border border-old-money-200/90 bg-white shadow-2xs divide-y divide-old-money-200"
            >
              {/* Фирменная плашка группы пород — бесшовно переходит в первую собаку */}
              <div className="bg-camel-100/80 border-b border-camel-200/90 py-1.5 px-3 select-none flex items-center justify-between">
                <span className="font-semibold text-xs text-camel-950">
                  {groupKey}
                </span>
                <span className="text-[11px] font-medium text-camel-700">
                  {breedCountLabel(groupResults.length)}
                </span>
              </div>
              {/* Карточки собак группы */}
              {groupResults.map((result, idx) => renderCard(result, idx))}
            </div>
          )
        })
      ) : (
        <div className="overflow-hidden rounded-xl border border-old-money-200/90 bg-white shadow-2xs divide-y divide-old-money-200">
          {visibleResults.map((result, idx) => renderCard(result, idx))}
        </div>
      )}

      {effectiveHasMore && (
        <div
          ref={loadMoreRef}
          className="py-3 text-center text-xs text-charcoal-500 font-medium select-none"
        >
          Загрузка следующих участников…
        </div>
      )}
    </div>
  )
}
