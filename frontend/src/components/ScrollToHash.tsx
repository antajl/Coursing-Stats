import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Global router listener for smooth scrolling to URL hash targets (#id).
 * Handles:
 * 1. Immediate scrolling if the element is already in the DOM.
 * 2. Retrying with requestAnimationFrame / timeouts to handle lazy-loaded (Suspense) tabs.
 * 3. Does not interfere with normal scrolling when no hash is present.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()
  const lastScrolledHash = useRef<string | null>(null)

  useEffect(() => {
    if (!hash) {
      lastScrolledHash.current = null
      return
    }

    const rawId = hash.replace(/^#/, '')
    if (!rawId) return

    // Avoid duplicate scroll triggers for the same hash unless pathname changed
    const targetKey = `${pathname}#${rawId}`
    if (lastScrolledHash.current === targetKey) {
      return
    }

    let isCancelled = false
    let attempts = 0
    const maxAttempts = 12 // ~1.2s total polling across lazy chunk loads

    const tryScroll = () => {
      if (isCancelled) return

      // Support either exact element id, or name attribute
      const element = document.getElementById(rawId) || document.querySelector(`[name="${rawId}"]`)

      if (element) {
        lastScrolledHash.current = targetKey
        // Smooth scroll with margin
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      attempts++
      if (attempts < maxAttempts) {
        // Exponential backoff: 30ms, 60ms, 90ms...
        setTimeout(tryScroll, 40 + attempts * 15)
      }
    }

    // Initial attempt in next frame after DOM paint
    const timer = setTimeout(tryScroll, 30)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [pathname, hash])

  return null
}
