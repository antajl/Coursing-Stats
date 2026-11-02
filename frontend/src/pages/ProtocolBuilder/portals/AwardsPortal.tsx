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
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        data-portal-menu
        className="fixed z-50 w-52 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
        style={{
          top:
            window.innerHeight - activeAwardsMenu.rect.bottom < 240
              ? Math.max(10, activeAwardsMenu.rect.top - 230)
              : activeAwardsMenu.rect.bottom + 4,
          left: Math.max(10, Math.min(activeAwardsMenu.rect.right - 208, window.innerWidth - 220))
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2.5 py-1 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/70 mb-1 flex items-center justify-between">
          <span>Выбор титулов</span>
          <button
            type="button"
            onClick={onClose}
            className="text-char-400 hover:text-char-700 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="p-0.5 space-y-0.5 max-h-56 overflow-y-auto">
          {TITLES_LIST.map((title) => {
            const active = (targetDog.awards || []).includes(title)
            return (
              <button
                key={title}
                type="button"
                onClick={() => onToggleAward(activeAwardsMenu.catId, activeAwardsMenu.dogId, title)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                  active
                    ? 'bg-camel-100 text-camel-900 font-bold'
                    : 'hover:bg-om-100 text-char-700'
                }`}
              >
                <span>{title}</span>
                {active && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </>,
    document.body
  )
}
