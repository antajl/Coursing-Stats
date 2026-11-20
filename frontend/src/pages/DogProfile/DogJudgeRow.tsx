import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import PlacementMedalBadge from '../../components/PlacementMedalBadge'
import type { RankedJudgeItem } from './dogJudgesStats'

export interface DogJudgeRowProps {
  judge: RankedJudgeItem
  variant: 'higher' | 'lower'
  isExpanded: boolean
  onToggle: () => void
  eventPlacementMap: Map<string | number, number>
}

export function DogJudgeRow({
  judge,
  variant,
  isExpanded,
  onToggle,
  eventPlacementMap,
}: DogJudgeRowProps) {
  const avgScore = judge.avg_score != null ? judge.avg_score.toFixed(1) : null
  const scoreDiff = judge.scoreDelta
  const placeDiff = judge.placeDelta

  return (
    <div className="transition-colors hover:bg-cream-50/60">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 cursor-pointer min-h-[44px]"
        aria-expanded={isExpanded}
      >
        {/* Левая часть: Имя эксперта, число состязаний, места и дельта к карьере */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-semibold text-charcoal-900 text-xs sm:text-sm truncate">
              {judge.judge_name}
            </span>
            <span className="text-[11px] text-charcoal-400 font-normal shrink-0">
              {judge.starts_count} сост.
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-[11px] leading-tight flex-wrap text-charcoal-600">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-charcoal-500 mr-0.5">места:</span>
              {(judge.placements && judge.placements.length > 0
                ? judge.placements
                : judge.avg_placement != null
                  ? [Math.round(judge.avg_placement)]
                  : []
              ).map((pl, idx) => (
                <PlacementMedalBadge key={idx} place={pl} size="xs" />
              ))}
            </div>

            <span className="text-old-money-300">•</span>

            {/* Дельта к карьере — чистый цветной текст, без фоновых пилюль */}
            {variant === 'higher' ? (
              <span className="font-medium text-forest-700">
                {scoreDiff > 0 ? `+${scoreDiff.toFixed(1)} б. к ср.` : '= ср. карьеры'}
              </span>
            ) : (
              <span className="font-medium text-rose-700">
                {scoreDiff < 0
                  ? `${scoreDiff.toFixed(1)} б. от ср.`
                  : placeDiff <= -1.0
                    ? `на ${Math.abs(placeDiff).toFixed(1)} м. ниже`
                    : 'строже обычного'}
              </span>
            )}
          </div>
        </div>

        {/* Правая часть: Чистый средний балл (без рамки) и шеврон */}
        <div className="flex items-center gap-2 shrink-0">
          {avgScore ? (
            <div className="text-right tabular-nums">
              <div
                className={`text-xs sm:text-sm font-bold leading-tight ${
                  variant === 'higher' ? 'text-forest-900' : 'text-rose-900'
                }`}
              >
                {avgScore} б.
              </div>
              <div className="text-[9px] text-charcoal-400 uppercase tracking-wide leading-none mt-0.5">
                ср. балл
              </div>
            </div>
          ) : (
            <span className="text-xs text-charcoal-400">—</span>
          )}

          <div className="text-charcoal-400 ml-1">
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden />
            )}
          </div>
        </div>
      </button>

      {/* Раскрывающийся список турниров с прямыми кликабельными ссылками на протоколы */}
      {isExpanded && (
        <div className="border-t border-old-money-100 bg-cream-50/70 p-2.5 sm:p-3 space-y-1.5 text-xs">
          <div className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider px-1">
            Результаты под этим экспертом (кликните для перехода в протокол):
          </div>
          {judge.events.map((ev, eIdx) => {
            const evPlacement = eventPlacementMap.get(ev.event_id)
            return (
              <Link
                key={eIdx}
                to={`/event/${ev.event_id}/`}
                className="group flex items-center justify-between gap-2.5 p-2 rounded-lg bg-white/90 hover:bg-white border border-old-money-200/70 hover:border-old-money-300 transition-colors shadow-2xs"
                title="Открыть протокол состязания"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate flex items-center gap-1.5">
                    <span className="truncate">{ev.title}</span>
                    <ExternalLink
                      className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-camel-600 shrink-0"
                      aria-hidden
                    />
                  </div>
                  <div className="text-[10px] text-charcoal-400 mt-0.5">{ev.date}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {evPlacement != null && (
                    <PlacementMedalBadge place={evPlacement} size="xs" />
                  )}
                  <div className="text-right">
                    {ev.avg_score != null ? (
                      <div className="font-bold text-charcoal-900 tabular-nums text-xs">
                        {ev.avg_score.toFixed(1)} б.
                      </div>
                    ) : (
                      <div className="text-charcoal-400">—</div>
                    )}
                    {ev.scores && ev.scores.length > 0 && (
                      <div className="text-[9px] text-charcoal-400 tabular-nums">
                        забеги: {ev.scores.join(' / ')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
