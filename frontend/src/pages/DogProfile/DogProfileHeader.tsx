import { useState, useMemo } from 'react'
import {
  Star as StarIcon,
  Crown,
  Trophy,
  Medal,
  Award,
  Zap,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import OwnerCrownName from '../../components/OwnerCrownName'
import DogSexIcon from '../../components/DogSexIcon'
import type { DogTitle } from '../../lib/qualificationTitles'
import { DogProfileAwardsBar } from './DogProfileAwardsBar'
import { parseDogName, toDogTitleCase, formatNameWithNonBreakingSpaces } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { useFavorites } from '../../hooks/useFavorites'
import { createLogger } from '../../lib/logging'
import HoverTooltip from '../../components/ui/HoverTooltip'
import DogAggressionBadge from './DogAggressionBadge'
import type { StandingExplainerInput } from './StandingPlaceExplainer'

const profileLogger = createLogger('dog-profile')

const BREED_ARCHIVE_FAVICON = '/assets/icons/breedarchive.webp'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dog: any
  showTitles: DogTitle[]
  competitionTitles: DogTitle[]
  showRuName: boolean
  exporting: boolean
  onBack?: () => void
  onExport: () => void
  ranks?: ProfileHeaderRank[]
  explainers?: {
    coursing?: StandingExplainerInput | null
    racing?: StandingExplainerInput | null
    shows?: StandingExplainerInput | null
  }
}

export function DogProfileHeader({
  dog,
  showTitles,
  competitionTitles,
  showRuName,
  exporting,
  onExport,
  ranks = [],
}: DogProfileHeaderProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const hasTitles = showTitles.length > 0 || competitionTitles.length > 0
  const { isFavorite, toggleFavorite } = useFavorites()
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const dogId = String(dog.id)
  const favorite = isFavorite(dogId)

  const handleToggleFavorite = async () => {
    if (loadingFavorite) return
    setLoadingFavorite(true)
    try {
      await toggleFavorite(dogId)
    } catch (err) {
      profileLogger.error('Failed to toggle favorite', { error: err })
    } finally {
      setLoadingFavorite(false)
    }
  }

  // Достижения и рейтинги
  const achievements = useMemo(() => {
    const items: Array<{
      id: string
      label: string
      sublabel?: string
      icon: React.ReactNode
      color: string
      tooltip: string
    }> = []

    const coursing = ranks.find((r) => r.key === 'coursing')
    const racing = ranks.find((r) => r.key === 'racing')
    const shows = ranks.find((r) => r.key === 'shows')

    // 1. Подиум в породе (курсинг)
    if (coursing?.yearBreedRank === 1) {
      items.push({
        id: 'coursing-breed-1',
        label: 'Топ-1 в породе',
        sublabel: 'Курсинг 2026',
        icon: <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />,
        color: 'bg-amber-50 text-amber-950 border border-amber-300 font-bold shadow-2xs',
        tooltip: '№1 среди всех собак породы в сезоне по курсингу',
      })
    } else if (coursing?.yearBreedRank === 2) {
      items.push({
        id: 'coursing-breed-2',
        label: 'Топ-2 в породе',
        sublabel: 'Курсинг 2026',
        icon: <Medal className="h-3.5 w-3.5 text-slate-500 shrink-0" />,
        color: 'bg-slate-50 text-slate-900 border border-slate-300/90 shadow-2xs',
        tooltip: '№2 среди всех собак породы в сезоне по курсингу',
      })
    } else if (coursing?.yearBreedRank === 3) {
      items.push({
        id: 'coursing-breed-3',
        label: 'Топ-3 в породе',
        sublabel: 'Курсинг 2026',
        icon: <Medal className="h-3.5 w-3.5 text-amber-700 shrink-0" />,
        color: 'bg-orange-50 text-amber-950 border border-amber-300/80 shadow-2xs',
        tooltip: '№3 среди всех собак породы в сезоне по курсингу',
      })
    } else if (coursing?.yearBreedRank && coursing.yearBreedRank <= 5) {
      items.push({
        id: 'coursing-breed-top5',
        label: `Топ-${coursing.yearBreedRank} в породе`,
        sublabel: 'Курсинг 2026',
        icon: <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        color: 'bg-cream-100 text-charcoal-800 border border-old-money-200/90',
        tooltip: `Входит в топ-${coursing.yearBreedRank} собак породы в сезоне`,
      })
    }

    // 2. Бега борзых (рейсинг)
    if (racing?.yearBreedRank && racing.yearBreedRank <= 3) {
      items.push({
        id: 'racing-breed-podium',
        label: `Топ-${racing.yearBreedRank} в бегах`,
        sublabel: 'Рейсинг 2026',
        icon: <Zap className="h-3.5 w-3.5 text-forest-600 shrink-0" />,
        color: 'bg-forest-50 text-forest-900 border border-forest-300 shadow-2xs',
        tooltip: `${racing.yearBreedRank} место в рейтинге по максимальной скорости в бегах`,
      })
    } else if (racing?.yearBreedRank && racing.yearBreedRank <= 5) {
      items.push({
        id: 'racing-breed-top5',
        label: `Топ-${racing.yearBreedRank} в бегах`,
        sublabel: 'Рейсинг 2026',
        icon: <Zap className="h-3.5 w-3.5 text-forest-700 shrink-0" />,
        color: 'bg-forest-50/70 text-forest-800 border border-forest-200',
        tooltip: `Входит в топ-${racing.yearBreedRank} собак породы по скорости в бегах`,
      })
    }

    // 3. Выставки (если топ в породе)
    if (shows?.yearBreedRank && shows.yearBreedRank <= 5) {
      items.push({
        id: 'shows-breed-podium',
        label: `Топ-${shows.yearBreedRank} выставок`,
        sublabel: 'РКФ',
        icon: <Sparkles className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        color: 'bg-cream-100 text-charcoal-800 border border-old-money-200',
        tooltip: `${shows.yearBreedRank} место в рейтинге выставок РКФ в породе`,
      })
    }

    return items
  }, [ranks])

  const formattedPrimary = formatNameWithNonBreakingSpaces(primary)
  const isMale = dog.sex === 'M' || dog.sex?.toLowerCase() === 'кобель'

  return (
    <div className="relative mb-6">
      <div className="relative min-w-0 rounded-2xl border border-old-money-200/80 bg-white p-4 sm:p-5 md:p-6 shadow-2xs">
        
        {/* РЯД 1: Сетка [Кличка (minmax 1fr)] + [Действия (auto)] */}
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 sm:gap-4 items-start">
          {/* Кличка собаки: свободное пространство, никакого сжатия */}
          <div className="min-w-0">
            <OwnerCrownName name={formattedPrimary} dogId={dog.id} kind="competition">
              <h1 className="break-words text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 leading-tight">
                {formattedPrimary}
              </h1>
            </OwnerCrownName>
            {secondary ? (
              <div className="mt-1 text-sm sm:text-base font-medium text-charcoal-400">
                {secondary}
              </div>
            ) : showRuName ? (
              <div className="mt-1 text-sm sm:text-base font-medium text-old-money-500">
                {formatNameWithNonBreakingSpaces(toDogTitleCase(dog.name_ru))}
              </div>
            ) : null}
          </div>

          {/* Действия: компактные кнопки справа вверху (на мобильном переносятся) */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={loadingFavorite}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 min-h-[36px] ${
                favorite
                  ? 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-old-money-200/90 bg-cream-50/60 text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
              }`}
              aria-label={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              title={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <StarIcon className={`h-3.5 w-3.5 shrink-0 ${favorite ? 'fill-current text-amber-500' : 'text-charcoal-400'}`} aria-hidden />
              <span>{favorite ? 'В избранном' : 'В избранное'}</span>
            </button>

            <a
              href={`https://t.me/coursing_stats_bot?start=dog_${dog.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-old-money-200/90 bg-cream-50/60 px-3 py-1.5 text-xs font-semibold text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900 transition-all min-h-[36px]"
              aria-label="Отслеживать собаку в Telegram"
              title="Отслеживать собаку в Telegram: результаты и место в топе"
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

        {/* РЯД 2: Метаданные чистым текстом через точку « · » */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-charcoal-600 font-medium">
          <span className="font-semibold text-charcoal-800">
            {breedDisplay.primary}
          </span>
          
          {dog.sex && (
            <>
              <span className="text-old-money-300 select-none">·</span>
              <span className="inline-flex items-center gap-1">
                <DogSexIcon sex={dog.sex} size={13} />
                <span>{isMale ? 'Кобель' : 'Сука'}</span>
              </span>
            </>
          )}

          {dog.pedigree_url && (
            <>
              <span className="text-old-money-300 select-none">·</span>
              <a
                href={dog.pedigree_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-camel-700 hover:text-camel-900 hover:underline transition-colors"
              >
                <img
                  src={BREED_ARCHIVE_FAVICON}
                  alt=""
                  role="presentation"
                  aria-hidden="true"
                  width={13}
                  height={13}
                  className="h-3 w-3 shrink-0 rounded-sm"
                  loading="lazy"
                  decoding="async"
                />
                <span>Breed Archive</span>
                <ExternalLink className="w-2.5 h-2.5 text-camel-500" aria-hidden />
              </a>
            </>
          )}

          {dog.owner && (
            <>
              <span className="text-old-money-300 select-none">·</span>
              <span>
                <span className="text-charcoal-400">Владелец:</span> {dog.owner}
              </span>
            </>
          )}

          {dog.aggression_count && dog.aggression_count > 0 ? (
            <>
              <span className="text-old-money-300 select-none">·</span>
              <DogAggressionBadge
                count={dog.aggression_count}
                incidents={dog.aggression_incidents}
              />
            </>
          ) : null}
        </div>



        {/* РЯД 3: Титулы слева + Ачивки рейтингов справа в одном блоке */}
        {(hasTitles || achievements.length > 0) && (
          <DogProfileAwardsBar
            competitionTitles={competitionTitles}
            showTitles={showTitles}
            achievements={achievements}
          />
        )}
      </div>
    </div>
  )
}
