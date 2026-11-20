import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ProfileHeaderRank } from '../DogProfileHeader'
import type { ShowDogCardData } from '../../Shows/ShowDogCard'

export interface SiteRankingsSectionProps {
  breed?: string
  ranks?: ProfileHeaderRank[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursingStats?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  racingStats?: any
  showDog?: ShowDogCardData | null
}

export function SiteRankingsSection({
  breed,
  ranks = [],
  coursingStats = {},
  racingStats = {},
  showDog,
}: SiteRankingsSectionProps) {
  const coursingRank = ranks.find((r) => r.key === 'coursing')
  const racingRank = ranks.find((r) => r.key === 'racing')
  const showRank = ranks.find((r) => r.key === 'shows')

  return (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
      <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-old-money-100 bg-cream-50/50 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
          Достижения и рекорды в рейтинге CoursingStats
        </h2>
      </div>

      <div className="p-2.5 sm:p-3 space-y-2">
        {/* Курсинг рейтинг */}
        <div className="rounded-xl border border-forest-200/80 bg-forest-50/20 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex shrink-0 items-center justify-center w-[82px] rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-forest-100/90 text-forest-900 border border-forest-200/80">
              Курсинг
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                  {coursingRank?.yearBreedRank
                    ? `#${coursingRank.yearBreedRank} в сезоне`
                    : coursingRank?.breedRank
                      ? `#${coursingRank.breedRank} в породе`
                      : 'В зачёте'}
                </span>
                {coursingStats?.gold ? (
                  <span className="text-[11px] text-forest-800 font-semibold tabular-nums hidden sm:inline">
                    • {coursingStats.gold} {coursingStats.gold === 1 ? 'победа' : 'побед'}
                  </span>
                ) : null}
                {coursingStats?.best_judge_score ? (
                  <span className="text-[11px] text-charcoal-500 tabular-nums hidden md:inline">
                    • макс: {coursingStats.best_judge_score} б.
                  </span>
                ) : null}
              </div>
              <div className="text-[10px] sm:text-[11px] text-charcoal-500 truncate mt-0.5">
                {breed || 'порода'}{coursingRank?.rank ? ` · №${coursingRank.rank} за всё время` : ''}
                {coursingStats?.avg_judge_score ? ` · ср. балл: ${coursingStats.avg_judge_score}` : ''}
              </div>
            </div>
          </div>

          <Link
            to="/competitions/"
            className="shrink-0 p-1.5 text-forest-800 hover:text-forest-950 hover:bg-forest-100/60 rounded-md transition-colors"
            title="Рейтинг сезона"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Бега борзых рейтинг */}
        <div className="rounded-xl border border-sky-200/80 bg-sky-50/20 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex shrink-0 items-center justify-center w-[82px] rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-sky-100/90 text-sky-900 border border-sky-200/80">
              Рейсинг
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                  {racingRank?.yearBreedRank
                    ? `#${racingRank.yearBreedRank} по скорости`
                    : racingStats?.best_speed
                      ? `${racingStats.best_speed} км/ч`
                      : 'В зачёте'}
                </span>
                {racingStats?.gold ? (
                  <span className="text-[11px] text-sky-800 font-semibold tabular-nums hidden sm:inline">
                    • {racingStats.gold} {racingStats.gold === 1 ? 'победа' : 'побед'}
                  </span>
                ) : null}
                {racingStats?.best_speed ? (
                  <span className="text-[11px] text-charcoal-500 tabular-nums hidden md:inline">
                    • рекорд: {racingStats.best_speed} км/ч
                  </span>
                ) : null}
              </div>
              <div className="text-[10px] sm:text-[11px] text-charcoal-500 truncate mt-0.5">
                {breed || 'порода'}{racingRank?.rank ? ` · №${racingRank.rank} за всё время` : ''}
                {racingStats?.avg_speed ? ` · ср. скорость: ${racingStats.avg_speed} км/ч` : ''}
              </div>
            </div>
          </div>

          <Link
            to="/competitions/"
            className="shrink-0 p-1.5 text-sky-800 hover:text-sky-950 hover:bg-sky-100/60 rounded-md transition-colors"
            title="Рейтинг скорости"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Выставки рейтинг */}
        <div className="rounded-xl border border-camel-200/80 bg-camel-50/20 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex shrink-0 items-center justify-center w-[82px] rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-camel-100/90 text-camel-900 border border-camel-200/80">
              Выставки
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                  {showDog?.best_award || (showDog?.total_shows ? `${showDog.total_shows} выставок` : 'В каталоге')}
                </span>
                {showDog?.total_shows ? (
                  <span className="text-[11px] text-camel-800 font-semibold tabular-nums hidden sm:inline">
                    • {showDog.total_shows} {showDog.total_shows === 1 ? 'выставка' : 'выставок'}
                  </span>
                ) : null}
                {(showDog?.bis_count || 0) + (showDog?.big_count || 0) + (showDog?.bob_count || 0) > 0 ? (
                  <span className="text-[11px] text-charcoal-500 tabular-nums hidden md:inline">
                    • побед в ринге: {(showDog?.bis_count || 0) + (showDog?.big_count || 0) + (showDog?.bob_count || 0)}
                  </span>
                ) : null}
              </div>
              <div className="text-[10px] sm:text-[11px] text-charcoal-500 truncate mt-0.5">
                {showRank?.rank ? `№${showRank.rank} за всё время` : 'Рейтинг экстерьера'}
                {showDog?.rank_score ? ` · рейтинговый балл: ${showDog.rank_score}` : ''}
              </div>
            </div>
          </div>

          <Link
            to="/shows/"
            className="shrink-0 p-1.5 text-camel-800 hover:text-camel-950 hover:bg-camel-100/60 rounded-md transition-colors"
            title="Рейтинг выставок"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
