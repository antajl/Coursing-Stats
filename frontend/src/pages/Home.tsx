import { useRef, useCallback } from 'react'
import { SEO } from '../components/SEO'
import { JsonLd, organizationSchema, webSiteSchema } from '../components/JsonLd'
import { useGSAP, prefersReducedMotion, riseIn } from '../lib/motion'
import HomeHeroStage from '../components/HomeHeroStage'
import MetricsWidget from '../components/MetricsWidget'
import { useHomeData } from './Home/hooks/useHomeData'
import { useHeroScroll } from './Home/hooks/useHeroScroll'
import { SeasonTopSection } from './Home/components/SeasonTopSection'
import { DoninoRecordsSection } from './Home/components/DoninoRecordsSection'
import { HomeFooter } from './Home/components/HomeFooter'
import { formatDate } from './Home/utils/formatters'
import { ANIMATION, IMAGES } from '../lib/constants'

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null)
  const heroTitleRef = useHeroScroll()
  const homeData = useHomeData()
  
  // Memoize formatDate to prevent unnecessary re-renders
  const memoizedFormatDate = useCallback(formatDate, [])

  const {
    stats,
    showStats,
    featuredEvents,
    featuredShows,
    topPlacement,
    topScore,
    topSpeed,
    doninoSpeedRecords,
    doninoCoursingRecords,
    topShowDogs,
    loading,
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

      {/* Hero title only on home page */}
      <img
        ref={heroTitleRef}
        src="/assets/hero/title.webp"
        width={IMAGES.HERO_TITLE.WIDTH}
        height={IMAGES.HERO_TITLE.HEIGHT}
        loading="eager"
        fetchPriority="high"
        alt=""
        role="presentation"
        aria-hidden="true"
        className={`hidden md:block fixed left-4 top-20 scale-50 origin-top-left will-change-opacity pointer-events-none z-50 transition-opacity duration-[${ANIMATION.CSS_FAST}ms] ease-linear`}
      />

      <HomeHeroStage
        children={<></>}
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
      />

      <div className="wrap home-v2-body">
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
