import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import { Top3AccentBar } from '../../components/DogCard'
import RankBadge, { DeltaBadge } from '../../components/RankBadge'
import { parseDogName } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { showYearBadge } from '../../lib/season'
import { showDogProfilePath, isShowOnlyProfileId, stableShowProfileId, SHOW_PROFILE_ID_BASE } from '../../lib/showDogProfilePath'
import { renderShowAwardChips } from '../../lib/awardChipRender'
import {
  SHOW_GENERAL_AWARD_ORDER,
  SHOW_MONO_AWARD_ORDER,
  SHOW_MONO_ADULT_KEYS,
  SHOW_MONO_JUNIOR_KEYS,
  SHOW_MONO_VETERAN_KEYS,
  type ShowMonoAgeCategory,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'
import type { ShowScopeFilter } from './ShowCalendar/ShowScopeDropdown'
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
  bis_count?: number
  big_count?: number
  bob_count?: number
  pedigree_url?: string | null
  photo_url?: string | null
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
      className={`absolute right-2 bottom-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all duration-150 hover:bg-cream-100 active:scale-90 touch-manipulation before:absolute before:-inset-2 before:content-[''] ${
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
  filterScope?: ShowScopeFilter
  monoAgeCategory?: ShowMonoAgeCategory
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
  filterScope = 'all',
  monoAgeCategory = 'all',
  favorites,
  onToggleFavorite,
}: ShowDogCardProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const isAllTime = !filterYear || filterYear === 'all'
  const yearBadge = isAllTime ? showYearBadge(dog, '') : null
  const href = showDogProfilePath(dog)

  const isMonoScope = filterScope === 'mono'
  const awards = useMemo(() => {
    if (isMonoScope) {
      const order =
        monoAgeCategory === 'junior'
          ? SHOW_MONO_JUNIOR_KEYS
          : monoAgeCategory === 'veteran'
            ? SHOW_MONO_VETERAN_KEYS
            : monoAgeCategory === 'adult'
              ? SHOW_MONO_ADULT_KEYS
              : SHOW_MONO_AWARD_ORDER
      return order.filter((key) => (dog.titles[key] || 0) > 0)
    }
    return SHOW_GENERAL_AWARD_ORDER.filter((key) => (dog.titles[key] || 0) > 0)
  }, [dog.titles, isMonoScope, monoAgeCategory])

  const monoAwardsCount = useMemo(() => {
    const order =
      monoAgeCategory === 'junior'
        ? SHOW_MONO_JUNIOR_KEYS
        : monoAgeCategory === 'veteran'
          ? SHOW_MONO_VETERAN_KEYS
          : monoAgeCategory === 'adult'
            ? SHOW_MONO_ADULT_KEYS
            : SHOW_MONO_AWARD_ORDER
    return order.reduce((acc, key) => acc + (dog.titles[key] || 0), 0)
  }, [dog.titles, monoAgeCategory])

  const completedNormative = useMemo(() => {
    if (!isMonoScope) return null
    const effectiveKchk =
      (dog.titles?.KCHK || 0) + ((dog.titles?.KCHP || 0) * 2) + Math.floor((dog.titles?.SS || 0) / 3)
    if (effectiveKchk >= 4) {
      return {
        badge: 'ЧНКП ✓',
        title: `Норматив Чемпиона Клуба выполнен (зачтено ${effectiveKchk} КЧК при норме 4)`,
      }
    }
    const effectiveYkchk =
      (dog.titles?.YKCHK || 0) + ((dog.titles?.YKCHP || 0) * 2) + Math.floor((dog.titles?.YSS || 0) / 3)
    if (effectiveYkchk >= 3) {
      return {
        badge: 'ЮЧНКП ✓',
        title: `Норматив Юного Чемпиона Клуба выполнен (зачтено ${effectiveYkchk} ЮКЧК при норме 3)`,
      }
    }
    const effectiveVkchk =
      (dog.titles?.VKCHK || 0) + ((dog.titles?.VKCHP || 0) * 2) + Math.floor((dog.titles?.VSS || 0) / 3)
    if (effectiveVkchk >= 3) {
      return {
        badge: 'ВЧНКП ✓',
        title: `Норматив Ветерана Чемпиона Клуба выполнен (зачтено ${effectiveVkchk} ВКЧК при норме 3)`,
      }
    }
    return null
  }, [dog.titles, isMonoScope])

  const isTop3 = rank != null && rank > 0 && rank <= 3
  const top3Wash = isTop3 ? TOP3_WASH[rank as 1 | 2 | 3] : ''

  const favId = getShowDogFavId(dog)
  const isFav = Boolean(favorites?.has(favId))

  const shellBase =
    'group relative flex min-h-[4rem] sm:min-h-[4.25rem] flex-row items-stretch border-0 bg-transparent px-3 sm:px-4 py-1 sm:py-1.5 shadow-none transition-colors duration-150 hover:bg-camel-100/60'
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
          <div className="flex min-h-0 min-w-[2.5rem] sm:min-w-[2.75rem] shrink-0 flex-col justify-center items-center gap-0.5 pr-2 sm:pr-2.5 mr-2 sm:mr-2.5 border-r border-old-money-200/70 self-stretch">
            <RankBadge rank={rank} hideDelta />
            <div className="flex items-center justify-center h-3.5">
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
        <div className="flex sm:hidden flex-row items-stretch w-full min-h-[4rem] py-0.5 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-0.5 overflow-hidden">
            <div className="min-w-0">
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
              <div className="flex items-center gap-1 text-[10px] leading-tight">
                <span className="text-charcoal-600 font-medium truncate">
                  {breedDisplay.primary}
                </span>
                {breedDisplay.variety && (
                  <span className="text-charcoal-400 font-normal shrink-0">
                    {breedDisplay.variety}
                  </span>
                )}
                {dog.sex && (
                  <>
                    <span className="text-charcoal-300 shrink-0" aria-hidden>
                      ·
                    </span>
                    <DogSexIcon sex={dog.sex} size={11} variant="neutral" strokeWidth={2.25} />
                  </>
                )}
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
                {completedNormative && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-500/80 bg-amber-50 text-amber-900 shrink-0 leading-none shadow-2xs select-none cursor-default"
                    title={completedNormative.title}
                  >
                    {completedNormative.badge}
                  </span>
                )}
                {awards.length > 0 ? (
                  renderShowAwardChips({
                    titles: dog.titles,
                    keys: awards as any,
                    maxVisible: completedNormative ? 2 : 3,
                    nowrap: true,
                  })
                ) : !completedNormative ? (
                  <span className="text-[10px] text-charcoal-400">Участник рингов</span>
                ) : null}
              </div>
              <div className={`flex items-center justify-end gap-1 text-[11px] font-semibold text-charcoal-700 tabular-nums shrink-0 min-w-[2.25rem] ${onToggleFavorite ? 'mr-8' : ''}`}>
                {isMonoScope ? (
                  <>
                    <span className="tabular-nums text-right font-bold text-camel-700">{monoAwardsCount}</span>
                    <span className="text-[9px] font-normal text-charcoal-500">титул.</span>
                  </>
                ) : (
                  <>
                    <span className="tabular-nums text-right font-bold text-camel-700">{dog.total_shows || 0}</span>
                    <span className="text-[9px] font-normal text-charcoal-500">выст.</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Десктопная раскладка (>= sm) */}
        <div className="hidden sm:flex flex-row items-stretch w-full min-w-0">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 sm:gap-1 overflow-hidden pr-2">
            {/* Кличка собаки */}
            <div className="flex items-center gap-1.5 min-w-0">
              <OwnerCrownName
                name={primary}
                dogId={dog.competition_dog_id ?? null}
                kind="competition"
              >
                <h3
                  className="text-xs sm:text-[13px] font-bold leading-snug text-charcoal-900 truncate"
                  title={secondary ? `${primary} / ${secondary}` : primary}
                >
                  {primary}
                </h3>
              </OwnerCrownName>
            </div>

            {/* Порода собаки под кличкой */}
            <div className="flex items-center gap-1 text-[10.5px] leading-tight">
              <span className="text-charcoal-600 font-medium truncate">
                {breedDisplay.primary}
              </span>
              {breedDisplay.variety && (
                <span className="text-charcoal-400 font-normal shrink-0">
                  {breedDisplay.variety}
                </span>
              )}
              {dog.sex && (
                <>
                  <span className="text-charcoal-300 shrink-0" aria-hidden>
                    ·
                  </span>
                  <DogSexIcon sex={dog.sex} size={11} variant="neutral" strokeWidth={2.25} />
                </>
              )}
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

            {/* Выставочные награды */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
              {completedNormative && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold border border-amber-500/80 bg-amber-50 text-amber-900 shrink-0 leading-none shadow-2xs select-none cursor-default"
                  title={completedNormative.title}
                >
                  {completedNormative.badge}
                </span>
              )}
              {awards.length > 0 ? (
                renderShowAwardChips({
                  titles: dog.titles,
                  keys: awards as any,
                  maxVisible: completedNormative ? 4 : 5,
                  nowrap: true,
                })
              ) : !completedNormative ? (
                <span className="text-[10px] text-charcoal-400">Участник рингов</span>
              ) : null}
            </div>
          </div>

          {/* Правая колонка статистики выставок */}
          <div className="mr-6 sm:mr-7 flex min-h-0 min-w-[5.5rem] sm:min-w-[6.5rem] shrink-0 flex-col justify-center items-end border-l border-old-money-200/60 pl-2.5 sm:pl-3">
            <span className="text-base sm:text-lg font-bold tabular-nums text-camel-700 leading-none">
              {isMonoScope ? monoAwardsCount : dog.total_shows || 0}
            </span>
            <span className="text-[8.5px] sm:text-[9px] uppercase tracking-wide text-charcoal-500 font-medium mt-0.5">
              {isMonoScope ? 'титулов НКП' : 'выставок'}
            </span>
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
    prevProps.dog.rank_score === nextProps.dog.rank_score &&
    prevProps.rank === nextProps.rank &&
    prevProps.dog.overall_rank === nextProps.dog.overall_rank &&
    prevProps.filterYear === nextProps.filterYear &&
    prevProps.filterScope === nextProps.filterScope &&
    prevProps.monoAgeCategory === nextProps.monoAgeCategory &&
    prevProps.dog.name_ru === nextProps.dog.name_ru &&
    prevProps.dog.name_lat === nextProps.dog.name_lat &&
    Boolean(prevProps.favorites?.has(getShowDogFavId(prevProps.dog))) ===
      Boolean(nextProps.favorites?.has(getShowDogFavId(nextProps.dog)))
  )
})

export default ShowDogCardMemo
