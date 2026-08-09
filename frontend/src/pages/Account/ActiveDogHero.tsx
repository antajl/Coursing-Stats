import { Link } from 'react-router-dom'
import { Pin } from 'lucide-react'
import { formatStarts } from '../Home/utils/formatters'
import type { FavoriteDog, FavoriteMedalStats } from './accountFavorites'

function formatSex(sex: string | null): string | null {
  if (!sex) return null
  const s = sex.trim().toUpperCase()
  if (s === 'M' || s === 'MALE' || s === 'К') return '♂'
  if (s === 'F' || s === 'FEMALE' || s === 'С' || s === 'S') return '♀'
  return null
}

function MedalBlock({ stats }: { stats: FavoriteMedalStats }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
          Участий
        </p>
        <p className="mt-0.5 text-xl font-bold tabular-nums text-charcoal-900 dark:text-cream-100">
          {stats.total_starts}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
          Победы
        </p>
        <p className="mt-0.5 text-xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
          {stats.gold}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
          Серебро
        </p>
        <p className="mt-0.5 text-xl font-bold tabular-nums text-charcoal-600 dark:text-charcoal-300">
          {stats.silver}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
          Бронза
        </p>
        <p className="mt-0.5 text-xl font-bold tabular-nums text-amber-900 dark:text-amber-600">
          {stats.bronze}
        </p>
      </div>
    </div>
  )
}

type ActiveDogHeroProps = {
  dog: FavoriteDog
}

export function ActiveDogHero({ dog }: ActiveDogHeroProps) {
  const sex = formatSex(dog.sex)
  const meta = [dog.breedDisplay, sex].filter(Boolean).join(' · ')
  const primaryStats = dog.coursing?.total_starts
    ? dog.coursing
    : dog.racing?.total_starts
      ? dog.racing
      : dog.coursing ?? dog.racing

  return (
    <section className="relative overflow-hidden rounded-xl border border-charcoal-200/80 dark:border-charcoal-700 mb-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.14] dark:opacity-[0.22]"
        style={{ backgroundImage: "url('/assets/hero/background.webp')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-cream-50/95 via-cream-100/90 to-camel-100/70 dark:from-charcoal-900/95 dark:via-charcoal-900/90 dark:to-charcoal-800/80" />

      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-camel-800 dark:text-camel-300 mb-3">
          <Pin className="w-3.5 h-3.5" />
          Главная собака
        </div>

        <Link to={`/dog/${dog.id}`} className="group block">
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-cream-50 group-hover:text-camel-800 dark:group-hover:text-camel-300 transition-colors leading-tight">
            {dog.name_lat}
          </h2>
          {dog.name_ru && dog.name_ru !== dog.name_lat && (
            <p className="mt-1 text-lg text-charcoal-600 dark:text-cream-300">{dog.name_ru}</p>
          )}
        </Link>

        {meta ? (
          <p className="mt-2 text-sm text-charcoal-600 dark:text-cream-300">{meta}</p>
        ) : null}

        <div className="mt-5">
          {primaryStats && primaryStats.total_starts > 0 ? (
            <>
              <MedalBlock stats={primaryStats} />
              {dog.coursing && dog.racing && dog.racing.total_starts > 0 && dog.coursing.total_starts > 0 && (
                <p className="mt-3 text-xs text-charcoal-500 dark:text-charcoal-400">
                  Курсинг: {formatStarts(dog.coursing.total_starts)} · Бега:{' '}
                  {formatStarts(dog.racing.total_starts)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Пока без участий в базе</p>
          )}
        </div>

        <div className="mt-6">
          <Link
            to={`/dog/${dog.id}`}
            className="inline-flex items-center bg-camel-700 hover:bg-camel-800 text-cream-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Открыть профиль →
          </Link>
        </div>
      </div>
    </section>
  )
}
