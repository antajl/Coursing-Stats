import { useState, useRef, useEffect, useCallback } from 'react'

export type SortMode = 'time' | 'points'

export function useChampionshipCarousel() {
  const [sortMode, setSortMode] = useState<SortMode>('time')
  const [isNudging, setIsNudging] = useState(false)
  const hasInteractedRef = useRef(false)
  const nudgeTimerRef = useRef<number | null>(null)
  const nudgeEndTimerRef = useRef<number | null>(null)

  const hadMovedRef = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const activeSlide = sortMode === 'time' ? 0 : 1
  const currentSlideRef = useRef<number>(activeSlide)
  const gapPx = 16

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

  // Плавная анимация скольжения колонок при изменении активной сортировки
  useEffect(() => {
    const slideIndex = sortMode === 'time' ? 0 : 1
    if (currentSlideRef.current !== slideIndex) {
      currentSlideRef.current = slideIndex
      if (trackRef.current && (typeof window === 'undefined' || window.innerWidth < 1024)) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${getSlideOffset(slideIndex)}, 0, 0)`
      }
    }
  }, [sortMode, getSlideOffset])

  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    hasInteractedRef.current = true
    cancelNudge()
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }, [cancelNudge])

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const dx = clientX - touchStartRef.current.x
    const dy = clientY - touchStartRef.current.y

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
      const currentSlide = sortMode === 'time' ? 0 : 1
      const isAtLeftEdge = currentSlide === 0 && dx > 0
      const isAtRightEdge = currentSlide === 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      const base = currentSlide === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
      trackRef.current.style.transform = `translate3d(calc(${base} + ${appliedDx}px), 0, 0)`
    }
  }, [sortMode, gapPx])

  const endDrag = useCallback((clientX: number, nativeEvent?: any) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const isHorizontal = gestureLockRef.current === 'horizontal'
    const dx = clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    const currentSlide = sortMode === 'time' ? 0 : 1

    if (isHorizontal) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)

      let targetSlide = currentSlide
      if (isSwipeLeft && currentSlide === 0) {
        targetSlide = 1
        if (nativeEvent) nativeEvent._doninoSwipeConsumed = true
      } else if (isSwipeRight && currentSlide === 1) {
        targetSlide = 0
        if (nativeEvent) nativeEvent._doninoSwipeConsumed = true
      }

      currentSlideRef.current = targetSlide
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${getSlideOffset(targetSlide)}, 0, 0)`
      }

      if (targetSlide !== currentSlide) {
        setSortMode(targetSlide === 0 ? 'time' : 'points')
      }
    } else {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
      }
      hadMovedRef.current = false
    }
  }, [sortMode, getSlideOffset])

  const cancelDrag = useCallback(() => {
    hasInteractedRef.current = true
    cancelNudge()
    touchStartRef.current = null
    gestureLockRef.current = null
    const currentSlide = sortMode === 'time' ? 0 : 1
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
    hadMovedRef.current = false
  }, [sortMode, getSlideOffset, cancelNudge])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY)
  }, [startDrag])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    moveDrag(e.touches[0].clientX, e.touches[0].clientY)
  }, [moveDrag])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    endDrag(e.changedTouches[0].clientX, e.nativeEvent)
  }, [endDrag])

  const handleTouchCancel = useCallback(() => {
    cancelDrag()
  }, [cancelDrag])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    startDrag(e.clientX, e.clientY)
  }, [startDrag])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    moveDrag(e.clientX, e.clientY)
  }, [moveDrag])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    endDrag(e.clientX)
  }, [endDrag])

  const handleMouseLeave = useCallback(() => {
    if (touchStartRef.current) {
      cancelDrag()
    }
  }, [cancelDrag])

  const handleSortModeChange = useCallback((mode: SortMode) => {
    if (mode === sortMode) return
    hasInteractedRef.current = true
    cancelNudge()
    const targetSlide = mode === 'time' ? 0 : 1
    currentSlideRef.current = targetSlide
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(targetSlide)}, 0, 0)`
    }
    setSortMode(mode)
  }, [sortMode, getSlideOffset, cancelNudge])

  const isAnimating = isNudging

  return {
    sortMode,
    setSortMode,
    activeSlide,
    gapPx,
    getSlideOffset,
    isTransitioning: false,
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
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  }
}
