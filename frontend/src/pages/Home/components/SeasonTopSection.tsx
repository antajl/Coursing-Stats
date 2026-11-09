import { memo, useMemo, useState } from 'react'
import { Trophy, Sparkles } from 'lucide-react'
import { SeasonTopSectionSkeleton } from './SeasonTopSectionSkeleton'
import { useHomeBreedCarousel } from '../hooks/useHomeBreedCarousel'
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
      { id: 'sport' as const, label: 'Спорт' },
      { id: 'shows' as const, label: 'Выставки' },
      { id: 'donino' as const, label: 'Донино' },
    ],
    [],
  )

  if (loading) return <SeasonTopSectionSkeleton compact={compact} />

  return (
    <section
      id="season-top"
      className={`home-v2-block scroll-mt-20 w-full min-w-0 max-w-full overflow-x-clip md:overflow-visible ${
        compact ? 'home-v2-season-top--compact md:overflow-visible' : 'home-v2-season-top--mobile overflow-hidden'
      }`}
      {...(!compact ? { 'data-home-reveal': true } : {})}
    >
      <h2 className="sr-only">Лидеры сезона и рейтинги</h2>
      {/* Верхняя полоса: Единая парящая плашка Physical Glass (h=34px), зеркально отражающая правый кокпит «База данных и реестр» */}
      <div className="home-v2-stats-cockpit-tab relative flex items-center justify-between text-xs select-none shrink-0">
        {/* Заголовок виджета слева (зеркально как справа «База данных и реестр») */}
        <span className="text-[11.5px] font-bold text-camel-900 uppercase tracking-wider flex items-center gap-1.5 shrink-0 pl-0.5 sm:pl-1">
          <Trophy className="w-3.5 h-3.5 text-camel-700" aria-hidden />
          <span className="hidden xs:inline">Лидеры сезона</span>
          <span className="xs:hidden">Лидеры</span>
        </span>

        {/* Переключатель вкладок строго по центру полосы — элегантный встроенный микро-сегмент */}
        <div
          role="tablist"
          aria-label="Разделы рейтингов и достижений"
          className="flex items-center gap-1 sm:gap-2 md:absolute md:left-1/2 md:-translate-x-1/2"
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
                className={`h-[25px] px-3 rounded-full text-xs transition-all flex items-center justify-center cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? 'cs-glass-pill-active !text-camel-950 font-semibold shadow-2xs'
                    : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-white/60 font-medium'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Мета-информация справа (зеркально как «Россия · 240+ пород» справа) */}
        <span className="text-[11px] font-medium text-charcoal-600 hidden md:flex items-center gap-1 shrink-0 pr-1">
          <Sparkles className="w-3 h-3 text-camel-700" aria-hidden />
          <span>2026 · Топ-3 по породам</span>
        </span>
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
