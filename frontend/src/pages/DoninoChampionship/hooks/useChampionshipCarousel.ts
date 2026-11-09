import { useState, useRef, useEffect, useCallback } from 'react'

export type SortMode = 'time' | 'points'

export function useChampionshipCarousel() {
  const [sortMode, setSortMode] = useState<SortMode>('time')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isNudging, setIsNudging] = useState(false)
  const hasInteractedRef = useRef(false)
  const nudgeTimerRef = useRef<number | null>(null)
  const nudgeEndTimerRef = useRef<number | null>(null)

  const hadMovedRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const activeSlide = sortMode === 'time' ? 0 : 1

  const cancelNudge = useCallback(() => {
    if (nudgeTimerRef.current !== null) {
      clearTimeout(nudgeTimerRef.current)
      nudgeTimerRef.current = null
    }
    if (nudgeEndTimerRef.current !== null) {
      clearTimeout(nudgeEndTimerRef.current)
      nudgeEndTimerRef.current = null
    }
    setIsNudging(false)
  }, [])

  const triggerNudge = useCallback(() => {
    if (hasInteractedRef.current) return
    cancelNudge()
    setIsNudging(true)
    nudgeEndTimerRef.current = window.setTimeout(() => {
      setIsNudging(false)
      nudgeEndTimerRef.current = null
    }, 750)
  }, [cancelNudge])

  // Auto-play gentle invitation nudge on page load (after 600ms) only if not interacted
  useEffect(() => {
    if (hasInteractedRef.current) return
    nudgeTimerRef.current = window.setTimeout(() => {
      triggerNudge()
    }, 600)
    return () => {
      cancelNudge()
    }
  }, [triggerNudge, cancelNudge])

  // Mobile swipe gesture with real-time direct GPU drag (0 React re-renders during swipe!)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    hasInteractedRef.current = true
    cancelNudge()
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      hadMovedRef.current = true
    }

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 8 && absDy < 8) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal' && trackRef.current) {
      const isAtLeftEdge = activeSlide === 0 && dx > 0
      const isAtRightEdge = activeSlide === 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      trackRef.current.style.transform = `translate3d(calc(${-activeSlide * 100}% + ${appliedDx}px), 0, 0)`
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const isHorizontal = gestureLockRef.current === 'horizontal'
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    if (isHorizontal) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)

      let targetSlide = activeSlide
      if (isSwipeLeft && activeSlide === 0) {
        targetSlide = 1
        ;(e.nativeEvent as any)._doninoSwipeConsumed = true
      } else if (isSwipeRight && activeSlide === 1) {
        targetSlide = 0
        ;(e.nativeEvent as any)._doninoSwipeConsumed = true
      }

      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${-targetSlide * 100}%, 0, 0)`
      }

      setIsTransitioning(true)
      if (targetSlide !== activeSlide) {
        setSortMode(targetSlide === 0 ? 'time' : 'points')
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false)
        hadMovedRef.current = false
        if (trackRef.current) {
          trackRef.current.style.transition = ''
          trackRef.current.style.transform = `translate3d(${-targetSlide * 100}%, 0, 0)`
        }
      }, 400)
    } else {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${-activeSlide * 100}%, 0, 0)`
      }
      hadMovedRef.current = false
    }
  }

  const handleTouchCancel = () => {
    hasInteractedRef.current = true
    cancelNudge()
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${-activeSlide * 100}%, 0, 0)`
    }
    hadMovedRef.current = false
  }

  const handleSortModeChange = (mode: SortMode) => {
    if (mode === sortMode) return
    hasInteractedRef.current = true
    cancelNudge()
    setIsTransitioning(true)
    setSortMode(mode)
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }
    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
  }

  const isAnimating = isTransitioning || isNudging

  return {
    sortMode,
    setSortMode,
    activeSlide,
    isTransitioning,
    isNudging,
    isAnimating,
    trackRef,
    hadMovedRef,
    triggerNudge,
    handleSortModeChange,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  }
}
