import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Global router listener for:
 * 1. Resetting window scroll to top (0, 0) on page navigation (PUSH / REPLACE)
 *    so newly opened pages always start at the very top instead of inheriting
 *    the previous page's scroll position.
 * 2. Smooth scrolling to URL hash targets (#id) with retry polling for lazy-loaded tabs.
 * 3. Preserving browser native scroll restoration on history Back/Forward (POP).
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()
  const navType = useNavigationType()
  const lastScrolledHash = useRef<string | null>(null)
  const prevPathnameRef = useRef<string>(pathname)
  const prevHashRef = useRef<string>(hash)

  // 1. Reset scroll to top synchronously before DOM paint on pathname change (PUSH / REPLACE)
  useLayoutEffect(() => {
    const isNewPath = prevPathnameRef.current !== pathname
    const isHashCleared = Boolean(prevHashRef.current && !hash)
    prevPathnameRef.current = pathname
    prevHashRef.current = hash

    if (navType !== 'POP' && (isNewPath || isHashCleared)) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname, hash, navType])

  // 2. Hash scroll handling with retry polling
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
