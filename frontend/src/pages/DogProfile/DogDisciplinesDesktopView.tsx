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
}) => {
  return (
    <div className="mb-6 hidden items-stretch gap-4 lg:grid lg:grid-cols-3 lg:gap-5 xl:gap-6">
      <div id="coursing" className="scroll-mt-20 flex flex-col h-full">
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
      </div>

      <div id="racing" className="scroll-mt-20 flex flex-col h-full">
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
      </div>

      <div id="shows" className="scroll-mt-20 flex flex-col h-full">
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
    </div>
  )
}
