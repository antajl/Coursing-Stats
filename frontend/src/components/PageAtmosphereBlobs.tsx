import { useEffect, useRef } from 'react'

const BLOB_COUNT = 3

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** Случайная точка так, чтобы центр пятна мог уйти к краям / чуть за край. */
function placeBlob(el: HTMLElement) {
  const sizeVw = randomBetween(42, 72)
  el.style.width = `${sizeVw}vw`
  el.style.height = `${sizeVw}vw`
  el.style.left = `${randomBetween(-28, 78)}%`
  el.style.top = `${randomBetween(-28, 78)}%`
}

/**
 * Мягкие пятна фона: гаснут → прыгают в случайное место → появляются.
 * Каждый blob со своим таймингом; при reduced-motion — статичные позиции.
 */
export default function PageAtmosphereBlobs() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const blobs = Array.from(root.querySelectorAll<HTMLElement>('.cs-page-blob'))
    if (!blobs.length) return

    let cancelled = false
    const timers: number[] = []
    const reduced = prefersReducedMotion()

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn()
      }, ms)
      timers.push(id)
    }

    blobs.forEach((el, i) => {
      placeBlob(el)
      if (reduced) {
        el.style.opacity = '0.58'
        return
      }

      el.style.opacity = '0'
      el.style.transition = 'opacity 2.2s ease'

      const cycle = () => {
        if (cancelled) return
        // Пик ~0.55–0.72: заметно на фоне, без прежних ~0.8
        el.style.opacity = String(randomBetween(0.55, 0.72))
        later(() => {
          el.style.opacity = '0'
          later(() => {
            placeBlob(el)
            later(cycle, randomBetween(300, 1000))
          }, 2400)
        }, randomBetween(7000, 12000))
      }

      later(cycle, i * randomBetween(400, 1200) + randomBetween(150, 600))
    })

    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  return (
    <div ref={rootRef} className="cs-page-blobs" aria-hidden="true">
      {Array.from({ length: BLOB_COUNT }, (_, i) => (
        <span key={i} className={`cs-page-blob cs-page-blob--${String.fromCharCode(97 + i)}`} />
      ))}
    </div>
  )
}
