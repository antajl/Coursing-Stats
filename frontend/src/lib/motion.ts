import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export { useGSAP }

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

/** Синхронно прячет цели до первого кадра анимации (дублирует CSS opacity на [data-rise]/[data-podium]). */
export function hideMotionTargets(targets: gsap.TweenTarget, y = 10): void {
  gsap.set(targets, { autoAlpha: 0, y })
}

export function riseIn(targets: gsap.TweenTarget, options: RiseInOptions = {}): gsap.core.Tween | void {
  const {
    stagger = 0,
    delay = 0,
    y = 10,
    duration = 0.42,
    ease = 'power2.out',
    mode = 'full',
  } = options

  if (!targets || (Array.isArray(targets) && targets.length === 0)) return

  gsap.killTweensOf(targets)

  if (prefersReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: 'all' })
    return
  }

  if (mode === 'subtle') {
    return gsap.fromTo(
      targets,
      { autoAlpha: 0.88, y: Math.min(y, 8) },
      {
        autoAlpha: 1,
        y: 0,
        duration: duration * 0.85,
        delay,
        stagger,
        ease,
        overwrite: 'auto',
        clearProps: 'transform',
      },
    )
  }

  hideMotionTargets(targets, y)

  return gsap.to(targets, {
    autoAlpha: 1,
    y: 0,
    duration,
    delay,
    stagger,
    ease,
    overwrite: 'auto',
    // opacity оставляем inline (1), иначе CSS [data-rise]{opacity:0} снова спрячет блок
    clearProps: 'transform',
  })
}

export interface FadeInOptions {
  y?: number
  duration?: number
  delay?: number
}

/** Подиум: 2-е и 3-е место синхронно, без каскада по очереди. */
export function riseInPodium(container: HTMLElement): gsap.core.Tween | void {
  const cards = container.querySelectorAll('[data-podium]')
  if (!cards.length) return
  return riseIn(cards, { stagger: 0, y: 12, duration: 0.45, ease: 'power2.out' })
}

export function fadeInPodium(container: HTMLElement): gsap.core.Tween | void {
  const cards = container.querySelectorAll('[data-podium]')
  if (!cards.length) return
  return fadeIn(cards, { duration: 0.24, y: 4 })
}

export function fadeIn(targets: gsap.TweenTarget, options: FadeInOptions = {}): gsap.core.Tween | void {
  const { y = 6, duration = 0.28, delay = 0 } = options

  if (!targets || (Array.isArray(targets) && targets.length === 0)) return

  gsap.killTweensOf(targets)

  if (prefersReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: 'all' })
    return
  }

  return gsap.fromTo(
    targets,
    { autoAlpha: 0.55, y },
    {
      autoAlpha: 1,
      y: 0,
      duration,
      delay,
      ease: 'power2.out',
      overwrite: 'auto',
      clearProps: 'transform',
    },
  )
}

export function animateCount(
  el: HTMLElement,
  value: number,
  options: { duration?: number; from?: number } = {},
): gsap.core.Tween | void {
  const { duration = 1.2, from = 0 } = options

  if (value <= 0) {
    el.textContent = '0'
    return
  }

  if (prefersReducedMotion()) {
    el.textContent = String(value)
    return
  }

  const counter = { val: from }
  return gsap.to(counter, {
    val: value,
    duration,
    ease: 'power3.out',
    overwrite: 'auto',
    onUpdate: () => {
      el.textContent = String(Math.round(counter.val))
    },
  })
}
