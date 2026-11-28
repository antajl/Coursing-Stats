import React from 'react'
import { CoursingColumn } from './CoursingColumn'
import { RacingColumn } from './RacingColumn'
import { ShowsColumn } from './ShowsColumn'
import { EmptyDisciplineColumn } from './EmptyDisciplineColumn'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import type { ProfileHeaderRank } from './DogProfileHeader'

interface DogDisciplinesDesktopViewProps {
  showCoursingColumn: boolean
  hasCoursingData: boolean
  hasCourseMedals: boolean
  coursing: any
  coursingEvents: any[]
  visibleCoursingEvents: any[]
  eventResultsUrls: Map<number, string>
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
  showAllShows?: boolean
  onToggleShowAllShows?: () => void
  showDog: ShowDogCardData | null
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
  showAllShows,
  onToggleShowAllShows,
  showDog,
}) => {
  const visibleCount =
    Number(showCoursingColumn) + Number(showRacingColumn) + Number(Boolean(showDog))

  if (visibleCount === 0) {
    return (
      <div className="mb-6 hidden lg:block">
        <EmptyDisciplineColumn title="Курсинг" theme="forest" />
      </div>
    )
  }

  const gridColsClass =
    visibleCount === 1
      ? 'lg:grid-cols-1'
      : visibleCount === 2
        ? 'lg:grid-cols-2'
        : 'lg:grid-cols-3'

  return (
    <div className={`mb-6 hidden items-stretch gap-4 lg:grid ${gridColsClass} lg:gap-5 xl:gap-6`}>
      {showCoursingColumn && (
        <div id="coursing" className="scroll-mt-20 flex flex-col h-full">
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
        </div>
      )}

      {showRacingColumn && (
        <div id="racing" className="scroll-mt-20 flex flex-col h-full">
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
        </div>
      )}

      {showDog && (
        <div id="shows" className="scroll-mt-20 flex flex-col h-full">
          <ShowsColumn
            dog={showDog}
            rank={headerRanks.find((r) => r.key === 'shows')}
            breed={headerBreed}
            showAll={showAllShows}
            onToggleShowAll={onToggleShowAllShows}
          />
        </div>
      )}
    </div>
  )
}
