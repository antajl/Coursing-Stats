import { useEffect, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '../lib/motion'

interface AnimatedMeterBarProps {
  /** 0–100 */
  percent: number
  className?: string
  children?: ReactNode
}

/** Полоска метра: width from 0 → target при маунте. */
export default function AnimatedMeterBar({ percent, className = '', children }: AnimatedMeterBarProps) {
  const [width, setWidth] = useState(prefersReducedMotion() ? percent : 0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setWidth(percent)
      return
    }
    setWidth(0)
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setWidth(percent))
    })
    return () => window.cancelAnimationFrame(id)
  }, [percent])

  return (
    <div className={className} style={{ width: `${Math.max(0, Math.min(100, width))}%` }}>
      {children}
    </div>
  )
}
