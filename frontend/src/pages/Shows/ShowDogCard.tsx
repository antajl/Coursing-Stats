import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import OwnerCrownName from '../../components/OwnerCrownName'
import { Top3AccentBar } from '../../components/DogCard'
import RankBadge, { DeltaBadge } from '../../components/RankBadge'
import { parseDogName } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { showYearBadge } from '../../lib/season'
import { showDogProfilePath, isShowOnlyProfileId, stableShowProfileId, SHOW_PROFILE_ID_BASE } from '../../lib/showDogProfilePath'
import { renderShowAwardChips } from '../../lib/awardChipRender'
import { showAwardBadgeClass } from '../../lib/qualificationTitles'
import {
  presentShowAwards,
  SHOW_AWARD_BADGE,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'
import type { FavoriteDogMeta } from '../../hooks/useFavorites'

export interface ShowDogCardData {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_en?: string
  breed_group?: string
  sex: string
  total_shows: number
  best_placement?: number
  best_award?: string | null
  /** Лучшая оценка FCI/РКФ (RU), если есть в индексе. */
  best_grade?: string | null
  rank_score?: number
  /** 1-based место в рейтинге среза (lean / details), если есть в индексе. */
  rank?: number
  /** 1-based место в рейтинге по породе за всё время. */
  breed_rank?: number
  /** Место в общем рейтинге РКФ (до применения фильтров по породе/группе). */
  overall_rank?: number
  titles: ShowTitleCounts
  competition_dog_id?: number | null
  /** Catalog/ring # for legacy /shows/dog/{catalog}/{breed} URLs. */
  catalog_id?: string
  history?: Array<{
    date: string
    exhibition_id: number
    exhibition_title?: string
    placement: number
    title?: string
    grade?: string
  }>
}

export function getShowDogFavId(dog: Pick<ShowDogCardData, 'id' | 'name_lat' | 'breed' | 'competition_dog_id'>): string {
  if (dog.competition_dog_id != null && Number.isFinite(Number(dog.competition_dog_id))) {
    return String(dog.competition_dog_id)
  }
  if (isShowOnlyProfileId(dog.id)) {
    return String(dog.id)
  }
  const stable = stableShowProfileId(dog.name_lat || '', dog.breed || '')
  if (stable >= SHOW_PROFILE_ID_BASE) return String(stable)
  return String(dog.id)
}

function FavoriteCardStar({
  dogId,
  nameLat,
  nameRu,
  breed,
  isFav,
  onToggle,
}: {
  dogId: string
  nameLat: string
  nameRu?: string
  breed: string
  isFav: boolean
  onToggle: (dogId: string, meta: FavoriteDogMeta) => void
}) {
  const { primary } = parseDogName(nameLat, nameRu)
  const meta: FavoriteDogMeta = { name: primary, breed }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle(dogId, meta)
      }}
      className={`absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm transition-all duration-150 hover:bg-cream-100 active:scale-90 ${
        isFav ? 'opacity-100' : 'opacity-40 sm:opacity-0 sm:group-hover:opacity-100'
      }`}
      title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
      aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Star
        key={isFav ? `${dogId}-fav` : `${dogId}-plain`}
        className={`h-4 w-4 ${
          isFav ? 'fill-amber-400 text-amber-400 animate-favorite-star-pop' : 'text-charcoal-400'
        }`}
      />
    </button>
  )
}

interface ShowDogCardProps {
  dog: ShowDogCardData
  /** Место в полном рейтинге среза. */
  rank?: number
  /**
   * Год среза рейтинга.
   * Пусто = все годы → бейдж из history / year_*.
   */
  filterYear?: string
  favorites?: Set<string>
  onToggleFavorite?: (dogId: string, meta: FavoriteDogMeta) => void
}

const TOP3_WASH: Record<1 | 2 | 3, string> = {
  1: 'bg-amber-50/45',
  2: 'bg-slate-100/55',
  3: 'bg-orange-50/45',
}

function ShowDogCardInner({
  dog,
  rank,
  filterYear = '',
  favorites,
  onToggleFavorite,
}: ShowDogCardProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const yearBadge = showYearBadge(dog, filterYear)
  const href = showDogProfilePath(dog)
  const awards = useMemo(() => presentShowAwards(dog.titles), [dog.titles])

  const isTop3 = rank != null && rank > 0 && rank <= 3
  const top3Wash = isTop3 ? TOP3_WASH[rank as 1 | 2 | 3] : ''

  const favId = getShowDogFavId(dog)
  const isFav = Boolean(favorites?.has(favId))

  const shellBase =
    'group relative flex min-h-[5rem] sm:h-[5.25rem] flex-row items-stretch border-0 bg-transparent px-3 sm:px-4 py-1.5 shadow-none transition-colors duration-150 hover:bg-camel-100/60'
  const shellClass = isTop3
    ? `${shellBase} overflow-visible ${top3Wash}`.trim()
    : `${shellBase} overflow-hidden`.trim()

  return (
    <div data-list-item className="relative group">
      {onToggleFavorite && (
        <FavoriteCardStar
          dogId={favId}
          nameLat={dog.name_lat}
          nameRu={dog.name_ru}
          breed={dog.breed}
          isFav={isFav}
          onToggle={onToggleFavorite}
        />
      )}
      <Link to={href} className={shellClass}>
        {isTop3 && rank != null ? <Top3AccentBar rank={rank} /> : null}

        {/* Колонка ранга (слева на всю высоту карточки) */}
        {rank != null && rank > 0 && (
          <div className="flex min-h-0 min-w-[2.75rem] sm:min-w-[3rem] shrink-0 flex-col justify-between items-center pr-2 sm:pr-2.5 mr-2 sm:mr-2.5 border-r border-old-money-200/70 self-stretch">
            <RankBadge rank={rank} hideDelta />
            <div className="flex items-center justify-center h-4 sm:h-5">
              {dog.overall_rank != null && dog.overall_rank !== rank ? (
                <span
                  className="text-[9px] font-medium text-charcoal-400 tabular-nums leading-none tracking-tight"
                  title={`Место в общем зачёте РКФ: ${dog.overall_rank}`}
                >
                  №{dog.overall_rank}
                </span>
              ) : (dog as any)?.rank_delta ? (
                <DeltaBadge delta={(dog as any).rank_delta} />
              ) : null}
            </div>
          </div>
        )}

        {/* Мобильная раскладка (< sm) */}
        <div className="flex sm:hidden flex-row items-stretch w-full min-h-[4.75rem] py-0.5 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 overflow-hidden">
            <div className="pr-10 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <OwnerCrownName
                  name={primary}
                  dogId={dog.competition_dog_id ?? null}
                  kind="competition"
                >
                  <h3
                    className="text-xs font-bold leading-snug text-charcoal-900 truncate"
                    title={secondary ? `${primary} / ${secondary}` : primary}
                  >
                    {primary}
                  </h3>
                </OwnerCrownName>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-charcoal-600 font-medium truncate">
                  {breedDisplay.primary}
                </span>
                {yearBadge && (
                  <>
                    <span className="text-charcoal-300 shrink-0" aria-hidden>
                      ·
                    </span>
                    <span className="text-charcoal-500 shrink-0">
                      {yearBadge.label}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
                {awards.length > 0 ? (
                  renderShowAwardChips({ titles: dog.titles, maxVisible: 3, nowrap: true })
                ) : (
                  <span className="text-[10px] text-charcoal-400">Участник рингов</span>
                )}
              </div>
              <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-charcoal-700 tabular-nums shrink-0 min-w-[2.25rem]">
                <span className="tabular-nums text-right">{dog.total_shows || 0}</span>
                <span className="text-[9px] font-normal text-charcoal-500">выст.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Десктопная раскладка (>= sm) */}
        <div className="hidden sm:flex flex-row items-stretch w-full min-w-0">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <OwnerCrownName
                name={primary}
                dogId={dog.competition_dog_id ?? null}
                kind="competition"
              >
                <h3
                  className="text-xs font-bold leading-snug text-charcoal-900 truncate"
                  title={secondary ? `${primary} / ${secondary}` : primary}
                >
                  {primary}
                </h3>
              </OwnerCrownName>
              <span className="text-charcoal-300 shrink-0" aria-hidden>
                ·
              </span>
              <span className="text-[10px] text-charcoal-600 font-medium truncate">
                {breedDisplay.primary}
              </span>
              {yearBadge && (
                <>
                  <span className="text-charcoal-300 shrink-0" aria-hidden>
                    ·
                  </span>
                  <span className="text-[10px] text-charcoal-500 shrink-0">
                    {yearBadge.label}
                  </span>
                </>
              )}
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
              {awards.length > 0 ? (
                renderShowAwardChips({ titles: dog.titles, maxVisible: 6, nowrap: true })
              ) : (
                <span className="text-[10px] text-charcoal-400">Участник рингов</span>
              )}
            </div>
          </div>

          {/* Правая колонка статистики выставок */}
          <div className="mr-7 flex min-h-0 min-w-[7.5rem] sm:min-w-[8.5rem] shrink-0 flex-col justify-center items-end gap-1 border-l border-old-money-200/60 pl-3">
            {dog.best_award ? (
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[9px] uppercase tracking-wide text-charcoal-500">
                  лучшая:
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${showAwardBadgeClass(
                    dog.best_award as any,
                  )}`}
                >
                  {SHOW_AWARD_BADGE[dog.best_award as any] || dog.best_award}
                </span>
              </div>
            ) : (
              <div className="text-[9px] uppercase tracking-wide text-charcoal-400">
                класс
              </div>
            )}
            <div className="flex shrink-0 items-center gap-1.5 h-6 text-xs text-charcoal-600">
              <span className="text-[11px] text-charcoal-500">Выставок:</span>
              <span className="inline-block w-[3ch] text-right text-sm font-bold tabular-nums leading-none text-charcoal-800">
                {dog.total_shows || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

const ShowDogCardMemo = memo(ShowDogCardInner, (prevProps, nextProps) => {
  return (
    prevProps.dog.id === nextProps.dog.id &&
    prevProps.dog.total_shows === nextProps.dog.total_shows &&
    prevProps.rank === nextProps.rank &&
    prevProps.dog.overall_rank === nextProps.dog.overall_rank &&
    prevProps.filterYear === nextProps.filterYear &&
    Boolean(prevProps.favorites?.has(getShowDogFavId(prevProps.dog))) ===
      Boolean(nextProps.favorites?.has(getShowDogFavId(nextProps.dog)))
  )
})

export default ShowDogCardMemo
