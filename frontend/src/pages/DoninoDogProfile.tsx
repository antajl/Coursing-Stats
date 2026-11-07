import { useParams, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import {
  dedupeByRecordDate,
  expandCoursingTimeline,
  expandSpeedTimeline,
} from '../lib/recordDates'
import { toDogTitleCase } from '../lib/dogName'
import { displayBreed } from '../lib/breedMapping'
import { useFavorites } from '../hooks/useFavorites'
import { SEO } from '../components/SEO'
import { JsonLd, breadcrumbListSchema, profilePageSchema } from '../components/JsonLd'
import DoninoAttribution from '../components/DoninoAttribution'
import { api } from '../services/api'
import { SegmentedTabs } from '../components/ui/SegmentedTabs'
import { computeDoninoAchievements } from './DoninoDogProfile/doninoAchievements'
import DoninoDogHeader from './DoninoDogProfile/DoninoDogHeader'
import DoninoSpeedSection from './DoninoDogProfile/DoninoSpeedSection'
import DoninoCoursingSection from './DoninoDogProfile/DoninoCoursingSection'

export default function DoninoDogProfile() {
  const { name, breed } = useParams()
  const location = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  const fromCoursingRecords = location.state?.from === 'coursing-records'
  const [mobileTab, setMobileTab] = useState<'speed' | 'coursing'>(() =>
    fromCoursingRecords ? 'coursing' : 'speed'
  )

  useEffect(() => {
    async function fetchDogData() {
      try {
        setLoading(true)
        const result = await api.getDoninoDog(name, breed)

        if (result.success) {
          setData(result.data)
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch dog data')
        }
      } catch (err) {
        setError('Failed to fetch dog data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (name && breed) {
      fetchDogData()
    }
  }, [name, breed])

  // Calculate derived values with useMemo (must be before early returns)
  const hasSpeedRecords = useMemo(() => (data?.speedStats?.total || 0) > 0, [data?.speedStats?.total])
  const hasCoursingRecords = useMemo(() => (data?.coursingStats?.total || 0) > 0, [data?.coursingStats?.total])

  const speedTimeline = useMemo(() => {
    if (!data?.speedRecords) return []
    return expandSpeedTimeline(data.speedRecords)
  }, [data?.speedRecords])

  const uniqueSpeedRecords = useMemo(() => {
    if (speedTimeline.length > 0) return speedTimeline
    if (!data?.speedRecords) return []
    return dedupeByRecordDate(
      data.speedRecords,
      (candidate, existing) => candidate.speed_km_h > existing.speed_km_h
    )
  }, [speedTimeline, data?.speedRecords])

  const coursingTimeline = useMemo(() => {
    if (!data?.coursingRecords) return []
    return expandCoursingTimeline(data.coursingRecords)
  }, [data?.coursingRecords])

  const coursingHistory = useMemo(() => {
    if (coursingTimeline.length > 0) return coursingTimeline
    if (!data?.coursingRecords) return []
    return dedupeByRecordDate(
      data.coursingRecords,
      (candidate, existing) => candidate.time_seconds < existing.time_seconds
    )
  }, [coursingTimeline, data?.coursingRecords])

  const dogSex = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => data?.sex || data?.speedRecords?.find((r: any) => r.sex)?.sex || '',
    [data?.sex, data?.speedRecords]
  )

  useEffect(() => {
    if (!hasSpeedRecords && hasCoursingRecords) {
      setMobileTab('coursing')
    } else if (hasSpeedRecords && !hasCoursingRecords) {
      setMobileTab('speed')
    }
  }, [hasSpeedRecords, hasCoursingRecords])

  const displayName = useMemo(() => toDogTitleCase(data?.name || name || ''), [data?.name, name])
  const breedInfo = useMemo(() => displayBreed(data?.breed || breed || ''), [data?.breed, breed])

  const { isFavorite, toggleFavorite } = useFavorites()
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const favoriteKey = data?.dog_id ? String(data.dog_id) : `donino:${name}:${breed}`
  const favorite = isFavorite(favoriteKey)

  const handleToggleFavorite = async () => {
    try {
      setLoadingFavorite(true)
      await toggleFavorite(favoriteKey, {
        name: displayName,
        breed: data?.breed || breed || '',
      })
    } finally {
      setLoadingFavorite(false)
    }
  }

  // Achievements calculation (Old Money podium palette, max 5)
  const achievements = useMemo(
    () => computeDoninoAchievements(data, uniqueSpeedRecords, coursingHistory),
    [data, uniqueSpeedRecords, coursingHistory]
  )

  // SEO values
  const seoTitle = useMemo(() => `${displayName} — ${breedInfo.primary}`, [displayName, breedInfo.primary])
  const seoFacts = useMemo(() => {
    const facts: string[] = []
    if (hasSpeedRecords && data?.speedStats?.bestSpeed) {
      facts.push(`лучшая скорость ${data.speedStats.bestSpeed.toFixed(1)} км/ч`)
    }
    if (hasCoursingRecords && data?.coursingStats?.bestTime) {
      facts.push(`лучшее время 350 м: ${data.coursingStats.bestTime.toFixed(2)} с`)
    }
    return facts
  }, [hasSpeedRecords, hasCoursingRecords, data?.speedStats?.bestSpeed, data?.coursingStats?.bestTime])

  const seoDescription = useMemo(() => {
    if (seoFacts.length > 0) {
      return `Рекорды Донино: ${displayName} (${breedInfo.primary}). ${seoFacts.join('; ')}.`
    }
    return `Рекорды Донино: ${displayName} (${breedInfo.primary}). Замер скорости и бега борзых 350 м.`
  }, [seoFacts, displayName, breedInfo.primary])

  const seoKeywords = useMemo(
    () => `${displayName}, ${breedInfo.primary}, рекорды Донино, замер скорости, бега борзых, 350 м, курсинг`,
    [displayName, breedInfo.primary],
  )

  const seoCanonical = useMemo(() => {
    if (!name || !breed) return undefined
    return `https://coursing-stats.ru/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}/`
  }, [name, breed])

  // Early returns
  if (loading) {
    return <SkeletonLoader variant="card" count={3} />
  }

  if (error) {
    return <ErrorState title="Ошибка" message={error} onRetry={() => window.location.reload()} />
  }

  if (!data) {
    return <ErrorState title="Данные не найдены" message="Собака не найдена в базе данных" />
  }

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} keywords={seoKeywords} canonicalUrl={seoCanonical} />
      {seoCanonical && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              breadcrumbListSchema([
                { name: 'Главная', url: '/' },
                { name: 'Рекорды Донино', url: '/speed-records/' },
                { name: displayName, url: seoCanonical },
              ]),
              profilePageSchema({
                url: seoCanonical,
                name: displayName,
                breed: breedInfo.primary,
                description: seoDescription,
              }),
            ],
          }}
        />
      )}
      <div ref={exportRef}>
        {/* Шапка профиля */}
        <DoninoDogHeader
          displayName={displayName}
          data={data}
          dogSex={dogSex}
          breedInfo={breedInfo}
          achievements={achievements}
          favorite={favorite}
          loadingFavorite={loadingFavorite}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Мобильный переключатель дисциплин (если есть обе) */}
        {hasSpeedRecords && hasCoursingRecords && (
          <SegmentedTabs
            tabs={[
              { id: 'speed', label: 'Замер скорости', count: uniqueSpeedRecords.length },
              { id: 'coursing', label: 'Бега 350 м', count: coursingHistory.length },
            ]}
            activeTab={mobileTab}
            onChange={setMobileTab}
            ariaLabel="Дисциплины собаки"
            className="mb-4"
          />
        )}

        {/* Статистика и история */}
        {(hasSpeedRecords || hasCoursingRecords) && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:gap-6">
            <DoninoSpeedSection
              hasSpeedRecords={hasSpeedRecords}
              hasCoursingRecords={hasCoursingRecords}
              mobileTab={mobileTab}
              speedStats={data?.speedStats}
              uniqueSpeedRecords={uniqueSpeedRecords}
            />

            <DoninoCoursingSection
              hasSpeedRecords={hasSpeedRecords}
              hasCoursingRecords={hasCoursingRecords}
              mobileTab={mobileTab}
              coursingStats={data?.coursingStats}
              coursingHistory={coursingHistory}
            />
          </div>
        )}

        {!hasSpeedRecords && !hasCoursingRecords && (
          <div className="rounded-xl border border-old-money-200/80 bg-white p-6 text-center">
            <p className="text-old-money-600">Нет записей для этой собаки</p>
          </div>
        )}

        <DoninoAttribution className="mt-6 text-center" />
      </div>
    </>
  )
}
