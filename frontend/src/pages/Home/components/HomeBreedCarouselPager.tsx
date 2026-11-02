import { ChevronRight } from 'lucide-react'
import {
  HOME_BREED_SLIDE_MS,
  type HomeBreedCarouselApi,
} from '../hooks/useHomeBreedCarousel'

type SlideDot = { key: string; label: string }

interface HomeBreedCarouselPagerProps {
  carousel: HomeBreedCarouselApi
  /** Dots — usually one per slide in this column. */
  dots: SlideDot[]
  /** Active dot index within `dots` (already modulo-mapped). */
  activeDot: number
  ariaLabel: string
  /** Only one pager should advance the shared carousel on progress end. */
  driveAutoplay?: boolean
}

/** Progress bar + breed dots — shared chrome for home season carousels. */
export function HomeBreedCarouselPager({
  carousel,
  dots,
  activeDot,
  ariaLabel,
  driveAutoplay = false,
}: HomeBreedCarouselPagerProps) {
  const { index, paused, autoplay, progressReady, go } = carousel

  if (dots.length <= 1) return null

  return (
    <div className="relative mt-auto border-t border-old-money-100 home-breed-pager-wrapper">
      <nav
        className="flex items-center justify-center gap-0.5 px-3 py-0.5 home-breed-pager-nav"
        aria-label={ariaLabel}
      >
        {dots.map((dot, i) => {
          const active = i === activeDot
          return (
            <button
              key={dot.key}
              type="button"
              aria-label={dot.label}
              title={dot.label}
              className="inline-flex min-h-[44px] min-w-[36px] items-center justify-center px-1 py-1 focus:outline-none home-breed-pager-dot-btn"
              onClick={() => go(i)}
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  active
                    ? 'w-4 bg-camel-500'
                    : 'w-1.5 bg-old-money-300 hover:bg-old-money-400'
                }`}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </nav>

      {/* Физический прозрачный язычок с правого края (Mobile) */}
      <button
        type="button"
        onClick={() => {
          carousel.next()
          carousel.triggerNudge?.()
        }}
        className="md:hidden absolute top-1/2 -translate-y-1/2 right-0 z-10 inline-flex items-center gap-1 rounded-l-full border-y border-l border-camel-400/90 bg-camel-100/80 pl-2.5 pr-1.5 py-1 text-[11px] font-bold text-camel-950 shadow-xs backdrop-blur-md transition-all hover:bg-camel-200 active:scale-95 cursor-pointer touch-manipulation"
        title="Смахните экран или нажмите для перехода к следующей породе"
        aria-label="Следующая порода"
      >
        <span>Породы</span>
        <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" />
      </button>

      {autoplay && (
        <>
          <div className="home-breed-progress-track" aria-hidden />
          {progressReady ? (
            <div
              key={index}
              className="home-breed-progress-fill__bar"
              aria-hidden
              style={{
                animation: `home-breed-progress ${HOME_BREED_SLIDE_MS}ms linear forwards`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
              onAnimationEnd={() => {
                if (driveAutoplay && !paused) go(index + 1, 1)
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
