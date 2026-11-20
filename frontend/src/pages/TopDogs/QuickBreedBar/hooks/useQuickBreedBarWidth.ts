import { useState, useLayoutEffect, useRef } from 'react'
import type { QuickBreedItem } from '../types'
import {
  getContextKey,
  getInitialContainerWidth,
  cachedWidthByContext,
} from '../constants'

let cachedMeasured: {
  allW: number
  moreW: number
  minW: number
  widths: Record<string, number>
} | null = null

interface UseQuickBreedBarWidthProps {
  candidates: QuickBreedItem[]
  candidateKeys: string
}

export function useQuickBreedBarWidth({
  candidates,
  candidateKeys,
}: UseQuickBreedBarWidthProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const allBtnRef = useRef<HTMLButtonElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const minBtnRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [containerWidth, setContainerWidth] = useState<number>(getInitialContainerWidth)
  const [measured, setMeasured] = useState<{
    allW: number
    moreW: number
    minW: number
    widths: Record<string, number>
  } | null>(() => cachedMeasured)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    let isCancelled = false

    const updateContainer = () => {
      if (el) {
        const nextW = el.clientWidth
        if (nextW > 0) {
          cachedWidthByContext.set(getContextKey(), nextW)
          setContainerWidth((prev) => (prev !== nextW ? nextW : prev))
        }
      }
    }
    updateContainer()

    const remeasure = () => {
      const allW = allBtnRef.current?.offsetWidth || cachedMeasured?.allW || 88
      const moreW = moreBtnRef.current?.offsetWidth || cachedMeasured?.moreW || 105
      const minW = minBtnRef.current?.offsetWidth || cachedMeasured?.minW || 82
      const widths: Record<string, number> = { ...(cachedMeasured?.widths || {}) }
      candidates.forEach((b, i) => {
        widths[b.key] =
          itemRefs.current[i]?.offsetWidth || cachedMeasured?.widths[b.key] || b.estWidth
      })
      setMeasured((prev) => {
        if (
          prev &&
          prev.allW === allW &&
          prev.moreW === moreW &&
          prev.minW === minW &&
          Object.keys(prev.widths).length === Object.keys(widths).length &&
          Object.entries(widths).every(([k, v]) => prev.widths[k] === v)
        ) {
          return prev
        }
        const next = { allW, moreW, minW, widths }
        cachedMeasured = next
        return next
      })
    }

    remeasure()

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (!isCancelled) {
          remeasure()
          updateContainer()
        }
      })
    }

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width
          if (w > 0) {
            cachedWidthByContext.set(getContextKey(), w)
            setContainerWidth((prev) => (prev !== w ? prev : prev))
          }
        }
      })
      ro.observe(el)
      return () => {
        isCancelled = true
        ro.disconnect()
      }
    } else {
      window.addEventListener('resize', updateContainer)
      return () => {
        isCancelled = true
        window.removeEventListener('resize', updateContainer)
      }
    }
  }, [candidateKeys])

  return {
    containerRef,
    allBtnRef,
    moreBtnRef,
    minBtnRef,
    itemRefs,
    containerWidth,
    measured,
  }
}
