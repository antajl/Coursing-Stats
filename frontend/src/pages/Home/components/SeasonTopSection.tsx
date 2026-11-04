import { memo, useMemo, useState } from 'react'
import { SeasonTopSectionSkeleton } from './SeasonTopSectionSkeleton'
import { useHomeBreedCarousel } from '../hooks/useHomeBreedCarousel'
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs'
import {
  HomeSubSectionTab,
  HomeSubSectionCapsule,
  SportTopTab,
  ShowsTopTab,
  DoninoTopTab,
} from './SeasonTopTabs'
import type { BreedSlide } from '../utils/breedSeasonSlides'
import type { CombinedRankingDog } from '../../TopDogs/mergeCombinedRanking'
import type { ShowHomeTopDog } from '../../../lib/staticData'
import type { SpeedRecord, CoursingRecord } from '../types'

export type HubCategoryTab = 'sport' | 'shows' | 'donino'
export type SportSubTab = 'coursing' | 'racing'
export type ShowsSubTab = 'by-breed' | 'all-breeds'
export type DoninoSubTab = 'speed' | 'coursing'

// Re-export tab components & capsules for external backward compatibility
export { HomeSubSectionTab, HomeSubSectionCapsule }
export type { HomeSubSectionTabProps } from './SeasonTopTabs'

interface SeasonTopSectionProps {
  competitionSlides: BreedSlide<CombinedRankingDog>[]
  racingSlides: BreedSlide<any>[]
  showSlides: BreedSlide<ShowHomeTopDog>[]
  topShowDogs: ShowHomeTopDog[]
  doninoSpeedRecords: SpeedRecord[]
  doninoCoursingRecords: CoursingRecord[]
  doninoSpeedSlides?: BreedSlide<SpeedRecord>[]
  doninoCoursingSlides?: BreedSlide<CoursingRecord>[]
  loading: boolean
  compact?: boolean
  singleColumn?: boolean
}

function SeasonTopSectionInner({
  competitionSlides,
  racingSlides,
  showSlides,
  topShowDogs,
  doninoSpeedRecords,
  doninoCoursingRecords,
  doninoSpeedSlides,
  doninoCoursingSlides,
  loading,
  compact = false,
}: SeasonTopSectionProps) {
  const [activeTab, setActiveTab] = useState<HubCategoryTab>('sport')

  const speedSlideCount = doninoSpeedSlides?.length || 0
  const coursingSlideCount = doninoCoursingSlides?.length || 0
  const syncCount = Math.max(
    competitionSlides.length,
    racingSlides.length,
    showSlides.length,
    speedSlideCount,
    coursingSlideCount,
    0,
  )
  const carousel = useHomeBreedCarousel(syncCount)

  const syncDots = useMemo(
    () =>
      Array.from({ length: syncCount }, (_, i) => {
        const comp = competitionSlides[i]
        const rac = racingSlides[i]
        const show = showSlides[i]
        const donSp = doninoSpeedSlides?.[i]
        const donCo = doninoCoursingSlides?.[i]
        const label =
          [comp?.breedLabel, rac?.breedLabel, show?.breedLabel, donSp?.breedLabel, donCo?.breedLabel].filter(Boolean)[0] ||
          `Слайд ${i + 1}`
        return {
          key: `sync-${i}-${comp?.breedKey ?? donSp?.breedKey ?? ''}`,
          label,
        }
      }),
    [syncCount, competitionSlides, racingSlides, showSlides, doninoSpeedSlides, doninoCoursingSlides],
  )

  const mainTabs = useMemo(
    () => [
      { id: 'sport' as const, label: 'Соревнования' },
      { id: 'shows' as const, label: 'Выставки' },
      {
        id: 'donino' as const,
        label: (
          <>
            <span className="md:hidden">Донино</span>
            <span className="hidden md:inline">Рекорды Донино</span>
          </>
        ),
      },
    ],
    [],
  )

  if (loading) return <SeasonTopSectionSkeleton compact={compact} />

  return (
    <section
      id="season-top"
      className={`home-v2-block scroll-mt-20 w-full min-w-0 max-w-full overflow-hidden ${
        compact ? 'home-v2-season-top--compact' : ''
      }`}
      {...(!compact ? { 'data-home-reveal': true } : {})}
    >
      {/* Парящие плашки Physical Glass — строго по высоте h-[34px] с симметричным кокпитом */}
      <div
        role="tablist"
        aria-label="Разделы рейтингов и достижений"
        className="mb-2.5 flex items-center gap-2 h-[34px] !bg-transparent !border-0 !shadow-none !p-0 select-none"
        style={{ height: '34px', boxSizing: 'border-box' }}
      >
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`h-[34px] flex-1 px-3.5 rounded-full text-xs transition-all flex items-center justify-center cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'cs-glass-pill-active !font-bold !text-camel-950'
                  : 'cs-glass-pill !font-medium !text-charcoal-700'
              }`}
              style={{ height: '34px', boxSizing: 'border-box' }}
            >
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'sport' && (
        <SportTopTab
          competitionSlides={competitionSlides}
          racingSlides={racingSlides}
          carousel={carousel}
          syncDots={syncDots}
        />
      )}

      {activeTab === 'shows' && (
        <ShowsTopTab
          showSlides={showSlides}
          topShowDogs={topShowDogs}
          carousel={carousel}
          syncDots={syncDots}
        />
      )}

      {activeTab === 'donino' && (
        <DoninoTopTab
          doninoSpeedRecords={doninoSpeedRecords}
          doninoCoursingRecords={doninoCoursingRecords}
          doninoSpeedSlides={doninoSpeedSlides}
          doninoCoursingSlides={doninoCoursingSlides}
          carousel={carousel}
          syncDots={syncDots}
        />
      )}
    </section>
  )
}

export const SeasonTopSection = memo(SeasonTopSectionInner)
