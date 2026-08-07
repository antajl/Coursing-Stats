import { Link } from 'react-router-dom'
import { ChevronLeft, Star as StarIcon, Rabbit, Gauge, Sparkles } from 'lucide-react'
import { useState } from 'react'
import OwnerCrownName from '../../components/OwnerCrownName'
import { type DogTitle } from '../../lib/qualificationTitles'
import { renderGroupedDogTitles } from '../../lib/awardChipRender'
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
  onBack: () => void
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

function TitleDomainBlock({ label, titles }: { label: string; titles: DogTitle[] }) {
  if (titles.length === 0) return null
  return (
    <div className="min-w-0 text-center">
      <div className="mb-1.5 text-[11px] font-medium text-old-money-500 dark:text-old-money-400">
        {label}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {renderGroupedDogTitles(titles)}
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
  onBack,
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
    if (val == null) return 'text-charcoal-400 dark:text-charcoal-500'
    if (val <= 3) return 'text-amber-600 dark:text-amber-400 font-semibold'
    if (val <= 4) return 'text-charcoal-700 dark:text-charcoal-300'
    return 'text-charcoal-500 dark:text-charcoal-400'
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
      <button
        type="button"
        onClick={onBack}
        className="relative z-10 mb-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:absolute md:right-full md:top-8 md:mb-0 md:mr-0.5 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
        aria-label="Назад"
        data-export-ignore
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <div className="relative min-w-0 rounded-xl border border-old-money-200/80 bg-white p-5 dark:border-charcoal-600 dark:bg-charcoal-800/50 md:p-8">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <OwnerCrownName name={primary} dogId={dog.id} kind="competition">
                <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
                  {primary}
                </h1>
              </OwnerCrownName>
              {dog.sex && (
                <span className="text-lg font-medium text-charcoal-400 dark:text-charcoal-500">
                  {dog.sex === 'M' ? '♂' : '♀'}
                </span>
              )}
            </div>
            {secondary ? (
              <div className="mt-1 text-base font-medium text-charcoal-400 dark:text-charcoal-500">
                {secondary}
              </div>
            ) : showRuName ? (
              <div className="mt-1 text-base font-medium text-old-money-500 dark:text-old-money-400">
                {dog.name_ru}
              </div>
            ) : null}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <div className="min-w-0">
                <span
                  className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300"
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-camel-700 transition-colors hover:border-camel-400 hover:bg-camel-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:border-camel-600 dark:hover:bg-charcoal-700"
                >
                  <img
                    src={BREED_ARCHIVE_FAVICON}
                    alt=""
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
                    ? 'border-amber-400 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:border-amber-500 dark:hover:bg-amber-900/50'
                    : 'border-old-money-200 bg-white text-camel-700 hover:border-camel-400 hover:bg-camel-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:border-camel-600 dark:hover:bg-charcoal-700'
                }`}
                aria-label={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                title={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                data-export-ignore
              >
                <StarIcon className={`h-3.5 w-3.5 shrink-0 ${favorite ? 'fill-current' : ''}`} aria-hidden />
                {favorite ? 'В избранном' : 'В избранное'}
              </button>
            </div>
          </div>
          {hasRanks ? (
            <div
              className="hidden shrink-0 absolute top-0 right-0 z-10 md:block md:relative md:mt-0 md:ml-4"
              aria-label="Места в рейтингах"
            >
              <div className="px-4 py-2 rounded-lg border border-old-money-200/80 bg-white dark:border-charcoal-600 dark:bg-charcoal-800 md:border-none md:bg-transparent md:p-0 md:rounded-none md:dark:bg-transparent">
                <div className="grid grid-cols-4 gap-1">
                  <div />
                  {['coursing', 'racing', 'shows'].map((key, index) => {
                    const r = ranks.find((rank) => rank.key === key)
                    const icon = key === 'coursing' ? <Rabbit className="h-4 w-4 text-charcoal-400 dark:text-charcoal-500" /> : key === 'racing' ? <Gauge className="h-4 w-4 text-charcoal-400 dark:text-charcoal-500" /> : <Sparkles className="h-4 w-4 text-charcoal-400 dark:text-charcoal-500" />
                    const label = key === 'coursing' ? 'Курсинг' : key === 'racing' ? 'Бега' : 'Выставки'
                    const href = key === 'shows' ? '/shows?tab=ranking&year=' : '/competitions?tab=ranking&year='
                    return (
                      <Link key={key} to={href} className="group">
                        <div className={`flex items-center justify-center gap-1 mb-1 ${index > 0 ? 'border-l border-charcoal-200/10 dark:border-charcoal-600/10 pl-2' : ''}`}>
                          {icon}
                          <div className="text-[10px] font-medium text-charcoal-500 dark:text-charcoal-400 uppercase">
                            {label}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                  <div className="text-[10px] text-charcoal-400 dark:text-charcoal-500 text-right pr-2">Общий</div>
                  {(['coursing', 'racing', 'shows'] as const).map((key, index) => {
                    const r = ranks.find((rank) => rank.key === key)
                    return (
                      <div
                        key={key}
                        className={`h-4 flex items-center justify-end ${index > 0 ? 'border-l border-charcoal-200/10 dark:border-charcoal-600/10 pl-2' : ''}`}
                      >
                        {renderPlace(key, 'overall', r?.rank, r)}
                      </div>
                    )
                  })}
                  <div className="text-[10px] text-charcoal-400 dark:text-charcoal-500 text-right pr-2">За год</div>
                  {(['coursing', 'racing', 'shows'] as const).map((key, index) => {
                    const r = ranks.find((rank) => rank.key === key)
                    return (
                      <div
                        key={key}
                        className={`h-4 flex items-center justify-end ${index > 0 ? 'border-l border-charcoal-200/10 dark:border-charcoal-600/10 pl-2' : ''}`}
                      >
                        {renderPlace(key, 'year', r?.yearRank, r)}
                      </div>
                    )
                  })}
                  <div className="text-[10px] text-charcoal-400 dark:text-charcoal-500 text-right pr-2">Порода</div>
                  {(['coursing', 'racing', 'shows'] as const).map((key, index) => {
                    const r = ranks.find((rank) => rank.key === key)
                    return (
                      <div
                        key={key}
                        className={`h-4 flex items-center justify-end ${index > 0 ? 'border-l border-charcoal-200/10 dark:border-charcoal-600/10 pl-2' : ''}`}
                      >
                        {renderPlace(key, 'breed', r?.breedRank, r)}
                      </div>
                    )
                  })}
                  <div className="text-[10px] text-charcoal-400 dark:text-charcoal-500 text-right pr-2">Пор. за год</div>
                  {(['coursing', 'racing', 'shows'] as const).map((key, index) => {
                    const r = ranks.find((rank) => rank.key === key)
                    return (
                      <div
                        key={key}
                        className={`h-4 flex items-center justify-end ${index > 0 ? 'border-l border-charcoal-200/10 dark:border-charcoal-600/10 pl-2' : ''}`}
                      >
                        {renderPlace(key, 'yearBreed', r?.yearBreedRank, r)}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {hasTitles && (
          <div className="mt-4 border-t border-old-money-100 pt-4 dark:border-charcoal-600">
            <div
              className={
                showTitles.length > 0 && competitionTitles.length > 0
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-0'
                  : 'grid grid-cols-1'
              }
            >
              <TitleDomainBlock label="Курсинг и бега" titles={competitionTitles} />
              {showTitles.length > 0 && competitionTitles.length > 0 ? (
                <div
                  className="hidden w-px self-stretch bg-gradient-to-b from-transparent via-old-money-300 to-transparent dark:via-charcoal-500 md:mx-6 md:block"
                  aria-hidden
                />
              ) : null}
              <TitleDomainBlock label="Выставки" titles={showTitles} />
            </div>
          </div>
        )}

        {dog.owner && (
          <div className="mt-4 border-t border-old-money-100 pt-4 text-sm text-old-money-700 dark:border-charcoal-600 dark:text-old-money-300">
            <span className="font-semibold text-old-money-800 dark:text-old-money-200">Владелец:</span> {dog.owner}
          </div>
        )}
      </div>
    </div>
  )
}
