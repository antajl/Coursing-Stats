import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../../lib/icons'
import SeasonCompetitionsCarousel from './SeasonCompetitionsCarousel'
import SeasonShowsCarousel from './SeasonShowsCarousel'
import { SectionHead } from './SectionHead'
import { SeasonTopSectionSkeleton } from './SeasonTopSectionSkeleton'
import { useHomeBreedCarousel } from '../hooks/useHomeBreedCarousel'
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

  return (
    <section className="home-v2-block" data-home-reveal>
      <SectionHead
        icon={Icons.medal}
        title={`Топ сезона ${CURRENT_SEASON}`}
        href="/competitions?tab=ranking"
        linkLabel="Весь рейтинг"
      />
      {competitionSlides.length > 0 || showSlides.length > 0 ? (
        <div className="home-v2-columns" {...carousel.pauseHandlers}>
          <div className="home-v2-col">
            {competitionSlides.length > 0 ? (
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
          <div className="home-v2-col">
            {showSlides.length > 0 ? (
              <SeasonShowsCarousel
                slides={showSlides}
                carousel={carousel}
                syncDots={syncDots}
                driveAutoplay={competitionSlides.length === 0}
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
