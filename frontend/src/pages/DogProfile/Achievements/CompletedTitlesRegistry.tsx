import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { titleBadgeClass } from '../../../lib/qualificationTitles'
import { getFullTitleLabel } from '../../../lib/awardTooltip'
import type { CumulativeEvaluationResult } from '../../../lib/cumulativeTitles'

export interface CompletedTitlesRegistryProps {
  cumulativeTitles: CumulativeEvaluationResult
  supremeTitles: { title: string; count: number }[]
  coursingTitles: { title: string; count: number }[]
  racingTitles: { title: string; count: number }[]
  showTitles: { title: string; count: number }[]
  totalTitlesCount: number
}

export function CompletedTitlesRegistry({
  cumulativeTitles,
  supremeTitles,
  coursingTitles,
  racingTitles,
  showTitles,
  totalTitlesCount,
}: CompletedTitlesRegistryProps) {
  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({})

  const toggleTitle = (id: string) => {
    setExpandedTitles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const renderCompletedTitleCard = (
    item: { title: string; count: number },
    category: 'supreme' | 'coursing' | 'racing' | 'show',
    borderColor: string,
    bgColor: string,
  ) => {
    const key = `completed-${category}-${item.title}`
    const isExpanded = Boolean(expandedTitles[key])
    const isShow = category === 'show'
    const explanation =
      cumulativeTitles.titleExplanations[`${category}:${item.title}`] ||
      cumulativeTitles.titleExplanations[item.title]
    const chipClass = titleBadgeClass(item.title)
    const fullLabel = getFullTitleLabel(item.title, isShow)

    return (
      <div
        key={key}
        className={`rounded-xl border transition-colors overflow-hidden ${borderColor} ${bgColor}`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleTitle(key)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleTitle(key)
            }
          }}
          className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative inline-flex shrink-0">
              <span
                className={`inline-flex shrink-0 items-center justify-center w-[92px] sm:w-[96px] rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums text-center whitespace-nowrap tracking-tight ${chipClass}`}
              >
                {item.title}
              </span>
              {item.count > 1 && (
                <span
                  className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-1 min-w-[17px] h-4 text-[9.5px] font-extrabold leading-none rounded-full bg-charcoal-800 text-white shadow-2xs border border-white"
                  title={`Оформлено ${item.count} раза`}
                >
                  ×{item.count}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-charcoal-900 leading-snug">{fullLabel}</h4>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-charcoal-400">
            <span className="text-[11px] hidden sm:inline text-charcoal-500 font-normal">
              {isExpanded ? 'Свернуть' : 'Подробнее'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-charcoal-700' : 'text-charcoal-400'
              }`}
              aria-hidden
            />
          </div>
        </div>

        {isExpanded && explanation && (
          <div className="px-3.5 pb-2.5 pt-1.5 text-xs text-charcoal-600 border-t border-old-money-100/70 bg-cream-50/40 leading-relaxed animate-in fade-in duration-150">
            <span className="font-semibold text-charcoal-800">Нормативное основание: </span>
            <span>{explanation}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
      <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
          Оформленные официальные чемпионские звания
        </h2>
        <span className="rounded-full bg-cream-200/80 text-charcoal-800 text-xs font-bold px-2.5 py-0.5">
          {totalTitlesCount}
        </span>
      </div>

      {totalTitlesCount === 0 ? (
        <div className="p-8 text-center text-charcoal-500 text-sm">
          У собаки пока нет оформленных чемпионских титулов. Выполняйте квалификационные нормативы в состязаниях и выставках!
        </div>
      ) : (
        <div className="divide-y divide-old-money-100">
          {/* 1. Высшие звания */}
          {supremeTitles.length > 0 && (
            <div className="px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-2">
                Высшие звания
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                {supremeTitles.map((item) =>
                  renderCompletedTitleCard(
                    item,
                    'supreme',
                    'border-amber-200/90',
                    'bg-amber-50/40',
                  ),
                )}
              </div>
            </div>
          )}

          {/* 2. Курсинг борзых */}
          {coursingTitles.length > 0 && (
            <div className="px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-forest-800 mb-2">
                Курсинг борзых
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                {coursingTitles.map((item) =>
                  renderCompletedTitleCard(
                    item,
                    'coursing',
                    'border-old-money-200/80',
                    'bg-white',
                  ),
                )}
              </div>
            </div>
          )}

          {/* 3. Бега борзых (рейсинг) */}
          {racingTitles.length > 0 && (
            <div className="px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-800 mb-2">
                Бега борзых (рейсинг)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                {racingTitles.map((item) =>
                  renderCompletedTitleCard(
                    item,
                    'racing',
                    'border-old-money-200/80',
                    'bg-white',
                  ),
                )}
              </div>
            </div>
          )}

          {/* 4. Выставки РКФ */}
          {showTitles.length > 0 && (
            <div className="px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800 mb-2">
                Выставки РКФ (экстерьер)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                {showTitles.map((item) =>
                  renderCompletedTitleCard(
                    item,
                    'show',
                    'border-old-money-200/80',
                    'bg-white',
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
