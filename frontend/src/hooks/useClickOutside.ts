import { useEffect, RefObject } from 'react'

interface UseClickOutsideOptions {
  /** Callback to trigger when click outside is detected */
  onClickOutside: () => void
  /** Whether the hook is active (useful for conditional enable/disable) */
  enabled?: boolean
}

/**
 * Hook to detect clicks/taps outside a referenced element.
 * Handles both mouse and touch events for desktop and mobile compatibility.
 * 
 * @param ref - React ref to the element to monitor
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null)
 * useClickOutside(ref, { onClickOutside: () => setOpen(false) })
 * ```
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  options: UseClickOutsideOptions
): void {
  const { onClickOutside, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    function handlePointerOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null
      
      // Check if the click is outside the referenced element
      if (ref.current && target && !ref.current.contains(target)) {
        onClickOutside()
      }
    }

    // Add event listeners for both mouse and touch
    document.addEventListener('mousedown', handlePointerOutside)
    document.addEventListener('touchstart', handlePointerOutside, { passive: true })

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousedown', handlePointerOutside)
      document.removeEventListener('touchstart', handlePointerOutside)
    }
  }, [ref, onClickOutside, enabled])
}
