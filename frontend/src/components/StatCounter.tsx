import { useEffect, useRef } from 'react'
import { animateCount, prefersReducedMotion } from '../lib/motion'

interface StatCounterProps {
  value: number
  className?: string
}

export default function StatCounter({ value, className = '' }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let tween: ReturnType<typeof animateCount>
    let started = false

    const start = () => {
      if (started) return
      started = true
      tween = animateCount(el, value)
    }

    if (prefersReducedMotion()) {
      el.textContent = value <= 0 ? '0' : String(Math.round(value))
      return
    }

    el.textContent = '0'

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          start()
          io.disconnect()
        }
      },
      { threshold: 0.4, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      tween?.kill()
    }
  }, [value])

  return (
    <div ref={ref} className={className} aria-label={String(value)}>
      0
    </div>
  )
}
