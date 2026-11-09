import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Star as StarIcon,
  Crown,
  Trophy,
  Medal,
  Award,
  Zap,
  Sparkles,
  ExternalLink,
  Maximize2,
  X,
} from 'lucide-react'
import OwnerCrownName from '../../components/OwnerCrownName'
import DogSexIcon from '../../components/DogSexIcon'
import { isCertificateToken, type DogTitle } from '../../lib/qualificationTitles'
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
  const hasTitles =
    showTitles.some((t) => !isCertificateToken(t.title)) ||
    competitionTitles.some((t) => !isCertificateToken(t.title))
  const { isFavorite, toggleFavorite } = useFavorites()
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const dogId = String(dog.id)
  const favorite = isFavorite(dogId)
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [photoVariant, setPhotoVariant] = useState<'passport' | 'split_right' | 'bottom_card' | 'cover_banner'>('passport')

  useEffect(() => {
    if (!isPhotoOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPhotoOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPhotoOpen])

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
        icon: <Crown className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
        color: 'text-charcoal-900',
        tooltip: '№1 среди всех собак породы в сезоне по курсингу',
      })
    } else if (coursing?.yearBreedRank === 2) {
      items.push({
        id: 'coursing-breed-2',
        label: 'Топ-2 в породе',
        sublabel: 'Курсинг 2026',
        icon: <Medal className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        color: 'text-charcoal-900',
        tooltip: '№2 среди всех собак породы в сезоне по курсингу',
      })
    } else if (coursing?.yearBreedRank === 3) {
      items.push({
        id: 'coursing-breed-3',
        label: 'Топ-3 в породе',
        sublabel: 'Курсинг 2026',
        icon: <Medal className="h-3.5 w-3.5 text-amber-700 shrink-0" />,
        color: 'text-charcoal-900',
        tooltip: '№3 среди всех собак породы в сезоне по курсингу',
      })
    } else if (coursing?.yearBreedRank && coursing.yearBreedRank <= 5) {
      items.push({
        id: 'coursing-breed-top5',
        label: `Топ-${coursing.yearBreedRank} в породе`,
        sublabel: 'Курсинг 2026',
        icon: <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        color: 'text-charcoal-800',
        tooltip: `Входит в топ-${coursing.yearBreedRank} собак породы в сезоне`,
      })
    }

    // 2. Бега борзых (рейсинг)
    if (racing?.yearBreedRank && racing.yearBreedRank <= 3) {
      items.push({
        id: 'racing-breed-podium',
        label: `Топ-${racing.yearBreedRank} в бегах`,
        sublabel: 'Рейсинг 2026',
        icon: <Zap className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        color: 'text-charcoal-900',
        tooltip: `${racing.yearBreedRank} место в рейтинге по максимальной скорости в бегах`,
      })
    } else if (racing?.yearBreedRank && racing.yearBreedRank <= 5) {
      items.push({
        id: 'racing-breed-top5',
        label: `Топ-${racing.yearBreedRank} в бегах`,
        sublabel: 'Рейсинг 2026',
        icon: <Zap className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        color: 'text-charcoal-800',
        tooltip: `Входит в топ-${racing.yearBreedRank} собак породы по скорости в бегах`,
      })
    }

    // 3. Выставки (если топ в породе)
    const showRank = shows?.yearBreedRank || shows?.breedRank
    if (showRank && showRank <= 5) {
      items.push({
        id: 'shows-breed-podium',
        label: `Топ-${showRank} выставок`,
        sublabel: 'РКФ',
        icon: <Sparkles className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        color: 'text-charcoal-800',
        tooltip: `${showRank} место в рейтинге выставок РКФ в породе`,
      })
    }

    return items
  }, [ranks])

  const formattedPrimary = formatNameWithNonBreakingSpaces(primary)
  const isMale = dog.sex === 'M' || dog.sex?.toLowerCase() === 'кобель'

  return (
    <div className="relative mb-6">
      {/* Главная карточка профиля собаки (Вариант 1: Паспортный аватар слева) */}
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-old-money-200/80 bg-white p-4 sm:p-5 md:p-6 shadow-2xs">
        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 sm:gap-6 items-start">
            {/* Слева: Крупный аватар с закруглёнными углами + имя и метаданные */}
            <div className="flex items-start gap-4 sm:gap-5 md:gap-6 min-w-0">
              {dog.photo_url && (
                <button
                  type="button"
                  onClick={() => setIsPhotoOpen(true)}
                  className="group relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-2xl border border-cream-200/90 bg-cream-50/60 shadow-xs transition-all hover:border-camel-400 hover:shadow-sm focus-visible:outline-hidden cursor-pointer"
                  aria-label={`Увеличить фото ${primary}`}
                  title="Нажмите, чтобы открыть фото в полном размере"
                >
                  <img
                    src={dog.photo_url}
                    alt={primary}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.parentElement) target.parentElement.style.display = 'none';
                    }}
                  />
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded-md bg-charcoal-900/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs">
                    <Maximize2 className="h-3 w-3" aria-hidden />
                  </span>
                </button>
              )}

              <div className="min-w-0 flex-1">
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

                {/* РЯД 2: Метаданные чистым текстом через точку « · » */}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-charcoal-600 font-medium">
                  <span className="font-semibold text-charcoal-800">{breedDisplay.primary}</span>
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
                          width={13}
                          height={13}
                          className="h-3 w-3 shrink-0 rounded-sm"
                          loading="lazy"
                          decoding="async"
                        />
                        <span>Breed Archive</span>
                      </a>
                    </>
                  )}
                  {dog.aggression_count ? (
                    <>
                      <span className="text-old-money-300 select-none">·</span>
                      <DogAggressionBadge
                        count={dog.aggression_count}
                        incidents={dog.aggression_incidents}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Справа: Компактные кнопки действий */}
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
                <img src={TELEGRAM_FAVICON} alt="" width={14} height={14} className="h-3.5 w-3.5 shrink-0 rounded-full" />
                <span>Отслеживать</span>
              </a>
            </div>
          </div>

          {/* РЯД 3: Титулы слева + Ачивки рейтингов справа в одном блоке */}
          {(hasTitles || achievements.length > 0) && (
            <div className="mt-4 pt-3.5 border-t border-cream-200/70">
              <DogProfileAwardsBar
                competitionTitles={competitionTitles}
                showTitles={showTitles}
                achievements={achievements}
              />
            </div>
          )}
        </div>
      </div>

      {/* Полноэкранный Lightbox для фото собаки (при клике на аватар) */}
      {isPhotoOpen && dog.photo_url && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal-950/85 p-4 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsPhotoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Фотография ${primary}`}
        >
          <div
            className="relative max-h-[92vh] max-w-[95vw] sm:max-w-3xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              type="button"
              onClick={() => setIsPhotoOpen(false)}
              className="absolute -top-12 right-0 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/30 backdrop-blur-xs transition-colors cursor-pointer min-h-[36px]"
              aria-label="Закрыть фото"
            >
              <X className="h-4 w-4" aria-hidden />
              <span>Закрыть (Esc)</span>
            </button>

            {/* Полное фото собаки без обрезки */}
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-charcoal-900 shadow-2xl">
              <img
                src={dog.photo_url}
                alt={primary}
                referrerPolicy="no-referrer"
                className="max-h-[78vh] w-auto max-w-full object-contain select-none"
              />
            </div>

            {/* Подпись под фото */}
            <div className="mt-3 flex items-center justify-between w-full text-xs text-white/80 px-1">
              <span className="font-medium text-white">{primary}</span>
              {dog.pedigree_url && (
                <a
                  href={dog.pedigree_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-camel-300 hover:text-white transition-colors"
                >
                  <span>The Breed Archive</span>
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
