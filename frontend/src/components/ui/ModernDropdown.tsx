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
}

export default function ModernDropdown({
  trigger,
  children,
  className = '',
  isOpen: controlledOpen,
  onOpenChange,
  portal = true,
  width,
}: ModernDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [positionReady, setPositionReady] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const toggle = () => {
    setIsOpen(!isOpen)
    setPositionReady(false)
  }
  const close = () => {
    setIsOpen(false)
    setPositionReady(false)
  }

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    if (!isOpen || !triggerRef.current) return

    const updatePosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect()
      if (!triggerRect) return

      setPosition({
        top: triggerRect.bottom + 4,
        left: triggerRect.left,
        width: width ? parseInt(width) : triggerRect.width,
      })
    }

    // Calculate position immediately to prevent flash
    updatePosition()
    
    // Use requestAnimationFrame to ensure position is set before render
    requestAnimationFrame(() => {
      updatePosition()
      setPositionReady(true)
    })

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, width])

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`rounded-lg border border-old-money-200 bg-white shadow-lg dark:border-charcoal-600 dark:bg-charcoal-800 ${className}`}
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
    <div ref={triggerRef} className="relative inline-block">
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
      
      {isOpen && positionReady && (
        portal ? (
          createPortal(dropdownContent, document.body)
        ) : (
          dropdownContent
        )
      )}
    </div>
  )
}
