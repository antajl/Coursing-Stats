import { useMemo } from 'react'
import type { CumulativeEvaluationResult } from '../../lib/cumulativeTitles'
import type { ProfileHeaderRank } from './DogProfileHeader'
import type { ShowDogCardData } from '../Shows/ShowDogCard'
import { OneStepAwaySection } from './Achievements/OneStepAwaySection'
import { CompletedTitlesRegistry } from './Achievements/CompletedTitlesRegistry'
import { CertificatesSection } from './Achievements/CertificatesSection'
import { SiteRankingsSection } from './Achievements/SiteRankingsSection'

export interface DogAchievementsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dog?: any
  cumulativeTitles: CumulativeEvaluationResult
  ranks?: ProfileHeaderRank[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursingStats?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  racingStats?: any
  showDog?: ShowDogCardData | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events?: any[]
  eventResultsUrls?: Record<string | number, string>
  breed?: string
}

export function DogAchievementsTab({
  cumulativeTitles,
  ranks = [],
  coursingStats = {},
  racingStats = {},
  showDog,
  events = [],
  eventResultsUrls = {},
  breed,
}: DogAchievementsTabProps) {
  // 1. Оформленные титулы
  const supremeTitles = cumulativeTitles.officialSupremeTitles || []
  const coursingTitles = cumulativeTitles.officialCoursingTitles || []
  const racingTitles = cumulativeTitles.officialRacingTitles || []
  const showTitles = cumulativeTitles.officialShowTitles || []

  const totalTitlesCount =
    supremeTitles.length + coursingTitles.length + racingTitles.length + showTitles.length

  // 2. Титулы в процессе (отсортированы по проценту готовности, максимальный сверху)
  const inProgressTitles = useMemo(() => {
    return [...(cumulativeTitles.inProgress || [])].sort(
      (a, b) => b.progressPercent - a.progressPercent,
    )
  }, [cumulativeTitles.inProgress])

  // 3. Сертификаты
  const certs = cumulativeTitles.certificates || {
    caclEventsCoursing: [],
    caclEventsRacing: [],
    caclBrEventsCoursing: [],
    caclBrEventsRacing: [],
    cacilEvents: [],
    cacShowEvents: [],
    jcacShowEvents: [],
    vcacShowEvents: [],
    uniqueCacJudgesCount: 0,
    uniqueJcacJudgesCount: 0,
    uniqueVcacJudgesCount: 0,
    hasRunningClearanceCoursing: false,
    hasRunningClearanceRacing: false,
  }

  const totalCacl = certs.caclEventsCoursing.length + certs.caclEventsRacing.length
  const totalCaclBr = (certs.caclBrEventsCoursing?.length ?? 0) + (certs.caclBrEventsRacing?.length ?? 0)
  const totalCac = certs.cacShowEvents.length > 0 ? certs.cacShowEvents.length : (showDog?.titles?.CAC ?? 0)
  const totalJcac = (certs.jcacShowEvents?.length ?? 0) > 0 ? (certs.jcacShowEvents?.length ?? 0) : (showDog?.titles?.JCAC ?? 0)
  const totalVcac = (certs.vcacShowEvents?.length ?? 0) > 0 ? (certs.vcacShowEvents?.length ?? 0) : (showDog?.titles?.VCAC ?? 0)
  const totalCertificates = totalCacl + totalCaclBr + certs.cacilEvents.length + totalCac + totalJcac + totalVcac

  return (
    <div className="space-y-6">
      {/* РАЗДЕЛ 1: В ШАГЕ ОТ ТИТУЛА */}
      <OneStepAwaySection inProgressTitles={inProgressTitles} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ЛЕВАЯ КОЛОНКА: ОФИЦИАЛЬНЫЕ ТИТУЛЫ */}
        <CompletedTitlesRegistry
          cumulativeTitles={cumulativeTitles}
          supremeTitles={supremeTitles}
          coursingTitles={coursingTitles}
          racingTitles={racingTitles}
          showTitles={showTitles}
          totalTitlesCount={totalTitlesCount}
        />

        {/* ПРАВАЯ КОЛОНКА: СЕРТИФИКАТЫ + ДОСТИЖЕНИЯ В РЕЙТИНГЕ */}
        <div className="space-y-6">
          <CertificatesSection
            certs={certs}
            totalCertificates={totalCertificates}
            totalCac={totalCac}
            totalJcac={totalJcac}
            totalVcac={totalVcac}
            events={events}
            eventResultsUrls={eventResultsUrls}
          />

          <SiteRankingsSection
            breed={breed}
            ranks={ranks}
            coursingStats={coursingStats}
            racingStats={racingStats}
            showDog={showDog}
          />
        </div>
      </div>
    </div>
  )
}
