import { useEffect, useRef } from 'react'

const SCROLL_RANGE_PX = 450

/**
 * Hero title opacity = scroll fade × overlap clear.
 * Overlap with the metrics panel must win: narrowing hides the title and
 * scroll must not bring it back until the collision is gone.
 */
export function useHeroScroll() {
  const heroTitleRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const heroTitle = heroTitleRef.current
    if (!heroTitle) return

    let ticking = false
    let overlapClear = 1

    const applyOpacity = () => {
      const progress = Math.min(window.scrollY / SCROLL_RANGE_PX, 1)
      const scrollOpacity = 1 - progress
      heroTitle.style.opacity = String(scrollOpacity * overlapClear)
      heroTitle.style.pointerEvents = 'none'
    }

    const checkOverlap = () => {
      const metricsPanel = document.querySelector('.fixed.right-4.top-16') as HTMLElement | null
      if (!metricsPanel) {
        overlapClear = 1
        applyOpacity()
        return
      }

      const heroRect = heroTitle.getBoundingClientRect()
      const metricsRect = metricsPanel.getBoundingClientRect()
      overlapClear = heroRect.right > metricsRect.left ? 0 : 1
      applyOpacity()
    }

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        applyOpacity()
        ticking = false
      })
    }

    const observer = new ResizeObserver(checkOverlap)
    observer.observe(heroTitle)

    const metricsPanel = document.querySelector('.fixed.right-4.top-16')
    if (metricsPanel) observer.observe(metricsPanel)

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', checkOverlap)
    checkOverlap()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkOverlap)
    }
  }, [])

  return heroTitleRef
}
