import { useRef, useCallback, useEffect } from 'react'
import { SEO } from '../components/SEO'
import { JsonLd, organizationSchema, webSiteSchema } from '../components/JsonLd'
import { useGSAP, riseIn } from '../lib/motion'
import HomeHeroStage from '../components/HomeHeroStage'
import HomeStatsPills from '../components/HomeStatsPills'
import { useHomeData } from './Home/hooks/useHomeData'
import { SeasonTopSection } from './Home/components/SeasonTopSection'
import { HomeFooter } from './Home/components/HomeFooter'
import { formatDate } from './Home/utils/formatters'
import { ANIMATION, IMAGES } from '../lib/constants'
import { ConceptSymmetricFinal } from './Home/components/HomeConcepts'

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null)
  const homeData = useHomeData()

  // Lock root scroll on single-screen static dashboard ONLY on desktop (>= 768px)
  useEffect(() => {
    const applyLock = () => {
      if (window.innerWidth >= 768) {
        document.documentElement.classList.add('home-static-locked')
      } else {
        document.documentElement.classList.remove('home-static-locked')
      }
    }
    applyLock()
    window.addEventListener('resize', applyLock)
    return () => {
      document.documentElement.classList.remove('home-static-locked')
      window.removeEventListener('resize', applyLock)
    }
  }, [])

  // Memoize formatDate to prevent unnecessary re-renders
  const memoizedFormatDate = useCallback(formatDate, [])

  const {
    stats,
    showStats,
    competitionSlides,
    racingSlides,
    showSlides,
    topShowDogs,
    doninoSpeedRecords,
    doninoCoursingRecords,
    doninoSpeedSlides,
    doninoCoursingSlides,
    seasonLoading,
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
          title="Coursing Stats — Рейтинг и статистика собак: курсинг, бега, выставки РКФ"
          description="Статистика и рейтинги собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ. Карьера собаки, награды, медали и рейтинг с 2015 года."
          canonicalUrl="https://coursing-stats.ru/"
          keywords="курсинг, бега борзых, статистика курсинга, рейтинг собак 2026, выставки РКФ, донино"
        />
        <div className="wrap home-v2-body">
          <div className="home-v2-error" role="alert" aria-live="assertive">
            <h1 className="text-xl font-bold text-charcoal-900 mb-2">Ошибка загрузки данных</h1>
            <p>Не удалось загрузить данные главной страницы. Пожалуйста, попробуйте обновить страницу.</p>
            <button onClick={() => window.location.reload()} aria-label="Обновить страницу">
              Обновить страницу
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-v2 home-v2-static" ref={pageRef}>
      <h1 className="sr-only">Рейтинг и статистика собак: курсинг, бега, выставки</h1>
      <SEO
        title="Coursing Stats — Рейтинг и статистика собак: курсинг, бега, выставки РКФ"
        description="Статистика и рейтинги собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ. Карьера собаки, награды, медали и рейтинг с 2015 года."
        canonicalUrl="https://coursing-stats.ru/"
        keywords="курсинг, бега борзых, статистика курсинга, рейтинг собак 2026, выставки РКФ, донино"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />

      {/* =========================================================================
          DESKTOP (>= 768px): Single-Screen Static Executive Dashboard
      ========================================================================= */}
      <HomeHeroStage
        isStaticDashboard={true}
        hideScrollCue={true}
        disableScrollFade={true}
        reverseLayout={true}
        children={<ConceptSymmetricFinal stats={stats} showStats={showStats} />}
        metrics={
          /* Left block: Double Podium Rankings */
          <div className="pointer-events-auto shrink-0 w-full md:w-[clamp(900px,53vw,1040px)] 3xl:w-[clamp(980px,58vw,1360px)] max-w-[calc(100vw-340px)] mr-auto">
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
              compact={true}
            />
          </div>
        }
      />

      {/* =========================================================================
          MOBILE (< 768px): Natural, touch-friendly, scrollable flow
      ========================================================================= */}
      <div className="md:hidden flex flex-col pb-6">
        {/* Hero Banner: Borzoi in Motion across full width (Native, Smooth bottom fade) */}
        <div
          className="relative w-full h-[140px] xs:h-[155px] sm:h-[180px] overflow-hidden select-none pointer-events-none mb-1"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.85) 84%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.85) 84%, transparent 100%)',
          }}
        >
          <picture>
            <source
              media="(max-width: 480px)"
              srcSet="/assets/hero/background-mobile-480.webp"
              width={480}
              height={160}
            />
            <source
              media="(max-width: 768px)"
              srcSet="/assets/hero/background-mobile.webp"
              width={820}
              height={278}
            />
            <img
              src="/assets/hero/background-mobile-480.webp"
              width={480}
              height={160}
              alt=""
              role="presentation"
              className="w-full h-full object-cover object-[center_68%]"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          {/* Bottom soft gradient overlay into om-50 */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#faf8f4] via-[#faf8f4]/70 to-transparent pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="wrap !pb-2 px-3 sm:px-4 relative z-10 flex flex-col gap-2.5">
          {/* Database Statistics */}
          <HomeStatsPills stats={stats} showStats={showStats} loading={seasonLoading} />

          {/* Seasonal Ratings & Leaders */}
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
            compact={false}
          />

          {/* Footer */}
          <HomeFooter />
        </div>
      </div>
    </div>
  )
}
