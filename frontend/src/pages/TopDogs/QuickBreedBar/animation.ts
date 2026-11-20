export function playCollapseGhosts(
  container: HTMLElement,
  excludeEl: HTMLElement | null,
  targetLeft: number,
) {
  if (typeof document === 'undefined' || !container) return
  const pills = Array.from(
    container.querySelectorAll<HTMLElement>('[data-breed-pill], [data-more-btn]'),
  )
  if (pills.length === 0) return

  const containerRect = container.getBoundingClientRect()
  const ghostWrapper = document.createElement('div')
  ghostWrapper.setAttribute('aria-hidden', 'true')
  ghostWrapper.style.position = 'absolute'
  ghostWrapper.style.top = '0'
  ghostWrapper.style.left = '0'
  ghostWrapper.style.width = '100%'
  ghostWrapper.style.height = '100%'
  ghostWrapper.style.pointerEvents = 'none'
  ghostWrapper.style.zIndex = '5'
  ghostWrapper.style.overflow = 'hidden'

  pills.forEach((p) => {
    if (excludeEl && p === excludeEl) return
    const rect = p.getBoundingClientRect()
    const clone = p.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.top = `${rect.top - containerRect.top}px`
    clone.style.left = `${rect.left - containerRect.left}px`
    clone.style.width = `${rect.width}px`
    clone.style.height = `${rect.height}px`
    clone.style.margin = '0'
    clone.style.pointerEvents = 'none'
    ghostWrapper.appendChild(clone)

    const deltaX = targetLeft - rect.left
    clone.animate(
      [
        { transform: 'translateX(0px) scale(1)', opacity: '1' },
        { transform: `translateX(${deltaX * 0.75}px) scale(0.35)`, opacity: '0' },
      ],
      {
        duration: 180,
        easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
      },
    )
  })

  container.appendChild(ghostWrapper)
  setTimeout(() => {
    ghostWrapper.remove()
  }, 220)
}
