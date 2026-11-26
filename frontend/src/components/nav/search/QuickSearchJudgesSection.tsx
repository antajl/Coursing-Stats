import React from 'react'
import { Icons } from '../../../lib/icons'
import type { JudgeSearchItem, SearchItem } from '../quickSearchTypes'

interface QuickSearchJudgesSectionProps {
  judgeItems: Array<{ type: 'judge'; judge: JudgeSearchItem; score: number }>
  allItems: SearchItem[]
  selectedIndex: number
  onSelectItem: (item: SearchItem) => void
  onHoverIndex: (index: number) => void
}

export const QuickSearchJudgesSection: React.FC<QuickSearchJudgesSectionProps> = ({
  judgeItems,
  allItems,
  selectedIndex,
  onSelectItem,
  onHoverIndex,
}) => {
  if (judgeItems.length === 0) return null

  return (
    <div className="py-1">
      <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
        <span>Судьи и эксперты ({judgeItems.length})</span>
        <span className="text-[10px] text-charcoal-400 font-normal">Судейство</span>
      </div>
      {judgeItems.map((item) => {
        const idx = allItems.indexOf(item)
        const isSelected = idx === selectedIndex
        return (
          <button
            key={`judge-${item.judge.kind}-${item.judge.id}`}
            type="button"
            onClick={() => onSelectItem(item)}
            onMouseEnter={() => onHoverIndex(idx)}
            className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
              isSelected
                ? 'bg-camel-100/75 border-l-2 border-camel-600'
                : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-charcoal-900 truncate">
                  {item.judge.name}
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-old-money-100 text-camel-800 border border-old-money-200 shrink-0">
                  {item.judge.kind === 'js' ? 'Спорт' : 'РКФ'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                {item.judge.meta}
                {item.judge.count > 0 ? ` · ${item.judge.count}` : ''}
              </p>
            </div>
            <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
          </button>
        )
      })}
    </div>
  )
}
