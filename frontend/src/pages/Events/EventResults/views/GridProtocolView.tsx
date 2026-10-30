import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import QualificationBadges from '../components/QualificationBadges'
import DetailPanel from '../details/DetailPanel'
import { parseRawScores } from '../utils'
import type { Result } from '../types'

interface GridProtocolViewProps {
  results: Result[]
  bestTimesByRace?: Record<string, number>
  isRacing?: boolean
}

export default function GridProtocolView({
  results,
  bestTimesByRace,
  isRacing = false,
}: GridProtocolViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (key: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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
                ? 'col-span-1 lg:col-span-2 border-camel-300 bg-cream-50 shadow-xs'
                : 'border-old-money-200/80 bg-white hover:border-camel-300 hover:bg-cream-50/50'
            }`}
          >
            {/* Карточка плитки */}
            <div
              onClick={() => toggleExpand(rowKey)}
              className="p-3 cursor-pointer select-none space-y-1.5"
            >
              {/* Верхняя строка: Место + Кличка + Итог */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="shrink-0">
                    <PlacementBadge result={result} />
                  </div>
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
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-serif font-bold text-base sm:text-lg text-camel-800 tabular-nums">
                    {result.total_score != null ? result.total_score : '—'}
                  </span>
                  {isRacing && result.total_score && (
                    <span className="text-xs text-old-money-500 font-sans">сек</span>
                  )}
                  <div className="text-charcoal-400">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-camel-700" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Нижняя строка: Сплиты + Лига + Титул */}
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs pt-0.5 border-t border-old-money-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {result.class_label && (
                    <span className="text-[11px] font-medium text-charcoal-500">
                      {result.class_label}
                    </span>
                  )}
                  <span className="text-old-money-300">·</span>
                  <div className="flex items-center gap-1 text-[11px] text-charcoal-600 font-mono">
                    {heats.map((heat, i) => (
                      <span key={i} className="inline-flex items-center">
                        <span className="text-old-money-400 mr-0.5">{i + 1}к:</span>
                        {isRacing ? (heat.time ? `${heat.time}с` : '—') : (heat.total ?? '—')}
                        {i < heats.length - 1 && <span className="text-old-money-300 ml-1">·</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {result.qualification && (
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <QualificationBadges qualification={result.qualification} />
                  </div>
                )}
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
  )
}
