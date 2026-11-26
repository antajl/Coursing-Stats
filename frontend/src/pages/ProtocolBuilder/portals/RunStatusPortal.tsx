import React from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Ban, Clock } from 'lucide-react'
import type { CategoryGroup, RunStatus, ActiveRunMenuState } from '../types'

interface RunStatusPortalProps {
  categories: CategoryGroup[]
  activeRunMenu: ActiveRunMenuState | null
  onClose: () => void
  onSetStatus: (catId: string, dogId: string, rIdx: number, status: RunStatus, reason?: string) => void
}

export const RunStatusPortal: React.FC<RunStatusPortalProps> = ({
  categories,
  activeRunMenu,
  onClose,
  onSetStatus,
}) => {
  if (!activeRunMenu || typeof document === 'undefined') return null

  const activeCat = categories.find((c) => c.id === activeRunMenu.catId)
  const activeDog = activeCat?.dogs.find((d) => d.id === activeRunMenu.dogId)
  const currentRunStatus = activeDog?.runs[activeRunMenu.rIdx]?.status || 'normal'

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
            window.innerHeight - activeRunMenu.rect.bottom < 170
              ? Math.max(10, activeRunMenu.rect.top - 160)
              : activeRunMenu.rect.bottom + 4,
          left: Math.max(10, Math.min(activeRunMenu.rect.right - 224, window.innerWidth - 235)),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/80 mb-1 flex items-center justify-between">
          <span>Статус забега</span>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 rounded-lg cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onSetStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'normal')
              onClose()
            }}
            className={`w-full min-h-[44px] text-left px-3 py-1.5 rounded-xl font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
              currentRunStatus === 'normal'
                ? 'bg-camel-100/80 text-camel-950'
                : 'hover:bg-om-100 text-charcoal-800'
            }`}
          >
            <div>
              <div className="font-semibold leading-tight">Оценки (баллы)</div>
              <div className="text-[11px] text-charcoal-600 font-normal">5 критериев М/Р/В/П/Э</div>
            </div>
            {currentRunStatus === 'normal' && <Check className="w-4 h-4 text-camel-700 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => {
              onSetStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'withdrawn')
              onClose()
            }}
            className={`w-full min-h-[44px] text-left px-3 py-1.5 rounded-xl font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
              currentRunStatus === 'withdrawn'
                ? 'bg-terracotta-100/80 text-terracotta-950'
                : 'hover:bg-terracotta-50 text-terracotta-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Ban className="w-4 h-4 text-terracotta-700 shrink-0" />
              <div>
                <div className="font-semibold leading-tight">Дисквалификация</div>
                <div className="text-[11px] text-charcoal-600 font-normal">Собака снята с забега</div>
              </div>
            </div>
            {currentRunStatus === 'withdrawn' && <Check className="w-4 h-4 text-terracotta-700 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => {
              onSetStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'absent')
              onClose()
            }}
            className={`w-full min-h-[44px] text-left px-3 py-1.5 rounded-xl font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
              currentRunStatus === 'absent'
                ? 'bg-om-200/80 text-charcoal-950'
                : 'hover:bg-om-100 text-charcoal-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-charcoal-600 shrink-0" />
              <div>
                <div className="font-semibold leading-tight">Неявка</div>
                <div className="text-[11px] text-charcoal-600 font-normal">Не явилась на старт</div>
              </div>
            </div>
            {currentRunStatus === 'absent' && <Check className="w-4 h-4 text-charcoal-800 shrink-0" />}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
