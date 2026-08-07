import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import OwnerCrownName from '../../components/OwnerCrownName'
import { DOG_CARD_HEIGHT_CLASS } from '../../components/DogCard'
import RankBadge from '../../components/RankBadge'
import { parseDogName } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { showYearBadge } from '../../lib/season'
import { showDogProfilePath } from '../../lib/showDogProfilePath'
import { renderShowAwardChips } from '../../lib/awardChipRender'
import {
  groupShowAwardsByCategory,
  presentShowAwards,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_CATEGORY,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'

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

interface ShowDogCardProps {
  dog: ShowDogCardData
  /** Место в полном рейтинге среза (не позиция в фильтре). */
  rank?: number
  /**
   * Год среза рейтинга (как у DogCard.filterYear).
   * Пусто = все годы → бейдж из history / year_*.
   */
  filterYear?: string
}

/** Оценка ширины чипа «BADGE» / «BADGE ×N» + gap. */
export function estimateShowAwardChipWidth(
  badge: string,
  count: number,
  showCounts = true,
): number {
  const label = showCounts ? `${badge}×${count}` : badge
  // Чуть с запасом: text-[10px] + padding + gap
  return Math.ceil(label.length * 6.6 + 16 + 4)
}

/** Сколько наград влезает в budget px (с учётом `+N`). */
export function maxShowAwardsForWidth(
  width: number,
  titles: ShowTitleCounts,
  awards: ReturnType<typeof presentShowAwards>,
  opts?: { showCounts?: boolean },
): number {
  if (awards.length === 0 || width <= 0) return awards.length
  const showCounts = opts?.showCounts !== false
  const groups = groupShowAwardsByCategory(awards)
  const flat = groups.flatMap((g) => g.keys)
  const sepW = 8
  const plusW = 36
  const budget = width

  let used = 0
  let count = 0
  let prevCat: string | null = null
  for (const key of flat) {
    const cat = SHOW_AWARD_CATEGORY[key]
    const chip = estimateShowAwardChipWidth(
      SHOW_AWARD_BADGE[key],
      titles[key] || 0,
      showCounts,
    )
    const sep = prevCat && prevCat !== cat ? sepW : 0
    const next = used + sep + chip
    const remaining = flat.length - count - 1
    if (remaining > 0 && next + plusW > budget) break
    if (remaining === 0 && next > budget) break
    used = next
    prevCat = cat
    count++
  }
  return Math.max(count, Math.min(2, flat.length))
}

function ShowAwardsRow({
  titles,
  totalShows,
  rank,
}: {
  titles: ShowTitleCounts
  totalShows: number
  rank?: number
}) {
  const awards = presentShowAwards(titles)
  const rowRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  // 0 до первого measure — иначе все чипы раздувают карточку и RO видит «бесконечную» ширину
  const [maxVisible, setMaxVisible] = useState(0)

  const awardKey = awards.join(',')

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row || awards.length === 0) {
      setMaxVisible(0)
      return
    }

    const update = () => {
      const statsW = statsRef.current?.offsetWidth ?? 64
      // row padding (px-2.5×2) + gap между чипами и колонкой
      const budget = Math.max(0, row.clientWidth - statsW - 20 - 8)
      setMaxVisible(maxShowAwardsForWidth(budget, titles, awards))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(row)
    return () => ro.disconnect()
    // awardKey стабилизирует список ключей без новой ссылки на массив каждый рендер
  }, [awardKey, titles])

  return (
    <div
      ref={rowRef}
      className="flex items-center justify-between text-xs w-full overflow-hidden"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {rank != null && rank > 0 && <div className="w-7 shrink-0"></div>}
        <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
          {awards.length > 0 ? (
            renderShowAwardChips({ titles, maxVisible, nowrap: true })
          ) : (
            <span className="text-[10px] text-charcoal-400 dark:text-charcoal-500">Нет наград</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-charcoal-500 dark:text-charcoal-400">Выставки:</span>
        <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
          {totalShows || 0}
        </span>
      </div>
    </div>
  )
}

export default function ShowDogCard({ dog, rank, filterYear = '' }: ShowDogCardProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const yearBadge = showYearBadge(dog, filterYear)

  const href = showDogProfilePath(dog)

  return (
    <Link
      to={href}
      className={`relative grid min-w-0 w-full ${DOG_CARD_HEIGHT_CLASS} grid-rows-[auto_auto] gap-0 overflow-hidden border-b border-old-money-200 bg-white py-1.5 px-4 transition-colors duration-200 hover:bg-camel-100/60 dark:border-charcoal-600 dark:bg-charcoal-800 dark:hover:bg-camel-900/30 first:rounded-t-xl last:rounded-b-xl last:border-b-0`}
    >
      <div className="flex items-center gap-2 w-full overflow-hidden">
        {/* Rank badge on the left */}
        {rank != null && rank > 0 && (
          <RankBadge rank={rank} />
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Dog name */}
          <OwnerCrownName
            name={primary}
            dogId={dog.competition_dog_id ?? null}
            kind="competition"
          >
            <h3
              className="text-xs font-bold leading-snug text-charcoal-900 dark:text-charcoal-100"
              title={secondary ? `${primary} / ${secondary}` : primary}
            >
              {primary}
            </h3>
          </OwnerCrownName>

          {/* Breed and year as subtitle */}
          <div className="flex items-center gap-1 text-[9px]">
            <span className="text-charcoal-500 dark:text-charcoal-400">
              {breedDisplay.primary}
            </span>
            {yearBadge && (
              <>
                <span className="text-charcoal-300 dark:text-charcoal-600" aria-hidden>
                  ·
                </span>
                <span className="text-charcoal-500 dark:text-charcoal-400">
                  {yearBadge.label}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <ShowAwardsRow titles={dog.titles} totalShows={dog.total_shows} rank={rank} />
    </Link>
  )
}
