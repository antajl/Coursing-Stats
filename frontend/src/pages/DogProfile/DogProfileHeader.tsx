import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Star as StarIcon,
  ExternalLink,
  X,
  ArrowUpRight,
  Share2,
  Check,
  Download,
} from 'lucide-react'
import { DogPassportModal } from './components/Passport/DogPassportModal'
import type { DogPassportData } from './components/Passport/passportTypes'
import OwnerCrownName from '../../components/OwnerCrownName'
import DogSexIcon from '../../components/DogSexIcon'
import { isCertificateToken, type DogTitle } from '../../lib/qualificationTitles'
import { DogProfileAwardsBar } from './DogProfileAwardsBar'
import { parseDogName, toDogTitleCase, formatNameWithNonBreakingSpaces } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { getBreedHubByCanonicalKey } from '../../lib/breed-hubs-data'
import { useFavorites } from '../../hooks/useFavorites'
import { createLogger } from '../../lib/logging'
import DogAggressionBadge from './DogAggressionBadge'
import { DogPhotoFrame } from '../../components/DogPhotoFrame'
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
  passportData?: DogPassportData
  showTitles: DogTitle[]
  competitionTitles: DogTitle[]
  supremeTitles?: DogTitle[]
  coursingTitles?: DogTitle[]
  racingTitles?: DogTitle[]
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
  titleExplanations?: Record<string, string>
}

export function DogProfileHeader({
  dog,
  passportData,
  showTitles,
  competitionTitles,
  supremeTitles,
  coursingTitles,
  racingTitles,
  showRuName,
  exporting: _exporting,
  onExport: _onExport,
  ranks: _ranks = [],
  titleExplanations,
}: DogProfileHeaderProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const breedHub = useMemo(
    () => (dog.breed ? getBreedHubByCanonicalKey(dog.breed) : undefined),
    [dog.breed]
  )
  const hasTitles =
    showTitles.some((t) => !isCertificateToken(t.title)) ||
    competitionTitles.some((t) => !isCertificateToken(t.title)) ||
    Boolean(supremeTitles?.some((t) => !isCertificateToken(t.title))) ||
    Boolean(coursingTitles?.some((t) => !isCertificateToken(t.title))) ||
    Boolean(racingTitles?.some((t) => !isCertificateToken(t.title)))
  const { isFavorite, toggleFavorite } = useFavorites()
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const dogId = String(dog.id)
  const favorite = isFavorite(dogId)
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPassportOpen, setIsPassportOpen] = useState(false)

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: primary,
          text: `${primary} — результаты, титулы и статистика на CoursingStats`,
          url,
        })
        return
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      } else if (typeof document !== 'undefined') {
        const input = document.createElement('textarea')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

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
      profileLogger.error('Failed to toggle favorite', err instanceof Error ? err : undefined)
    } finally {
      setLoadingFavorite(false)
    }
  }

  const renderActionButtons = () => (
    <>
      <button
        type="button"
        onClick={handleToggleFavorite}
        disabled={loadingFavorite}
        className={`inline-flex items-center justify-center rounded-xl border transition-all disabled:opacity-50 min-h-[36px] min-w-[36px] h-9 w-9 sm:h-9.5 sm:w-9.5 cursor-pointer shadow-2xs touch-manipulation ${
          favorite
            ? 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100'
            : 'border-old-money-200/90 bg-cream-50/60 text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
        }`}
        aria-label={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        title={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      >
        <StarIcon className={`h-4 w-4 shrink-0 ${favorite ? 'fill-current text-amber-500' : 'text-charcoal-400'}`} aria-hidden />
      </button>

      <a
        href={`https://t.me/coursing_stats_bot?start=dog_${dog.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-xl border border-old-money-200/90 bg-cream-50/60 text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900 transition-all min-h-[36px] min-w-[36px] h-9 w-9 sm:h-9.5 sm:w-9.5 cursor-pointer shadow-2xs touch-manipulation"
        aria-label="Отслеживать собаку в Telegram"
        title="Отслеживать собаку в Telegram: результаты и место в топе"
      >
        <img src={TELEGRAM_FAVICON} alt="" width={16} height={16} className="h-4 w-4 shrink-0 rounded-full" />
      </a>

      {passportData && (
        <button
          type="button"
          onClick={() => setIsPassportOpen(true)}
          className="relative inline-flex items-center justify-center gap-1.5 rounded-full border border-old-money-200/90 bg-cream-50/80 px-3 text-charcoal-800 hover:border-camel-400 hover:bg-cream-100 hover:text-charcoal-950 transition-all min-h-[36px] h-9 sm:h-9.5 cursor-pointer shadow-2xs touch-manipulation before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-[''] md:before:hidden"
          aria-label="Карточка собаки (Паспорт)"
          title="Скачать карточку собаки (A4 или Stories) — Паспорт достижений"
        >
          <Download className="h-3.5 w-3.5 shrink-0 text-camel-700" aria-hidden />
          <span className="text-xs font-semibold whitespace-nowrap">Карточка</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleShare}
        className={`relative inline-flex items-center justify-center rounded-xl border transition-all min-h-[36px] min-w-[36px] h-9 w-9 sm:h-9.5 sm:w-9.5 cursor-pointer shadow-2xs touch-manipulation before:absolute before:-inset-1.5 before:content-[''] md:before:hidden ${
          copied
            ? 'border-forest-400 bg-forest-50 text-forest-800'
            : 'border-old-money-200/90 bg-cream-50/60 text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
        }`}
        aria-label={copied ? 'Ссылка скопирована' : 'Поделиться профилем собаки'}
        title={copied ? 'Ссылка скопирована в буфер обмена' : 'Поделиться профилем собаки'}
      >
        {copied ? (
          <Check className="h-4 w-4 shrink-0 text-forest-600" aria-hidden />
        ) : (
          <Share2 className="h-4 w-4 shrink-0 text-charcoal-500" aria-hidden />
        )}
      </button>
    </>
  )

  const formattedPrimary = formatNameWithNonBreakingSpaces(primary)
  const isMale = dog.sex === 'M' || dog.sex?.toLowerCase() === 'кобель'

  return (
    <div className="relative mb-6">
      {/* Главная карточка профиля собаки */}
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-old-money-200/80 bg-white p-4 sm:p-5 md:p-6 shadow-2xs">
        <div className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-4 sm:gap-6 items-start">
            {/* Слева: Крупный аватар + имя, метаданные и кнопки действий прямо под ними */}
            <div className="flex items-start gap-4 sm:gap-5 md:gap-6 min-w-0">
              <DogPhotoFrame
                photoUrl={dog.photo_url}
                breed={dog.breed}
                name={primary}
                onPhotoClick={() => setIsPhotoOpen(true)}
              />

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
                  {breedHub ? (
                    <Link
                      to={`/breeds/${breedHub.slug}/`}
                      className="font-semibold text-charcoal-800 hover:text-camel-800 hover:underline inline-flex items-center gap-0.5 transition-colors group cursor-pointer"
                      title={`Хаб породы ${breedDisplay.full || breedDisplay.primary}`}
                    >
                      <span>{breedDisplay.primary}</span>
                      {breedDisplay.variety && (
                        <span className="font-normal text-charcoal-500 text-xs ml-1">
                          {breedDisplay.variety}
                        </span>
                      )}
                      <ArrowUpRight className="h-3 w-3 text-camel-600 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden />
                    </Link>
                  ) : (
                    <span className="font-semibold text-charcoal-800">
                      {breedDisplay.primary}
                      {breedDisplay.variety && (
                        <span className="font-normal text-charcoal-500 text-xs ml-1">
                          {breedDisplay.variety}
                        </span>
                      )}
                    </span>
                  )}
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

                {/* РЯД 3: Кнопки действий прямо под кличкой и метаданными */}
                <div className="mt-3.5 flex items-center gap-2">
                  {renderActionButtons()}
                </div>
              </div>
            </div>

            {/* Справа: Блок всех официальных титулов и наград в правом верхнем углу */}
            {hasTitles && (
              <div className="w-full lg:w-auto shrink-0 lg:max-w-md xl:max-w-lg lg:ml-auto pt-3 lg:pt-0 border-t border-cream-200/70 lg:border-t-0">
                <DogProfileAwardsBar
                  supremeTitles={supremeTitles}
                  competitionTitles={competitionTitles}
                  coursingTitles={coursingTitles}
                  racingTitles={racingTitles}
                  showTitles={showTitles}
                  titleExplanations={titleExplanations}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Полноэкранный Lightbox для фото собаки (при клике на аватар) */}
      {isPhotoOpen && dog.photo_url && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/95 select-none animate-in fade-in duration-200"
          style={{ transform: 'translateZ(0)' }}
          role="dialog"
          aria-modal="true"
          aria-label={`Фотография ${primary}`}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault()
          }}
        >
          {/* Полноэкранный кликабельный оверлей для надежного закрытия по тапу в любом месте фона (включая iOS Safari) */}
          <button
            type="button"
            onClick={() => setIsPhotoOpen(false)}
            className="absolute inset-0 h-full w-full cursor-pointer bg-transparent border-none p-0 -z-10 focus:outline-hidden"
            aria-label="Закрыть фото"
            tabIndex={-1}
          />

          {/* Фиксированная кнопка закрытия в правом верхнем углу (с учетом Safe Area на iPhone) */}
          <button
            type="button"
            onClick={() => setIsPhotoOpen(false)}
            className="fixed z-[110] flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-black/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-sm transition-transform active:scale-95 hover:bg-black/95 cursor-pointer min-h-[44px] min-w-[44px]"
            style={{
              top: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
              right: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
            }}
            aria-label="Закрыть фото"
          >
            <X className="h-5 w-5 text-white" aria-hidden />
            <span className="hidden sm:inline">Закрыть</span>
          </button>

          <div
            className="relative max-h-[85dvh] max-w-[95vw] sm:max-w-3xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Полное фото собаки без обрезки */}
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-charcoal-900 shadow-2xl">
              <img
                src={dog.photo_url}
                alt={primary}
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
                className="max-h-[72dvh] sm:max-h-[78dvh] w-auto max-w-full object-contain select-none block"
              />
            </div>

            {/* Подпись под фото в 2 строки: кличка и источник */}
            <div className="mt-3 flex flex-col items-center text-center gap-1 w-full px-2">
              <span className="font-semibold text-sm sm:text-base text-white tracking-tight drop-shadow-sm">
                {primary}
              </span>
              {dog.pedigree_url && (
                <a
                  href={dog.pedigree_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-camel-300 hover:text-white transition-colors underline-offset-2 hover:underline"
                >
                  <span>Источник фото: The Breed Archive</span>
                  <ExternalLink className="h-3.5 w-3.5 text-camel-400" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {isPassportOpen && passportData && (
        <DogPassportModal
          isOpen={isPassportOpen}
          onClose={() => setIsPassportOpen(false)}
          data={passportData}
        />
      )}
    </div>
  )
}
