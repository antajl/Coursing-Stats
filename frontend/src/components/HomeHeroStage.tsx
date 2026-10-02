import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion, useGSAP } from '../lib/motion'
import { Icons } from '../lib/icons'
import { ANIMATION, BREAKPOINTS, LAYOUT } from '../lib/constants'

interface HomeHeroStageProps {
  children?: ReactNode
  metrics?: ReactNode
  onCloseMetrics?: () => void
}

/**
 * Стартовый экран: статичная картинка с надписью и виджетом метрик.
 */
export default function HomeHeroStage({ children, metrics, onCloseMetrics }: HomeHeroStageProps) {
  const rootRef = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentFaded, setContentFaded] = useState(false)

  // Scroll fade for metrics widget and hero content (logo + search) on desktop
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < BREAKPOINTS.MOBILE) return

      const scrollY = window.scrollY
      const progress = Math.min(scrollY / LAYOUT.SCROLL_FADE_RANGE, 1)
      const fadeOpacity = String(Math.max(0, 1 - progress))
      const isFadedOut = progress >= 0.98

      const metricsEl = metricsRef.current
      if (metricsEl) {
        metricsEl.style.opacity = fadeOpacity
        metricsEl.style.pointerEvents = isFadedOut ? 'none' : 'auto'
        metricsEl.style.visibility = isFadedOut ? 'hidden' : 'visible'
      }

      const contentEl = contentRef.current
      if (contentEl) {
        contentEl.style.opacity = fadeOpacity
        contentEl.style.pointerEvents = isFadedOut ? 'none' : 'auto'
        contentEl.style.visibility = isFadedOut ? 'hidden' : 'visible'
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [metrics])

  // Overlap check for desktop content vs metrics
  useEffect(() => {
    const contentEl = contentRef.current
    const metricsEl = metricsRef.current
    if (!contentEl || !metricsEl) return

    const checkOverlap = () => {
      if (window.innerWidth < BREAKPOINTS.MOBILE) {
        setContentFaded(false)
        return
      }

      const targetEl = (contentEl.firstElementChild as HTMLElement) || contentEl
      const targetRect = targetEl.getBoundingClientRect()
      const metricsRect = metricsEl.getBoundingClientRect()

      // If either rect has no dimensions (not laid out yet), do not falsely hide
      if (targetRect.width === 0 || metricsRect.width === 0) {
        setContentFaded(false)
        return
      }

      const isOverlapping = targetRect.right > metricsRect.left - 16
      setContentFaded(isOverlapping)
    }

    const observer = new ResizeObserver(checkOverlap)
    observer.observe(contentEl)
    observer.observe(metricsEl)

    window.addEventListener('resize', checkOverlap)
    checkOverlap()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkOverlap)
    }
  }, [])

  const [mobileClosed, setMobileClosed] = useState(false)
  const isClosingRef = useRef(false)

  const handleCloseMobile = () => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    const stage = rootRef.current
    if (!stage) {
      setMobileClosed(true)
      return
    }

    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (prefersReducedMotion()) {
      setMobileClosed(true)
      window.dispatchEvent(new Event('scroll'))
      return
    }

    const currentHeight = stage.offsetHeight
    stage.style.overflow = 'hidden'
    stage.style.minHeight = '0px'
    stage.style.height = `${currentHeight}px`

    const metricsEl = metricsRef.current

    const tl = gsap.timeline({
      onUpdate: () => {
        window.dispatchEvent(new Event('scroll'))
      },
      onComplete: () => {
        setMobileClosed(true)
        window.dispatchEvent(new Event('scroll'))
      },
    })

    if (metricsEl) {
      tl.to(
        metricsEl,
        {
          opacity: 0,
          y: -16,
          duration: 0.3,
          ease: 'power2.in',
        },
        0
      )
    }

    tl.to(
      stage,
      {
        height: 0,
        opacity: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.55,
        ease: 'power2.inOut',
      },
      0.08
    )
  }

  const handleScrollDown = () => {
    if (onCloseMetrics) {
      onCloseMetrics()
      return
    }
    const target = document.getElementById('season-top') || document.getElementById('content-start') || document.querySelector('.home-v2-body')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }
  }

  return (
    <section
      ref={rootRef}
      className={`home-v2-stage flex flex-col justify-start ${mobileClosed ? 'home-v2-stage--closed' : ''}`}
      aria-label="Главный экран"
    >
      <div ref={mediaRef} className="home-v2-stage-media block" aria-hidden>
        <img
          src="/assets/hero/background.webp"
          alt=""
          role="presentation"
          aria-hidden="true"
          className="home-v2-stage-layer"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <div
        ref={contentRef}
        className={`hidden md:block md:fixed md:top-20 z-20 will-change-opacity w-fit max-w-full home-v2-stage-content ${contentFaded ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'}`}
      >
        {children}
      </div>

      {metrics && (
        <div
          ref={metricsRef}
          data-metrics-panel="true"
          className="relative z-40 w-full max-w-xl mx-auto px-3 pt-2 md:pt-0 md:fixed md:top-20 md:max-w-5xl md:px-0 max-h-[calc(88dvh-4rem)] md:max-h-none overflow-y-auto md:overflow-visible will-change-opacity pointer-events-auto home-v2-stage-metrics"
        >
          {/* Mobile close button: smoothly collapses stage so content flies up */}
          <div className="md:hidden flex justify-end pb-1.5">
            <button
              type="button"
              onClick={handleCloseMobile}
              className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow text-xs font-semibold text-char-800 flex items-center gap-1 active:scale-95 border border-camel-200/80 transition-transform"
              aria-label="Закрыть блок ближайших событий"
            >
              ✕ Закрыть
            </button>
          </div>
          {metrics}
        </div>
      )}

      {/* Scroll cue is hidden on mobile (< 768px) and only visible on desktop */}
      <button
        type="button"
        className="hidden md:inline-flex home-v2-scroll-cue group"
        aria-label="Прокрутить к рейтингам сезона"
        onClick={handleScrollDown}
      >
        <span>Рейтинги сезона</span>
        <Icons.chevronDown className="w-3.5 h-3.5 text-camel-700 transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden />
      </button>
    </section>
  )
}
