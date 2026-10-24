import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export interface AggressionIncident {
  event_id: number
  year?: number | null
  date: string | null
  title: string | null
  reason: string
}

interface DogAggressionBadgeProps {
  count?: number
  incidents?: AggressionIncident[]
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${day}.${month}.${year}`
  }
  return dateStr
}

export default function DogAggressionBadge({ count = 0, incidents = [] }: DogAggressionBadgeProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tipId = useId()

  const effectiveCount = Math.max(count, incidents.length)
  if (effectiveCount <= 0) return null

  const isRepeat = effectiveCount >= 2

  const updateCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const scrollY = window.scrollY || document.documentElement.scrollTop
    const scrollX = window.scrollX || document.documentElement.scrollLeft
    const panelWidth = Math.min(window.innerWidth - 32, 352)
    const maxLeft = scrollX + window.innerWidth - panelWidth - 16
    const left = Math.max(scrollX + 16, Math.min(rect.left + scrollX, maxLeft))
    setCoords({ top: rect.bottom + scrollY + 6, left })
  }

  useEffect(() => {
    if (!open) return
    updateCoords()
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onScroll = (e: Event) => {
      const target = e.target as Node | null
      if (target && panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const onResize = () => setOpen(false)

    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const toggle = () => {
    if (!open) updateCoords()
    setOpen((v) => !v)
  }

  const badgeClass =
    'border-rose-300 bg-rose-50/90 text-rose-950 hover:bg-rose-100 hover:border-rose-400'

  const iconClass = 'text-rose-700'
  const labelText = isRepeat
    ? `Повторная агрессия (${effectiveCount})`
    : `Дисквалификация за агрессию (1)`

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={tipId}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${badgeClass}`}
        title="Нажмите для просмотра подробностей инцидентов"
      >
        <ShieldAlert className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} aria-hidden="true" />
        <span>{labelText}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={tipId}
            role="dialog"
            aria-label="Подробности дисквалификаций за агрессию"
            style={{ top: coords.top, left: coords.left }}
            className="absolute z-40 w-[min(calc(100vw-32px),22rem)] rounded-xl border border-old-money-200 bg-white p-4 shadow-xl text-left"
          >
            <div className="flex items-start justify-between gap-2 border-b border-old-money-100 pb-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
                  <ShieldAlert className={`h-4 w-4 shrink-0 ${iconClass}`} />
                  <span>{isRepeat ? 'Повторная агрессия (рецидив)' : 'Дисквалификация за агрессию'}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-charcoal-500">
                  Официальные записи в судейских протоколах РКФ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-charcoal-400 hover:bg-cream-100 hover:text-charcoal-700 transition-colors cursor-pointer"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {incidents.length > 0 ? (
                incidents.map((inc, idx) => (
                  <div
                    key={`${inc.event_id}-${idx}`}
                    className="rounded-lg border border-old-money-100 bg-cream-50/70 p-2.5 text-xs"
                  >
                    <div className="flex items-baseline justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-charcoal-700">
                        {formatDate(inc.date)}
                      </span>
                      {inc.event_id ? (
                        <Link
                          to={`/event/${inc.event_id}`}
                          onClick={() => setOpen(false)}
                          className="font-medium text-camel-700 hover:text-camel-800 underline truncate max-w-[11rem]"
                          title="Открыть состязание"
                        >
                          {inc.title || `Состязание #${inc.event_id}`}
                        </Link>
                      ) : (
                        <span className="text-charcoal-500 truncate max-w-[11rem]">
                          {inc.title || 'Состязание'}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-medium text-rose-800 text-[11px] bg-rose-50/80 rounded px-1.5 py-0.5 border border-rose-200/60 inline-block">
                      {inc.reason || 'Агрессия'}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-charcoal-600">
                  Зафиксировано {effectiveCount} снятий за агрессию на трассе или после финиша.
                </p>
              )}
            </div>

            <p className="mt-3 text-[10px] leading-tight text-charcoal-400 border-t border-old-money-100 pt-2">
              Правила РКФ/FCI: нападение или агрессивное поведение к собаке-партнёру влечёт дисквалификацию с состязаний.
            </p>
          </div>,
          document.body,
        )}
    </>
  )
}
