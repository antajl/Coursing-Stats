import { Link } from 'react-router-dom'
import { ArrowRight, Star as StarIcon, Trophy } from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import HoverTooltip from '../../components/ui/HoverTooltip'
import type { DoninoAchievementBadge } from './doninoAchievements'

interface DoninoDogHeaderProps {
  displayName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  dogSex: string
  breedInfo: { primary: string; secondary?: string }
  achievements: DoninoAchievementBadge[]
  favorite: boolean
  loadingFavorite: boolean
  onToggleFavorite: () => void
}

export default function DoninoDogHeader({
  displayName,
  data,
  dogSex,
  breedInfo,
  achievements,
  favorite,
  loadingFavorite,
  onToggleFavorite,
}: DoninoDogHeaderProps) {
  return (
    <div className="relative mb-6">
      <div className="relative min-w-0 rounded-xl border border-old-money-200/80 bg-white p-4 sm:p-5 md:p-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3 sm:gap-4">
          {/* Левая часть: Кличка и пол */}
          <div className="min-w-0 flex-1 xl:min-w-[280px]">
            <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
              <OwnerCrownName name={data?.name} breed={data?.breed} kind="donino">
                <h1 className="break-words text-2xl font-bold tracking-tight text-charcoal-900 md:text-3xl">
                  {displayName}
                </h1>
              </OwnerCrownName>
              {dogSex && <DogSexIcon sex={dogSex} size={20} className="mb-0.5 shrink-0" />}
            </div>
          </div>

          {/* Правая часть: Достижения и награды (подиум Old Money) */}
          {achievements.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 xl:max-w-2xl xl:justify-end">
              {achievements.map((badge) => (
                <HoverTooltip key={badge.id} label={badge.tooltip}>
                  <div
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                    {badge.sublabel && (
                      <span className="font-normal opacity-80">· {badge.sublabel}</span>
                    )}
                  </div>
                </HoverTooltip>
              ))}
            </div>
          )}
        </div>

        {/* Нижняя строка шапки: Порода, Избранное, Ссылка в спорт */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-old-money-100">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-charcoal-700"
              title={
                breedInfo.secondary
                  ? `${breedInfo.primary} — ${breedInfo.secondary}`
                  : breedInfo.primary
              }
            >
              {breedInfo.primary}
            </span>

            {/* Кнопка в избранное */}
            <button
              type="button"
              onClick={onToggleFavorite}
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
              <StarIcon
                className={`h-3.5 w-3.5 shrink-0 ${favorite ? 'fill-current' : ''}`}
                aria-hidden
              />
              <span>{favorite ? 'В избранном' : 'В избранное'}</span>
            </button>

            {/* Ссылка на официальный профиль в спорте при наличии dog_id */}
            {data?.dog_id && (
              <Link
                to={`/dog/${data.dog_id}/`}
                className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3.5 py-1.5 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-300 hover:bg-forest-100"
                title="Перейти в официальный спортивный профиль собаки (соревнования РКФ)"
                data-export-ignore
              >
                <Trophy className="h-3.5 w-3.5 text-forest-600 shrink-0" />
                <span>Профиль в спорте</span>
                <ArrowRight className="h-3 w-3 text-forest-600 shrink-0" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
