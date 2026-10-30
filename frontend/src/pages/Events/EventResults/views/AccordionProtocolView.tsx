import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import QualificationBadges from '../components/QualificationBadges'
import DetailPanel from '../details/DetailPanel'
import { parseRawScores } from '../utils'
import type { Result } from '../types'

interface AccordionProtocolViewProps {
  results: Result[]
  bestTimesByRace?: Record<string, number>
  isRacing?: boolean
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
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-charcoal-500 hover:text-camel-800 transition-colors"
        >
          <ChevronsUpDown className="h-3 w-3" />
          <span>{expandedIds.size === results.length ? 'Свернуть все' : 'Развернуть все'}</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {results.map((result, idx) => {
          const rowKey = `${result.dog_id || 'unk'}-${idx}`
          const isExpanded = expandedIds.has(rowKey)
          const rawScores = parseRawScores(result.raw_scores_json)
          const heats = rawScores.heats || []
          const dogName = result.name_ru || result.name_lat || 'Без клички'
          const genderSymbol =
            result.dog?.gender === 'M' ? '♂' : result.dog?.gender === 'F' ? '♀' : ''
          const genderColor =
            result.dog?.gender === 'M'
              ? 'text-sky-700'
              : result.dog?.gender === 'F'
                ? 'text-rose-700'
                : 'text-charcoal-400'

          return (
            <div
              key={rowKey}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-camel-300 bg-cream-50 shadow-xs'
                  : 'border-old-money-200/80 bg-white hover:border-camel-300 hover:bg-cream-50/50'
              }`}
            >
              {/* Строка-сводка собаки */}
              <div
                onClick={() => toggleExpand(rowKey)}
                className="flex items-center justify-between p-2.5 sm:px-3.5 cursor-pointer gap-2 select-none"
              >
                {/* Левая группа: Место + Собака + Пол + Лига */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="shrink-0">
                    <PlacementBadge result={result} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                    {result.dog_id ? (
                      <Link
                        to={`/dog/${result.dog_id}/`}
                        onClick={(e) => e.stopPropagation()}
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

                    {result.class_label && (
                      <span className="text-xs text-charcoal-500 font-medium">
                        ({result.class_label})
                      </span>
                    )}

                    {result.qualification && (
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <QualificationBadges qualification={result.qualification} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Правая группа: Сплиты забегов + Итог + Шеврон */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Мини-чипы сплитов кругов (на десктопе) */}
                  <div className="hidden lg:flex items-center gap-1.5">
                    {heats.map((heat, i) => {
                      const val = isRacing
                        ? (heat.time ? `${heat.time} с` : '—')
                        : (heat.total != null ? `${heat.total} б` : '—')
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md border border-old-money-200/60 bg-cream-100/70 px-2 py-0.5 text-xs font-mono text-charcoal-700"
                        >
                          <span className="text-[10px] text-old-money-400 mr-1">{i + 1}к:</span>
                          {val}
                        </span>
                      )
                    })}
                  </div>

                  {/* Итоговый результат */}
                  <div className="flex items-baseline gap-0.5 text-right min-w-[3.5rem]">
                    <span className="font-serif font-bold text-base sm:text-lg text-camel-800 tabular-nums">
                      {result.total_score != null ? result.total_score : '—'}
                    </span>
                    {isRacing && result.total_score && (
                      <span className="text-xs text-old-money-500 font-sans">сек</span>
                    )}
                  </div>

                  {/* Иконка разворота */}
                  <div className="text-charcoal-400">
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
                <div className="border-t border-old-money-200/70 p-3 sm:px-4 bg-cream-50/60 rounded-b-xl">
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
