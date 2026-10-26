import { useRef, useCallback } from 'react'
import { SEO } from '../components/SEO'
import { JsonLd, organizationSchema, webSiteSchema } from '../components/JsonLd'
import { useGSAP, riseIn } from '../lib/motion'
import HomeHeroStage from '../components/HomeHeroStage'
import HomeStatsPills from '../components/HomeStatsPills'
import { useHomeData } from './Home/hooks/useHomeData'
import { SeasonTopSection } from './Home/components/SeasonTopSection'
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

      {/* Single-Screen Executive Dashboard */}
      <HomeHeroStage
        isStaticDashboard={true}
        hideScrollCue={true}
        disableScrollFade={true}
        reverseLayout={true}
        children={
          /* Right block: Logo & Compact Database Statistics */
          <div className="flex flex-col items-end text-right gap-2 select-none max-w-full">
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
                className="w-full max-w-[220px] sm:max-w-[260px] lg:max-w-[290px] h-auto drop-shadow-md pointer-events-none"
              />
            </picture>
            <div className="w-full max-w-[310px] pointer-events-auto">
              <HomeStatsPills stats={stats} showStats={showStats} />
            </div>
          </div>
        }
        metrics={
          /* Left block: Double Podium Rankings */
          <div className="pointer-events-auto shrink-0 w-[960px] lg:w-[1040px] xl:w-[1140px] 2xl:w-[1220px] max-w-[calc(100vw-340px)] mr-auto">
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
    </div>
  )
}
