import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Download, Trophy, Calendar, ExternalLink } from 'lucide-react'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import { getShowDogRanking } from '../../lib/staticData'
import type { ShowDogCardData } from './ShowDogCard'
import {
  SHOW_AWARD_LABELS,
  SHOW_AWARD_ORDER,
  type ShowAwardKey,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'

interface ShowExhibition {
  id: number
  date: string
  title: string
  location: string
  rank: string
  type: string
  club: string
  judges: string[]
  results: any[]
}

export default function ShowDogProfile() {
  const { dogId, breed } = useParams<{ dogId: string; breed: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dog, setDog] = useState<ShowDogCardData | null>(null)
  const [exhibitions, setExhibitions] = useState<ShowExhibition[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!dogId || !breed) {
        setError('ID собаки или порода не указаны')
        setLoading(false)
        return
      }

      setLoading(true)
      // Load all-time ranking to find the dog (since we don't know which year the dog is in)
      const result = await getShowDogRanking()
      if (result.success && result.data) {
        const foundDog = result.data.find(
          (d) => d.id === dogId && d.breed === breed
        )
        if (foundDog) {
          setDog(foundDog)
        } else {
          setError('Собака не найдена')
        }
      } else {
        setError('Не удалось загрузить данные')
      }
      setLoading(false)
    }
    loadData()
  }, [dogId, breed])

  useEffect(() => {
    const loadExhibitions = async () => {
      if (!dogId || !breed) return

      // Load exhibition data to find dog's results
      // This would need a new API endpoint or data structure
      // For now, we'll show basic dog info
    }
    loadExhibitions()
  }, [dogId, breed])

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (error || !dog) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Собака не найдена"
            message={error || `ID: ${dogId}`}
            action={
              <Link
                to="/shows?tab=ranking"
                className="rounded-xl border-2 border-camel-300 bg-white px-4 py-2 text-sm font-semibold text-camel-700 transition-all hover:border-camel-400 hover:bg-camel-50 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:bg-charcoal-700"
              >
                Вернуться к рейтингу
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const awardKeys = SHOW_AWARD_ORDER.filter((key) => dog.titles[key] > 0)
  const totalAwards = awardKeys.reduce((sum, key) => sum + dog.titles[key], 0)

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Шапка профиля */}
        <div className="mb-6 flex items-start gap-1 md:gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 flex-shrink-0 rounded-sm p-1 text-old-money-500 transition-colors hover:text-camel-700 md:mt-8 dark:text-old-money-400 dark:hover:text-camel-400"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 rounded-xl border border-old-money-200/80 bg-white p-5 dark:border-charcoal-600 dark:bg-charcoal-800/50 md:p-8">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
                    {dog.name_lat}
                  </h1>
                  {dog.sex && (
                    <span className="text-lg font-medium text-charcoal-400 dark:text-charcoal-500">
                      {dog.sex === 'M' ? '♂' : '♀'}
                    </span>
                  )}
                </div>
                {dog.name_ru && (
                  <div className="mt-1 text-base font-medium text-old-money-500 dark:text-old-money-400">
                    {dog.name_ru}
                  </div>
                )}
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300">
                    {dog.breed}
                  </span>
                  {dog.breed_group && (
                    <span className="inline-block rounded-full border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-camel-700 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-camel-400">
                      {dog.breed_group}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-old-money-200 bg-white/80 px-4 py-4 dark:border-charcoal-600 dark:bg-charcoal-800/60">
            <div className="font-serif font-bold tabular-nums text-2xl text-charcoal-900 dark:text-charcoal-100">
              {dog.total_shows}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Выставок
            </div>
          </div>
          <div className="rounded-xl border border-old-money-200 bg-white/80 px-4 py-4 dark:border-charcoal-600 dark:bg-charcoal-800/60">
            <div className="font-serif font-bold tabular-nums text-2xl text-charcoal-900 dark:text-charcoal-100">
              {dog.best_placement || '—'}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Лучшее место
            </div>
          </div>
          <div className="rounded-xl border border-old-money-200 bg-white/80 px-4 py-4 dark:border-charcoal-600 dark:bg-charcoal-800/60">
            <div className="font-serif font-bold tabular-nums text-2xl text-charcoal-900 dark:text-charcoal-100">
              {dog.rank_score}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Рейтинг
            </div>
          </div>
          <div className="rounded-xl border border-old-money-200 bg-white/80 px-4 py-4 dark:border-charcoal-600 dark:bg-charcoal-800/60">
            <div className="font-serif font-bold text-2xl text-charcoal-900 dark:text-charcoal-100">
              {dog.best_award || '—'}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Лучшая награда
            </div>
          </div>
        </div>

        {/* Награды */}
        <div className="mb-6 rounded-xl border border-old-money-200 bg-white/70 dark:border-charcoal-600 dark:bg-charcoal-800/30">
          <div className="border-b border-old-money-200 px-5 py-4 dark:border-charcoal-600">
            <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-charcoal-100 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Награды
              <span className="ml-2 text-sm font-normal text-old-money-500 dark:text-old-money-400">
                ({totalAwards})
              </span>
            </h2>
          </div>
          <div className="p-5">
            {awardKeys.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {awardKeys.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3 dark:bg-charcoal-800/40"
                  >
                    <span className="text-sm font-semibold text-charcoal-800 dark:text-charcoal-200">
                      {SHOW_AWARD_LABELS[key]}
                    </span>
                    <span className="font-mono text-lg font-bold text-camel-700 dark:text-camel-400">
                      ×{dog.titles[key]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-old-money-500 dark:text-old-money-400">
                Нет наград
              </p>
            )}
          </div>
        </div>

        {/* История */}
        <div className="rounded-xl border border-old-money-200 bg-white/70 dark:border-charcoal-600 dark:bg-charcoal-800/30">
          <div className="border-b border-old-money-200 px-5 py-4 dark:border-charcoal-600">
            <h2 className="font-serif text-lg font-bold text-charcoal-900 dark:text-charcoal-100 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              История выступлений
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-old-money-500 dark:text-old-money-400">
              История выступлений в разработке. Скоро здесь появится список выставок с результатами.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
