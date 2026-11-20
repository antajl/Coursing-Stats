import { useState, useMemo } from 'react'
import type { DogProfileEventItem } from './DogJudgesSection'
import {
  type OrgDisciplineFilter,
  computeDogOrganizationStats,
} from './dogOrganizationsStats'
import { DogOrganizationsHeader } from './Organizations/DogOrganizationsHeader'
import { DogOrganizationsCarousel } from './Organizations/DogOrganizationsCarousel'

export * from './dogOrganizationsStats'
export { DogOrganizationRow } from './Organizations/DogOrganizationRow'

export interface DogOrganizationsSectionProps {
  competitions?: DogProfileEventItem[]
  initialDiscipline?: OrgDisciplineFilter
}

export function DogOrganizationsSection({
  competitions = [],
  initialDiscipline = 'all',
}: DogOrganizationsSectionProps) {
  const [selectedDiscipline, setSelectedDiscipline] = useState<OrgDisciplineFilter>(initialDiscipline)
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set())

  const toggleOrg = (orgKey: string) => {
    setExpandedOrgs((prev) => {
      const next = new Set(prev)
      if (next.has(orgKey)) {
        next.delete(orgKey)
      } else {
        next.add(orgKey)
      }
      return next
    })
  }

  // Считаем доступность и число стартов по дисциплинам у собаки
  const { hasCoursing, hasRacing, coursingStarts, racingStarts } = useMemo(() => {
    let coursing = false
    let racing = false
    let cStart = 0
    let rStart = 0
    for (const c of competitions) {
      if (c.event_type === 'racing') {
        racing = true
        rStart++
      } else {
        coursing = true
        cStart++
      }
    }
    return {
      hasCoursing: coursing,
      hasRacing: racing,
      coursingStarts: cStart,
      racingStarts: rStart,
    }
  }, [competitions])

  const showDisciplineFilter = hasCoursing && hasRacing

  // Вычисляем аналитику побед по организациям
  const orgStats = useMemo(() => {
    return computeDogOrganizationStats(competitions, selectedDiscipline)
  }, [competitions, selectedDiscipline])

  if (!orgStats || orgStats.total_starts === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <DogOrganizationsHeader
        orgStats={orgStats}
        showDisciplineFilter={showDisciplineFilter}
        selectedDiscipline={selectedDiscipline}
        onSelectDiscipline={setSelectedDiscipline}
        coursingStarts={coursingStarts}
        racingStarts={racingStarts}
      />

      <DogOrganizationsCarousel
        orgStats={orgStats}
        expandedOrgs={expandedOrgs}
        onToggleOrg={toggleOrg}
      />
    </div>
  )
}
