import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Gauge } from 'lucide-react'
import DogSexIcon from '../../../../components/DogSexIcon'
import MedalBadge from '../../../../components/MedalBadge'
import { parseDogName } from '../../../../lib/dogName'

export interface SportAllTimeDog {
  dog_id: number
  name_lat?: string | null
  name_ru?: string | null
  breed: string
  gold: number
  silver: number
  bronze: number
  total_starts: number
  year_from?: number
  year_to?: number
  sex?: string | null
}

export interface RacingAllTimeDog {
  dog_id: number
  name_lat?: string | null
  name_ru?: string | null
  breed: string
  best_speed: number
  avg_speed?: number
  total_starts: number
  year_from?: number
  year_to?: number
  sex?: string | null
}

interface SportHallOfFameColumnProps {
  breedNameRu: string
  canonicalKey: string
  sportCoursingDogs: SportAllTimeDog[]
  sportRacingDogs: RacingAllTimeDog[]
}

export const SportHallOfFameColumn = memo(function SportHallOfFameColumn({
  breedNameRu: _breedNameRu,
  canonicalKey: _canonicalKey,
  sportCoursingDogs = [],
  sportRacingDogs = [],
}: SportHallOfFameColumnProps) {
  const [sportMode, setSportMode] = useState<'coursing' | 'racing'>('coursing')

  const hasRacing = sportRacingDogs.length > 0
  const hasCoursing = sportCoursingDogs.length > 0
  if (!hasCoursing && !hasRacing) return null

  const activeSportList = sportMode === 'racing' && hasRacing ? sportRacingDogs : sportCoursingDogs
  const isRacingMode = sportMode === 'racing'

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Plaque Header: matching BreedDisciplinePlaque style */}
      <div className="donino-column-plaque relative flex h-10 min-h-10 items-center justify-between border-b border-[rgba(195,168,128,0.80)] bg-cream-100/90 px-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-camel-800 inline-flex items-center gap-1.5 shrink-0 min-w-0">
          {isRacingMode ? (
            <Gauge className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          ) : (
            <Trophy className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          )}
          <span>Зал славы: Спорт</span>
        </h2>

        {hasRacing && (
          <div className="inline-flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSportMode('coursing')}
              className={`inline-flex items-center justify-center h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                !isRacingMode
                  ? 'cs-glass-pill-active'
                  : 'cs-glass-pill text-charcoal-700 hover:text-camel-900'
              }`}
            >
              Курсинг
            </button>
            <button
              type="button"
              onClick={() => setSportMode('racing')}
              className={`inline-flex items-center justify-center h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                isRacingMode
                  ? 'cs-glass-pill-active'
                  : 'cs-glass-pill text-charcoal-700 hover:text-camel-900'
              }`}
            >
              Рейсинг
            </button>
          </div>
        )}
      </div>

      <div className="flex-1">
        {activeSportList.length === 0 ? (
          <p className="text-xs text-charcoal-500 italic py-4 text-center">Результатов пока нет.</p>
        ) : (
          <ol className="divide-y divide-old-money-100 text-xs sm:text-sm">
            {activeSportList.slice(0, 5).map((dog, idx) => {
              const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
              const isMale = dog.sex === 'M' || dog.sex === 'К'
              const isFemale = dog.sex === 'F' || dog.sex === 'С'
              const sexVal = isMale ? 'm' : isFemale ? 'f' : ''
              const yearsLabel =
                dog.year_from && dog.year_to
                  ? dog.year_from === dog.year_to
                    ? `${dog.year_from}`
                    : `${dog.year_from}–${dog.year_to}`
                  : null

              const racingDog = dog as RacingAllTimeDog
              const coursingDog = dog as SportAllTimeDog

              return (
                <li
                  key={dog.dog_id}
                  className="h-[52px] px-3.5 sm:px-4 flex items-center justify-between gap-2 hover:bg-cream-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-5 text-center font-bold font-sans text-xs text-charcoal-500 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <Link
                          to={`/dog/${dog.dog_id}/`}
                          className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block"
                          title={primary}
                        >
                          {primary}
                        </Link>
                        {sexVal && (
                          <span title={isMale ? 'Кобель' : 'Сука'} className="inline-flex shrink-0">
                            <DogSexIcon sex={sexVal} size={12} variant="colored" />
                          </span>
                        )}
                      </div>
                      {secondary && (
                        <span
                          className="text-[11px] text-charcoal-500 block leading-tight truncate"
                          title={secondary}
                        >
                          {secondary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    <div className="text-[11px] font-sans font-medium text-charcoal-600 leading-tight">
                      <span>{dog.total_starts} заб.</span>
                      {yearsLabel && (
                        <span className="text-[10px] text-charcoal-400 font-normal ml-1">
                          ({yearsLabel})
                        </span>
                      )}
                    </div>

                    {isRacingMode && racingDog.best_speed ? (
                      <span className="font-bold font-sans tabular-nums text-camel-950 text-xs bg-camel-100/90 border border-camel-300 px-2 py-0.5 rounded-full shadow-2xs">
                        {racingDog.best_speed.toFixed(1)} км/ч
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <MedalBadge variant="gold" count={coursingDog.gold || 0} size="sm" />
                        <MedalBadge variant="silver" count={coursingDog.silver || 0} size="sm" />
                        <MedalBadge variant="bronze" count={coursingDog.bronze || 0} size="sm" />
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
})
