import { useLayoutEffect, useRef, type RefObject } from 'react'
import { prefersReducedMotion } from '../../../../lib/motion'
import { matchesBreedFilter } from '../../../../lib/breedMapping'
import { GAP } from '../constants'
import { playCollapseGhosts } from '../animation'

interface UseFlipBreedAnimationProps {
  containerRef: RefObject<HTMLDivElement | null>
  normalizedSelected: string
  onSelectBreed: (breed: string) => void
}

export function useFlipBreedAnimation({
  containerRef,
  normalizedSelected,
  onSelectBreed,
}: UseFlipBreedAnimationProps) {
  const isTransitioningRef = useRef(false)
  const prevSelectedRef = useRef(normalizedSelected)
  const flyFromRef = useRef<{ left: number } | null>(null)

  useLayoutEffect(() => {
    const prev = prevSelectedRef.current
    prevSelectedRef.current = normalizedSelected
    isTransitioningRef.current = false

    if (prefersReducedMotion() || !containerRef.current) return

    const container = containerRef.current

    // Если порода только что была выбрана:
    if (!prev && normalizedSelected) {
      const from = flyFromRef.current
      flyFromRef.current = null

      const selectedPill = container.querySelector<HTMLElement>('[data-selected-pill]')
      const hubLink = container.querySelector<HTMLElement>('[data-hub-link]')

      if (from && selectedPill) {
        // FLIP: выбранная пилюля летит из точки клика прямо в свой финальный слот (200мс)
        const toRect = selectedPill.getBoundingClientRect()
        const deltaX = from.left - toRect.left

        selectedPill.animate(
          [
            { transform: `translateX(${deltaX}px)`, boxShadow: '0 4px 16px rgba(120, 80, 30, 0.20)' },
            { transform: 'translateX(0px)', boxShadow: 'none' },
          ],
          {
            duration: 200,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }
        )

        const crossIcon = selectedPill.querySelector<HTMLElement>('[data-cross-icon]')
        if (crossIcon) {
          crossIcon.animate(
            [
              { opacity: 0, transform: 'scale(0.5)' },
              { opacity: 1, transform: 'scale(1)' },
            ],
            { duration: 170, easing: 'ease-out' }
          )
        }

        // Кнопка «Хаб породы ↗» летит ВМЕСТЕ с пилюлей и проявляется ОДНОВРЕМЕННО
        if (hubLink) {
          hubLink.animate(
            [
              { transform: `translateX(${deltaX}px)`, opacity: 0 },
              { transform: 'translateX(0px)', opacity: 1 },
            ],
            {
              duration: 210,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }
          )
        }
      } else if (selectedPill) {
        // Порода выбрана через внешний фильтр (без прямого клика по плашке)
        selectedPill.animate(
          [
            { transform: 'scale(0.94) translateX(-4px)', opacity: 0 },
            { transform: 'scale(1) translateX(0px)', opacity: 1 },
          ],
          {
            duration: 170,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }
        )
        if (hubLink) {
          hubLink.animate(
            [
              { opacity: 0, transform: 'translateX(-4px)' },
              { opacity: 1, transform: 'translateX(0px)' },
            ],
            { duration: 170, easing: 'ease-out' }
          )
        }
      }
    }

    // Если вернулись ко «Всем породам»: каскадный веерный выезд плашек слева направо
    if (prev && !normalizedSelected) {
      flyFromRef.current = null

      if (typeof container.getAnimations === 'function') {
        container.getAnimations({ subtree: true }).forEach((anim) => anim.cancel())
      }

      const allPills = Array.from(container.querySelectorAll<HTMLElement>('[data-breed-pill]'))
      allPills.forEach((el, index) => {
        el.animate(
          [
            { opacity: 0, transform: 'translateX(-10px) scale(0.96)' },
            { opacity: 1, transform: 'translateX(0px) scale(1)' },
          ],
          {
            duration: 180,
            delay: Math.min(index * 12, 100),
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }
        )
      })
      const moreBtn = container.querySelector<HTMLElement>('[data-more-btn]')
      if (moreBtn) {
        moreBtn.animate(
          [
            { opacity: 0, transform: 'translateX(-6px)' },
            { opacity: 1, transform: 'translateX(0px)' },
          ],
          {
            duration: 180,
            delay: Math.min(allPills.length * 12, 120),
            easing: 'ease-out',
          }
        )
      }
    }
  }, [normalizedSelected, containerRef])

  const handlePillClick = (breedKey: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (matchesBreedFilter(normalizedSelected, breedKey)) {
      onSelectBreed('')
      return
    }

    if (isTransitioningRef.current) return

    const clickedEl =
      e?.currentTarget ||
      containerRef.current?.querySelector<HTMLElement>(`[data-breed-pill="${breedKey}"]`)

    if (prefersReducedMotion() || !containerRef.current || !clickedEl) {
      onSelectBreed(breedKey)
      return
    }

    const container = containerRef.current
    const allBtn = container.querySelector<HTMLElement>('[data-all-btn]')
    const allRect = allBtn?.getBoundingClientRect()
    const targetLeft = allRect ? allRect.right + GAP : 0

    isTransitioningRef.current = true

    const clickedRect = clickedEl.getBoundingClientRect()
    flyFromRef.current = { left: clickedRect.left }

    playCollapseGhosts(container, clickedEl, targetLeft)
    onSelectBreed(breedKey)
  }

  const handleDropdownSelect = (breedKey: string) => {
    if (isTransitioningRef.current) return

    if (prefersReducedMotion() || !containerRef.current) {
      onSelectBreed(breedKey)
      return
    }

    const container = containerRef.current
    const allBtn = container.querySelector<HTMLElement>('[data-all-btn]')
    const moreBtn = container.querySelector<HTMLElement>('[data-more-btn]')
    const allRect = allBtn?.getBoundingClientRect()
    const targetLeft = allRect ? allRect.right + GAP : 0
    const moreRect = moreBtn?.getBoundingClientRect()

    isTransitioningRef.current = true

    if (moreRect) {
      flyFromRef.current = { left: moreRect.left }
    }

    playCollapseGhosts(container, null, targetLeft)
    onSelectBreed(breedKey)
  }

  return {
    handlePillClick,
    handleDropdownSelect,
  }
}
