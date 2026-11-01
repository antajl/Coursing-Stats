import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Clock } from 'lucide-react'
import DogSexIcon from '../../../components/DogSexIcon'
import OwnerCrownName from '../../../components/OwnerCrownName'
import RankBadge from '../../../components/RankBadge'
import { formatBreedName } from '../../../lib/breedMapping'
import { parseDogName } from '../../../lib/dogName'
import type { ChampionshipStanding } from '../../../lib/staticData/donino'

interface ChampionshipDogCardProps {
  dog: ChampionshipStanding
  rank: number
  isExpanded: boolean
  sortMode: 'points' | 'time'
  dogPromotions?: string[]
  onToggle: () => void
}

/** Человекопонятные русские статусы для нефинишировавших участников */
export function formatChampionshipStatus(status: string | null | undefined): string {
  if (!status) return '—'
  const s = status.toLowerCase().trim()
  if (s === 'dns' || s === 'absent') return 'Неявка'
  if (s === 'withdrawn') return 'Снят'
  if (s === 'dnf') return 'Сошёл'
  if (s === 'dismissed') return 'Отстранён'
  if (s === 'disqualified' || s === 'dq') return 'Дисквалификация'
  return status
}

export default function ChampionshipDogCard({
  dog,
  rank,
  isExpanded,
  sortMode,
  dogPromotions,
  onToggle,
}: ChampionshipDogCardProps) {
  // League badge styling
  const leagueBadgeClass =
    dog.current_league === 'Абсолют'
      ? 'bg-amber-100/90 text-amber-900 border border-amber-300/80'
      : dog.current_league === 'Чемпионов'
      ? 'bg-camel-100 text-charcoal-900 border border-camel-300'
      : dog.current_league === 'Прогресс'
      ? 'bg-cream-200 text-charcoal-700 border border-old-money-300'
      : 'bg-sky-50 text-sky-800 border border-sky-200'

  const { primary, secondary } = parseDogName(dog.name_lat || dog.name, dog.name_ru || dog.name)

  return (
    <div className="rounded-xl border border-old-money-200 bg-cream-50/90 shadow-2xs overflow-hidden transition-all hover:border-camel-400 hover:shadow-xs">
      {/* Header Row */}
      <div
        onClick={onToggle}
        className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Rank Badge with Official Medals for 1, 2, 3 */}
          <div className="shrink-0 flex items-center justify-center w-8 sm:w-9">
            <RankBadge rank={rank} hideDelta />
          </div>

          {/* Dog info: Clean Name and Breed */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {dog.dog_id ? (
                <Link
                  to={`/dog/${dog.dog_id}`}
                  onClick={(e) => e.stopPropagation()}
                  title={secondary || undefined}
                  className="font-bold font-serif text-charcoal-900 hover:text-camel-800 transition-colors text-xs sm:text-sm truncate"
                >
                  {primary}
                </Link>
              ) : (
                <span
                  title={secondary || undefined}
                  className="font-bold font-serif text-charcoal-900 text-xs sm:text-sm truncate"
                >
                  {primary}
                </span>
              )}
              <OwnerCrownName dogName={primary} />
              {dog.sex && (
                <DogSexIcon
                  sex={dog.sex === 'Сука' ? 'f' : 'm'}
                  size={12}
                  variant="neutral"
                  className="shrink-0"
                />
              )}
            </div>

            <div className="text-[11px] text-charcoal-600 mt-0.5">
              <span className="font-medium">{formatBreedName(dog.breed)}</span>
            </div>
          </div>
        </div>

        {/* Right side: Fixed League Badge, Racing Time, Chevron */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span
            className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${leagueBadgeClass}`}
          >
            Лига «{dog.current_league}»
          </span>

          {/* Best Time & Points Display depending on sortMode */}
          <div className="text-right pl-1 sm:pl-2 shrink-0 min-w-[72px]">
            {sortMode === 'points' ? (
              <>
                <div className="flex items-baseline justify-end gap-1 leading-none">
                  <span className="font-serif text-base sm:text-lg font-bold tabular-nums text-camel-900 leading-none">
                    {dog.total_points != null && dog.total_points > 0 ? dog.total_points : '—'}
                  </span>
                  {dog.total_points != null && dog.total_points > 0 && (
                    <span className="text-xs font-semibold text-charcoal-700">б.</span>
                  )}
                </div>
                <div className="text-[10px] text-charcoal-500 mt-1 leading-tight font-mono">
                  {dog.best_time ? `${dog.best_time.toFixed(2)} сек` : 'без заездов'}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-end gap-1 leading-none">
                  <span className="font-serif text-base sm:text-lg font-bold tabular-nums text-camel-800 leading-none">
                    {dog.best_time ? dog.best_time.toFixed(2) : '—'}
                  </span>
                  <span className="text-xs font-semibold text-charcoal-600">сек</span>
                </div>
                <div className="text-[10px] text-charcoal-500 mt-1 leading-tight font-medium">
                  {dog.total_points != null && dog.total_points > 0 ? `${dog.total_points} б.` : '0 б.'}
                  {dog.stages_count > 1 ? ` · ${dog.stages_count} заб.` : ''}
                </div>
              </>
            )}
          </div>

          {/* Chevron */}
          <div className="text-charcoal-400 pl-0.5">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Drawer: Stage History */}
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-cream-100/80 border-t border-old-money-200 space-y-2.5 animate-fadeIn">
          <div className="text-xs font-semibold text-charcoal-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-camel-700" />
              <span>История выступлений на этапах:</span>
            </div>
            <span className="sm:hidden text-[10px] px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-semibold">
              Лига «{dog.current_league}»
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {dog.history.map((h, hIdx) => {
              const b = h.points_breakdown
              return (
                <div
                  key={hIdx}
                  className="p-2.5 rounded-xl bg-cream-50 border border-old-money-200 flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-charcoal-900">
                        {h.stage_num === 1
                          ? 'I этап'
                          : h.stage_num === 2
                          ? 'II этап'
                          : 'III этап'}{' '}
                        ({h.date})
                      </div>
                      <div className="text-[11px] text-charcoal-600">{h.breed_class}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`font-bold ${
                          h.placement > 0 ? 'text-charcoal-900' : 'text-stone-500 font-medium'
                        }`}
                      >
                        {h.placement > 0 ? `${h.placement} место` : formatChampionshipStatus(h.status)}
                        {h.points != null && h.points > 0 ? (
                          <span className="ml-1 text-camel-900 font-bold">· {h.points} б.</span>
                        ) : null}
                      </div>
                      <div className="font-mono text-camel-800 text-[11px]">
                        {h.total_score ? `${h.total_score.toFixed(2)} сек` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Bonus breakdown badges */}
                  {b &&
                    (b.place_points > 0 ||
                      b.best_final_points > 0 ||
                      b.best_class_points > 0 ||
                      b.best_breed_points > 0 ||
                      b.track_record_points > 0) && (
                      <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-old-money-100 text-[10px]">
                        {b.place_points > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-cream-100 text-charcoal-700 font-medium border border-old-money-200/60">
                            место: +{b.place_points}
                          </span>
                        )}
                        {b.best_final_points > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-medium border border-amber-200">
                            финал: +1
                          </span>
                        )}
                        {b.best_class_points > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-camel-50 text-camel-900 font-medium border border-camel-200">
                            класс: +1
                          </span>
                        )}
                        {b.best_breed_points > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-forest-50 text-forest-900 font-medium border border-forest-200">
                            порода: +1
                          </span>
                        )}
                        {b.track_record_points > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-900 font-medium border border-rose-200"
                            title="Рекорд клубного чемпионата (+1 б.)"
                          >
                            рекорд: +1
                          </span>
                        )}
                      </div>
                    )}
                </div>
              )
            })}
          </div>

          {/* Transitions between leagues */}
          {dogPromotions && dogPromotions.length > 0 && (
            <div className="space-y-1 pt-1">
              {dogPromotions.map((note, nIdx) => (
                <div
                  key={nIdx}
                  className="text-[11px] text-emerald-900 bg-emerald-50/80 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 font-medium"
                >
                  {note}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
