import { memo } from 'react'
import {
  SportHallOfFameColumn,
  type SportAllTimeDog,
  type RacingAllTimeDog,
} from './HallOfFame/SportHallOfFameColumn'
import { ShowsHallOfFameColumn } from './HallOfFame/ShowsHallOfFameColumn'
import type { ShowAllTimeDog } from '../../../hooks/useStaticData'

export type { SportAllTimeDog, RacingAllTimeDog }

interface BreedHallOfFameProps {
  breedNameRu: string
  breedSlug: string
  canonicalKey: string
  sportCoursingDogs: SportAllTimeDog[]
  sportRacingDogs: RacingAllTimeDog[]
  showsAllBreedDogs: ShowAllTimeDog[]
  showsMonoDogs: ShowAllTimeDog[]
  isLoading?: boolean
}

export const BreedHallOfFame = memo(function BreedHallOfFame({
  breedNameRu,
  breedSlug,
  canonicalKey,
  sportCoursingDogs = [],
  sportRacingDogs = [],
  showsAllBreedDogs = [],
  showsMonoDogs = [],
  isLoading = false,
}: BreedHallOfFameProps) {
  const hasSport = sportCoursingDogs.length > 0 || sportRacingDogs.length > 0
  const hasShows = showsAllBreedDogs.length > 0 || showsMonoDogs.length > 0

  if (!hasSport && !hasShows && !isLoading) {
    return null
  }

  const gridColsClass = hasSport && hasShows ? 'lg:grid-cols-2' : 'lg:grid-cols-1'

  return (
    <div
      id="hall-of-fame"
      className="rounded-2xl border border-[rgba(195,168,128,0.70)] bg-white shadow-2xs overflow-hidden scroll-mt-24 md:scroll-mt-28"
    >
      <div className={`grid grid-cols-1 ${gridColsClass} divide-y lg:divide-y-0 lg:divide-x divide-[rgba(195,168,128,0.80)]`}>
        {hasSport && (
          <SportHallOfFameColumn
            breedNameRu={breedNameRu}
            canonicalKey={canonicalKey}
            sportCoursingDogs={sportCoursingDogs}
            sportRacingDogs={sportRacingDogs}
          />
        )}

        {hasShows && (
          <ShowsHallOfFameColumn
            breedNameRu={breedNameRu}
            breedSlug={breedSlug}
            showsAllBreedDogs={showsAllBreedDogs}
            showsMonoDogs={showsMonoDogs}
          />
        )}
      </div>
    </div>
  )
})
