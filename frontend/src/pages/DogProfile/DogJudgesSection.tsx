import { useState, useMemo } from 'react'
import type { DogProfileEventItem, DogJudgesStats } from './dogJudgesStats'
import { computeDogJudgesAnalysis } from './dogJudgesStats'
import { DogJudgesHeader } from './JudgesAnalytics/DogJudgesHeader'
import { DogJudgesCarousel } from './JudgesAnalytics/DogJudgesCarousel'

export * from './dogJudgesStats'
export { DogJudgeRow } from './DogJudgeRow'

export interface DogJudgesSectionProps {
  judgeStats: DogJudgesStats
  competitions?: DogProfileEventItem[]
}

export function DogJudgesSection({ judgeStats, competitions }: DogJudgesSectionProps) {
  const [expandedJudgeKey, setExpandedJudgeKey] = useState<string | null>(null)

  const {
    eventPlacementMap,
    coursingJudges,
    higherThanCareer,
    lowerThanCareer,
  } = useMemo(() => {
    return computeDogJudgesAnalysis(judgeStats, competitions)
  }, [judgeStats, competitions])

  if (coursingJudges.length === 0) {
    return null
  }

  const toggleJudge = (judgeKey: string) => {
    setExpandedJudgeKey((prev) => (prev === judgeKey ? null : judgeKey))
  }

  return (
    <div className="space-y-3">
      <DogJudgesHeader
        judgeStats={judgeStats}
        coursingJudgesCount={coursingJudges.length}
      />

      <DogJudgesCarousel
        higherThanCareer={higherThanCareer}
        lowerThanCareer={lowerThanCareer}
        expandedJudgeKey={expandedJudgeKey}
        onToggleJudge={toggleJudge}
        eventPlacementMap={eventPlacementMap}
      />
    </div>
  )
}
