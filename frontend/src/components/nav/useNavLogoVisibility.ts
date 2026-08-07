import { useEffect, useState, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Nav brand logo opacity:
 * - Home: fades in as hero title fades out (scroll)
 * - Other pages: fully visible
 * - Always: fades out when the logo box overlaps the centered nav links (narrow viewport)
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

    const handleScroll = () => {
      const scrollY = window.scrollY
      const progress = Math.min(scrollY / 450, 1)
      // Appear when hero title is half faded (progress >= 0.5)
      const adjustedProgress = progress < 0.5 ? 0 : (progress - 0.5) * 2
      setScrollOpacity(adjustedProgress)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
