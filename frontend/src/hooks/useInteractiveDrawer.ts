import { useEffect, useRef } from 'react'

interface UseInteractiveDrawerProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export function useInteractiveDrawer({
  isOpen,
  onOpen,
  onClose,
}: UseInteractiveDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  const isOpenRef = useRef(isOpen)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    isOpenRef.current = isOpen
    onOpenRef.current = onOpen
    onCloseRef.current = onClose
  }, [isOpen, onOpen, onClose])

  // Sync state to DOM styles when triggered via button or programmatically
  useEffect(() => {
    const container = containerRef.current
    const overlay = overlayRef.current
    const drawer = drawerRef.current
    if (!container || !overlay || !drawer) return

    if (isOpen) {
      container.style.visibility = 'visible'
      container.style.pointerEvents = 'auto'
      overlay.style.transition = 'opacity 240ms ease-out'
      overlay.style.opacity = '1'
      drawer.style.transition = 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)'
      drawer.style.transform = 'translateX(0px)'
    } else {
      overlay.style.transition = 'opacity 200ms ease-in'
      overlay.style.opacity = '0'
      drawer.style.transition = 'transform 220ms ease-in'
      drawer.style.transform = 'translateX(100%)'
      const timer = setTimeout(() => {
        if (!isOpenRef.current && container) {
          container.style.visibility = 'hidden'
          container.style.pointerEvents = 'none'
        }
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let startX = 0
    let startY = 0
    let startTime = 0
    let isDragging = false
    let isHorizontalGesture = false
    let mode: 'open' | 'close' | null = null
    let drawerWidth = 320

    const getDrawerWidth = () => {
      return drawerRef.current?.offsetWidth || Math.min(320, window.innerWidth * 0.84)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const winWidth = window.innerWidth
      drawerWidth = getDrawerWidth()

      if (!isOpenRef.current) {
        // Closed: start if touching near right edge (within 48px)
        if (touch.clientX >= winWidth - 48) {
          isDragging = true
          isHorizontalGesture = false
          mode = 'open'
          startX = touch.clientX
          startY = touch.clientY
          startTime = Date.now()
        }
      } else {
        // Open: anywhere on the screen can drag right to close
        isDragging = true
        isHorizontalGesture = false
        mode = 'close'
        startX = touch.clientX
        startY = touch.clientY
        startTime = Date.now()
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (!isHorizontalGesture) {
        if (absX < 6 && absY < 6) return
        if (absY >= absX) {
          // Vertical scroll: cancel drawer dragging
          isDragging = false
          mode = null
          return
        }
        isHorizontalGesture = true
      }

      const container = containerRef.current
      const overlay = overlayRef.current
      const drawer = drawerRef.current
      if (!container || !overlay || !drawer) return

      if (e.cancelable) {
        e.preventDefault()
      }

      // 1:1 Instant finger tracking
      drawer.style.transition = 'none'
      overlay.style.transition = 'none'

      if (mode === 'open') {
        container.style.visibility = 'visible'
        container.style.pointerEvents = 'auto'
        const pulledDistance = Math.max(0, Math.min(drawerWidth, -deltaX))
        const remainingDistance = drawerWidth - pulledDistance
        drawer.style.transform = `translateX(${remainingDistance}px)`
        const opacity = (pulledDistance / drawerWidth)
        overlay.style.opacity = `${opacity}`
      } else if (mode === 'close') {
        const pushedDistance = Math.max(0, deltaX)
        drawer.style.transform = `translateX(${pushedDistance}px)`
        const opacity = Math.max(0, 1 - (pushedDistance / drawerWidth))
        overlay.style.opacity = `${opacity}`
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return
      isDragging = false

      const drawer = drawerRef.current
      const overlay = overlayRef.current
      if (!drawer || !overlay) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX
      const elapsed = Date.now() - startTime
      const velocity = Math.abs(deltaX) / Math.max(1, elapsed)

      if (mode === 'open') {
        const pulledDistance = -deltaX
        const shouldOpen = pulledDistance > drawerWidth * 0.25 || (velocity > 0.35 && pulledDistance > 25)

        if (shouldOpen) {
          drawer.style.transition = 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)'
          overlay.style.transition = 'opacity 200ms ease-out'
          drawer.style.transform = 'translateX(0px)'
          overlay.style.opacity = '1'
          onOpenRef.current()
        } else {
          drawer.style.transition = 'transform 200ms ease-out'
          overlay.style.transition = 'opacity 180ms ease-out'
          drawer.style.transform = 'translateX(100%)'
          overlay.style.opacity = '0'
          setTimeout(() => {
            if (!isOpenRef.current && containerRef.current) {
              containerRef.current.style.visibility = 'hidden'
              containerRef.current.style.pointerEvents = 'none'
            }
          }, 210)
        }
      } else if (mode === 'close') {
        const pushedDistance = deltaX
        const shouldClose = pushedDistance > drawerWidth * 0.2 || (velocity > 0.35 && pushedDistance > 25)

        if (shouldClose) {
          drawer.style.transition = 'transform 200ms ease-out'
          overlay.style.transition = 'opacity 180ms ease-out'
          drawer.style.transform = 'translateX(100%)'
          overlay.style.opacity = '0'
          onCloseRef.current()
        } else {
          drawer.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)'
          overlay.style.transition = 'opacity 180ms ease-out'
          drawer.style.transform = 'translateX(0px)'
          overlay.style.opacity = '1'
        }
      }

      mode = null
      isHorizontalGesture = false
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  return {
    containerRef,
    overlayRef,
    drawerRef,
  }
}
