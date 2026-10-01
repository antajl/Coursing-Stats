import { useEffect, useState, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { BREAKPOINTS, LAYOUT } from '../../lib/constants'

/**
 * Nav brand logo visibility & opacity:
 * - Home desktop:
 *     scrollY = 0: Hero logo & search are visible on hero stage -> Nav logo is hidden (opacity: 0)
 *     scrollY scrolls 0..350: Hero elements fade out (1->0), Nav logo fades in (0->1)
 *     scrollY > 350: Nav logo is fully visible (opacity: 1)
 * - Home mobile:
 *     Initial screen (Hero stage with events): mobile page logo is below the fold -> Nav logo is visible (opacity: 1)
 *     Scroll down to #content-start (or "✕ Закрыть"): mobile page logo is in view -> Nav logo is hidden (opacity: 0)
 *     Scroll past #content-start down the page: mobile page logo leaves top of screen -> Nav logo is visible (opacity: 1)
 * - Other pages: Nav logo is always fully visible (opacity: 1)
 * - Always (desktop): fades out if logo box overlaps centered nav links (narrow viewport)
 */
export function useNavLogoVisibility(
  logoRef?: RefObject<HTMLElement | null>,
  navCenterRef?: RefObject<HTMLElement | null>
) {
  const [scrollOpacity, setScrollOpacity] = useState(0)
  const [overlapClear, setOverlapClear] = useState(1)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') {
      setScrollOpacity(1)
      return
    }

    let ticking = false

    const updateVisibility = () => {
      const isMobile = window.innerWidth < BREAKPOINTS.MOBILE

      if (!isMobile) {
        // Desktop: smoothly fade in as the hero stage elements fade out
        const scrollY = window.scrollY
        const progress = Math.min(scrollY / LAYOUT.SCROLL_FADE_RANGE, 1)
        setScrollOpacity(progress)
        return
      }

      // Mobile: mutual exclusion with the mobile page logo
      const mobileLogo = document.querySelector<HTMLElement>('[data-page-logo="mobile"]')
      if (!mobileLogo) {
        setScrollOpacity(1)
        return
      }

      const rect = mobileLogo.getBoundingClientRect()
      const navHeight = 48 // NavMobile h-12
      const winH = window.innerHeight

      const thresholdHigh = winH * 0.72
      const thresholdLow = winH * 0.48

      if (rect.top >= thresholdHigh) {
        // User is at the top Hero stage (events screen): page logo is below fold -> nav logo visible
        setScrollOpacity(1)
      } else if (rect.bottom <= navHeight) {
        // User scrolled past the mobile page logo: page logo is off-screen above -> nav logo visible
        setScrollOpacity(1)
      } else {
        // Mobile page logo is currently in view (or transitioning):
        // 1. As it enters from the bottom, fade out nav logo:
        const fadeInFromBottom = Math.max(
          0,
          Math.min(1, (rect.top - thresholdLow) / (thresholdHigh - thresholdLow))
        )
        // 2. As it leaves through the top under the header, fade in nav logo:
        const fadeOutToTop = Math.max(0, Math.min(1, (navHeight + 64 - rect.bottom) / 64))

        // When comfortably in view, both are 0 -> scrollOpacity = 0 (nav logo hidden)
        const opacity = Math.max(fadeInFromBottom, fadeOutToTop)
        setScrollOpacity(opacity)
      }
    }

    const onScrollOrResize = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        updateVisibility()
        ticking = false
      })
    }

    updateVisibility()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [location.pathname])

  useEffect(() => {
    const logoEl = logoRef?.current
    const navEl = navCenterRef?.current
    if (!logoEl || !navEl) return

    const GAP_PX = 12

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

  const logoOpacity = scrollOpacity * overlapClear
  const logoVisible = logoOpacity > 0.05

  return { logoVisible, logoOpacity }
}
