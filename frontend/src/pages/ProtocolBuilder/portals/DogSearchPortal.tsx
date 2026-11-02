import React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import DogSexIcon from '../../../components/DogSexIcon'
import type { ActiveSearchDogState } from '../types'
import type { ExistingDog } from '../constants'

interface DogSearchPortalProps {
  activeSearchDog: ActiveSearchDogState | null
  filteredExistingDogs: ExistingDog[]
  onClose: () => void
  onSelectDog: (catId: string, dogId: string, dog: ExistingDog) => void
}

export const DogSearchPortal: React.FC<DogSearchPortalProps> = ({
  activeSearchDog,
  filteredExistingDogs,
  onClose,
  onSelectDog,
}) => {
  if (!activeSearchDog || filteredExistingDogs.length === 0 || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        data-portal-menu
        className="fixed z-50 bg-cream-50 rounded-xl border border-om-300 shadow-2xl py-1 divide-y divide-om-100 max-h-56 overflow-y-auto ring-1 ring-char-900/10 text-xs animate-in fade-in zoom-in-95 duration-100"
        style={{
          top:
            window.innerHeight - activeSearchDog.rect.bottom < 180
              ? Math.max(10, activeSearchDog.rect.top - 180)
              : activeSearchDog.rect.bottom + 4,
          left: Math.max(10, Math.min(window.innerWidth - 300, activeSearchDog.rect.left)),
          width: Math.max(280, activeSearchDog.rect.width)
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2.5 py-1 text-[9px] font-bold text-camel-800 uppercase tracking-wider bg-om-100/90 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xs border-b border-om-200/60">
          <span>Собаки из базы сайта</span>
          <button
            type="button"
            onClick={onClose}
            className="text-char-400 hover:text-char-800 p-0.5 rounded cursor-pointer"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
        {filteredExistingDogs.map((exDog, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectDog(activeSearchDog.catId, activeSearchDog.dogId, exDog)}
            className="w-full text-left px-2.5 py-1.5 hover:bg-camel-100/70 text-xs flex justify-between items-center transition-colors cursor-pointer"
          >
            <span className="font-semibold text-char-900 truncate">{exDog.name}</span>
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              <span className="text-[10px] text-char-400">{exDog.breed}</span>
              {exDog.sex && <DogSexIcon sex={exDog.sex} size={11} className="inline-block" />}
            </div>
          </button>
        ))}
      </div>
    </>,
    document.body
  )
}
