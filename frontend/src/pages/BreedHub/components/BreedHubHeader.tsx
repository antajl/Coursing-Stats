import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Award,
  Crown,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react'
import type { BreedHubItem } from '../../../lib/breed-hubs-data'
import type { BreedShowStats } from '../../../hooks/useStaticData'

interface BreedHubHeaderProps {
  breedInfo: BreedHubItem
  breedStats: {
    totalDogs: number
    totalStarts: number
    totalGold: number
    yearsSpan: string
    maxSpeed: number
  }
  showsStats: BreedShowStats | null
  breedArchiveUrl: string | null
  placementAllLoading: boolean
  speedAllLoading: boolean
  doninoLoading: boolean
  annualLeadersLoading: boolean
  statsMode: 'sport' | 'shows'
  setStatsMode: (mode: 'sport' | 'shows') => void
}

export function BreedHubHeader({
  breedInfo,
  breedStats,
  showsStats,
  breedArchiveUrl,
  placementAllLoading,
  speedAllLoading,
  doninoLoading,
  annualLeadersLoading,
  statsMode,
  setStatsMode,
}: BreedHubHeaderProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false)

  return (
    <div className="cs-glass-card rounded-2xl border border-old-money-200/80 bg-white shadow-xs overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-old-money-200/70 items-stretch">
        {/* Левая колонка: название с паспортными данными, лид, единый тулбар кнопок и спойлер истории */}
        <div className="p-3.5 sm:p-4 md:py-3.5 md:px-5 flex flex-col justify-center min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900 tracking-tight leading-tight">
              {breedInfo.nameRu}
            </h1>
            <span className="text-sm sm:text-base font-serif italic text-charcoal-500">
              {breedInfo.nameLat}
            </span>
            <span className="inline-flex items-center rounded-md border border-camel-200/90 bg-cream-100/90 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-camel-800 shrink-0">
              {breedInfo.fci}
            </span>
            {breedStats.yearsSpan && (
              <span className="text-xs text-charcoal-400 font-sans tabular-nums hidden sm:inline">
                · Сезоны {breedStats.yearsSpan}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm font-medium text-charcoal-800 leading-snug mt-1">
            {breedInfo.lead}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 pt-2 border-t border-old-money-100/80">
            <Link
              to={`/competitions/ranking/2026/?breed=${breedInfo.slug}`}
              className="cs-glass-pill inline-flex h-8 items-center justify-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-xs font-semibold shrink-0 cursor-pointer text-charcoal-700 hover:text-camel-800 transition-all active:scale-95"
              title={`Спортивный рейтинг породы ${breedInfo.nameRu}`}
            >
              <Trophy className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span>Спорт</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-charcoal-400 shrink-0" aria-hidden />
            </Link>

            <Link
              to={`/shows/?tab=ranking&breed=${breedInfo.slug}&scope=all_breed`}
              className="cs-glass-pill inline-flex h-8 items-center justify-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-xs font-semibold shrink-0 cursor-pointer text-charcoal-700 hover:text-camel-800 transition-all active:scale-95"
              title={`Выставочный рейтинг САС породы ${breedInfo.nameRu}`}
            >
              <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span>САС</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-charcoal-400 shrink-0" aria-hidden />
            </Link>

            <Link
              to={`/shows/?tab=calendar&breed=${breedInfo.slug}&scope=mono`}
              className="cs-glass-pill inline-flex h-8 items-center justify-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-xs font-semibold shrink-0 cursor-pointer text-charcoal-700 hover:text-camel-800 transition-all active:scale-95"
              title={`Календарь монопородных выставок НКП породы ${breedInfo.nameRu}`}
            >
              <Crown className="h-3.5 w-3.5 text-amber-700 shrink-0" aria-hidden />
              <span>Моно НКП</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-charcoal-400 shrink-0" aria-hidden />
            </Link>

            {breedArchiveUrl && (
              <a
                href={breedArchiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-glass-pill inline-flex h-8 items-center justify-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-xs font-semibold shrink-0 cursor-pointer text-charcoal-700 hover:text-camel-800 transition-all active:scale-95"
                title={`Международная база родословных The Breed Archive (${breedInfo.nameLat})`}
              >
                <img
                  src="/assets/icons/breedarchive.webp"
                  alt=""
                  className="h-3.5 w-3.5 rounded-xs shrink-0"
                  loading="lazy"
                />
                <span>Archive</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-charcoal-400 shrink-0" aria-hidden />
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="cs-glass-pill inline-flex h-8 items-center justify-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 text-xs font-semibold shrink-0 cursor-pointer text-charcoal-700 hover:text-camel-800 transition-all active:scale-95"
              aria-expanded={isDescExpanded}
            >
              <BookOpen className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span className="sm:hidden">{isDescExpanded ? 'Свернуть' : 'История'}</span>
              <span className="hidden sm:inline">{isDescExpanded ? 'Свернуть историю' : 'О породе и истории'}</span>
              {isDescExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-charcoal-400 shrink-0" aria-hidden />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-charcoal-400 shrink-0" aria-hidden />
              )}
            </button>
          </div>

          {isDescExpanded && (
            <p className="text-xs text-charcoal-600 leading-relaxed mt-2 pt-2 border-t border-old-money-100 animate-in fade-in duration-200">
              {breedInfo.description}
            </p>
          )}
        </div>

        {/* Правая колонка: вертикальный отсек с реестром 4 ключевых метрик (Спорт vs Выставки) */}
        <div className="bg-cream-50/50 px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 flex flex-col justify-center">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-old-money-200/50">
            <div className="inline-flex rounded-lg bg-cream-100/90 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setStatsMode('sport')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  statsMode === 'sport'
                    ? 'bg-white shadow-2xs text-charcoal-900 font-bold'
                    : 'text-charcoal-500 hover:text-charcoal-800'
                }`}
              >
                Спорт
              </button>
              <button
                type="button"
                onClick={() => setStatsMode('shows')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  statsMode === 'shows'
                    ? 'bg-white shadow-2xs text-charcoal-900 font-bold'
                    : 'text-charcoal-500 hover:text-charcoal-800'
                }`}
              >
                Выставки
              </button>
            </div>
            <span className="text-[10px] text-charcoal-400 font-medium">Паспорт породы</span>
          </div>

          <div className="divide-y divide-old-money-200/50">
            {statsMode === 'sport' ? (
              <>
                <div className="flex items-center justify-between py-1 sm:py-1.5 text-xs">
                  <span className="text-charcoal-600 font-medium">Собак в состязаниях</span>
                  <span className="font-bold font-sans tabular-nums text-charcoal-900 text-sm">
                    {placementAllLoading ? '…' : breedStats.totalDogs.toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 sm:py-1.5 text-xs">
                  <span className="text-charcoal-600 font-medium">Всего забегов</span>
                  <span className="font-bold font-sans tabular-nums text-charcoal-900 text-sm">
                    {placementAllLoading ? '…' : breedStats.totalStarts.toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 sm:py-1.5 text-xs">
                  <span className="text-charcoal-600 font-medium">Побед (1-е места)</span>
                  <span className="font-bold font-sans tabular-nums text-camel-800 text-sm">
                    {placementAllLoading ? '…' : breedStats.totalGold.toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 sm:py-1.5 text-xs">
                  <span className="text-charcoal-600 font-medium">Рекорд скорости</span>
                  <span className="font-bold font-sans tabular-nums text-charcoal-900 text-sm">
                    {speedAllLoading || doninoLoading ? (
                      '…'
                    ) : breedStats.maxSpeed > 0 ? (
                      `${breedStats.maxSpeed % 1 === 0 ? breedStats.maxSpeed : breedStats.maxSpeed.toFixed(1)} км/ч`
                    ) : (
                      breedStats.yearsSpan || 'Архив'
                    )}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between py-1 sm:py-1.5 text-xs">
                  <span className="text-charcoal-600 font-medium">Собак на выставках</span>
                  <span className="font-bold font-sans tabular-nums text-charcoal-900 text-sm">
                    {annualLeadersLoading ? '…' : (showsStats?.total_dogs || 0).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 sm:py-1.5 text-xs">
                  <span className="text-charcoal-600 font-medium">Выходов в ринг</span>
                  <span className="font-bold font-sans tabular-nums text-charcoal-900 text-sm">
                    {annualLeadersLoading ? '…' : (showsStats?.total_entries || 0).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 sm:py-1.5 text-xs">
                  <span className="text-charcoal-600 font-medium">Побед BIS (Главный ринг)</span>
                  <span className="font-bold font-sans tabular-nums text-amber-800 text-sm">
                    {annualLeadersLoading ? '…' : (showsStats?.total_bis_wins || 0).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 sm:py-1.5 text-xs">
                  <span className="text-charcoal-600 font-medium">Монопородных смотров НКП</span>
                  <span className="font-bold font-sans tabular-nums text-camel-900 text-sm">
                    {annualLeadersLoading ? '…' : (showsStats?.total_mono_exhibitions || 0).toLocaleString('ru-RU')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
