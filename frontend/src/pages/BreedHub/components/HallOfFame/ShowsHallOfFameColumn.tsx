import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'
import DogSexIcon from '../../../../components/DogSexIcon'
import { parseDogName } from '../../../../lib/dogName'
import type { ShowAllTimeDog } from '../../../../hooks/useStaticData'
import { ShowsHallOfFameBadges } from './ShowsHallOfFameBadges'

interface ShowsHallOfFameColumnProps {
  breedNameRu: string
  breedSlug: string
  showsAllBreedDogs: ShowAllTimeDog[]
  showsMonoDogs: ShowAllTimeDog[]
}

export const ShowsHallOfFameColumn = memo(function ShowsHallOfFameColumn({
  breedNameRu,
  breedSlug,
  showsAllBreedDogs = [],
  showsMonoDogs = [],
}: ShowsHallOfFameColumnProps) {
  const [showsMode, setShowsMode] = useState<'all_breed' | 'mono'>('all_breed')

  const hasMono = showsMonoDogs.length > 0
  const hasAllBreed = showsAllBreedDogs.length > 0
  if (!hasAllBreed && !hasMono) return null

  const activeShowsList = showsMode === 'mono' && hasMono ? showsMonoDogs : showsAllBreedDogs
  const isMono = showsMode === 'mono'

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Plaque Header: matching BreedDisciplinePlaque style */}
      <div className="donino-column-plaque relative flex h-10 min-h-10 items-center justify-between border-b border-[rgba(195,168,128,0.80)] bg-cream-100/90 px-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-camel-800 inline-flex items-center gap-1.5 shrink-0 min-w-0">
          <Crown className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span>Зал славы: Выставки</span>
        </h2>

        {hasMono && (
          <div className="inline-flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowsMode('all_breed')}
              className={`inline-flex items-center justify-center h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                !isMono
                  ? 'cs-glass-pill-active'
                  : 'cs-glass-pill text-charcoal-700 hover:text-camel-900'
              }`}
            >
              Всепородные
            </button>
            <button
              type="button"
              onClick={() => setShowsMode('mono')}
              className={`inline-flex items-center justify-center h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                isMono
                  ? 'cs-glass-pill-active'
                  : 'cs-glass-pill text-charcoal-700 hover:text-camel-900'
              }`}
            >
              Моно НКП
            </button>
          </div>
        )}
      </div>

      <div className="flex-1">
        {activeShowsList.length === 0 ? (
          <p className="text-xs text-charcoal-500 italic py-4 text-center">Результатов пока нет.</p>
        ) : (
          <ol className="divide-y divide-old-money-100 text-xs sm:text-sm">
            {activeShowsList.slice(0, 5).map((dog, idx) => {
              const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
              const isMale = dog.sex === 'M' || dog.sex === 'К'
              const isFemale = dog.sex === 'F' || dog.sex === 'С'
              const sexVal = isMale ? 'm' : isFemale ? 'f' : ''
              const dogProfileId = dog.competition_dog_id != null ? dog.competition_dog_id : dog.dog_id

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
                          to={`/dog/${dogProfileId}/`}
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
                      {dog.total_shows} {isMono ? 'смотр.' : 'выст.'}
                    </div>
                    <ShowsHallOfFameBadges isMono={isMono} titles={dog.titles} />
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
