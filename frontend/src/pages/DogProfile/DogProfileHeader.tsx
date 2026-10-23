import { Link } from 'react-router-dom'
import {
  Star as StarIcon,
  Rabbit,
  Gauge,
  Sparkles,
  ArrowRight,
  Trophy,
  Medal,
  Award,
  Crown,
  Zap,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import OwnerCrownName from '../../components/OwnerCrownName'
import DogSexIcon from '../../components/DogSexIcon'
import type { DogTitle } from '../../lib/qualificationTitles'
import { DogProfileAwardsBar } from './DogProfileAwardsBar'
import { parseDogName, toDogTitleCase } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { useFavorites } from '../../hooks/useFavorites'
import { createLogger } from '../../lib/logging'
import HoverTooltip from '../../components/ui/HoverTooltip'
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

  const achievements = useMemo(() => {
    const items: Array<{
      id: string
      label: string
      sublabel?: string
      icon: React.ReactNode
      color: string
      tooltip: string
    }> = []

    const coursing = ranks?.find((r) => r.key === 'coursing')
    const racing = ranks?.find((r) => r.key === 'racing')
    const shows = ranks?.find((r) => r.key === 'shows')

    // 1. Подиум в породе (сезон курсинга)
    if (coursing?.yearBreedRank === 1) {
      items.push({
        id: 'coursing-breed-1',
        label: 'Топ-1 в породе',
        sublabel: 'Курсинг 2026',
        icon: <Trophy className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
        color: 'bg-amber-50 text-amber-950 border border-amber-300/90 shadow-2xs',
        tooltip: '№1 среди всех собак породы в сезоне по курсингу',
      })
    } else if (coursing?.yearBreedRank === 2) {
      items.push({
        id: 'coursing-breed-2',
        label: 'Топ-2 в породе',
        sublabel: 'Курсинг 2026',
        icon: <Medal className="h-3.5 w-3.5 text-slate-600 shrink-0" />,
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

    // 2. Подиум в общем рейтинге сезона (курсинг)
    if (coursing?.yearRank === 1) {
      items.push({
        id: 'coursing-overall-1',
        label: 'Топ-1 сезона 2026',
        sublabel: 'Общий зачёт',
        icon: <Crown className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
        color: 'bg-amber-100/90 text-amber-950 border border-amber-400 font-bold shadow-2xs',
        tooltip: 'Абсолютный лидер общего сезона по курсингу среди всех пород',
      })
    } else if (coursing?.yearRank === 2) {
      items.push({
        id: 'coursing-overall-2',
        label: 'Топ-2 сезона 2026',
        sublabel: 'Общий зачёт',
        icon: <Trophy className="h-3.5 w-3.5 text-slate-600 shrink-0" />,
        color: 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold shadow-2xs',
        tooltip: '2 место в общем сезоне по курсингу среди всех пород',
      })
    } else if (coursing?.yearRank === 3) {
      items.push({
        id: 'coursing-overall-3',
        label: 'Топ-3 сезона 2026',
        sublabel: 'Общий зачёт',
        icon: <Trophy className="h-3.5 w-3.5 text-amber-700 shrink-0" />,
        color: 'bg-orange-50 text-amber-950 border border-amber-300 font-semibold shadow-2xs',
        tooltip: '3 место в общем сезоне по курсингу среди всех пород',
      })
    } else if (coursing?.yearRank && coursing.yearRank <= 10) {
      items.push({
        id: 'coursing-overall-top10',
        label: `Топ-${coursing.yearRank} сезона`,
        sublabel: 'Общий зачёт',
        icon: <Award className="h-3.5 w-3.5 text-camel-700 shrink-0" />,
        color: 'bg-cream-100 text-charcoal-800 border border-old-money-200/90',
        tooltip: `Входит в топ-${coursing.yearRank} общего рейтинга сезона`,
      })
    }

    // 3. Бега борзых (рейсинг)
    if (racing?.yearBreedRank && racing.yearBreedRank <= 3) {
      items.push({
        id: 'racing-breed-podium',
        label: `Топ-${racing.yearBreedRank} в бегах`,
        sublabel: 'Рейсинг 2026',
        icon: <Zap className="h-3.5 w-3.5 text-forest-600 shrink-0" />,
        color: 'bg-forest-50 text-forest-900 border border-forest-300 shadow-2xs',
        tooltip: `${racing.yearBreedRank} место в рейтинге по максимальной скорости в бегах`,
      })
    } else if (racing?.yearBreedRank && racing.yearBreedRank <= 10) {
      items.push({
        id: 'racing-breed-top10',
        label: `Топ-${racing.yearBreedRank} в бегах`,
        sublabel: 'Рейсинг 2026',
        icon: <Zap className="h-3.5 w-3.5 text-forest-700 shrink-0" />,
        color: 'bg-forest-50/70 text-forest-800 border border-forest-200',
        tooltip: `Входит в топ-${racing.yearBreedRank} собак породы по скорости в бегах`,
      })
    }

    // 4. Скорость 55+ км/ч (Мастер скорости)
    const rawSpeed = dog?.racing_stats?.best_speed || dog?.best_speed
    const speedVal = rawSpeed ? Number(rawSpeed) : null
    if (speedVal && speedVal >= 55) {
      items.push({
        id: 'speed-master',
        label: 'Мастер скорости',
        sublabel: `${speedVal.toFixed(1)} км/ч`,
        icon: <Zap className="h-3.5 w-3.5 text-sky-600 shrink-0" />,
        color: 'bg-sky-50 text-sky-950 border border-sky-300 shadow-2xs',
        tooltip: `Зафиксирована выдающаяся скорость в бегах: ${speedVal.toFixed(1)} км/ч`,
      })
    }

    // 5. Выставки (если топ в породе)
    if (shows?.yearBreedRank && shows.yearBreedRank <= 3) {
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
  }, [ranks, dog, competitionTitles])

  return (
    <div className="relative mb-6">
      <div className="relative min-w-0 rounded-xl border border-old-money-200/80 bg-white p-4 sm:p-5 md:p-6">
        {/* Верх: Кличка слева + Бейджи рейтингов справа */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <OwnerCrownName name={primary} dogId={dog.id} kind="competition">
              <h1 className="break-words text-2xl font-bold tracking-tight text-charcoal-900 md:text-3xl">
                {primary}
              </h1>
            </OwnerCrownName>
            {secondary ? (
              <div className="mt-1 text-sm sm:text-base font-medium text-charcoal-400">
                {secondary}
              </div>
            ) : showRuName ? (
              <div className="mt-1 text-sm sm:text-base font-medium text-old-money-500">
                {toDogTitleCase(dog.name_ru)}
              </div>
            ) : null}
          </div>

          {achievements.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 lg:justify-end">
              {achievements.map((ach) => (
                <HoverTooltip key={ach.id} label={ach.tooltip} placement="bottom" portal>
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ach.color}`}>
                    {ach.icon}
                    <span>{ach.label}</span>
                    {ach.sublabel && (
                      <span className="text-[10px] font-normal opacity-80">· {ach.sublabel}</span>
                    )}
                  </div>
                </HoverTooltip>
              ))}
            </div>
          )}
        </div>

        {/* Средняя строка: Порода, Пол, Ссылки, Кнопки, и Владелец справа */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-charcoal-700"
              title={
                breedDisplay.secondary
                  ? `${breedDisplay.primary} — ${breedDisplay.secondary}`
                  : breedDisplay.primary
              }
            >
              {breedDisplay.primary}
            </span>

            {dog.sex && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-old-money-200 bg-cream-100 px-3 py-1.5 text-xs sm:text-sm font-semibold text-charcoal-700"
                title={dog.sex === 'M' || dog.sex?.toLowerCase() === 'кобель' ? 'Кобель' : 'Сука'}
              >
                <DogSexIcon sex={dog.sex} size={15} />
                <span>{dog.sex === 'M' || dog.sex?.toLowerCase() === 'кобель' ? 'Кобель' : 'Сука'}</span>
              </span>
            )}

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

          {dog.owner && (
            <div className="text-xs text-charcoal-600 sm:text-right">
              <span className="font-semibold text-charcoal-800">Владелец:</span> {dog.owner}
            </div>
          )}
        </div>

        {/* Нижняя строка: Все титулы и награды собаки (по центру) */}
        {hasTitles && (
          <DogProfileAwardsBar
            competitionTitles={competitionTitles}
            showTitles={showTitles}
          />
        )}
      </div>
    </div>
  )
}
