import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import PlacementBadge from '../components/PlacementBadge'
import QualificationBadges from '../components/QualificationBadges'
import DetailPanel from '../details/DetailPanel'
import { parseRawScores } from '../utils'
import type { Result } from '../types'

interface TableProtocolViewProps {
  results: Result[]
  bestTimesByRace?: Record<string, number>
  isRacing?: boolean
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

  // Determine max heats count in this group
  const maxHeats = Math.max(
    ...results.map(r => parseRawScores(r.raw_scores_json).heats?.length || 0),
    2
  )

  return (
    <div className="overflow-x-auto rounded-xl border border-old-money-200/90 bg-white shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-cream-100/80 border-b border-old-money-200 text-charcoal-700 font-semibold select-none">
          <tr>
            <th className="w-12 py-2 px-2 text-center">Место</th>
            <th className="w-12 py-2 px-2 text-center text-charcoal-500">№ кат.</th>
            <th className="py-2 px-3">Собака</th>
            <th className="py-2 px-2 hidden sm:table-cell">Лига / Класс</th>
            {Array.from({ length: maxHeats }).map((_, i) => (
              <th key={i} className="py-2 px-2 text-center whitespace-nowrap">
                {i + 1} круг
              </th>
            ))}
            <th className="py-2 px-3 text-right">Итог</th>
            <th className="py-2 px-3 hidden md:table-cell">Титул / Переход</th>
            <th className="w-8 py-2 px-1 text-center"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-old-money-100/70">
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

            const isPodium = result.placement != null && result.placement <= 3
            const rowBg = isExpanded
              ? 'bg-camel-50/40'
              : idx % 2 === 1
                ? 'bg-cream-50/40 hover:bg-cream-100/60'
                : 'hover:bg-cream-100/60'

            return (
              <tr key={rowKey} className="group">
                <td colSpan={maxHeats + 6} className="p-0">
                  <div
                    onClick={() => toggleExpand(rowKey)}
                    className={`flex items-center w-full py-1.5 px-1 cursor-pointer transition-colors ${rowBg}`}
                  >
                    {/* Место */}
                    <div className="w-12 shrink-0 flex justify-center">
                      <PlacementBadge result={result} />
                    </div>

                    {/* Каталожный номер */}
                    <div className="w-12 shrink-0 text-center text-charcoal-500 font-mono text-xs">
                      {result.catalog_no || '—'}
                    </div>

                    {/* Кличка собаки и пол */}
                    <div className="flex-1 min-w-[160px] px-2 flex items-center gap-1.5 truncate">
                      {result.dog_id ? (
                        <Link
                          to={`/dog/${result.dog_id}/`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-charcoal-900 hover:text-camel-800 hover:underline truncate"
                        >
                          {dogName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-charcoal-900 truncate">{dogName}</span>
                      )}
                      {genderSymbol && (
                        <span className={`text-xs font-bold shrink-0 ${genderColor}`}>
                          {genderSymbol}
                        </span>
                      )}
                    </div>

                    {/* Лига / Класс */}
                    <div className="w-28 shrink-0 hidden sm:block px-2 text-charcoal-600 text-xs truncate">
                      {result.class_label || '—'}
                    </div>

                    {/* Забеги / круги */}
                    {Array.from({ length: maxHeats }).map((_, i) => {
                      const heat = heats[i]
                      const text = isRacing
                        ? (heat?.time ? `${heat.time}с` : '—')
                        : (heat?.total != null ? `${heat.total}` : '—')
                      return (
                        <div
                          key={i}
                          className="w-16 shrink-0 text-center font-mono text-xs text-charcoal-700"
                        >
                          {text}
                        </div>
                      )
                    })}

                    {/* Итоговый балл / время */}
                    <div className="w-24 shrink-0 px-2 text-right">
                      <span className="font-serif font-bold text-sm sm:text-base text-camel-800 tabular-nums">
                        {result.total_score != null ? result.total_score : '—'}
                      </span>
                      {isRacing && result.total_score && (
                        <span className="text-[10px] text-old-money-500 ml-0.5">с</span>
                      )}
                    </div>

                    {/* Квалификация / титулы */}
                    <div className="w-32 shrink-0 hidden md:flex items-center px-2">
                      {result.qualification ? (
                        <QualificationBadges qualification={result.qualification} />
                      ) : (
                        <span className="text-old-money-400">—</span>
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
