import { useEffect, useState, type RefObject } from 'react'

/**
 * Nav brand logo visibility:
 * The brand logo in the navigation header is always visible on all pages (desktop and mobile).
 * On desktop, it checks for physical collision with centered links on very narrow screens.
 */
export function useNavLogoVisibility(
  logoRef?: RefObject<HTMLElement | null>,
  navCenterRef?: RefObject<HTMLElement | null>
) {
  const [overlapClear, setOverlapClear] = useState(1)

  useEffect(() => {
    const logoEl = logoRef?.current
    const navEl = navCenterRef?.current
    if (!logoEl || !navEl) return

    const GAP_PX = 8

    const checkOverlap = () => {
      const logoRect = logoEl.getBoundingClientRect()
      const navRect = navEl.getBoundingClientRect()
      // Logo on the left colliding with centered links
      const overlapping = logoRect.right + GAP_PX > navRect.left
      setOverlapClear(overlapping ? 0 : 1)
    }

    const observer = new ResizeObserver(checkOverlap)
    observer.observe(logoEl)
    observer.observe(navEl)
    window.addEventListener('resize', checkOverlap)
    checkOverlap()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkOverlap)
    }
  }, [logoRef, navCenterRef])

  const logoOpacity = overlapClear
  const logoVisible = logoOpacity > 0.05

  return { logoVisible, logoOpacity }
}
