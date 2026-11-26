import React from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'
import type { CategoryGroup, ActiveAwardsMenuState } from '../types'
import { TITLES_LIST } from '../constants'

interface AwardsPortalProps {
  categories: CategoryGroup[]
  activeAwardsMenu: ActiveAwardsMenuState | null
  onClose: () => void
  onToggleAward: (catId: string, dogId: string, title: string) => void
}

export const AwardsPortal: React.FC<AwardsPortalProps> = ({
  categories,
  activeAwardsMenu,
  onClose,
  onToggleAward,
}) => {
  if (!activeAwardsMenu || typeof document === 'undefined') return null

  const targetCat = categories.find((c) => c.id === activeAwardsMenu.catId)
  const targetDog = targetCat?.dogs.find((d) => d.id === activeAwardsMenu.dogId)
  if (!targetDog) return null

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Закрыть"
        className="fixed inset-0 z-50 bg-transparent border-none p-0 cursor-pointer touch-manipulation"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        data-portal-menu
        className="fixed z-50 w-56 bg-cream-50 rounded-2xl border border-om-300 shadow-2xl p-1.5 text-xs ring-1 ring-charcoal-900/10"
        style={{
          top:
            window.innerHeight - activeAwardsMenu.rect.bottom < 260
              ? Math.max(10, activeAwardsMenu.rect.top - 250)
              : activeAwardsMenu.rect.bottom + 4,
          left: Math.max(10, Math.min(activeAwardsMenu.rect.right - 224, window.innerWidth - 235)),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/80 mb-1 flex items-center justify-between">
          <span>Выбор титулов</span>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 rounded-lg cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-0.5 space-y-0.5 max-h-60 overflow-y-auto">
          {TITLES_LIST.map((title) => {
            const active = (targetDog.awards || []).includes(title)
            return (
              <button
                key={title}
                type="button"
                onClick={() => onToggleAward(activeAwardsMenu.catId, activeAwardsMenu.dogId, title)}
                className={`w-full min-h-[44px] sm:min-h-[36px] text-left px-3 py-1.5 rounded-xl text-xs flex justify-between items-center transition-colors cursor-pointer ${
                  active
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'hover:bg-om-100 text-charcoal-800'
                }`}
              >
                <span>{title}</span>
                {active && <Check className="w-4 h-4 text-camel-700 shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </>,
    document.body
  )
}
