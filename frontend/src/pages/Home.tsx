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
import { DoninoRecordsSection } from './Home/components/DoninoRecordsSection'
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
    showSlides,
    topPlacement,
    topScore,
    topSpeed,
    doninoSpeedRecords,
    doninoCoursingRecords,
    topShowDogs,
    loading,
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
          title="Статистика курсинга, бегов и выставок собак"
          description="Coursing Stats — агрегатор результатов курсинга, бегов борзых и выставок РКФ (в т.ч. протоколы с procoursing.ru): карьера собаки, награды и рейтинги с 2015 года."
          canonicalUrl="https://coursing-stats.ru/"
          keywords="курсинг, бега борзых, статистика курсинга, рейтинг собак, выставки РКФ, procoursing"
        />
        <div className="wrap home-v2-body">
          <div className="home-v2-error" role="alert" aria-live="assertive">
            <h2>Ошибка загрузки данных</h2>
            <p>Не удалось загрузить данные главной страницы. Пожалуйста, попробуйте обновить страницу.</p>
            <button onClick={() => window.location.reload()} aria-label="Обновить страницу">Обновить страницу</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-v2" ref={pageRef}>
      <SEO
        title="Статистика курсинга, бегов и выставок собак"
        description="Coursing Stats — агрегатор результатов курсинга, бегов борзых и выставок РКФ (в т.ч. протоколы с procoursing.ru): карьера собаки, награды и рейтинги с 2015 года."
        canonicalUrl="https://coursing-stats.ru/"
        keywords="курсинг, бега борзых, статистика курсинга, рейтинг собак, выставки РКФ, procoursing"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />

      {/* Desktop Hero Stage (>= 768px) and Mobile Initial Screen (< 768px) */}
      <HomeHeroStage
        children={
          <div
            className="flex flex-col items-start gap-4 lg:gap-6 select-none max-w-full"
            style={{ width: 'clamp(400px, 36vw, 720px)' }}
          >
            <img
              src="/assets/hero/title.webp"
              width={IMAGES.HERO_TITLE.WIDTH}
              height={IMAGES.HERO_TITLE.HEIGHT}
              alt="Coursing Stats"
              data-page-logo="desktop"
              loading="eager"
              fetchPriority="high"
              className="w-full h-auto drop-shadow-md pointer-events-none"
            />
            <div className="w-full max-w-[500px] ml-6 lg:ml-10 pointer-events-auto">
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
            loading={loading}
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
            src="/assets/hero/title.webp"
            width={IMAGES.HERO_TITLE.WIDTH}
            height={IMAGES.HERO_TITLE.HEIGHT}
            alt="Coursing Stats"
            data-page-logo="mobile"
            className="w-[280px] sm:w-[320px] max-w-[88vw] h-auto mx-auto drop-shadow-sm pointer-events-none select-none"
            loading="lazy"
          />
          <div className="w-full max-w-md px-2 pt-2 pb-2">
            <HomeDogSearch className="w-full" />
          </div>
        </div>

        {/* Season top section */}
        <SeasonTopSection
          competitionSlides={competitionSlides}
          showSlides={showSlides}
          loading={loading}
        />

        {/* Donino records section */}
        <DoninoRecordsSection
          doninoSpeedRecords={doninoSpeedRecords}
          doninoCoursingRecords={doninoCoursingRecords}
          loading={loading}
        />

        {/* Footer */}
        <HomeFooter />
      </div>
    </div>
  )
}
