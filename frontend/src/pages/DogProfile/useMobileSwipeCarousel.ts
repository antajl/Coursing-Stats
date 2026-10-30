import { useState, useRef, useEffect } from 'react'

interface UseMobileSwipeCarouselProps {
  tabsCount: number
  activeIndex: number
  onIndexChange: (newIndex: number) => void
}

export function useMobileSwipeCarousel({
  tabsCount,
  activeIndex,
  onIndexChange,
}: UseMobileSwipeCarouselProps) {
  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const transitionTimeoutRef = useRef<number | null>(null)
  const hadMovedRef = useRef(false)

  // Плавная анимация скольжения при изменении активного индекса
  useEffect(() => {
    setIsTransitioning(true)
    const timer = window.setTimeout(() => {
      setIsTransitioning(false)
    }, 320)
    return () => clearTimeout(timer)
  }, [activeIndex])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    if (tabsCount <= 1) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setIsTransitioning(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    if (tabsCount <= 1) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
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

    if (gestureLockRef.current === 'horizontal') {
      const isAtLeftEdge = activeIndex === 0 && dx > 0
      const isAtRightEdge = activeIndex === tabsCount - 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      setDragOffset(appliedDx)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    if (tabsCount <= 1) {
      touchStartRef.current = null
      gestureLockRef.current = null
      setDragOffset(null)
      hadMovedRef.current = false
      return
    }

    const isHorizontal = gestureLockRef.current === 'horizontal'
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    if (isHorizontal) {
      const isSwipeLeft = dx < -45 || (dx < -20 && velocity > 0.25)
      const isSwipeRight = dx > 45 || (dx > 20 && velocity > 0.25)

      setIsTransitioning(true)
      setDragOffset(null)

      if (isSwipeLeft && activeIndex < tabsCount - 1) {
        onIndexChange(activeIndex + 1)
      } else if (isSwipeRight && activeIndex > 0) {
        onIndexChange(activeIndex - 1)
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false)
        hadMovedRef.current = false
      }, 320)
    } else {
      setDragOffset(null)
      hadMovedRef.current = false
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    setDragOffset(null)
    hadMovedRef.current = false
  }

  const isDragging = dragOffset !== null && dragOffset !== 0
  const isAnimating = isDragging || isTransitioning
  const mobileTransform = `translateX(calc(-${activeIndex * 100}% + ${dragOffset ?? 0}px))`

  return {
    isDragging,
    isAnimating,
    mobileTransform,
    hadMovedRef,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  }
}
