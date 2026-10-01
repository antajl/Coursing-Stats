import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion, useGSAP } from '../lib/motion'
import { Icons } from '../lib/icons'
import { ANIMATION, BREAKPOINTS, LAYOUT } from '../lib/constants'

interface HomeHeroStageProps {
  children: ReactNode
  metrics?: ReactNode
}

/**
 * Стартовый экран: статичная картинка с надписью.
 * Надпись исчезает при скролле.
 */
export default function HomeHeroStage({ children, metrics }: HomeHeroStageProps) {
  const rootRef = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [metricsCollapsed, setMetricsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < BREAKPOINTS.MOBILE
    }
    return false
  })
  const [contentFaded, setContentFaded] = useState(false)

  useGSAP(
    () => {
      const media = mediaRef.current
      const metricsEl = metricsRef.current
      if (!media) return

      if (prefersReducedMotion()) return

      // Анимация появления метрик
      if (metricsEl && window.innerWidth >= BREAKPOINTS.MOBILE) {
        gsap.fromTo(
          metricsEl,
          { autoAlpha: 0, x: 20 },
          { autoAlpha: 1, x: 0, duration: ANIMATION.GSAP_SLOW, ease: 'power2.out', delay: ANIMATION.DELAY_SHORT }
        )
      }
    },
    { scope: rootRef },
  )

  useEffect(() => {
    if (!metrics) return

    const handleScroll = () => {
      const isMobile = window.innerWidth < BREAKPOINTS.MOBILE
      if (isMobile && metricsCollapsed) return

      const scrollY = window.scrollY
      const progress = Math.min(scrollY / LAYOUT.SCROLL_FADE_RANGE, 1)
      const metricsEl = metricsRef.current
      if (metricsEl) {
        metricsEl.style.opacity = String(1 - progress)
        const gradientStop = 100 - (progress * 100)
        metricsEl.style.maskImage = `linear-gradient(to bottom, black 0%, black ${gradientStop}%, transparent 100%)`
        metricsEl.style.webkitMaskImage = `linear-gradient(to bottom, black 0%, black ${gradientStop}%, transparent 100%)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [metrics, metricsCollapsed])

  // ResizeObserver to fade content when page is too narrow on desktop
  useEffect(() => {
    const contentEl = contentRef.current
    const metricsEl = metricsRef.current
    if (!contentEl || !metricsEl) return

    const checkOverlap = () => {
      const isMobile = window.innerWidth < BREAKPOINTS.MOBILE
      if (isMobile) {
        setContentFaded(false)
        return
      }

      const targetEl = (contentEl.firstElementChild as HTMLElement) || contentEl
      const targetRect = targetEl.getBoundingClientRect()
      const metricsRect = metricsEl.getBoundingClientRect()

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

  const handleScrollDown = () => {
    const nextSection = document.querySelector('.home-v2-body')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }
  }

  const toggleMetrics = () => {
    setMetricsCollapsed((prev) => !prev)
  }

  useEffect(() => {
    const metricsEl = metricsRef.current
    if (!metricsEl) return

    const isMobile = window.innerWidth < BREAKPOINTS.MOBILE
    if (isMobile) {
      if (metricsCollapsed) {
        gsap.to(metricsEl, {
          y: -16,
          autoAlpha: 0,
          duration: 0.2,
          ease: 'power2.in',
        })
      } else {
        gsap.fromTo(
          metricsEl,
          { y: -16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.25,
            ease: 'power2.out',
          }
        )
      }
    } else {
      gsap.set(metricsEl, { y: 0, autoAlpha: 1, clearProps: 'transform' })
    }
  }, [metricsCollapsed])

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < BREAKPOINTS.MOBILE
      const metricsEl = metricsRef.current
      if (!metricsEl) return

      if (!isMobile) {
        setMetricsCollapsed(false)
        gsap.set(metricsEl, { x: 0, y: 0, autoAlpha: 1, clearProps: 'transform,visibility' })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <section ref={rootRef} className="home-v2-stage flex flex-col justify-start" aria-label="Главный экран">
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
          className={`home-v2-stage-copy px-4 sm:px-6 lg:px-8 transition-all duration-300 ${contentFaded ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'}`}
        >
          {children}

          {metrics && (
            <div className="md:hidden mt-2.5 flex justify-center">
              <button
                type="button"
                onClick={toggleMetrics}
                className="px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md shadow-sm border border-camel-200/80 text-xs font-medium text-char-800 flex items-center gap-1.5 transition-all duration-150 active:scale-95"
              >
                <span>{metricsCollapsed ? 'Ближайшие события и статистика' : 'Скрыть события и статистику'}</span>
                <Icons.chevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${metricsCollapsed ? 'rotate-0' : 'rotate-180'}`}
                  aria-hidden
                />
              </button>
            </div>
          )}
        </div>

        {metrics && (
          <>
            {!metricsCollapsed && (
              <div
                className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 md:hidden"
                onClick={() => setMetricsCollapsed(true)}
                aria-hidden="true"
              />
            )}

            <div
              ref={metricsRef}
              data-metrics-panel="true"
              className="fixed right-3 left-3 top-14 md:left-auto md:right-4 md:top-20 max-w-5xl max-h-[82vh] md:max-h-none overflow-y-auto md:overflow-visible will-change-opacity z-50 transition-opacity duration-75 ease-linear"
            >
              <div className="md:hidden flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setMetricsCollapsed(true)}
                  className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow text-xs font-semibold text-char-700 flex items-center gap-1 active:scale-95"
                  aria-label="Закрыть панель метрик"
                >
                  ✕ Закрыть
                </button>
              </div>
              {metrics}
            </div>
          </>
        )}

        <button
          type="button"
          className="home-v2-scroll-cue"
          aria-label="Прокрутить вниз"
          onClick={handleScrollDown}
        >
          <Icons.chevronDown aria-hidden />
          <Icons.chevronDown className="home-v2-scroll-cue-chevron" aria-hidden />
        </button>
      </section>
    </>
  )
}
