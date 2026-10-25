import { useEffect, useLayoutEffect } from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Add listener for runtime changes
export function useReducedMotionListener(callback: (prefersReduced: boolean) => void) {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    callback(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      callback(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [callback])
}

/**
 * Lightweight drop-in replacement for useGSAP hook using standard useLayoutEffect.
 * Preserves the exact same signature and lifecycle without requiring the 150KB GSAP runtime.
 */
export function useGSAP(
  callback: () => void | (() => void),
  options?: { scope?: React.RefObject<unknown>; dependencies?: unknown[] } | unknown[],
) {
  const deps = Array.isArray(options) ? options : options?.dependencies || []
  useIsomorphicLayoutEffect(() => {
    const cleanup = callback()
    return typeof cleanup === 'function' ? cleanup : undefined
  }, deps)
}

export interface RiseInOptions {
  stagger?: number
  delay?: number
  y?: number
  duration?: number
  ease?: string
  /** full — из opacity:0; subtle — лёгкий сдвиг без полного скрытия (заголовки секций) */
  mode?: 'full' | 'subtle'
}

type AnimatableTarget = HTMLElement | Element | null | undefined
type TargetInput = AnimatableTarget | NodeListOf<Element> | AnimatableTarget[]

function normalizeTargets(targets: TargetInput): HTMLElement[] {
  if (!targets) return []
  const list = Array.isArray(targets)
    ? targets
    : 'length' in targets && typeof (targets as NodeListOf<Element>).item === 'function'
      ? Array.from(targets as NodeListOf<Element>)
      : [targets]
  return list.filter((el): el is HTMLElement => el instanceof HTMLElement)
}

/** Синхронно прячет цели до первого кадра анимации (дублирует CSS opacity на [data-rise]/[data-podium]). */
export function hideMotionTargets(targets: TargetInput, y = 10): void {
  const elements = normalizeTargets(targets)
  elements.forEach((el) => {
    el.style.opacity = '0'
    el.style.transform = `translateY(${y}px)`
  })
}

export function riseIn(targets: TargetInput, options: RiseInOptions = {}): void {
  const {
    stagger = 0,
    delay = 0,
    y = 10,
    duration = 0.42,
    mode = 'full',
  } = options

  const elements = normalizeTargets(targets)
  if (elements.length === 0) return

  if (prefersReducedMotion()) {
    elements.forEach((el) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
    return
  }

  const initialOpacity = mode === 'subtle' ? 0.88 : 0
  const initialY = mode === 'subtle' ? Math.min(y, 8) : y
  const totalDuration = mode === 'subtle' ? duration * 0.85 : duration

  elements.forEach((el, index) => {
    const itemDelay = (delay + index * stagger) * 1000
    // Set initial position
    el.style.opacity = String(initialOpacity)
    el.style.transform = `translateY(${initialY}px)`

    const anim = el.animate(
      [
        { opacity: initialOpacity, transform: `translateY(${initialY}px)` },
        { opacity: 1, transform: 'translateY(0px)' },
      ],
      {
        duration: totalDuration * 1000,
        delay: itemDelay,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth easeOut / power3.out
        fill: 'forwards',
      },
    )

    anim.onfinish = () => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
  })
}

export interface FadeInOptions {
  y?: number
  duration?: number
  delay?: number
}

export function fadeIn(targets: TargetInput, options: FadeInOptions = {}): void {
  const { y = 6, duration = 0.28, delay = 0 } = options

  const elements = normalizeTargets(targets)
  if (elements.length === 0) return

  if (prefersReducedMotion()) {
    elements.forEach((el) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
    return
  }

  elements.forEach((el) => {
    el.style.opacity = '0.55'
    el.style.transform = `translateY(${y}px)`

    const anim = el.animate(
      [
        { opacity: 0.55, transform: `translateY(${y}px)` },
        { opacity: 1, transform: 'translateY(0px)' },
      ],
      {
        duration: duration * 1000,
        delay: delay * 1000,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards',
      },
    )

    anim.onfinish = () => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
  })
}

export function animateCount(
  el: HTMLElement,
  value: number,
  options: { duration?: number; from?: number } = {},
): void {
  const { duration = 1.35, from = 0 } = options
  const format = (n: number) => {
    const rounded = Math.round(n)
    return new Intl.NumberFormat('en-GB', {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(rounded)
  }

  if (value <= 0) {
    el.textContent = '0'
    return
  }

  if (prefersReducedMotion()) {
    el.textContent = format(value)
    return
  }

  const startTime = performance.now()
  const totalMs = duration * 1000

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / totalMs, 1)
    // power3.out easing: 1 - Math.pow(1 - progress, 3)
    const ease = 1 - Math.pow(1 - progress, 3)
    const current = from + (value - from) * ease
    el.textContent = format(current)
    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      el.textContent = format(value)
    }
  }

  el.textContent = format(from)
  requestAnimationFrame(step)
}
