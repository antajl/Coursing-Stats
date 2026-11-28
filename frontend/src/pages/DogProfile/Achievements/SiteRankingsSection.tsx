import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { breedToSlug } from '../../../lib/breedMapping'
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

  const breedSlug = breed ? breedToSlug(breed) : ''
  const breedQuery = breedSlug ? `?breed=${encodeURIComponent(breedSlug)}` : ''
  const compRankingUrl = `/competitions/ranking/2026/${breedQuery}`
  const showRankingUrl = `/shows/ranking/2026/${breedQuery}`

  return (
    <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
      <div className="px-4 py-3 sm:px-5 border-b border-old-money-200/80 bg-cream-50/50 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
          Достижения и рекорды в рейтинге CoursingStats
        </h2>
      </div>

      <div className="divide-y divide-old-money-200/80">
        {/* Курсинг рейтинг */}
        <Link
          to={compRankingUrl}
          className="min-h-[56px] px-4 py-3 sm:px-5 flex items-center justify-between gap-2.5 hover:bg-cream-50/80 transition-colors"
          title="Открыть рейтинг породы по курсингу"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex shrink-0 items-center justify-center w-[84px] sm:w-[92px] rounded-lg px-2 py-0.5 text-xs font-bold bg-forest-50 text-forest-900 border border-forest-200/80">
              Курсинг
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2 gap-y-0.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                  {coursingRank?.yearBreedRank
                    ? `#${coursingRank.yearBreedRank} в сезоне`
                    : coursingRank?.breedRank
                      ? `#${coursingRank.breedRank} в породе`
                      : 'В зачёте'}
                </span>
                {coursingStats?.gold ? (
                  <span className="text-[11px] text-forest-800 font-semibold tabular-nums">
                    · {coursingStats.gold} {coursingStats.gold === 1 ? 'победа' : 'побед'}
                  </span>
                ) : null}
                {coursingStats?.best_judge_score ? (
                  <span className="text-[11px] text-charcoal-600 tabular-nums">
                    · макс: {coursingStats.best_judge_score} б.
                  </span>
                ) : null}
              </div>
              <div className="text-[11px] text-charcoal-500 truncate mt-0.5">
                {breed || 'порода'}{coursingRank?.rank ? ` · №${coursingRank.rank} за всё время` : ''}
                {coursingStats?.avg_judge_score ? ` · ср. балл: ${coursingStats.avg_judge_score}` : ''}
              </div>
            </div>
          </div>

          <ArrowUpRight className="w-4 h-4 shrink-0 text-forest-700" strokeWidth={1.75} aria-hidden />
        </Link>

        {/* Бега борзых рейтинг */}
        <Link
          to={compRankingUrl}
          className="min-h-[56px] px-4 py-3 sm:px-5 flex items-center justify-between gap-2.5 hover:bg-cream-50/80 transition-colors"
          title="Открыть рейтинг породы по бегам"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex shrink-0 items-center justify-center w-[84px] sm:w-[92px] rounded-lg px-2 py-0.5 text-xs font-bold bg-warm-blue-50 text-warm-blue-900 border border-warm-blue-200/80">
              Рейсинг
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2 gap-y-0.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                  {racingRank?.yearBreedRank
                    ? `#${racingRank.yearBreedRank} по скорости`
                    : racingStats?.best_speed
                      ? `${racingStats.best_speed} км/ч`
                      : 'В зачёте'}
                </span>
                {racingStats?.gold ? (
                  <span className="text-[11px] text-warm-blue-800 font-semibold tabular-nums">
                    · {racingStats.gold} {racingStats.gold === 1 ? 'победа' : 'побед'}
                  </span>
                ) : null}
                {racingStats?.best_speed ? (
                  <span className="text-[11px] text-charcoal-600 tabular-nums">
                    · рекорд: {racingStats.best_speed} км/ч
                  </span>
                ) : null}
              </div>
              <div className="text-[11px] text-charcoal-500 truncate mt-0.5">
                {breed || 'порода'}{racingRank?.rank ? ` · №${racingRank.rank} за всё время` : ''}
                {racingStats?.avg_speed ? ` · ср. скорость: ${racingStats.avg_speed} км/ч` : ''}
              </div>
            </div>
          </div>

          <ArrowUpRight className="w-4 h-4 shrink-0 text-warm-blue-700" strokeWidth={1.75} aria-hidden />
        </Link>

        {/* Выставки рейтинг */}
        <Link
          to={showRankingUrl}
          className="min-h-[56px] px-4 py-3 sm:px-5 flex items-center justify-between gap-2.5 hover:bg-cream-50/80 transition-colors"
          title="Открыть рейтинг выставок породы"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex shrink-0 items-center justify-center w-[84px] sm:w-[92px] rounded-lg px-2 py-0.5 text-xs font-bold bg-camel-100/90 text-camel-900 border border-camel-200/80">
              Выставки
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2 gap-y-0.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
                  {showDog?.best_award || (showDog?.total_shows ? `${showDog.total_shows} выставок` : 'В каталоге')}
                </span>
                {showDog?.total_shows ? (
                  <span className="text-[11px] text-camel-800 font-semibold tabular-nums">
                    · {showDog.total_shows} {showDog.total_shows === 1 ? 'выставка' : 'выставок'}
                  </span>
                ) : null}
                {(showDog?.bis_count || 0) + (showDog?.big_count || 0) + (showDog?.bob_count || 0) > 0 ? (
                  <span className="text-[11px] text-charcoal-600 tabular-nums">
                    · побед в ринге: {(showDog?.bis_count || 0) + (showDog?.big_count || 0) + (showDog?.bob_count || 0)}
                  </span>
                ) : null}
              </div>
              <div className="text-[11px] text-charcoal-500 truncate mt-0.5">
                {showRank?.rank ? `№${showRank.rank} за всё время` : 'Рейтинг экстерьера'}
                {showDog?.rank_score ? ` · рейтинговый балл: ${showDog.rank_score}` : ''}
              </div>
            </div>
          </div>

          <ArrowUpRight className="w-4 h-4 shrink-0 text-camel-700" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
