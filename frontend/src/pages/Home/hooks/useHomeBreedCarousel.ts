import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type TouchEvent,
} from 'react'
import { prefersReducedMotion } from '../../../lib/motion'

/** How long each breed stays fully visible (ms), after slide-in. */
export const HOME_BREED_SLIDE_MS = 5000
/** Duration of continuous track slide animation (ms). */
export const HOME_BREED_TRANSITION_MS = 320
/** Compatibility alias. */
export const HOME_BREED_FADE_MS = HOME_BREED_TRANSITION_MS

export type AnimState = 'idle' | 'dragging' | 'snapping' | 'animating-next' | 'animating-prev'

export type HomeBreedCarouselApi = {
  index: number
  contentIndex: number
  opaque: boolean
  paused: boolean
  autoplay: boolean
  progressReady: boolean
  go: (next: number, direction?: 1 | -1) => void
  prev: () => void
  next: () => void
  slideDirection: 1 | -1
  animState: AnimState
  trackStyle: CSSProperties
  fadeStyle: CSSProperties | undefined
  slideStyle: CSSProperties | undefined
  getAdjacent: <T>(slides: T[]) => { prev: T; current: T; next: T }
  pauseHandlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocusCapture: () => void
    onBlurCapture: (e: FocusEvent<HTMLDivElement>) => void
  }
  touchHandlers: {
    onTouchStart: (e: TouchEvent<HTMLDivElement>) => void
    onTouchMove: (e: TouchEvent<HTMLDivElement>) => void
    onTouchEnd: (e: TouchEvent<HTMLDivElement>) => void
    onTouchCancel: (e: TouchEvent<HTMLDivElement>) => void
    onClickCapture: (e: MouseEvent<HTMLDivElement>) => void
  }
}

/** Map shared carousel index onto a column that may have fewer slides. */
export function carouselSlideIndex(sharedIndex: number, slideCount: number): number {
  if (slideCount <= 0) return 0
  return ((sharedIndex % slideCount) + slideCount) % slideCount
}

/**
 * Continuous 3-slot native swipe slider track for home breed carousels.
 * Renders [prev, current, next] concurrently so that when dragging horizontally,
 * the adjacent breed smoothly slides into view in real time under the finger,
 * exactly like a native mobile app.
 */
export function useHomeBreedCarousel(slideCount: number): HomeBreedCarouselApi {
  const [index, setIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1)
  const [animState, setAnimState] = useState<AnimState>('idle')
  const [dragOffset, setDragOffset] = useState(0)
  const [paused, setPaused] = useState(false)
  const [overrideSlot, setOverrideSlot] = useState<{ pos: 'prev' | 'next'; index: number } | null>(null)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchStartTime = useRef<number>(0)
  const isSwiping = useRef<boolean | null>(null)
  const dragOffsetRef = useRef<number>(0)
  const wasDraggingRef = useRef<boolean>(false)

  const animTimerRef = useRef<number | null>(null)
  const clickBlockTimerRef = useRef<number | null>(null)

  const reduceMotion = prefersReducedMotion()
  const autoplay = slideCount > 1 && !reduceMotion
  const opaque = true
  const progressReady = autoplay && animState === 'idle' && !paused

  useEffect(() => {
    if (slideCount <= 0) return
    setIndex((i) => i % slideCount)
  }, [slideCount])

  const go = useCallback(
    (nextIdx: number, explicitDir?: 1 | -1) => {
      if (slideCount <= 1 || animState !== 'idle') return
      const normalizedTarget = ((nextIdx % slideCount) + slideCount) % slideCount
      if (normalizedTarget === index) return

      let dir: 1 | -1 = 1
      if (explicitDir !== undefined) {
        dir = explicitDir
      } else {
        dir = normalizedTarget >= index ? 1 : -1
      }

      setSlideDirection(dir)

      if (reduceMotion) {
        setIndex(normalizedTarget)
        return
      }

      if (dir === 1) {
        setOverrideSlot({ pos: 'next', index: normalizedTarget })
        setAnimState('animating-next')
      } else {
        setOverrideSlot({ pos: 'prev', index: normalizedTarget })
        setAnimState('animating-prev')
      }

      if (animTimerRef.current) window.clearTimeout(animTimerRef.current)
      animTimerRef.current = window.setTimeout(() => {
        setIndex(normalizedTarget)
        setOverrideSlot(null)
        setAnimState('idle')
      }, HOME_BREED_TRANSITION_MS)
    },
    [slideCount, index, animState, reduceMotion],
  )

  const prev = useCallback(() => {
    go(index - 1, -1)
  }, [go, index])

  const next = useCallback(() => {
    go(index + 1, 1)
  }, [go, index])

  const trackStyle: CSSProperties = useMemo(() => {
    if (reduceMotion) {
      return { transform: 'translateX(-100%)' }
    }

    if (animState === 'dragging') {
      return {
        transform: `translateX(calc(-100% + ${dragOffset}px))`,
        transition: 'none',
        willChange: 'transform',
      }
    }

    if (animState === 'animating-next') {
      return {
        transform: 'translateX(-200%)',
        transition: `transform ${HOME_BREED_TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: 'transform',
      }
    }

    if (animState === 'animating-prev') {
      return {
        transform: 'translateX(0%)',
        transition: `transform ${HOME_BREED_TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: 'transform',
      }
    }

    if (animState === 'snapping') {
      return {
        transform: 'translateX(-100%)',
        transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }
    }

    return {
      transform: 'translateX(-100%)',
      transition: 'none',
    }
  }, [animState, dragOffset, reduceMotion])

  const onTouchStart = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (slideCount <= 1 || e.touches.length !== 1 || animState !== 'idle') return
      const touch = e.touches[0]
      touchStartX.current = touch.clientX
      touchStartY.current = touch.clientY
      touchStartTime.current = Date.now()
      isSwiping.current = null
      dragOffsetRef.current = 0
      setPaused(true)
    },
    [slideCount, animState],
  )

  const onTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (touchStartX.current === null || touchStartY.current === null || slideCount <= 1) return
      const touch = e.touches[0]
      const dx = touch.clientX - touchStartX.current
      const dy = touch.clientY - touchStartY.current

      // Direction lock: check vertical scroll vs horizontal swipe after 7px
      if (isSwiping.current === null) {
        if (Math.abs(dy) >= 7 && Math.abs(dy) >= Math.abs(dx)) {
          isSwiping.current = false
          return
        }
        if (Math.abs(dx) >= 7 && Math.abs(dx) > Math.abs(dy)) {
          isSwiping.current = true
          wasDraggingRef.current = true
        }
      }

      if (isSwiping.current) {
        // Direct tactile 1:1 finger tracking
        dragOffsetRef.current = dx
        setDragOffset(dx)
        setAnimState('dragging')
      }
    },
    [slideCount],
  )

  const onTouchEnd = useCallback(() => {
    const currentDrag = dragOffsetRef.current
    const wasSwipingHorizontal = isSwiping.current
    const dt = Date.now() - touchStartTime.current

    touchStartX.current = null
    touchStartY.current = null
    isSwiping.current = null
    setPaused(false)

    if (wasSwipingHorizontal) {
      const isQuickFlick = dt < 280 && Math.abs(currentDrag) > 25
      const isThresholdPassed = Math.abs(currentDrag) >= 45

      if (isQuickFlick || isThresholdPassed) {
        if (currentDrag < 0) {
          const nextTarget = carouselSlideIndex(index + 1, slideCount)
          setSlideDirection(1)
          setOverrideSlot(null)
          setAnimState('animating-next')

          if (animTimerRef.current) window.clearTimeout(animTimerRef.current)
          animTimerRef.current = window.setTimeout(() => {
            setIndex(nextTarget)
            setAnimState('idle')
            setDragOffset(0)
            dragOffsetRef.current = 0
          }, HOME_BREED_TRANSITION_MS)
        } else {
          const prevTarget = carouselSlideIndex(index - 1, slideCount)
          setSlideDirection(-1)
          setOverrideSlot(null)
          setAnimState('animating-prev')

          if (animTimerRef.current) window.clearTimeout(animTimerRef.current)
          animTimerRef.current = window.setTimeout(() => {
            setIndex(prevTarget)
            setAnimState('idle')
            setDragOffset(0)
            dragOffsetRef.current = 0
          }, HOME_BREED_TRANSITION_MS)
        }
      } else {
        setAnimState('snapping')
        setDragOffset(0)
        dragOffsetRef.current = 0
        if (animTimerRef.current) window.clearTimeout(animTimerRef.current)
        animTimerRef.current = window.setTimeout(() => {
          setAnimState('idle')
        }, 240)
      }
    }

    if (clickBlockTimerRef.current) window.clearTimeout(clickBlockTimerRef.current)
    clickBlockTimerRef.current = window.setTimeout(() => {
      wasDraggingRef.current = false
    }, 150)
  }, [index, slideCount])

  const onTouchCancel = useCallback(() => {
    touchStartX.current = null
    touchStartY.current = null
    isSwiping.current = null
    dragOffsetRef.current = 0
    setDragOffset(0)
    setPaused(false)
    setAnimState('idle')
    if (clickBlockTimerRef.current) window.clearTimeout(clickBlockTimerRef.current)
    clickBlockTimerRef.current = window.setTimeout(() => {
      wasDraggingRef.current = false
    }, 150)
  }, [])

  const onClickCapture = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (wasDraggingRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const getAdjacent = useCallback(
    <T>(slides: T[]): { prev: T; current: T; next: T } => {
      const count = slides.length
      if (count === 0) {
        return {
          prev: undefined as unknown as T,
          current: undefined as unknown as T,
          next: undefined as unknown as T,
        }
      }
      if (count === 1) {
        return { prev: slides[0], current: slides[0], next: slides[0] }
      }

      const normCurrent = carouselSlideIndex(index, count)
      const normPrev = carouselSlideIndex(normCurrent - 1, count)
      const normNext = carouselSlideIndex(normCurrent + 1, count)

      const prevIdx =
        overrideSlot?.pos === 'prev' ? carouselSlideIndex(overrideSlot.index, count) : normPrev
      const nextIdx =
        overrideSlot?.pos === 'next' ? carouselSlideIndex(overrideSlot.index, count) : normNext

      return {
        prev: slides[prevIdx] ?? slides[normPrev],
        current: slides[normCurrent],
        next: slides[nextIdx] ?? slides[normNext],
      }
    },
    [index, overrideSlot],
  )

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: (e: FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
    },
  }

  const touchHandlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onClickCapture,
  }

  return {
    index,
    contentIndex: index,
    opaque,
    paused,
    autoplay,
    progressReady,
    go,
    prev,
    next,
    slideDirection,
    animState,
    trackStyle,
    fadeStyle: undefined,
    slideStyle: undefined,
    getAdjacent,
    pauseHandlers,
    touchHandlers,
  }
}
