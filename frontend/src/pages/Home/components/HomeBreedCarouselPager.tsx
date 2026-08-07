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
    <div className="mt-auto border-t border-old-money-100 dark:border-charcoal-700">
      <div
        className="flex items-center justify-center gap-1.5 px-3 py-2"
        role="tablist"
        aria-label={ariaLabel}
      >
        {dots.map((dot, i) => {
          const active = i === activeDot
          return (
            <button
              key={dot.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={dot.label}
              title={dot.label}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active
                  ? 'w-4 bg-camel-500 dark:bg-camel-400'
                  : 'w-1.5 bg-old-money-300 hover:bg-old-money-400 dark:bg-charcoal-600 dark:hover:bg-charcoal-500'
              }`}
              onClick={() => go(i)}
            />
          )
        })}
      </div>

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
                if (driveAutoplay && !paused) go(index + 1)
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
