import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Calendar, Users, ArrowUpRight, ShieldCheck } from 'lucide-react'
import DogSexIcon from '../../../components/DogSexIcon'
import { parseDogName } from '../../../lib/dogName'
import type { ShowAllTimeDog, BreedShowStats, AnnualShowDogLeader } from '../../../hooks/useStaticData'
import BreedShowsColumns from './BreedShowsColumns'

interface BreedShowsSectionProps {
  breedNameRu: string
  breedSlug: string
  canonicalKey: string
  showsCacLeaders?: AnnualShowDogLeader[]
  showsMonoLeaders?: AnnualShowDogLeader[]
  allTimeDogs: ShowAllTimeDog[]
  showStats: BreedShowStats | null
  isLoading?: boolean
}

export const BreedShowsSection = memo(function BreedShowsSection({
  breedNameRu,
  breedSlug,
  canonicalKey,
  showsCacLeaders = [],
  showsMonoLeaders = [],
  allTimeDogs,
  showStats,
  isLoading = false,
}: BreedShowsSectionProps) {
  const hasAnnualLeaders = showsCacLeaders.length > 0 || showsMonoLeaders.length > 0 || isLoading
  const hasAllTime = allTimeDogs.length > 0
  const hasStats = showStats != null && showStats.total_dogs > 0

  if (!hasAnnualLeaders && !hasAllTime && !hasStats) {
    return null
  }

  const monoCount = showStats?.total_mono_exhibitions || 0

  return (
    <div
      id="shows"
      className="rounded-2xl border border-[rgba(195,168,128,0.70)] bg-white shadow-2xs overflow-hidden scroll-mt-24 md:scroll-mt-28"
    >
        {/* Верхняя часть: Таблица ежегодных лидеров САС и Моно НКП */}
        {hasAnnualLeaders && (
          <BreedShowsColumns
            showsCacLeaders={showsCacLeaders}
            showsMonoLeaders={showsMonoLeaders}
            annualLeadersLoading={isLoading}
            canonicalKey={canonicalKey}
            breedNameRu={breedNameRu}
            breedSlug={breedSlug}
          />
        )}

        {/* Нижняя часть: Зал славы Топ-5 всех времён и блок НКП */}
        <div className={`${hasAnnualLeaders ? 'border-t border-[rgba(195,168,128,0.70)]' : ''} grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-old-money-100`}>
          {/* Левая колонка: Зал славы всех времён (All-Time Top-5 собак) */}
          <div id="hall-of-fame" className="p-3.5 sm:p-4 scroll-mt-24 md:scroll-mt-28">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 inline-flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden />
                <span>Зал славы: Топ-5 собак всех времён</span>
              </h3>
              <Link
                to={`/shows/?tab=ranking&breed=${breedSlug}&year=all`}
                className="text-[11px] font-semibold text-camel-800 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Все года</span>
                <ArrowUpRight className="w-2.5 h-2.5" aria-hidden />
              </Link>
            </div>

            {allTimeDogs.length === 0 ? (
              <p className="text-xs text-charcoal-500 italic py-4">Результатов пока нет.</p>
            ) : (
              <ol className="divide-y divide-old-money-100 text-xs sm:text-sm">
                {allTimeDogs.slice(0, 5).map((dog, idx) => {
                  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
                  const isMale = dog.sex === 'M' || dog.sex === 'К'
                  const isFemale = dog.sex === 'F' || dog.sex === 'С'
                  const sexVal = isMale ? 'm' : isFemale ? 'f' : ''
                  const bis = dog.titles?.BIS || 0
                  const big = dog.titles?.BIG || 0
                  const bob = dog.titles?.BOB || 0
                  const kchk = dog.titles?.KCHK || 0
                  const isPk = Boolean(dog.titles?.P_RUSSIA || dog.titles?.P_MOSCOW)
                  const dogProfileId = dog.competition_dog_id != null ? dog.competition_dog_id : dog.dog_id

                  return (
                    <li
                      key={dog.dog_id}
                      className="py-2 flex items-center justify-between gap-2 hover:bg-cream-50/50 transition-colors"
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

                      <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                        <div className="text-[11px] font-sans font-medium text-charcoal-600 leading-tight">
                          {dog.total_shows} выст.
                        </div>
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {isPk && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded font-sans font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                              ПК
                            </span>
                          )}
                          {bis > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded font-sans font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                              BIS {bis > 1 ? bis : ''}
                            </span>
                          )}
                          {big > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded font-sans font-semibold text-[10px] bg-camel-100 text-camel-900 border border-camel-300">
                              BIG {big > 1 ? big : ''}
                            </span>
                          )}
                          {kchk > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded font-sans font-medium text-[10px] bg-cream-100 text-charcoal-700 border border-cream-300">
                              КЧК {kchk}
                            </span>
                          )}
                          {!isPk && bis === 0 && big === 0 && kchk === 0 && bob > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded font-sans font-medium text-[10px] bg-cream-100 text-charcoal-700 border border-cream-300">
                              BOB {bob}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          {/* Правая колонка: Национальный клуб породы (НКП) и монопородные смотры */}
          <div className="p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                  <span>Монопородные выставки и племенной смотр НКП</span>
                </h3>
              </div>

              <p className="text-xs text-charcoal-600 leading-relaxed mb-3">
                Монопородная выставка — главный зоотехнический смотр породы под судейством признанных экспертов-породников.
                Здесь разыгрываются селекционные титулы Национального клуба породы: КЧК (Кандидат в чемпионы клуба) и ПК (Победитель клуба).
              </p>

              {monoCount > 0 && (
                <div className="rounded-xl border border-camel-200/80 bg-cream-50/70 p-2.5 sm:p-3 mb-3 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-charcoal-900">
                      Календарь монопородок 2026 года
                    </div>
                    <div className="text-charcoal-600 text-[11px] mt-0.5">
                      В текущем сезоне запланировано <span className="font-bold font-sans text-camel-900">{monoCount}</span> монопородных выставок породы {breedNameRu}.
                    </div>
                  </div>
                  <Link
                    to={`/shows/?tab=calendar&breed=${breedSlug}&scope=mono`}
                    className="cs-glass-pill inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-camel-900 hover:text-camel-950 shrink-0 ml-2"
                  >
                    <span>График</span>
                    <ArrowUpRight className="h-3 w-3 text-camel-700" aria-hidden />
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-old-money-100">
              <Link
                to={`/shows/?tab=calendar&breed=${breedSlug}&scope=mono`}
                className="rounded-xl border border-old-money-200/80 p-2.5 bg-cream-50/40 hover:bg-cream-100/60 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-camel-700 shrink-0" aria-hidden />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-charcoal-900 truncate">
                    Монопородки в календаре
                  </div>
                  <div className="text-[10px] text-charcoal-500 truncate">
                    Расписание смотров НКП
                  </div>
                </div>
              </Link>

              <Link
                to={`/shows/?tab=judges&breed=${breedSlug}`}
                className="rounded-xl border border-old-money-200/80 p-2.5 bg-cream-50/40 hover:bg-cream-100/60 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-camel-700 shrink-0" aria-hidden />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-charcoal-900 truncate">
                    Эксперты породы
                  </div>
                  <div className="text-[10px] text-charcoal-500 truncate">
                    Судьи, судившие породу
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
  )
})
