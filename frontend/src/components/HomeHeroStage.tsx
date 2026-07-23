import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion, useGSAP } from '../lib/motion'
import { HOME_LANDSCAPES, type HomePhoto } from '../lib/homePhotos'

const SLIDE_MS = 7000
const FADE_S = 1.15
const SETTLE_S = 0.72
export const HOME_HERO_SETTLE_EVENT = 'cs-home-hero-settle'

export function requestHomeHeroSettle(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(HOME_HERO_SETTLE_EVENT))
}

function shufflePhotos(pool: readonly HomePhoto[]): HomePhoto[] {
  const next = [...pool]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

interface HomeHeroStageProps {
  children: ReactNode
}

/**
 * Стартовый экран: текст внизу на ~100vh.
 * Первый скролл вниз — hero сжимается, текст остаётся «наверху»;
 * к полноэкранному старту вернуться нельзя.
 */
export default function HomeHeroStage({ children }: HomeHeroStageProps) {
  const rootRef = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<(HTMLImageElement | null)[]>([])
  const copyRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const settledRef = useRef(false)
  const settlingRef = useRef(false)

  const photos = useMemo(() => shufflePhotos(HOME_LANDSCAPES), [])

  useGSAP(
    () => {
      const media = mediaRef.current
      const copy = copyRef.current
      const layers = layersRef.current.filter(Boolean) as HTMLImageElement[]
      if (!media || layers.length === 0) return

      gsap.set(layers, { autoAlpha: 0, scale: 1.06 })
      gsap.set(layers[0], { autoAlpha: 1, scale: 1 })

      if (prefersReducedMotion()) {
        if (copy) gsap.set(copy, { clearProps: 'all' })
        return
      }

      gsap.fromTo(
        media,
        { scale: 1.12, autoAlpha: 0.6 },
        { scale: 1, autoAlpha: 1, duration: 1.2, ease: 'power3.out' },
      )
      if (copy) {
        gsap.fromTo(
          copy,
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' },
        )
      }
    },
    { scope: rootRef, dependencies: [photos] },
  )

  useEffect(() => {
    const root = rootRef.current
    const copy = copyRef.current
    if (!root || !copy) return

    if (prefersReducedMotion()) {
      settledRef.current = true
      root.classList.add('home-v2-stage--settled')
      return
    }

    const settle = () => {
      if (settledRef.current || settlingRef.current) return
      settlingRef.current = true

      const startH = root.getBoundingClientRect().height
      const padTop = 28
      const padBot = 56
      // + overlap с body уже учтён одинаковым margin-bottom
      const endH = Math.ceil(copy.offsetHeight + padTop + padBot)

      window.scrollTo(0, 0)

      root.classList.add('home-v2-stage--settling')

      gsap
        .timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            settledRef.current = true
            settlingRef.current = false
            root.classList.remove('home-v2-stage--settling')
            root.classList.add('home-v2-stage--settled')
            // Не трогаем margin — он стабилен в CSS
            gsap.set(root, { clearProps: 'height,minHeight,paddingTop,paddingBottom' })
            gsap.set(mediaRef.current, { clearProps: 'scale' })
          },
        })
        .fromTo(
          root,
          { height: startH, minHeight: startH },
          {
            height: endH,
            minHeight: endH,
            paddingTop: padTop,
            paddingBottom: padBot,
            duration: SETTLE_S,
          },
          0,
        )
        .to(mediaRef.current, { scale: 1.04, duration: SETTLE_S }, 0)
    }

    const onWheel = (e: WheelEvent) => {
      if (settledRef.current) return
      if (settlingRef.current) {
        e.preventDefault()
        return
      }
      if (e.deltaY > 6) {
        e.preventDefault()
        settle()
      }
    }

    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (settledRef.current || touchY == null) return
      if (settlingRef.current) {
        e.preventDefault()
        return
      }
      const y = e.touches[0]?.clientY
      if (y == null) return
      if (touchY - y > 14) {
        e.preventDefault()
        settle()
      }
    }

    const onScroll = () => {
      if (settledRef.current || settlingRef.current) return
      if (window.scrollY > 4) settle()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener(HOME_HERO_SETTLE_EVENT, settle)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener(HOME_HERO_SETTLE_EVENT, settle)
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion() || photos.length < 2) return

    const id = window.setInterval(() => {
      const layers = layersRef.current.filter(Boolean) as HTMLImageElement[]
      if (layers.length < 2) return
      const from = indexRef.current
      const to = (from + 1) % layers.length
      const cur = layers[from]
      const next = layers[to]
      if (!cur || !next) return

      gsap.killTweensOf([cur, next])
      gsap.set(next, { autoAlpha: 0, scale: 1.06 })
      gsap
        .timeline()
        .to(cur, { autoAlpha: 0, scale: 1.04, duration: FADE_S, ease: 'power2.inOut' }, 0)
        .to(next, { autoAlpha: 1, scale: 1, duration: FADE_S, ease: 'power2.inOut' }, 0)
      indexRef.current = to
    }, SLIDE_MS)

    return () => window.clearInterval(id)
  }, [photos])

  return (
    <section ref={rootRef} className="home-v2-stage" aria-label="Главный экран">
      <div ref={mediaRef} className="home-v2-stage-media" aria-hidden>
        {photos.map((photo, i) => (
          <img
            key={photo.id}
            ref={(el) => {
              layersRef.current[i] = el
            }}
            className="home-v2-stage-layer"
            src={photo.src}
            alt=""
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
        <div className="home-v2-stage-veil" />
      </div>

      <div ref={copyRef} className="home-v2-stage-copy wrap">
        {children}
      </div>
    </section>
  )
}
