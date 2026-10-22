import { Link } from 'react-router-dom'
import { Star as StarIcon, Rabbit, Gauge, Sparkles, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import OwnerCrownName from '../../components/OwnerCrownName'
import type { DogTitle } from '../../lib/qualificationTitles'
import { DogProfileAwardsBar } from './DogProfileAwardsBar'
import { parseDogName } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { useFavorites } from '../../hooks/useFavorites'
import { createLogger } from '../../lib/logging'
import StandingPlaceButton, {
  type RankDomain,
  type StandingExplainerInput,
  type StandingExplainerScope,
} from './StandingPlaceExplainer'

const profileLogger = createLogger('dog-profile')

/** Локальная копия favicon Breed Archive (см. public/assets/icons/). */
const BREED_ARCHIVE_FAVICON = '/assets/icons/breedarchive.webp'
/** Официальный favicon Telegram (см. public/assets/icons/). */
const TELEGRAM_FAVICON = '/assets/icons/telegram.svg'

export type ProfileHeaderRank = {
  key: 'coursing' | 'racing' | 'shows'
  label: string
  rank: number | null
  href: string
  yearRank?: number
  breedRank?: number
  yearBreedRank?: number
}

type DogProfileHeaderProps = {
  // Dog profile payload from static indexes (loosely typed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dog: any
  /** Титулы выставок (красота). */
  showTitles: DogTitle[]
  /** Титулы курсинга / БЗМП / бегов. */
  competitionTitles: DogTitle[]
  showRuName: boolean
  exporting: boolean
  onBack?: () => void
  onExport: () => void
  /** Места во всевременных рейтингах — показываем любые 1–3 из трёх. */
  ranks?: ProfileHeaderRank[]
  /** Данные для «почему это место» по колонкам. */
  explainers?: {
    coursing?: StandingExplainerInput | null
    racing?: StandingExplainerInput | null
    shows?: StandingExplainerInput | null
  }
}

function DogStandingHonorCard({
  ranks,
  renderPlace,
  dogBreed,
}: {
  ranks: ProfileHeaderRank[]
  renderPlace: (
    domain: RankDomain,
    scope: StandingExplainerScope,
    value: number | null | undefined,
    row: ProfileHeaderRank | undefined,
  ) => React.ReactNode
  dogBreed?: string
}) {
  const activeRanks = ranks.filter(
    (r) => r.rank != null || r.yearRank != null || r.breedRank != null || r.yearBreedRank != null,
  )

  if (activeRanks.length === 0) return null

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-old-money-200/90 bg-cream-50/70 p-3 shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b border-old-money-200/60 pb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
          Место в рейтинге
        </span>
        <span className="text-[10px] text-old-money-500">
          сезон / всё время
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {activeRanks.map((r) => {
          const icon =
            r.key === 'coursing' ? (
              <Rabbit className="h-4 w-4 text-camel-700" />
            ) : r.key === 'racing' ? (
              <Gauge className="h-4 w-4 text-camel-700" />
            ) : (
              <Sparkles className="h-4 w-4 text-camel-700" />
            )

          const label =
            r.key === 'coursing' ? 'Курсинг' : r.key === 'racing' ? 'Бега' : 'Выставки'

          const rankingLink =
            r.key === 'shows'
              ? `/shows?tab=ranking${dogBreed ? `&breed=${encodeURIComponent(dogBreed)}` : ''}`
              : `/competitions?tab=ranking${dogBreed ? `&breed=${encodeURIComponent(dogBreed)}` : ''}`

          return (
            <div
              key={r.key}
              className="group relative flex flex-col justify-between rounded-lg border border-old-money-200/70 bg-white p-2.5 transition-all hover:border-camel-400 hover:shadow-xs"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {icon}
                  <span className="text-xs font-bold text-charcoal-800">{label}</span>
                </div>
                <Link
                  to={rankingLink}
                  className="inline-flex items-center text-[10px] font-medium text-camel-700 hover:text-camel-900 group-hover:underline"
                  title={`Открыть рейтинг: ${label}`}
                >
                  <span>Топ</span>
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Link>
              </div>

              {/* Порода (сезонная и общая) */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-charcoal-500">В породе:</span>
                  <div className="flex items-center gap-1.5 font-semibold">
                    {r.yearBreedRank != null ? (
                      <span className="text-camel-800">
                        {renderPlace(r.key, 'yearBreed', r.yearBreedRank, r)}
                        <span className="text-[9px] font-normal text-charcoal-400 ml-0.5">год</span>
                      </span>
                    ) : null}
                    {r.breedRank != null ? (
                      <span className="text-charcoal-600">
                        {renderPlace(r.key, 'breed', r.breedRank, r)}
                        <span className="text-[9px] font-normal text-charcoal-400 ml-0.5">все</span>
                      </span>
                    ) : null}
                    {r.yearBreedRank == null && r.breedRank == null && (
                      <span className="text-charcoal-400">—</span>
                    )}
                  </div>
                </div>

                {/* Общий зачёт */}
                <div className="flex items-center justify-between text-[10px] text-charcoal-400 border-t border-old-money-100 pt-1">
                  <span>Общий:</span>
                  <div className="flex items-center gap-1.5">
                    {r.yearRank != null ? (
                      <span>
                        {renderPlace(r.key, 'year', r.yearRank, r)}
                        <span className="text-[9px] text-charcoal-400 ml-0.5">год</span>
                      </span>
                    ) : null}
                    {r.rank != null ? (
                      <span>
                        {renderPlace(r.key, 'overall', r.rank, r)}
                        <span className="text-[9px] text-charcoal-400 ml-0.5">все</span>
                      </span>
                    ) : null}
                    {r.yearRank == null && r.rank == null && (
                      <span>—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DogProfileHeader({
  dog,
  showTitles,
  competitionTitles,
  showRuName,
  exporting,
  onExport,
  ranks = [],
  explainers = {},
}: DogProfileHeaderProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const hasTitles = showTitles.length > 0 || competitionTitles.length > 0
  const hasRanks = ranks.length > 0
  const { isFavorite, toggleFavorite } = useFavorites()
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const dogId = String(dog.id)
  const favorite = isFavorite(dogId)

  const rankColor = (val: number | null | undefined) => {
    if (val == null) return 'text-charcoal-400'
    if (val <= 3) return 'text-amber-600 font-semibold'
    if (val <= 4) return 'text-charcoal-700'
    return 'text-charcoal-500'
  }

  const renderPlace = (
    domain: RankDomain,
    scope: StandingExplainerScope,
    value: number | null | undefined,
    row: ProfileHeaderRank | undefined,
  ) => {
    const base = explainers[domain]
    if (base && value != null) {
      return (
        <StandingPlaceButton
          value={value}
          domain={domain}
          scope={scope}
          className={`text-[11px] tabular-nums ${rankColor(value)}`}
          data={{
            ...base,
            rank: row?.rank,
            yearRank: row?.yearRank,
            breedRank: row?.breedRank,
            yearBreedRank: row?.yearBreedRank,
          }}
        />
      )
    }
    return (
      <span className={`text-[11px] tabular-nums ${rankColor(value)}`}>
        {value != null ? `#${value}` : '—'}
      </span>
    )
  }

  const handleToggleFavorite = async () => {
    profileLogger.info('Favorite toggle initiated', { dogId, isFavorite: favorite })
    setLoadingFavorite(true)
    try {
      await toggleFavorite(dogId, { name: primary, breed: dog.breed || '' })
      profileLogger.info(favorite ? 'Favorite removed' : 'Favorite added', { dogId })
    } catch (error) {
      profileLogger.error('Failed to toggle favorite', error as Error, { dogId, isFavorite: favorite })
    } finally {
      setLoadingFavorite(false)
    }
  }

  return (
    <div className="relative mb-6">
      <div className="relative min-w-0 rounded-xl border border-old-money-200/80 bg-white p-4 sm:p-5 md:p-8">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <OwnerCrownName name={primary} dogId={dog.id} kind="competition">
                <h1 className="break-words text-2xl font-bold tracking-tight text-charcoal-900 md:text-3xl">
                  {primary}
                </h1>
              </OwnerCrownName>
              {dog.sex && (
                <span className="text-lg font-medium text-charcoal-400">
                  {dog.sex === 'M' ? '♂' : '♀'}
                </span>
              )}
            </div>
            {secondary ? (
              <div className="mt-1 text-base font-medium text-charcoal-400">
                {secondary}
              </div>
            ) : showRuName ? (
              <div className="mt-1 text-base font-medium text-old-money-500">
                {dog.name_ru}
              </div>
            ) : null}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <div className="min-w-0">
                <span
                  className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-4 py-1.5 text-sm font-semibold text-charcoal-700"
                  title={
                    breedDisplay.secondary
                      ? `${breedDisplay.primary} — ${breedDisplay.secondary}`
                      : breedDisplay.primary
                  }
                >
                  {breedDisplay.primary}
                </span>
              </div>
              {dog.pedigree_url && (
                <a
                  href={dog.pedigree_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-camel-700 transition-colors hover:border-camel-400 hover:bg-camel-50"
                >
                  <img
                    src={BREED_ARCHIVE_FAVICON}
                    alt=""
                    role="presentation"
                    aria-hidden="true"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 shrink-0 rounded-sm"
                    loading="lazy"
                    decoding="async"
                  />
                  Breed Archive
                </a>
              )}
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={loadingFavorite}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  favorite
                    ? 'border-amber-400 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100'
                    : 'border-old-money-200 bg-white text-camel-700 hover:border-camel-400 hover:bg-camel-50'
                }`}
                aria-label={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                title={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                data-export-ignore
              >
                <StarIcon className={`h-3.5 w-3.5 shrink-0 ${favorite ? 'fill-current' : ''}`} aria-hidden />
                {favorite ? 'В избранном' : 'В избранное'}
              </button>
              <a
                href={`https://t.me/coursing_stats_bot?start=dog_${dog.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-camel-700 transition-colors hover:border-camel-400 hover:bg-camel-50"
                aria-label="Отслеживать собаку в Telegram"
                title="Отслеживать собаку в Telegram: результаты и место в топе"
                data-export-ignore
              >
                <img
                  src={TELEGRAM_FAVICON}
                  alt=""
                  role="presentation"
                  aria-hidden="true"
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  loading="lazy"
                  decoding="async"
                />
                <span>Отслеживать</span>
              </a>
            </div>
          </div>
        </div>

        {hasRanks ? (
          <div className="mt-4" aria-label="Места в рейтингах">
            <DogStandingHonorCard
              ranks={ranks}
              renderPlace={renderPlace}
              dogBreed={dog.breed}
            />
          </div>
        ) : null}

        {hasTitles && (
          <DogProfileAwardsBar
            competitionTitles={competitionTitles}
            showTitles={showTitles}
          />
        )}

        {dog.owner && (
          <div className="mt-4 border-t border-old-money-100 pt-4 text-sm text-old-money-700">
            <span className="font-semibold text-old-money-800">Владелец:</span> {dog.owner}
          </div>
        )}
      </div>
    </div>
  )
}
