import { type RefObject, useRef } from 'react'
import { fadeIn, useGSAP } from '../lib/motion'

interface UseGsapFadeInOptions {
  scope: RefObject<HTMLElement | null>
  selector?: string
  enabled?: boolean
  duration?: number
  dependencies?: unknown[]
  skipFirst?: boolean
}

export function useGsapFadeIn({
  scope,
  selector,
  enabled = true,
  duration = 0.28,
  dependencies = [],
  skipFirst = false,
}: UseGsapFadeInOptions) {
  const skipped = useRef(!skipFirst)

  useGSAP(
    () => {
      if (!enabled || !scope.current) return
      if (skipFirst && !skipped.current) {
        skipped.current = true
        return
      }
      const targets = selector ? scope.current.querySelectorAll(selector) : scope.current
      fadeIn(targets, { duration })
    },
    { scope, dependencies: [enabled, ...dependencies], revertOnUpdate: false },
  )
}
