import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion, useGSAP } from '../lib/motion'
import { shuffleHomePhotos } from '../lib/homePhotos'
import { Icons } from '../lib/icons'

const SLIDE_MS = 7000
const FADE_S = 1.15
const SETTLE_S = 0.72
/** Доля settle, с которой показываем body и каскад блоков */
const SETTLE_REVEAL_AT = 0.48
export const HOME_HERO_SETTLE_EVENT = 'cs-home-hero-settle'

export function requestHomeHeroSettle(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(HOME_HERO_SETTLE_EVENT))
}

interface HomeHeroStageProps {
  children: ReactNode
  /** Вызывается один раз при первом settle (скролл / поиск). */
  onSettleStart?: () => void
}

/**
 * Стартовый экран: текст внизу на ~100vh.
 * Первый скролл вниз — hero сжимается, текст остаётся «наверху»;
 * к полноэкранному старту вернуться нельзя.
 */
export default function HomeHeroStage({ children, onSettleStart }: HomeHeroStageProps) {
  const rootRef = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<(HTMLImageElement | null)[]>([])
  const copyRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const settledRef = useRef(false)
  const settlingRef = useRef(false)
  const onSettleStartRef = useRef(onSettleStart)
  onSettleStartRef.current = onSettleStart

  const photos = useMemo(() => shuffleHomePhotos(), [])

  useGSAP(
    () => {
      const media = mediaRef.current
      const copy = copyRef.current
      const layers = layersRef.current.filter(Boolean) as HTMLImageElement[]
      if (!media) return

      if (layers.length > 0) {
        gsap.set(layers, { autoAlpha: 0, scale: 1.06 })
        gsap.set(layers[0], { autoAlpha: 1, scale: 1 })
      }

      if (prefersReducedMotion()) {
        if (copy) gsap.set(copy, { clearProps: 'all' })
        return
      }

      if (layers.length > 0) {
        gsap.fromTo(
          media,
          { scale: 1.12, autoAlpha: 0.6 },
          { scale: 1, autoAlpha: 1, duration: 1.2, ease: 'power3.out' },
        )
      }
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
      document.documentElement.classList.remove('home-hero-locked')
      onSettleStartRef.current?.()
      return
    }

    const settle = () => {
      if (settledRef.current || settlingRef.current) return
      settlingRef.current = true

      const startH = root.getBoundingClientRect().height
      const padTop = 28
      const padBot = 56
      const homeRoot = root.closest('.home-v2')
      let bodyRevealed = false

      const revealBody = () => {
        if (bodyRevealed) return
        bodyRevealed = true
        homeRoot?.classList.add('home-v2--revealed')
        // Подтянуть body под низ фото, пока высота ещё анимируется
        gsap.set(root, { marginBottom: -48 })
        onSettleStartRef.current?.()
      }

      const contentH = copy.getBoundingClientRect().height
      const endH = Math.max(Math.ceil(contentH + padTop + padBot), 160)

      gsap.set(root, {
        height: startH,
        minHeight: startH,
        maxHeight: 'none',
        paddingTop: padTop,
        paddingBottom: padBot,
        marginBottom: 0,
      })
      root.classList.add('home-v2-stage--settling')

      window.scrollTo(0, 0)

      gsap.to(root, {
        height: endH,
        minHeight: endH,
        duration: SETTLE_S,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate() {
          if (this.progress() >= SETTLE_REVEAL_AT) revealBody()
        },
        onComplete: () => {
          settledRef.current = true
          settlingRef.current = false
          revealBody()

          document.documentElement.classList.remove('home-hero-locked')
          root.classList.remove('home-v2-stage--settling')
          root.classList.add('home-v2-stage--settled')

          gsap.set(root, {
            height: 'auto',
            minHeight: 0,
            maxHeight: 'none',
            paddingTop: padTop,
            paddingBottom: padBot,
            marginBottom: -48,
          })
          gsap.set(root, {
            clearProps: 'height,minHeight,maxHeight,paddingTop,paddingBottom,marginBottom',
          })
        },
      })
    }

    const onWheel = (e: WheelEvent) => {
      if (settledRef.current) return
      e.preventDefault()
      if (settlingRef.current) return
      if (e.deltaY > 6) settle()
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
      if (window.scrollY > 0) {
        window.scrollTo(0, 0)
        settle()
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (settledRef.current || settlingRef.current) return
      const keys = ['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End']
      if (!keys.includes(e.key)) return
      e.preventDefault()
      settle()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener(HOME_HERO_SETTLE_EVENT, settle)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKeyDown)
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

      <button
        type="button"
        className="home-v2-scroll-cue"
        aria-label="Прокрутить вниз"
        onClick={() => requestHomeHeroSettle()}
      >
        <Icons.chevronDown aria-hidden />
        <Icons.chevronDown className="home-v2-scroll-cue-chevron" aria-hidden />
      </button>
    </section>
  )
}
