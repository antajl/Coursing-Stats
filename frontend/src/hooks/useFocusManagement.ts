import { useCallback, useRef, useEffect } from 'react'

export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus()
    }
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTab)
    firstFocusable?.focus()

    return () => {
      container.removeEventListener('keydown', handleTab)
    }
  }, [])

  return { saveFocus, restoreFocus, trapFocus }
}

export function useFocusTrap(isOpen: boolean, containerRef: React.RefObject<HTMLElement>) {
  const { trapFocus } = useFocusManagement()

  useEffect(() => {
    if (isOpen && containerRef.current) {
      return trapFocus(containerRef.current)
    }
  }, [isOpen, containerRef, trapFocus])
}
