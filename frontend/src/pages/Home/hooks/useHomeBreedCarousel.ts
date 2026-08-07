import { useCallback, useEffect, useState, type CSSProperties, type FocusEvent } from 'react'
import { prefersReducedMotion } from '../../../lib/motion'

/** How long each breed stays fully visible (ms), after fade-in. */
export const HOME_BREED_SLIDE_MS = 5000
/** Fade out / fade in duration (ms). */
export const HOME_BREED_FADE_MS = 480

export type HomeBreedCarouselApi = {
  index: number
  contentIndex: number
  opaque: boolean
  paused: boolean
  autoplay: boolean
  progressReady: boolean
  go: (next: number) => void
  fadeStyle: CSSProperties | undefined
  pauseHandlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocusCapture: () => void
    onBlurCapture: (e: FocusEvent<HTMLDivElement>) => void
  }
}

/**
 * Shared autoplay + crossfade for home breed carousels.
 * Use one instance for competitions + shows so progress bars stay in sync.
 */
export function useHomeBreedCarousel(slideCount: number): HomeBreedCarouselApi {
  const [index, setIndex] = useState(0)
  const [contentIndex, setContentIndex] = useState(0)
  const [opaque, setOpaque] = useState(true)
  const [paused, setPaused] = useState(false)
  const reduceMotion = prefersReducedMotion()
  const autoplay = slideCount > 1 && !reduceMotion
  const progressReady = autoplay && opaque && contentIndex === index

  const go = useCallback(
    (next: number) => {
      if (slideCount <= 0) return
      setIndex(((next % slideCount) + slideCount) % slideCount)
    },
    [slideCount],
  )

  useEffect(() => {
    if (slideCount <= 0) return
    setIndex((i) => i % slideCount)
    setContentIndex((i) => i % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (index === contentIndex) return

    if (reduceMotion) {
      setContentIndex(index)
      setOpaque(true)
      return
    }

    setOpaque(false)
    const t = window.setTimeout(() => {
      setContentIndex(index)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOpaque(true))
      })
    }, HOME_BREED_FADE_MS)

    return () => window.clearTimeout(t)
  }, [index, contentIndex, reduceMotion])

  const fadeStyle = reduceMotion
    ? undefined
    : {
        opacity: opaque ? 1 : 0,
        transition: `opacity ${HOME_BREED_FADE_MS}ms ease-in-out`,
      }

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: (e: FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
    },
  }

  return {
    index,
    contentIndex,
    opaque,
    paused,
    autoplay,
    progressReady,
    go,
    fadeStyle,
    pauseHandlers,
  }
}

/** Map shared carousel index onto a column that may have fewer slides. */
export function carouselSlideIndex(sharedIndex: number, slideCount: number): number {
  if (slideCount <= 0) return 0
  return ((sharedIndex % slideCount) + slideCount) % slideCount
}
