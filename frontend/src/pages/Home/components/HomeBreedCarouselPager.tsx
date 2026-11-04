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
    <div className="relative mt-auto border-t border-old-money-200/70 home-breed-pager-wrapper w-full max-w-full overflow-hidden">
      {/* Autoplay progress bar: sleek 2px hairline along the straight top divider */}
      {autoplay && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-old-money-200/40 overflow-hidden pointer-events-none z-10" aria-hidden>
          {progressReady ? (
            <div
              key={index}
              className="h-full bg-camel-600 origin-left"
              style={{
                animation: `home-breed-progress ${HOME_BREED_SLIDE_MS}ms linear forwards`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
              onAnimationEnd={() => {
                if (driveAutoplay && !paused) go(index + 1, 1)
              }}
            />
          ) : null}
        </div>
      )}

      <nav
        className="flex items-center justify-center gap-0.5 px-2 py-0.5 w-full max-w-full overflow-hidden home-breed-pager-nav"
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
              className="inline-flex min-h-[32px] sm:min-h-[36px] min-w-0 flex-1 max-w-[28px] items-center justify-center px-0.5 py-1 focus:outline-none home-breed-pager-dot-btn cursor-pointer"
              onClick={() => go(i)}
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  active
                    ? 'w-3.5 sm:w-4 bg-camel-500'
                    : 'w-1.5 bg-old-money-300 hover:bg-old-money-400'
                }`}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
