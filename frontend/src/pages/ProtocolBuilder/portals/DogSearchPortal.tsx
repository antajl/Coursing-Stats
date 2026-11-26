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

const SOURCE_LABEL: Record<NonNullable<ExistingDog['source']>, string> = {
  sport: 'Спорт',
  show: 'Выставки',
  donino: 'Донино',
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
      <button
        type="button"
        aria-label="Закрыть"
        className="fixed inset-0 z-50 bg-transparent border-none p-0 cursor-pointer touch-manipulation"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        data-portal-menu
        className="fixed z-50 bg-cream-50 rounded-2xl border border-om-300 shadow-2xl py-1 divide-y divide-om-100 max-h-64 overflow-y-auto ring-1 ring-charcoal-900/10 text-xs"
        style={{
          top:
            window.innerHeight - activeSearchDog.rect.bottom < 200
              ? Math.max(10, activeSearchDog.rect.top - 200)
              : activeSearchDog.rect.bottom + 4,
          left: Math.max(10, Math.min(window.innerWidth - 320, activeSearchDog.rect.left)),
          width: Math.max(300, Math.min(400, activeSearchDog.rect.width + 40)),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-1.5 text-[10px] font-bold text-camel-800 uppercase tracking-wider bg-om-100/95 flex justify-between items-center sticky top-0 z-10 border-b border-om-200/80">
          <span>Собаки из базы сайта</span>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 rounded-lg cursor-pointer"
            aria-label="Закрыть подсказки"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {filteredExistingDogs.map((exDog, i) => (
          <button
            key={`${exDog.id || exDog.name}-${i}`}
            type="button"
            onClick={() => onSelectDog(activeSearchDog.catId, activeSearchDog.dogId, exDog)}
            className="w-full min-h-[44px] sm:min-h-[38px] text-left px-3 py-2 hover:bg-camel-100/70 text-xs flex justify-between items-center gap-2 transition-colors cursor-pointer"
          >
            <div className="min-w-0">
              <div className="font-semibold text-charcoal-900 truncate">{exDog.name}</div>
              {exDog.name_lat && exDog.name_lat !== exDog.name && (
                <div className="text-[11px] text-charcoal-600 truncate">{exDog.name_lat}</div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {exDog.breed && <span className="text-[11px] text-charcoal-600 max-w-[115px] truncate">{exDog.breed}</span>}
              {exDog.source && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-om-100 text-charcoal-700 font-medium">
                  {SOURCE_LABEL[exDog.source]}
                </span>
              )}
              {exDog.sex && <DogSexIcon sex={exDog.sex} size={12} className="inline-block" />}
            </div>
          </button>
        ))}
      </div>
    </>,
    document.body
  )
}
