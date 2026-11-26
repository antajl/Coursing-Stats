import { useRef, useCallback, useEffect, useState } from 'react'

interface UseHorizontalSwipeProps {
  activeTabsCount: number
  activeTabIndex: number
  onTabChange: (targetIndex: number) => void
  gapPx?: number
  enableNudge?: boolean
}

export function calculateSlideOffset(slideIndex: number, gapPx = 0): string {
  if (slideIndex === 0) return '0%'
  return gapPx > 0
    ? `calc(-${slideIndex * 100}% - ${slideIndex * gapPx}px)`
    : `-${slideIndex * 100}%`
}

export function useHorizontalSwipe({
  activeTabsCount,
  activeTabIndex,
  onTabChange,
  gapPx = 0,
  enableNudge = false,
}: UseHorizontalSwipeProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const hadMovedRef = useRef(false)
  const isSwipingRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const hasInteractedRef = useRef(false)
  const nudgeTimerRef = useRef<number | null>(null)
  const nudgeAnimRef = useRef<Animation | null>(null)
  const [isNudging, setIsNudging] = useState(false)

  const getSlideOffset = useCallback(
    (slideIndex: number) => calculateSlideOffset(slideIndex, gapPx),
    [gapPx],
  )

  const cancelNudge = useCallback(() => {
    if (nudgeTimerRef.current !== null) {
      window.clearTimeout(nudgeTimerRef.current)
      nudgeTimerRef.current = null
    }
    if (nudgeAnimRef.current) {
      nudgeAnimRef.current.cancel()
      nudgeAnimRef.current = null
    }
    setIsNudging(false)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      cancelNudge()
    }
  }, [cancelNudge])

  // Single-shot gentle invitation nudge on mobile (< 1024px) when enabled
  useEffect(() => {
    if (!enableNudge || activeTabsCount <= 1 || hasInteractedRef.current) return
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    nudgeTimerRef.current = window.setTimeout(() => {
      const track = trackRef.current
      if (!track || hasInteractedRef.current || window.innerWidth >= 1024) return
      const base = getSlideOffset(activeTabIndex)
      const delta = activeTabIndex === 0 ? '-28px' : '28px'
      setIsNudging(true)
      const anim = track.animate(
        [
          { transform: `translate3d(${base}, 0, 0)`, offset: 0 },
          { transform: `translate3d(calc(${base} + ${delta}), 0, 0)`, offset: 0.25 },
          { transform: `translate3d(calc(${base} + ${delta}), 0, 0)`, offset: 0.42 },
          { transform: `translate3d(${base}, 0, 0)`, offset: 1 },
        ],
        {
          duration: 750,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
      )
      nudgeAnimRef.current = anim
      anim.onfinish = () => {
        nudgeAnimRef.current = null
        setIsNudging(false)
      }
      anim.oncancel = () => {
        nudgeAnimRef.current = null
        setIsNudging(false)
      }
    }, 600)

    return () => cancelNudge()
  }, [enableNudge, activeTabsCount, activeTabIndex, getSlideOffset, cancelNudge])

  useEffect(() => {
    if (isSwipingRef.current) {
      isSwipingRef.current = false
      return
    }
    if (trackRef.current && (typeof window === 'undefined' || window.innerWidth < 1024)) {
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(activeTabIndex)}, 0, 0)`
    }
  }, [activeTabIndex, getSlideOffset])

  const startDrag = (clientX: number, clientY: number) => {
    if (activeTabsCount <= 1 || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    hasInteractedRef.current = true
    cancelNudge()
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const moveDrag = (clientX: number, clientY: number) => {
    if (!touchStartRef.current || activeTabsCount <= 1 || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const touch = touchStartRef.current
    const dx = clientX - touch.x
    const dy = clientY - touch.y

    if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
      hadMovedRef.current = true
    }

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 7 && absDy < 7) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal' && trackRef.current) {
      const isAtLeftEdge = activeTabIndex === 0 && dx > 0
      const isAtRightEdge = activeTabIndex === activeTabsCount - 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      const base = getSlideOffset(activeTabIndex)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(calc(${base} + ${appliedDx}px), 0, 0)`
        }
      })
    }
  }

  const endDrag = (clientX: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (!touchStartRef.current || activeTabsCount <= 1 || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return

    const isHorizontal = gestureLockRef.current === 'horizontal'
    const dx = clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    const track = trackRef.current

    if (isHorizontal && track) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)
      let targetIndex = activeTabIndex

      if (isSwipeLeft && activeTabIndex < activeTabsCount - 1) {
        targetIndex = activeTabIndex + 1
      } else if (isSwipeRight && activeTabIndex > 0) {
        targetIndex = activeTabIndex - 1
      }

      isSwipingRef.current = true
      track.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(targetIndex)}, 0, 0)`

      if (targetIndex !== activeTabIndex) {
        onTabChange(targetIndex)
      }
    } else if (track) {
      track.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(activeTabIndex)}, 0, 0)`
    }
  }

  const cancelDrag = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current && activeTabsCount > 1) {
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(activeTabIndex)}, 0, 0)`
    }
  }

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hadMovedRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const markInteracted = useCallback(() => {
    hasInteractedRef.current = true
    cancelNudge()
  }, [cancelNudge])

  return {
    trackRef,
    isNudging,
    markInteracted,
    getSlideOffset,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    handleClickCapture,
  }
}
