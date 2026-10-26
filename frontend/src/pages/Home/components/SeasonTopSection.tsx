import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../../lib/icons'
import SeasonCompetitionsCarousel from './SeasonCompetitionsCarousel'
import SeasonShowsCarousel from './SeasonShowsCarousel'
import { SectionHead } from './SectionHead'
import { SeasonTopSectionSkeleton } from './SeasonTopSectionSkeleton'
import { carouselSlideIndex, useHomeBreedCarousel } from '../hooks/useHomeBreedCarousel'
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { CombinedRankingDog } from '../../TopDogs/mergeCombinedRanking'
import type { ShowHomeTopDog } from '../../../lib/staticData'

const CURRENT_SEASON = new Date().getFullYear()

interface SeasonTopSectionProps {
  competitionSlides: BreedSlide<CombinedRankingDog>[]
  showSlides: BreedSlide<ShowHomeTopDog>[]
  loading: boolean
}

function SeasonTopSectionInner({
  competitionSlides,
  showSlides,
  loading,
}: SeasonTopSectionProps) {
  const showSeasonSection = loading || competitionSlides.length > 0 || showSlides.length > 0
  const syncCount = Math.max(competitionSlides.length, showSlides.length, 0)
  const carousel = useHomeBreedCarousel(syncCount)
  const [activeMobileTab, setActiveMobileTab] = useState<'competitions' | 'shows'>('competitions')

  const hasCompetitions = competitionSlides.length > 0
  const hasShows = showSlides.length > 0
  const effectiveMobileTab =
    !hasCompetitions && hasShows
      ? 'shows'
      : !hasShows && hasCompetitions
        ? 'competitions'
        : activeMobileTab

  const currentCompSlide =
    hasCompetitions
      ? competitionSlides[carouselSlideIndex(carousel.contentIndex, competitionSlides.length)]
      : undefined
  const currentShowSlide =
    hasShows
      ? showSlides[carouselSlideIndex(carousel.contentIndex, showSlides.length)]
      : undefined

  const mobileTabs = useMemo(
    () => [
      {
        id: 'competitions' as const,
        label: 'Соревнования',
        count: currentCompSlide?.dogCount,
      },
      {
        id: 'shows' as const,
        label: 'Выставки РКФ',
        count: currentShowSlide?.dogCount,
      },
    ],
    [currentCompSlide?.dogCount, currentShowSlide?.dogCount],
  )

  /** Same dots under both columns so pagers match width and active index. */
  const syncDots = useMemo(
    () =>
      Array.from({ length: syncCount }, (_, i) => {
        const comp = competitionSlides[i]
        const show = showSlides[i]
        const label =
          [comp?.breedLabel, show?.breedLabel].filter(Boolean).join(' · ') || `Слайд ${i + 1}`
        return {
          key: `sync-${i}-${comp?.breedKey ?? ''}-${show?.breedKey ?? ''}`,
          label,
        }
      }),
    [syncCount, competitionSlides, showSlides],
  )

  if (loading) return <SeasonTopSectionSkeleton />
  if (!showSeasonSection) return null

  const rankingHref =
    effectiveMobileTab === 'shows'
      ? `/shows?tab=ranking&year=${CURRENT_SEASON}`
      : '/competitions?tab=ranking'

  return (
    <section id="season-top" className="home-v2-block scroll-mt-20" data-home-reveal>
      <SectionHead
        icon={Icons.medal}
        title={`Топ сезона ${CURRENT_SEASON}`}
        href={rankingHref}
        linkLabel="Весь рейтинг"
      />

      {hasCompetitions && hasShows && (
        <SegmentedTabs
          tabs={mobileTabs}
          activeTab={effectiveMobileTab}
          onChange={(tab) => setActiveMobileTab(tab as 'competitions' | 'shows')}
          breakpoint="md"
          className="mb-3.5"
          ariaLabel="Разделы топа сезона"
        />
      )}

      {hasCompetitions || hasShows ? (
        <div className="home-v2-columns" {...carousel.pauseHandlers}>
          <div
            className={`home-v2-col ${
              effectiveMobileTab === 'shows' && hasCompetitions && hasShows ? '!hidden md:!flex' : ''
            }`}
          >
            {hasCompetitions ? (
              <SeasonCompetitionsCarousel
                slides={competitionSlides}
                carousel={carousel}
                syncDots={syncDots}
                driveAutoplay
              />
            ) : (
              <>
                <div className="home-v2-col-head">Соревнования</div>
                <p className="donino-home-empty" role="status">
                  Нет данных
                </p>
              </>
            )}
          </div>
          <div
            className={`home-v2-col ${
              effectiveMobileTab === 'competitions' && hasCompetitions && hasShows
                ? '!hidden md:!flex'
                : ''
            }`}
          >
            {hasShows ? (
              <SeasonShowsCarousel
                slides={showSlides}
                carousel={carousel}
                syncDots={syncDots}
                driveAutoplay={!hasCompetitions}
              />
            ) : (
              <>
                <div className="home-v2-col-head">Выставки</div>
                <p className="donino-home-empty" role="status">
                  Нет данных
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="home-v2-empty" aria-live="polite">
          Пока нет данных за {CURRENT_SEASON}.{' '}
          <Link to="/competitions?tab=ranking">Открыть рейтинг</Link>
        </p>
      )}
    </section>
  )
}

export const SeasonTopSection = memo(SeasonTopSectionInner)
