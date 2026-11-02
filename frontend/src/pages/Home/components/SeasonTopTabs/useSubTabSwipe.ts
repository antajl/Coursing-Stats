import { useState, useRef, useEffect, useCallback } from 'react'

interface UseSubTabSwipeOptions<T extends string> {
  subTabs: [T, T]
  initialSubTab?: T
}

export function useSubTabSwipe<T extends string>({
  subTabs,
  initialSubTab = subTabs[0],
}: UseSubTabSwipeOptions<T>) {
  const [activeSubTab, setActiveSubTab] = useState<T>(initialSubTab)
  const [isNudging, setIsNudging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const currentSlide = activeSubTab === subTabs[0] ? 0 : 1

  const triggerNudge = useCallback(() => {
    setIsNudging(true)
    const timer = setTimeout(() => {
      setIsNudging(false)
    }, 750)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerNudge()
    }, 600)
    return () => clearTimeout(timer)
  }, [triggerNudge])

  const handleToggle = useCallback(
    (target: T) => {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${target === subTabs[0] ? '0%' : '-100%'}, 0, 0)`
      }
      setActiveSubTab(target)
      window.setTimeout(() => {
        triggerNudge()
      }, 400)
    },
    [subTabs, triggerNudge],
  )

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return
    setIsNudging(false)
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
      trackRef.current.style.transform = `translate3d(calc(${-currentSlide * 100}% + ${appliedDx}px), 0, 0)`
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
      track.style.transform = `translate3d(${-targetSlide * 100}%, 0, 0)`

      if (targetSlide !== currentSlide) {
        setActiveSubTab(subTabs[targetSlide])
        window.setTimeout(() => {
          triggerNudge()
        }, 400)
      }
    } else if (track) {
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${-currentSlide * 100}%, 0, 0)`
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${-currentSlide * 100}%, 0, 0)`
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
          : `translate3d(${activeSubTab === subTabs[0] ? '0%' : '-100%'}, 0, 0)`,
      willChange: 'transform' as const,
    },
  }
}
