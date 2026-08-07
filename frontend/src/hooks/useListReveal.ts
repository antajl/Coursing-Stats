import { useEffect, useRef } from 'react'
import { hideMotionTargets, prefersReducedMotion, riseIn, useGSAP } from '../lib/motion'

function showListItem(el: HTMLElement) {
  el.style.opacity = '1'
  el.style.visibility = 'visible'
  el.style.transform = 'none'
}

/**
 * Одноразовый stagger-reveal при первой готовности данных.
 * Пометь строки атрибутом data-list-item.
 *
 * После первого прогона новые строки (поиск/фильтр/догрузка) не анимируем —
 * сразу показываем (иначе при CSS/GSAP opacity:0 они «пропадали»).
 */
export function useListReveal(ready: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!ready) doneRef.current = false
  }, [ready])

  // Новые [data-list-item] после первого reveal — сразу видимы
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const revealAdded = (node: Node) => {
      if (!doneRef.current || !(node instanceof HTMLElement)) return
      if (node.matches?.('[data-list-item]')) showListItem(node)
      node.querySelectorAll?.('[data-list-item]').forEach((el) => showListItem(el as HTMLElement))
    }

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach(revealAdded)
      }
    })
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  useGSAP(
    () => {
      const root = ref.current
      if (!ready || !root) return

      const items = root.querySelectorAll<HTMLElement>('[data-list-item]')
      if (!items.length) return

      // Уже отыграли — только гарантировать видимость (фильтр/поиск)
      if (doneRef.current) {
        items.forEach(showListItem)
        return
      }

      doneRef.current = true

      if (prefersReducedMotion()) {
        items.forEach(showListItem)
        return () => {
          doneRef.current = false
        }
      }

      hideMotionTargets(items, 8)
      riseIn(items, {
        y: 8,
        duration: 0.32,
        stagger: 0.028,
        ease: 'power2.out',
      })

      return () => {
        doneRef.current = false
        items.forEach(showListItem)
      }
    },
    { dependencies: [ready] },
  )

  return ref
}
