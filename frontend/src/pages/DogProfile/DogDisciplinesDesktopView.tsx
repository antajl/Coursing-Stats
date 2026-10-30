import React from 'react'
import { CoursingColumn } from './CoursingColumn'
import { RacingColumn } from './RacingColumn'
import { ShowsColumn } from './ShowsColumn'
import { EmptyDisciplineColumn } from './EmptyDisciplineColumn'
import { DoninoSpeedColumn } from './DoninoSpeedColumn'
import { DoninoCoursingColumn } from './DoninoCoursingColumn'
import { DogJudgesSection, type DogJudgesStats } from './DogJudgesSection'
import { CollapsibleSection } from '../../components/ui/CollapsibleSection'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import type { ProfileHeaderRank } from './DogProfileHeader'
import type { DogSpeedRecordStats, DogCoursingDoninoStats } from './dogProfileStats'

interface DogDisciplinesDesktopViewProps {
  showCoursingColumn: boolean
  hasCoursingData: boolean
  hasCourseMedals: boolean
  coursing: any
  coursingEvents: any[]
  visibleCoursingEvents: any[]
  eventResultsUrls: Record<string, string>
  bestScoreEventId: string | null
  bestJudgeScoreEventId: string | null
  avgJudgeScoreEventId: string | null
  showAllCoursingEvents: boolean
  onToggleShowAllCoursingEvents: () => void
  headerRanks: ProfileHeaderRank[]
  headerBreed: string
  showRacingColumn: boolean
  hasRacingData: boolean
  hasRacingMedals: boolean
  racing: any
  racingEvents: any[]
  visibleRacingEvents: any[]
  bestSpeedEventId: string | null
  avgSpeedEventId: string | null
  showAllRacingEvents: boolean
  onToggleShowAllRacingEvents: () => void
  showDog: ShowDogCardData | null
  judgeStats: DogJudgesStats | null
  events: any[]
  hasSpeedRecords: boolean
  hasCoursingRecords: boolean
  speedStats: DogSpeedRecordStats | null
  coursingStats: DogCoursingDoninoStats | null
  visibleSpeedHistory: any[]
  showAllSpeedHistory: boolean
  onToggleShowAllSpeedHistory: () => void
  visibleCoursingDoninoHistory: any[]
  showAllCoursingDoninoHistory: boolean
  onToggleShowAllCoursingDoninoHistory: () => void
}

export const DogDisciplinesDesktopView: React.FC<DogDisciplinesDesktopViewProps> = ({
  showCoursingColumn,
  hasCoursingData,
  hasCourseMedals,
  coursing,
  coursingEvents,
  visibleCoursingEvents,
  eventResultsUrls,
  bestScoreEventId,
  bestJudgeScoreEventId,
  avgJudgeScoreEventId,
  showAllCoursingEvents,
  onToggleShowAllCoursingEvents,
  headerRanks,
  headerBreed,
  showRacingColumn,
  hasRacingData,
  hasRacingMedals,
  racing,
  racingEvents,
  visibleRacingEvents,
  bestSpeedEventId,
  avgSpeedEventId,
  showAllRacingEvents,
  onToggleShowAllRacingEvents,
  showDog,
  judgeStats,
  events,
  hasSpeedRecords,
  hasCoursingRecords,
  speedStats,
  coursingStats,
  visibleSpeedHistory,
  showAllSpeedHistory,
  onToggleShowAllSpeedHistory,
  visibleCoursingDoninoHistory,
  showAllCoursingDoninoHistory,
  onToggleShowAllCoursingDoninoHistory,
}) => {
  return (
    <>
      {/* Десктопный вид: 3 колонки рядом */}
      <div className="mb-6 hidden items-stretch gap-4 lg:grid lg:grid-cols-3 lg:gap-5 xl:gap-6">
        {showCoursingColumn ? (
          <CoursingColumn
            hasCoursingData={hasCoursingData}
            hasCourseMedals={hasCourseMedals}
            coursing={coursing}
            coursingEvents={coursingEvents}
            visibleCoursingEvents={visibleCoursingEvents}
            eventResultsUrls={eventResultsUrls}
            bestScoreEventId={bestScoreEventId}
            bestJudgeScoreEventId={bestJudgeScoreEventId}
            avgJudgeScoreEventId={avgJudgeScoreEventId}
            showAllCoursingEvents={showAllCoursingEvents}
            onToggleShowAll={onToggleShowAllCoursingEvents}
            rank={headerRanks.find((r) => r.key === 'coursing')}
            breed={headerBreed}
          />
        ) : (
          <EmptyDisciplineColumn title="Курсинг / БЗМП" theme="forest" />
        )}

        {showRacingColumn ? (
          <RacingColumn
            hasRacingData={hasRacingData}
            hasRacingMedals={hasRacingMedals}
            racing={racing}
            racingEvents={racingEvents}
            visibleRacingEvents={visibleRacingEvents}
            eventResultsUrls={eventResultsUrls}
            bestSpeedEventId={bestSpeedEventId}
            avgSpeedEventId={avgSpeedEventId}
            showAllRacingEvents={showAllRacingEvents}
            onToggleShowAll={onToggleShowAllRacingEvents}
            rank={headerRanks.find((r) => r.key === 'racing')}
            breed={headerBreed}
          />
        ) : (
          <EmptyDisciplineColumn title="Бега борзых" theme="warm-blue" />
        )}

        {showDog ? (
          <ShowsColumn
            dog={showDog}
            rank={headerRanks.find((r) => r.key === 'shows')}
            breed={headerBreed}
          />
        ) : (
          <EmptyDisciplineColumn title="Выставки" theme="camel" />
        )}
      </div>

      {/* Десктопная секция судей */}
      {judgeStats && (
        <div className="hidden md:block">
          <DogJudgesSection judgeStats={judgeStats} competitions={events} />
        </div>
      )}

      {/* Десктопное Донино: CollapsibleSection внизу */}
      {(hasSpeedRecords || hasCoursingRecords) && !showCoursingColumn && !showRacingColumn && (
        <div className="hidden md:block">
          <CollapsibleSection
            title="Рекорды Донино"
            defaultOpen={false}
            className="mb-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {hasSpeedRecords && speedStats ? (
                <DoninoSpeedColumn
                  speedStats={speedStats}
                  visibleSpeedHistory={visibleSpeedHistory}
                  showAllSpeedHistory={showAllSpeedHistory}
                  onToggleShowAll={onToggleShowAllSpeedHistory}
                />
              ) : (
                <EmptyDisciplineColumn title="Замер скорости" theme="warm-blue" />
              )}

              {hasCoursingRecords && coursingStats ? (
                <DoninoCoursingColumn
                  coursingStats={coursingStats}
                  visibleCoursingDoninoHistory={visibleCoursingDoninoHistory}
                  showAllCoursingDoninoHistory={showAllCoursingDoninoHistory}
                  onToggleShowAll={onToggleShowAllCoursingDoninoHistory}
                />
              ) : (
                <EmptyDisciplineColumn title="Бега борзых (350 м)" theme="forest" />
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}
    </>
  )
}
