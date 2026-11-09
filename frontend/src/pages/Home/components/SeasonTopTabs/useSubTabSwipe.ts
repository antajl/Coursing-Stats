import { useState, useRef, useEffect, useCallback } from 'react'

interface UseSubTabSwipeOptions<T extends string> {
  subTabs: [T, T]
  initialSubTab?: T
  gapPx?: number
}

export function useSubTabSwipe<T extends string>({
  subTabs,
  initialSubTab = subTabs[0],
  gapPx = 16,
}: UseSubTabSwipeOptions<T>) {
  const [activeSubTab, setActiveSubTab] = useState<T>(initialSubTab)
  const [isNudging, setIsNudging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // One-shot hint tracking: once user touches, clicks, or swipes, hint is killed forever
  const hasInteractedRef = useRef(false)
  const nudgeTimerRef = useRef<number | null>(null)
  const nudgeEndTimerRef = useRef<number | null>(null)

  const currentSlide = activeSubTab === subTabs[0] ? 0 : 1

  const getSlideOffset = useCallback(
    (slideIndex: number) => {
      return slideIndex === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
    },
    [gapPx],
  )

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

  // Single-shot invitation nudge on clean initial mount only
  useEffect(() => {
    if (hasInteractedRef.current) return
    nudgeTimerRef.current = window.setTimeout(() => {
      triggerNudge()
    }, 600)
    return () => {
      cancelNudge()
    }
  }, [triggerNudge, cancelNudge])

  const handleToggle = useCallback(
    (target: T) => {
      hasInteractedRef.current = true
      cancelNudge()
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${target === subTabs[0] ? '0%' : `calc(-100% - ${gapPx}px)`}, 0, 0)`
      }
      setActiveSubTab(target)
    },
    [subTabs, gapPx, cancelNudge],
  )

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return
    hasInteractedRef.current = true
    cancelNudge()
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 768)) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

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
      const isAtLeftEdge = currentSlide === 0 && dx > 0
      const isAtRightEdge = currentSlide === 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      const base = currentSlide === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
      trackRef.current.style.transform = `translate3d(calc(${base} + ${appliedDx}px), 0, 0)`
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const isHorizontal = gestureLockRef.current === 'horizontal'
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)
    touchStartRef.current = null
    gestureLockRef.current = null

    const track = trackRef.current
    if (isHorizontal && track) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)
      let targetSlide: 0 | 1 = currentSlide

      if (isSwipeLeft && currentSlide === 0) {
        targetSlide = 1
      } else if (isSwipeRight && currentSlide === 1) {
        targetSlide = 0
      }

      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(targetSlide)}, 0, 0)`

      if (targetSlide !== currentSlide) {
        setActiveSubTab(subTabs[targetSlide])
      }
    } else if (track) {
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
  }

  const handleTouchCancel = () => {
    hasInteractedRef.current = true
    cancelNudge()
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
  }

  return {
    activeSubTab,
    trackRef,
    isNudging,
    handleToggle,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    trackStyle: {
      transform:
        typeof window !== 'undefined' && window.innerWidth >= 768
          ? 'none'
          : isNudging
          ? undefined
          : `translate3d(${activeSubTab === subTabs[0] ? '0%' : `calc(-100% - ${gapPx}px)`}, 0, 0)`,
      willChange: 'transform' as const,
    },
  }
}
