import { useEffect, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '../lib/motion'
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
  const desktopOverlayRef = useRef<HTMLDivElement>(null)

  // Scroll fade for desktop overlay (logo + search + metrics)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < BREAKPOINTS.MOBILE) return

      const scrollY = window.scrollY
      const progress = Math.min(scrollY / LAYOUT.SCROLL_FADE_RANGE, 1)
      const fadeOpacity = String(Math.max(0, 1 - progress))
      const isFadedOut = progress >= 0.98

      const overlayEl = desktopOverlayRef.current
      if (overlayEl) {
        overlayEl.style.opacity = fadeOpacity
        overlayEl.style.pointerEvents = isFadedOut ? 'none' : 'auto'
        overlayEl.style.visibility = isFadedOut ? 'hidden' : 'visible'
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [metrics])

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
    if (metricsEl) {
      metricsEl.animate(
        [
          { opacity: 1, transform: 'translateY(0px)' },
          { opacity: 0, transform: 'translateY(-16px)' },
        ],
        {
          duration: 300,
          easing: 'ease-in',
          fill: 'forwards',
        },
      )
    }

    const stageAnim = stage.animate(
      [
        { height: `${currentHeight}px`, opacity: 1, paddingTop: '', paddingBottom: '' },
        { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' },
      ],
      {
        duration: 550,
        easing: 'ease-in-out',
        fill: 'forwards',
      },
    )

    stageAnim.onfinish = () => {
      setMobileClosed(true)
      window.dispatchEvent(new Event('scroll'))
    }
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
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/assets/hero/background-mobile.webp"
            width={820}
            height={431}
          />
          <img
            src="/assets/hero/background.webp"
            srcSet="/assets/hero/background.webp 1x"
            width={1731}
            height={909}
            alt=""
            role="presentation"
            aria-hidden="true"
            className="home-v2-stage-layer"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      {/* Desktop Hero Overlay (>= 768px): Unified flex row prevents any overlap between logo and metrics */}
      <div
        ref={desktopOverlayRef}
        className="hidden md:block md:fixed md:top-20 inset-x-0 z-20 will-change-opacity pointer-events-none"
      >
        <div className="w-full max-w-[2048px] mx-auto px-4 lg:px-6 flex justify-between items-start gap-4 lg:gap-6">
          <div ref={contentRef} className="pointer-events-auto shrink-0 w-fit max-w-[45vw]">
            {children}
          </div>

          {metrics && (
            <div
              data-metrics-panel="true"
              className="pointer-events-auto shrink min-w-0 max-w-4xl hidden lg:block"
            >
              {metrics}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Metrics (< 768px) */}
      {metrics && (
        <div
          ref={metricsRef}
          data-metrics-panel="true"
          className="relative z-40 w-full max-w-xl mx-auto px-3 pt-2 pb-4 md:hidden will-change-opacity pointer-events-auto"
        >
          {/* Mobile close button: smoothly collapses stage so content flies up */}
          <div className="md:hidden flex justify-end pb-1.5">
            <button
              type="button"
              onClick={handleCloseMobile}
              className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow text-xs font-semibold text-char-800 flex items-center gap-1.5 active:scale-95 border border-camel-200/80 transition-transform"
              aria-label="Закрыть блок ближайших событий"
            >
              <Icons.close className="w-3.5 h-3.5 text-char-600" aria-hidden />
              <span>Закрыть</span>
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
