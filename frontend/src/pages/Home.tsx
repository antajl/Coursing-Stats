import { useRef, useCallback, useState } from 'react'
import { SEO } from '../components/SEO'
import { JsonLd, organizationSchema, webSiteSchema } from '../components/JsonLd'
import { useGSAP, prefersReducedMotion, riseIn } from '../lib/motion'
import { Icons } from '../lib/icons'
import HomeHeroStage from '../components/HomeHeroStage'
import HomeDogSearch from '../components/HomeDogSearch'
import MetricsWidget from '../components/MetricsWidget'
import { useHomeData } from './Home/hooks/useHomeData'
import { SeasonTopSection } from './Home/components/SeasonTopSection'
import { HomeFooter } from './Home/components/HomeFooter'
import { formatDate } from './Home/utils/formatters'
import { ANIMATION, IMAGES } from '../lib/constants'

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null)
  const homeData = useHomeData()
  
  // Memoize formatDate to prevent unnecessary re-renders
  const memoizedFormatDate = useCallback(formatDate, [])

  const {
    stats,
    showStats,
    featuredEvents,
    featuredShows,
    competitionSlides,
    racingSlides,
    showSlides,
    topShowDogs,
    doninoSpeedRecords, doninoCoursingRecords,
    doninoSpeedSlides, doninoCoursingSlides,
    heroLoading, seasonLoading, doninoLoading, loading,
    error,
  } = homeData

  // GSAP animations for reveal sections
  useGSAP(
    () => {
      if (!pageRef.current) return
      const sections = Array.from(
        pageRef.current.querySelectorAll<HTMLElement>('[data-home-reveal]'),
      ).filter((el) => el.dataset.homeAnimated !== '1')
      if (!sections.length) return
      sections.forEach((el) => {
        el.dataset.homeAnimated = '1'
      })

      riseIn(sections, {
        y: 14,
        duration: ANIMATION.GSAP_MEDIUM,
        stagger: ANIMATION.STAGGER_SMALL,
        delay: ANIMATION.DELAY_NONE,
        ease: 'power2.out',
      })
    },
    { scope: pageRef, dependencies: [loading] },
  )

  // Error state
  if (error) {
    return (
      <div className="home-v2" ref={pageRef}>
        <SEO
          title="Coursing Stats — Рейтинг и статистика собак: курсинг, бега, выставки РКФ"
          description="Статистика и рейтинги собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ. Карьера собаки, награды, медали и рейтинг с 2015 года."
          canonicalUrl="https://coursing-stats.ru/"
          keywords="курсинг, бега борзых, статистика курсинга, рейтинг собак 2026, выставки РКФ, донино"
        />
        <div className="wrap home-v2-body">
          <div className="home-v2-error" role="alert" aria-live="assertive">
            <h1 className="text-xl font-bold text-charcoal-900 mb-2">Ошибка загрузки данных</h1>
            <p>Не удалось загрузить данные главной страницы. Пожалуйста, попробуйте обновить страницу.</p>
            <button onClick={() => window.location.reload()} aria-label="Обновить страницу">Обновить страницу</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-v2" ref={pageRef}>
      <h1 className="sr-only">Рейтинг и статистика собак: курсинг, бега, выставки</h1>
      <SEO
        title="Coursing Stats — Рейтинг и статистика собак: курсинг, бега, выставки РКФ"
        description="Статистика и рейтинги собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ. Карьера собаки, награды, медали и рейтинг с 2015 года."
        canonicalUrl="https://coursing-stats.ru/"
        keywords="курсинг, бега борзых, статистика курсинга, рейтинг собак 2026, выставки РКФ, донино"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />

      {/* Desktop Hero Stage (>= 768px) and Mobile Initial Screen (< 768px) */}
      <HomeHeroStage
        children={
          <div
            className="flex flex-col items-start gap-4 lg:gap-6 select-none max-w-full"
            style={{ width: 'clamp(280px, 26vw, 560px)' }}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet="/assets/hero/title-mobile.webp" width={560} height={350} />
              <img
                src="/assets/hero/title.webp"
                width={IMAGES.HERO_TITLE.WIDTH}
                height={IMAGES.HERO_TITLE.HEIGHT}
                alt="Coursing Stats"
                data-page-logo="desktop"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-auto drop-shadow-md pointer-events-none"
              />
            </picture>
            <div className="w-full max-w-[440px] ml-4 lg:ml-8 pointer-events-auto">
              <HomeDogSearch className="w-full" />
            </div>
          </div>
        }
        metrics={
          <MetricsWidget
            events={featuredEvents}
            shows={featuredShows}
            stats={stats}
            showStats={showStats}
            loading={heroLoading}
            formatDate={memoizedFormatDate}
          />
        }
        onCloseMetrics={() => {
          const target = document.getElementById('season-top') || document.getElementById('content-start') || document.querySelector('.home-v2-body')
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' })
          } else {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
        }}
      />

      <div className="wrap home-v2-body">
        {/* Mobile Header: Logo & Search directly above SeasonTopSection */}
        <div id="content-start" className="md:hidden flex flex-col items-center pt-2 pb-4 scroll-mt-14">
          <img
            src="/assets/hero/title-mobile.webp"
            srcSet="/assets/hero/title-mobile.webp 1x, /assets/hero/title.webp 2x"
            width={560}
            height={350}
            alt="Coursing Stats"
            data-page-logo="mobile"
            className="w-[280px] sm:w-[320px] max-w-[88vw] h-auto mx-auto drop-shadow-sm pointer-events-none select-none"
            loading="lazy"
            decoding="async"
          />
          <div className="w-full max-w-md px-2 pt-2 pb-2">
            <HomeDogSearch className="w-full" />
          </div>
        </div>

        {/* Tablet / compressed desktop (< 1024px): MetricsWidget in body flow to prevent covering hero logo */}
        <div className="hidden md:block lg:hidden mb-8">
          <MetricsWidget
            events={featuredEvents}
            shows={featuredShows}
            stats={stats}
            showStats={showStats}
            loading={heroLoading}
            formatDate={memoizedFormatDate}
          />
        </div>

        {/* Season top & records section */}
        <SeasonTopSection
          competitionSlides={competitionSlides}
          racingSlides={racingSlides}
          showSlides={showSlides}
          topShowDogs={topShowDogs}
          doninoSpeedRecords={doninoSpeedRecords}
          doninoCoursingRecords={doninoCoursingRecords}
          doninoSpeedSlides={doninoSpeedSlides}
          doninoCoursingSlides={doninoCoursingSlides}
          loading={seasonLoading}
        />

        {/* Footer */}
        <HomeFooter />
      </div>
    </div>
  )
}
