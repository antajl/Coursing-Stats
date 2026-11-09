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
        className="fixed z-50 w-52 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
        style={{
          top:
            window.innerHeight - activeRunMenu.rect.bottom < 130
              ? Math.max(10, activeRunMenu.rect.top - 110)
              : activeRunMenu.rect.bottom + 4,
          left: Math.max(10, Math.min(activeRunMenu.rect.right - 208, window.innerWidth - 220))
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2.5 py-1 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/70 mb-1 flex items-center justify-between">
          <span>Статус забега</span>
          <button
            type="button"
            onClick={onClose}
            className="text-char-400 hover:text-char-700 p-0.5 rounded focus:outline-none cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onSetStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'normal')
              onClose()
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
              currentRunStatus === 'normal'
                ? 'bg-camel-100/70 text-camel-900'
                : 'hover:bg-om-100 text-char-800'
            }`}
          >
            <div>
              <div className="font-semibold leading-tight">Оценки (баллы)</div>
              <div className="text-[10px] text-char-400 font-normal">Баллы по 5 критериям</div>
            </div>
            {currentRunStatus === 'normal' && (
              <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSetStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'withdrawn')
              onClose()
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
              currentRunStatus === 'withdrawn'
                ? 'bg-terracotta-100/70 text-terracotta-900'
                : 'hover:bg-terracotta-50 text-terracotta-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Ban className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
              <div>
                <div className="font-semibold leading-tight">Дисквалификация</div>
                <div className="text-[10px] text-char-400 font-normal">Собака снята с забега</div>
              </div>
            </div>
            {currentRunStatus === 'withdrawn' && (
              <Check className="w-3.5 h-3.5 text-terracotta-700 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSetStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'absent')
              onClose()
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
              currentRunStatus === 'absent'
                ? 'bg-om-200/80 text-char-900'
                : 'hover:bg-om-100 text-char-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-3.5 h-3.5 text-char-400 shrink-0" />
              <div>
                <div className="font-semibold leading-tight">Неявка</div>
                <div className="text-[10px] text-char-400 font-normal">Не явилась на старт</div>
              </div>
            </div>
            {currentRunStatus === 'absent' && (
              <Check className="w-3.5 h-3.5 text-char-700 shrink-0" />
            )}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
