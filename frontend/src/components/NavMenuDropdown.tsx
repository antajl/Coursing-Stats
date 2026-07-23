import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icons } from '../lib/icons'

const OPEN_DELAY_MS = 70
const CLOSE_DELAY_MS = 120

export type NavMenuItem = {
  to: string
  label: string
  icon: LucideIcon
  isActive?: (pathname: string, search: string) => boolean
}

type NavMenuDropdownProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: ReactNode
  defaultTo: string
  title?: string
  isSectionActive: boolean
  items: NavMenuItem[]
  chevronLabel: string
}

export function NavMenuDropdown({
  open,
  onOpenChange,
  label,
  defaultTo,
  title,
  isSectionActive,
  items,
  chevronLabel,
}: NavMenuDropdownProps) {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinnedRef = useRef(false)

  const clearTimers = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const handleEnter = () => {
    clearTimers()
    openTimerRef.current = setTimeout(() => onOpenChange(true), OPEN_DELAY_MS)
  }

  const handleLeave = () => {
    clearTimers()
    closeTimerRef.current = setTimeout(() => {
      if (!pinnedRef.current) onOpenChange(false)
    }, CLOSE_DELAY_MS)
  }

  const toggleChevron = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    clearTimers()
    if (open) {
      pinnedRef.current = false
      onOpenChange(false)
    } else {
      pinnedRef.current = true
      onOpenChange(true)
    }
  }

  useEffect(() => {
    if (!open) pinnedRef.current = false
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        pinnedRef.current = false
        onOpenChange(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open, onOpenChange])

  useEffect(() => () => clearTimers(), [])

  const triggerTone = isSectionActive
    ? 'text-camel-700 dark:text-camel-400'
    : 'text-charcoal-700 dark:text-charcoal-200 hover:text-charcoal-900 dark:hover:text-charcoal-100'

  const chevronTone =
    open || isSectionActive
      ? 'text-camel-600 dark:text-camel-400'
      : 'text-charcoal-400 dark:text-charcoal-500 group-hover:text-camel-600 dark:group-hover:text-camel-400'

  return (
    <div ref={containerRef} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div className={`group relative flex shrink-0 items-stretch text-xs font-semibold lg:text-sm ${triggerTone}`}>
        <Link
          to={defaultTo}
          title={title}
          className="relative flex items-center whitespace-nowrap py-2 pl-2.5 pr-0.5 transition-colors duration-300 lg:pl-4"
        >
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={chevronLabel}
          onClick={toggleChevron}
          className={`flex items-center justify-center rounded-md py-2 pr-2 pl-0.5 transition-colors duration-200 lg:pr-2.5 ${chevronTone}`}
        >
          <Icons.chevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            strokeWidth={2.25}
            aria-hidden
          />
        </button>
        <span
          className={`pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-camel-600 transition-transform duration-300 ${
            isSectionActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      </div>

      {open && (
        <div className="nav-dropdown absolute left-1/2 top-full z-[100] w-max min-w-[9.5rem] -translate-x-1/2 pt-2">
          <div className="nav-dropdown-panel overflow-hidden rounded-xl border-2 border-old-money-200 bg-white shadow-xl dark:border-charcoal-600 dark:bg-charcoal-800">
            <ul className="py-1">
              {items.map((item) => {
                const active = item.isActive?.(location.pathname, location.search) ?? false
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => {
                        pinnedRef.current = false
                        onOpenChange(false)
                      }}
                      className={`flex items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-sm transition-colors ${
                        active
                          ? 'bg-camel-50 font-semibold text-camel-800 dark:bg-camel-950/30 dark:text-camel-300'
                          : 'text-charcoal-700 hover:bg-old-money-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${active ? 'text-camel-600 dark:text-camel-400' : 'text-old-money-500 dark:text-charcoal-400'}`}
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
