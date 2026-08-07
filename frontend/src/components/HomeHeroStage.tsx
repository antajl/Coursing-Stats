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
  const [metricsCollapsed, setMetricsCollapsed] = useState(false)
  const [autoCollapsed, setAutoCollapsed] = useState(false)
  const [contentFaded, setContentFaded] = useState(false)

  useGSAP(
    () => {
      const media = mediaRef.current
      const metricsEl = metricsRef.current
      if (!media) return

      if (prefersReducedMotion()) return

      // Анимация появления метрик
      if (metricsEl) {
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
      const scrollY = window.scrollY
      const progress = Math.min(scrollY / LAYOUT.SCROLL_FADE_RANGE, 1)
      const metricsEl = metricsRef.current
      if (metricsEl) {
        // Direct style manipulation for immediate response
        metricsEl.style.opacity = String(1 - progress)
        // Use mask-image with gradient for smooth fade from bottom
        const gradientStop = 100 - (progress * 100) // Linear progress for uniform speed
        metricsEl.style.maskImage = `linear-gradient(to bottom, black 0%, black ${gradientStop}%, transparent 100%)`
        metricsEl.style.webkitMaskImage = `linear-gradient(to bottom, black 0%, black ${gradientStop}%, transparent 100%)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [metrics])

  // IntersectionObserver for auto-collapse when approaching content (mobile only)
  useEffect(() => {
    const metricsEl = metricsRef.current
    const contentEl = contentRef.current
    if (!metricsEl || !contentEl) return

    // Only use IntersectionObserver on mobile
    const isMobile = window.innerWidth < BREAKPOINTS.MOBILE
    if (!isMobile) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Collapse when metrics panel gets close to content
        if (entry.isIntersecting) {
          setAutoCollapsed(true)
        } else {
          setAutoCollapsed(false)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-100px 0px 0px 0px'
      }
    )

    observer.observe(contentEl)
    return () => observer.disconnect()
  }, [])

  // ResizeObserver to fade content when page is too narrow
  useEffect(() => {
    const contentEl = contentRef.current
    const metricsEl = metricsRef.current
    if (!contentEl || !metricsEl) return

    const checkOverlap = () => {
      const contentRect = contentEl.getBoundingClientRect()
      const metricsRect = metricsEl.getBoundingClientRect()
      
      // Check if content (title) overlaps with metrics panel
      const contentRight = contentRect.right
      const metricsLeft = metricsRect.left
      const parentWidth = contentEl.parentElement?.offsetWidth || window.innerWidth
      
      // Fade when content overlaps with metrics or when parent is too narrow
      const isOverlapping = contentRight > metricsLeft
      const isTooNarrow = parentWidth < LAYOUT.CONTENT_FADE_THRESHOLD
      
      const shouldFade = isOverlapping || isTooNarrow
      
      setContentFaded(shouldFade)
    }

    const observer = new ResizeObserver(checkOverlap)
    observer.observe(contentEl)
    observer.observe(metricsEl)
    
    // Also check on window resize
    window.addEventListener('resize', checkOverlap)
    
    // Initial check
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
    setMetricsCollapsed(!metricsCollapsed)
  }

  useEffect(() => {
    const metricsEl = metricsRef.current
    if (!metricsEl) return

    // On mobile, use manual collapse only
    const isMobile = window.innerWidth < BREAKPOINTS.MOBILE
    if (isMobile && metricsCollapsed) {
      gsap.set(metricsEl, { x: '100%', opacity: 0 })
    } else {
      gsap.set(metricsEl, { x: '0%', opacity: 1 })
    }
  }, [metricsCollapsed])


  return (
    <>
      <section ref={rootRef} className="home-v2-stage hidden md:flex" aria-label="Главный экран">
        <div ref={mediaRef} className="home-v2-stage-media hidden md:block" aria-hidden>
          <img
            src="/assets/hero/background.webp"
            alt=""
            className="home-v2-stage-layer"
            loading="eager"
            fetchPriority="high"
          />
        </div>

        <div 
          ref={contentRef} 
          className={`home-v2-stage-copy wrap transition-all duration-300 ${contentFaded ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'}`}
        >
          {children}
        </div>

        {metrics && (
          <>
            <button
              type="button"
              onClick={toggleMetrics}
              className="fixed right-2 top-16 md:hidden z-50 p-2 rounded-full bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm shadow-lg border border-camel-200 dark:border-camel-700 will-change-opacity flex items-center justify-center"
              aria-label={metricsCollapsed ? 'Показать статистику' : 'Скрыть статистику'}
            >
              <Icons.chevronDown
                className={`transition-transform duration-300 ${metricsCollapsed ? 'rotate-0' : 'rotate-180'}`}
                aria-hidden
              />
            </button>
            <div ref={metricsRef} className="fixed right-4 top-16 md:right-4 md:top-20 max-w-5xl will-change-opacity z-50 transition-opacity duration-75 ease-linear">
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
