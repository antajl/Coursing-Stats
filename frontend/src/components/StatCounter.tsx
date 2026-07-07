import { useEffect, useRef } from 'react'
import { animateCount } from '../lib/motion'

interface StatCounterProps {
  value: number
  className?: string
}

export default function StatCounter({ value, className = '' }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tween = animateCount(el, value)
    return () => {
      tween?.kill()
    }
  }, [value])

  return (
    <div ref={ref} className={className}>
      0
    </div>
  )
}
