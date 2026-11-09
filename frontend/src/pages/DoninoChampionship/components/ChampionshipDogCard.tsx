import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
export function formatChampionshipStatus(
  status: string | null | undefined,
  statusReason?: string | null | undefined
): string {
  if (statusReason) {
    const sr = statusReason.trim()
    if (sr.toLowerCase().includes('снят')) return 'Снят'
    if (sr.toLowerCase().includes('неявк')) return 'Неявка'
    if (sr.toLowerCase().includes('сош')) return 'Сошёл'
    if (sr.toLowerCase().includes('отстран')) return 'Отстранён'
    if (sr.toLowerCase().includes('дискв')) return 'Дискв.'
    return sr
  }
  if (!status) return '—'
  const s = status.toLowerCase().trim()
  if (s === 'dns' || s === 'absent') return 'Неявка'
  if (s === 'withdrawn') return 'Снят'
  if (s === 'dnf') return 'Сошёл'
  if (s === 'dismissed') return 'Отстранён'
  if (s === 'disqualified' || s === 'dq') return 'Дискв.'
  if (s === 'finished') return '—'
  return status
}

function cleanClassName(breedClass: string): string {
  if (!breedClass) return ''
  return breedClass
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*-\s*(кобель|сука)\s*$/i, '')
    .trim()
}

function getStageLeagueBadgeClass(league: string): string {
  if (!league) return 'bg-cream-100 text-charcoal-700 border-old-money-200'
  if (league.includes('Абсолют')) return 'bg-amber-100/90 text-amber-900 border-amber-300/80'
  if (league.includes('Чемпион')) return 'bg-camel-100 text-charcoal-900 border-camel-300'
  if (league.includes('Прогресс')) return 'bg-cream-200 text-charcoal-700 border-old-money-300'
  return 'bg-sky-50 text-sky-800 border-sky-200'
}

function ChampionshipDogCard({
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

  const rowWashClass =
    rank === 1
      ? 'bg-amber-50/35 hover:bg-amber-100/40'
      : rank === 2
      ? 'bg-slate-50/50 hover:bg-slate-100/50'
      : rank === 3
      ? 'bg-orange-50/35 hover:bg-orange-100/40'
      : 'hover:bg-cream-100/60'

  return (
    <div className={`transition-colors duration-150 ${rowWashClass}`}>
      {/* Header Row */}
      <div
        onClick={onToggle}
        className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-2.5 cursor-pointer select-none"
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

            <div className="text-[11px] text-charcoal-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="font-medium">{formatBreedName(dog.breed)}</span>
              <span className="text-charcoal-300" aria-hidden="true">·</span>
              {sortMode === 'time' ? (
                <span>
                  <strong className="text-charcoal-800 font-semibold">{dog.total_points ?? 0}&nbsp;б.</strong>
                  {dog.stages_count > 1 ? ` · ${dog.stages_count} заб.` : ''}
                </span>
              ) : (
                <span>
                  <strong className="text-charcoal-800 font-semibold">
                    {dog.best_time ? `${dog.best_time.toFixed(2)} сек` : 'без заездов'}
                  </strong>
                  {dog.stages_count > 1 ? ` · ${dog.stages_count} заб.` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Fixed League Badge, Racing Time, Chevron */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span
            className={`hidden sm:inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${leagueBadgeClass}`}
          >
            Лига «{dog.current_league}»
          </span>

          {/* Best Time OR Points Display depending on sortMode (strictly 1 line!) */}
          <div className="text-right pl-1 sm:pl-2 shrink-0 min-w-[64px] flex items-center justify-end">
            {sortMode === 'points' ? (
              <div className="flex items-baseline justify-end gap-1 leading-none">
                <span className="font-serif text-base sm:text-lg font-bold tabular-nums text-camel-900 leading-none">
                  {dog.total_points != null && dog.total_points > 0 ? dog.total_points : '—'}
                </span>
                {dog.total_points != null && dog.total_points > 0 && (
                  <span className="text-xs font-semibold text-charcoal-700">б.</span>
                )}
              </div>
            ) : (
              <div className="flex items-baseline justify-end gap-1 leading-none">
                <span className="font-serif text-base sm:text-lg font-bold tabular-nums text-camel-800 leading-none">
                  {dog.best_time ? dog.best_time.toFixed(2) : '—'}
                </span>
                <span className="text-xs font-semibold text-charcoal-600">сек</span>
              </div>
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
        <div className="px-3 sm:px-4 py-2.5 bg-cream-100/80 border-t border-old-money-200/80 space-y-2 animate-fadeIn">
          {/* Stages Table / Monolith in 6 Columns */}
          <div className="overflow-hidden rounded-xl border border-old-money-200/90 bg-white/95 shadow-2xs divide-y-2 divide-old-money-200/90">
            {/* Desktop Table Header: 3 columns left (Этап, Класс, Лига), 3 columns right (Место, Баллы, Секунды) */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-3.5 py-1.5 bg-cream-100/70 text-[11px] font-semibold text-charcoal-600 border-b border-old-money-100">
              <div className="col-span-2">Этап</div>
              <div className="col-span-3">Класс</div>
              <div className="col-span-2">Лига</div>
              <div className="col-span-2 text-center">Место</div>
              <div className="col-span-1 text-center">Баллы</div>
              <div className="col-span-2 text-right">Секунды</div>
            </div>

            {dog.history.map((h, hIdx) => {
              const b = h.points_breakdown
              const stageRoman = h.stage_num === 1 ? 'I этап' : h.stage_num === 2 ? 'II этап' : 'III этап'
              const dateFormatted = h.date ? h.date.slice(5) : ''
              const cleanClass = cleanClassName(h.breed_class)
              const stageLeague = h.league || (h.breed_class.match(/\(([^)]+)\)/)?.[1] ?? dog.current_league)
              const leagueBadge = getStageLeagueBadgeClass(stageLeague)

              return (
                <div key={hIdx} className="px-3.5 py-2.5 flex flex-col gap-1 sm:grid sm:grid-cols-12 sm:items-center sm:gap-2 text-xs hover:bg-cream-50/60 transition-colors">
                  {/* Left 3 columns: Этап, Класс, Лига */}
                  <div className="sm:col-span-2 font-bold text-charcoal-900 flex items-center gap-1.5">
                    <span>{stageRoman}</span>
                    {dateFormatted && (
                      <span className="text-[10px] text-charcoal-400 font-normal">({dateFormatted})</span>
                    )}
                  </div>

                  <div className="sm:col-span-3 text-[11px] text-charcoal-700 truncate" title={h.breed_class}>
                    {cleanClass}
                  </div>

                  <div className="sm:col-span-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${leagueBadge}`}>
                      Лига «{stageLeague}»
                    </span>
                  </div>

                  {/* Right 3 columns: Место, Баллы, Секунды */}
                  <div className="sm:col-span-2 sm:text-center font-bold text-charcoal-900 flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-charcoal-500 font-normal">Место:</span>
                    <span>{h.placement > 0 ? `${h.placement} место` : formatChampionshipStatus(h.status)}</span>
                  </div>

                  <div className="sm:col-span-1 sm:text-center flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-charcoal-500 font-normal">Баллы:</span>
                    {h.points != null && h.points > 0 ? (
                      <span className="font-bold text-camel-900">{h.points} б.</span>
                    ) : (
                      <span className="text-charcoal-400">—</span>
                    )}
                  </div>

                  <div className="sm:col-span-2 sm:text-right font-mono font-bold text-camel-800 flex items-center justify-between sm:justify-end">
                    <span className="sm:hidden text-charcoal-500 font-normal font-sans">Время:</span>
                    <span>{h.total_score ? `${h.total_score.toFixed(2)} сек` : '—'}</span>
                  </div>

                  {/* Bonus breakdown row if bonuses exist */}
                  {b && (b.place_points > 0 || b.best_final_points > 0 || b.best_class_points > 0 || b.best_breed_points > 0 || b.track_record_points > 0) && (
                    <div className="sm:col-span-12 flex flex-wrap items-center gap-1 pt-1.5 sm:mt-0.5 border-t border-old-money-100/60 text-[10px]">
                      <span className="text-charcoal-400 font-medium">Бонусы:</span>
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
        </div>
      )}
    </div>
  )
}

export default memo(ChampionshipDogCard)
