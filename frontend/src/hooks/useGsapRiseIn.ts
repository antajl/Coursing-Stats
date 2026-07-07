import { type RefObject } from 'react'
import { riseIn, useGSAP } from '../lib/motion'

interface UseGsapRiseInOptions {
  scope: RefObject<HTMLElement | null>
  selector: string
  enabled?: boolean
  stagger?: number
  delay?: number
  y?: number
  duration?: number
  ease?: string
  mode?: 'full' | 'subtle'
  dependencies?: unknown[]
}

export function useGsapRiseIn({
  scope,
  selector,
  enabled = true,
  stagger = 0.065,
  delay = 0,
  y = 10,
  duration = 0.42,
  ease = 'power2.out',
  mode = 'full',
  dependencies = [],
}: UseGsapRiseInOptions) {
  useGSAP(
    () => {
      if (!enabled || !scope.current) return
      const targets = scope.current.querySelectorAll(selector)
      if (!targets.length) return
      riseIn(targets, { stagger, delay, y, duration, ease, mode })
    },
    // revertOnUpdate сбрасывает inline opacity → снова срабатывает CSS opacity:0 → блик
    { scope, dependencies: [enabled, ...dependencies], revertOnUpdate: false },
  )
}
