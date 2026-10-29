import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

interface ModernDropdownProps {
  trigger: ReactNode
  children: ReactNode
  className?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Render dropdown in portal to avoid z-index issues */
  portal?: boolean
  /** Fixed width for dropdown (e.g., '280px', '320px') */
  width?: string
  /** Whether hovering over trigger opens dropdown (also clickable) */
  openOnHover?: boolean
  /** Delay in ms before opening on hover (default 60ms) */
  openDelay?: number
  /** Delay in ms before closing on mouse leave (default 200ms) */
  closeDelay?: number
  /** Close dropdown when window or page scrolls */
  closeOnScroll?: boolean
}

export default function ModernDropdown({
  trigger,
  children,
  className = '',
  isOpen: controlledOpen,
  onOpenChange,
  portal = true,
  width,
  openOnHover = false,
  openDelay = 60,
  closeDelay = 200,
  closeOnScroll = false,
}: ModernDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [positionReady, setPositionReady] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

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

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const toggle = () => {
    clearTimers()
    setIsOpen(!isOpen)
    if (!isOpen) {
      setPositionReady(false)
    }
  }

  const openDropdown = () => {
    clearTimers()
    if (!isOpen) {
      setIsOpen(true)
      setPositionReady(false)
    }
  }

  const close = () => {
    clearTimers()
    setIsOpen(false)
    setPositionReady(false)
  }

  const handleMouseEnter = () => {
    if (!openOnHover) return
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (!isOpen) {
      if (openDelay > 0) {
        openTimerRef.current = setTimeout(() => {
          openDropdown()
        }, openDelay)
      } else {
        openDropdown()
      }
    }
  }

  const handleMouseLeave = () => {
    if (!openOnHover) return
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (isOpen) {
      closeTimerRef.current = setTimeout(() => {
        close()
      }, closeDelay)
    }
  }

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        close()
      }
    }

    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Update dropdown position
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (!isOpen || !triggerRef.current) {
      setPositionReady(false)
      return
    }

    let cancelled = false

    const isTriggerVisible = (el: HTMLElement) => {
      if (el.offsetParent === null && window.getComputedStyle(el).position !== 'fixed') {
        return false
      }
      const rect = el.getBoundingClientRect()
      return rect.width > 0 || rect.height > 0
    }

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger || cancelled) return false

      if (!isTriggerVisible(trigger)) {
        setPositionReady(false)
        return false
      }

      const triggerRect = trigger.getBoundingClientRect()
      if (triggerRect.width === 0 && triggerRect.height === 0) {
        setPositionReady(false)
        return false
      }

      const parsedWidth = width ? parseInt(width, 10) : triggerRect.width
      const dropdownWidth = Math.min(parsedWidth, Math.max(200, window.innerWidth - 16))
      const maxLeft = Math.max(8, window.innerWidth - dropdownWidth - 8)
      setPosition({
        top: triggerRect.bottom + 4,
        left: Math.max(8, Math.min(triggerRect.left, maxLeft)),
        width: dropdownWidth,
      })
      return true
    }

    // Calculate position immediately to prevent flash
    const initialOk = updatePosition()
    if (initialOk) {
      setPositionReady(true)
    }

    // Use requestAnimationFrame to ensure position is set before render
    const rafId = requestAnimationFrame(() => {
      if (!cancelled) {
        const ok = updatePosition()
        setPositionReady(ok)
      }
    })

    const handleScroll = (e: Event) => {
      if (closeOnScroll) {
        const target = e.target as Node | null
        if (target && dropdownRef.current?.contains(target)) return
        close()
        return
      }
      updatePosition()
    }

    const handleResize = () => {
      // Window resize (including mobile virtual keyboard popping up) updates coordinates without closing
      updatePosition()
    }

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('scroll', handleResize)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
    }
  }, [isOpen, width, closeOnScroll])

  const dropdownContent = (
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`rounded-lg border border-old-money-200 bg-white shadow-lg ${className}`}
      style={{
        position: portal ? 'fixed' : 'absolute',
        top: position.top,
        left: position.left,
        width: portal ? position.width : undefined,
        minWidth: portal ? position.width : 'min-content',
        zIndex: 'var(--z-dropdown)',
      }}
      role="menu"
      aria-hidden={!isOpen}
    >
      {children}
    </div>
  )

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen &&
        positionReady &&
        (portal ? createPortal(dropdownContent, document.body) : dropdownContent)}
    </div>
  )
}
