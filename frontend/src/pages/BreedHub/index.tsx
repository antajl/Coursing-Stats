import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Trophy, Gauge, ArrowUpRight, HelpCircle } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, itemPageSchema, breadcrumbListSchema, faqPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS, getBreedHubBySlug } from '../../lib/breed-hubs-data'
import { useTopPlacement, useTopSpeed, useSpeedRecordsByBreed } from '../../hooks/useStaticData'
import { parseDogName } from '../../lib/dogName'
import { matchesBreedFilter } from '../../lib/breedMapping'

interface TopPlacementItem {
  dog_id: number
  name_ru?: string | null
  name_lat?: string | null
  breed: string
  gold: number
  silver: number
  bronze: number
  total_starts: number
  year?: number
  year_from?: number
  year_to?: number
  sex?: string
}

interface TopSpeedItem {
  dog_id: number
  name_ru?: string | null
  name_lat?: string | null
  breed: string
  best_speed?: number
  avg_speed?: number
  total_starts: number
  sex?: string
  year_from?: number
  year_to?: number
}

interface SpeedRecordItem {
  breed?: string
  name?: string
  speed_km_h?: number
  date?: string
  track_type?: string
}

export default function BreedHub() {
  const { slug } = useParams<{ slug: string }>()
  const breedInfo = useMemo(() => (slug ? getBreedHubBySlug(slug) : undefined), [slug])

  // Load top dogs: 2026 first, and fallback to all-time
  const { data: topSpeedRes, isLoading: speedRankLoading } = useTopSpeed('2026')
  const { data: topPlacementRes, isLoading: placementLoading } = useTopPlacement('2026')
  const { data: topSpeedAllRes, isLoading: speedAllLoading } = useTopSpeed('all')
  const { data: topPlacementAllRes, isLoading: placementAllLoading } = useTopPlacement('all')

  // Load Donino speed records
  const { data: doninoSpeedRes, isLoading: doninoLoading } = useSpeedRecordsByBreed(
    breedInfo?.canonicalKey || '',
  )

  const topSpeedDogs = useMemo(() => {
    if (!breedInfo || !topSpeedRes?.data?.items) return []
    return (topSpeedRes.data.items as TopSpeedItem[])
      .filter((d) => matchesBreedFilter(d.breed, breedInfo.canonicalKey))
      .slice(0, 10)
  }, [breedInfo, topSpeedRes])

  const topPlacementDogs = useMemo(() => {
    if (!breedInfo || !topPlacementRes?.data?.items) return []
    return (topPlacementRes.data.items as TopPlacementItem[])
      .filter((d) => matchesBreedFilter(d.breed, breedInfo.canonicalKey))
      .slice(0, 10)
  }, [breedInfo, topPlacementRes])

  // Fallback to all-time leaders if 2026 has no data for the breed
  const topSpeedAllDogs = useMemo(() => {
    if (!breedInfo || !topSpeedAllRes?.data?.items) return []
    return (topSpeedAllRes.data.items as TopSpeedItem[])
      .filter((d) => matchesBreedFilter(d.breed, breedInfo.canonicalKey))
      .slice(0, 10)
  }, [breedInfo, topSpeedAllRes])

  const topPlacementAllDogs = useMemo(() => {
    if (!breedInfo || !topPlacementAllRes?.data?.items) return []
    return (topPlacementAllRes.data.items as TopPlacementItem[])
      .filter((d) => matchesBreedFilter(d.breed, breedInfo.canonicalKey))
      .slice(0, 10)
  }, [breedInfo, topPlacementAllRes])

  const speedRecords = useMemo(() => {
    if (!breedInfo || !doninoSpeedRes?.data) return []
    const list = Array.isArray(doninoSpeedRes.data)
      ? doninoSpeedRes.data
      : (doninoSpeedRes.data as any)?.records || []
    return (list as SpeedRecordItem[]).slice(0, 10)
  }, [breedInfo, doninoSpeedRes])

  // Real live database statistics calculated across all-time records
  const breedStats = useMemo(() => {
    if (!breedInfo || !topPlacementAllRes?.data?.items) {
      return { totalDogs: 0, totalStarts: 0, totalGold: 0, yearsSpan: '', maxSpeed: 0 }
    }
    const matchingPlacement = (topPlacementAllRes.data.items as TopPlacementItem[]).filter((d) =>
      matchesBreedFilter(d.breed, breedInfo.canonicalKey),
    )

    let totalStarts = 0
    let totalGold = 0
    let minYear = 9999
    let maxYear = 0

    matchingPlacement.forEach((d) => {
      totalStarts += d.total_starts || 0
      totalGold += d.gold || 0
      if (d.year_from && d.year_from < minYear) minYear = d.year_from
      if (d.year_to && d.year_to > maxYear) maxYear = d.year_to
    })

    let maxSpeed = 0
    if (topSpeedAllRes?.data?.items) {
      const matchingSpeed = (topSpeedAllRes.data.items as TopSpeedItem[]).filter((d) =>
        matchesBreedFilter(d.breed, breedInfo.canonicalKey),
      )
      matchingSpeed.forEach((d) => {
        if (d.best_speed && d.best_speed > maxSpeed) {
          maxSpeed = d.best_speed
        }
      })
    }

    speedRecords.forEach((r) => {
      if (r.speed_km_h && r.speed_km_h > maxSpeed) {
        maxSpeed = r.speed_km_h
      }
    })

    const yearsSpan =
      minYear !== 9999 ? (minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`) : ''

    return {
      totalDogs: matchingPlacement.length,
      totalStarts,
      totalGold,
      yearsSpan,
      maxSpeed,
    }
  }, [breedInfo, topPlacementAllRes, topSpeedAllRes, speedRecords])

  // Cascade hierarchy: 1) 2026 speed -> 2) 2026 placement -> 3) all-time speed -> 4) all-time placement
  const has2026Speed = topSpeedDogs.length > 0
  const has2026Placement = topPlacementDogs.length > 0
  const hasAllSpeed = topSpeedAllDogs.length > 0
  const hasAllPlacement = topPlacementAllDogs.length > 0

  const is2026Active = has2026Speed || has2026Placement
  const isAllTimeFallback = !is2026Active && (hasAllSpeed || hasAllPlacement)

  const isSpeedMode = has2026Speed || (!is2026Active && hasAllSpeed)
  const displayDogs = has2026Speed
    ? topSpeedDogs
    : has2026Placement
    ? topPlacementDogs
    : hasAllSpeed
    ? topSpeedAllDogs
    : topPlacementAllDogs

  const leadersTitle = is2026Active
    ? isSpeedMode
      ? 'Лидеры сезона 2026 по скорости'
      : 'Лидеры сезона 2026'
    : isSpeedMode
    ? 'Лидеры по скорости (все сезоны)'
    : 'Лидеры состязаний (все сезоны)'

  const leadersUrl = is2026Active
    ? isSpeedMode
      ? `/competitions/?tab=ranking&breed=${encodeURIComponent(breedInfo?.canonicalKey || '')}&sort=speed`
      : `/competitions/?tab=ranking&breed=${encodeURIComponent(breedInfo?.canonicalKey || '')}`
    : isSpeedMode
    ? `/competitions/?tab=ranking&breed=${encodeURIComponent(breedInfo?.canonicalKey || '')}&year=all&sort=speed`
    : `/competitions/?tab=ranking&breed=${encodeURIComponent(breedInfo?.canonicalKey || '')}&year=all`

  const isLeadersLoading =
    (speedRankLoading || placementLoading || speedAllLoading || placementAllLoading) &&
    displayDogs.length === 0

  if (!breedInfo) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-serif font-bold text-charcoal-900 mb-3">Порода не найдена</h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mb-6">
          Пожалуйста, выберите интересующую породу из официального каталога беговых пород:
        </p>
        <div className="space-y-4 text-left">
          {([
            { id: 'sighthound', title: 'Борзые (10 группа FCI и национальные породы)' },
            { id: 'primitive', title: 'Примитивные охотничьи породы (5 группа FCI)' },
            { id: 'sport', title: 'Породы в бегах за механической приманкой (БЗМП)' },
            { id: 'open', title: 'Открытый любительский класс' },
          ] as const).map((cat) => {
            const list = CORE_BREED_HUBS.filter((b) => b.category === cat.id)
            if (list.length === 0) return null
            return (
              <div key={cat.id} className="rounded-xl border border-cream-200 bg-white/60 p-3 sm:p-4">
                <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                  {cat.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.map((b) => (
                    <Link
                      key={b.slug}
                      to={`/breeds/${b.slug}/`}
                      className="cs-glass-pill inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                    >
                      {b.nameRu}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const seoTitle = `${breedInfo.nameRu} (${breedInfo.nameLat}) — рейтинг в курсинге, результаты забегов и рекорды | Coursing Stats`
  const seoDesc = `Всероссийский рейтинг породы ${breedInfo.nameRu} (${breedInfo.nameLat}, ${breedInfo.fci}) в курсинге, бегах борзых и БЗМП: результаты забегов, топ сезона по скорости, замеры в Донино (км/ч), протоколы соревнований РКФ и рекорды на Coursing Stats.`
  const seoKeywords = [
    breedInfo.nameRu.toLowerCase(),
    breedInfo.nameLat.toLowerCase(),
    breedInfo.canonicalKey.toLowerCase(),
    `курсинг ${breedInfo.nameRu.toLowerCase()}`,
    `бега ${breedInfo.nameRu.toLowerCase()}`,
    `скорость ${breedInfo.nameRu.toLowerCase()}`,
    `рейтинг ${breedInfo.nameRu.toLowerCase()}`,
    'рекорды донино',
    'бзмп',
    'ркф',
    'fci',
  ].join(', ')

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
        canonicalUrl={`https://coursing-stats.ru/breeds/${breedInfo.slug}/`}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Соревнования', url: '/competitions/' },
              { name: breedInfo.nameRu, url: `/breeds/${breedInfo.slug}/` },
            ]),
            itemPageSchema({
              url: `https://coursing-stats.ru/breeds/${breedInfo.slug}/`,
              name: seoTitle,
              alternateName: [breedInfo.nameLat, breedInfo.nameRu, breedInfo.canonicalKey],
              breed: breedInfo.nameRu,
              description: seoDesc,
            }),
            faqPageSchema(breedInfo.faqs),
          ],
        }}
      />

      {/* Hero Header */}
      <header className="rounded-xl border border-cream-200 bg-white/80 p-4 sm:p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-camel-100 text-camel-900 border border-camel-200/80 tracking-wide">
                {breedInfo.fci}
              </span>
              <span className="text-xs text-charcoal-600 uppercase tracking-wider font-medium">
                {breedInfo.nameLat}
              </span>
              {breedStats.yearsSpan && (
                <span className="text-xs text-charcoal-500 font-sans tabular-nums">
                  · Сезоны {breedStats.yearsSpan}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-900 tracking-tight">
              {breedInfo.nameRu} в курсинге и бегах
            </h1>
          </div>

          <Link
            to={`/competitions/?tab=ranking&breed=${encodeURIComponent(breedInfo.canonicalKey)}`}
            className="cs-glass-pill inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shrink-0 cursor-pointer"
          >
            <span>Полный рейтинг породы</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
          </Link>
        </div>

        <p className="text-xs sm:text-sm font-medium text-charcoal-800 mb-1 leading-relaxed">
          {breedInfo.lead}
        </p>
        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
          {breedInfo.description}
        </p>

        {/* Real Live Database Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3.5 border-t border-cream-200/80 mt-3.5">
          <div className="rounded-lg bg-cream-50/60 border border-cream-200/80 p-2 sm:p-2.5 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-600 mb-0.5">
              Собак в состязаниях
            </div>
            <div className="text-base sm:text-lg font-bold font-sans tabular-nums text-charcoal-900">
              {placementAllLoading ? (
                <span className="text-charcoal-400">...</span>
              ) : (
                breedStats.totalDogs.toLocaleString('ru-RU')
              )}
            </div>
            <div className="text-[10px] text-charcoal-500 mt-0.5 hidden sm:block">
              в базе состязаний
            </div>
          </div>

          <div className="rounded-lg bg-cream-50/60 border border-cream-200/80 p-2 sm:p-2.5 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-600 mb-0.5">
              Всего забегов
            </div>
            <div className="text-base sm:text-lg font-bold font-sans tabular-nums text-charcoal-900">
              {placementAllLoading ? (
                <span className="text-charcoal-400">...</span>
              ) : (
                breedStats.totalStarts.toLocaleString('ru-RU')
              )}
            </div>
            <div className="text-[10px] text-charcoal-500 mt-0.5 hidden sm:block">
              в протоколах состязаний
            </div>
          </div>

          <div className="rounded-lg bg-cream-50/60 border border-cream-200/80 p-2 sm:p-2.5 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-600 mb-0.5">
              Побед (золото)
            </div>
            <div className="text-base sm:text-lg font-bold font-sans tabular-nums text-charcoal-900">
              {placementAllLoading ? (
                <span className="text-charcoal-400">...</span>
              ) : (
                breedStats.totalGold.toLocaleString('ru-RU')
              )}
            </div>
            <div className="text-[10px] text-charcoal-500 mt-0.5 hidden sm:block">
              1-х мест на турнирах
            </div>
          </div>

          <div className="rounded-lg bg-cream-50/60 border border-cream-200/80 p-2 sm:p-2.5 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-600 mb-0.5">
              {breedStats.maxSpeed > 0 ? 'Рекорд скорости' : 'Сезоны состязаний'}
            </div>
            <div className="text-base sm:text-lg font-bold font-sans tabular-nums text-charcoal-900">
              {speedAllLoading || doninoLoading ? (
                <span className="text-charcoal-400">...</span>
              ) : breedStats.maxSpeed > 0 ? (
                `${breedStats.maxSpeed % 1 === 0 ? breedStats.maxSpeed : breedStats.maxSpeed.toFixed(1)} км/ч`
              ) : (
                breedStats.yearsSpan || 'Архив'
              )}
            </div>
            <div className="text-[10px] text-charcoal-500 mt-0.5 hidden sm:block">
              {breedStats.maxSpeed > 0 ? 'полигон и состязания' : 'период активности'}
            </div>
          </div>
        </div>
      </header>

      {/* Live Champions & Speed Records Grid */}
      {speedRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leaders Section */}
          <section className="rounded-xl border border-cream-200 bg-white/80 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-cream-200">
              <h2 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 flex items-center gap-2">
                {isSpeedMode ? (
                  <Gauge className="w-4 h-4 text-camel-700" />
                ) : (
                  <Trophy className="w-4 h-4 text-camel-700" />
                )}
                <span>{leadersTitle}</span>
              </h2>
              <Link
                to={leadersUrl}
                className="text-xs font-semibold text-charcoal-700 hover:text-camel-800 flex items-center gap-1"
              >
                <span>Все</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-camel-600" />
              </Link>
            </div>

            {isAllTimeFallback && (
              <p className="text-[11px] text-old-money-600 mb-3 bg-cream-50/80 rounded px-2.5 py-1.5 border border-cream-200/60 leading-relaxed">
                В сезоне 2026 забегов породы пока не зафиксировано. Показан общий рейтинг за все сезоны состязаний.
              </p>
            )}

            {isLeadersLoading ? (
              <p className="text-xs text-old-money-600 py-4">Данные загружаются...</p>
            ) : displayDogs.length === 0 ? (
              <div className="py-6 text-center text-xs text-old-money-600">
                <p>В официальных состязаниях РКФ забегов породы пока не зафиксировано.</p>
              </div>
            ) : (
              <ol className="divide-y divide-cream-100 text-sm">
                {displayDogs.map((dog, idx) => {
                  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
                  const speedDog = dog as TopSpeedItem
                  const placDog = dog as TopPlacementItem
                  return (
                    <li key={dog.dog_id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 text-center font-bold font-sans tabular-nums text-xs text-old-money-500 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            to={`/dog/${dog.dog_id}/`}
                            className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block"
                          >
                            {primary}
                          </Link>
                          {secondary && (
                            <span className="text-[11px] text-old-money-600 truncate block">
                              {secondary}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs shrink-0 text-old-money-600">
                        <span title="Забеги">{dog.total_starts} заб.</span>
                        {isSpeedMode && speedDog.best_speed ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded bg-camel-100 text-camel-950 font-semibold font-sans tabular-nums text-xs border border-camel-200 leading-normal"
                            title={
                              speedDog.avg_speed
                                ? `Лучшая скорость: ${speedDog.best_speed.toFixed(1)} км/ч, средняя: ${speedDog.avg_speed.toFixed(1)} км/ч`
                                : `Лучшая скорость: ${speedDog.best_speed.toFixed(1)} км/ч`
                            }
                          >
                            {speedDog.best_speed.toFixed(1)} км/ч
                          </span>
                        ) : placDog.gold > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold font-sans tabular-nums border border-amber-200/60 leading-normal">
                            {placDog.gold} зол.
                          </span>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          {/* Speed Records Section */}
          <section className="rounded-xl border border-cream-200 bg-white/80 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-cream-200">
              <h2 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-camel-700" />
                <span>Рекорды скорости (Донино)</span>
              </h2>
              <Link
                to="/speed-records/"
                className="text-xs font-semibold text-charcoal-700 hover:text-camel-800 flex items-center gap-1"
              >
                <span>Таблица</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-camel-600" />
              </Link>
            </div>

            {doninoLoading ? (
              <p className="text-xs text-old-money-600 py-4">Загрузка замеров скорости...</p>
            ) : (
              <ol className="divide-y divide-cream-100 text-sm">
                {speedRecords.map((r, i) => (
                  <li key={`${r.name}-${i}`} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-bold font-sans tabular-nums text-xs text-old-money-500 shrink-0">
                        {i + 1}
                      </span>
                      {r.name && r.breed ? (
                        <Link
                          to={`/donino-dog/${encodeURIComponent(r.name)}/${encodeURIComponent(r.breed)}/`}
                          className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate"
                        >
                          {r.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-camel-950 truncate">{r.name}</span>
                      )}
                      {r.track_type && (
                        <span className="text-xs text-old-money-500 hidden sm:inline">
                          ({r.track_type})
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-sans font-bold tabular-nums text-camel-800">
                        {r.speed_km_h}
                      </span>
                      <span className="text-xs text-old-money-600 ml-1">км/ч</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      ) : (
        /* Full-Width Hall of Fame when Donino has no radar tests for this breed */
        <section className="rounded-xl border border-cream-200 bg-white/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-cream-200">
            <h2 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 flex items-center gap-2">
              {isSpeedMode ? (
                <Gauge className="w-4 h-4 text-camel-700" />
              ) : (
                <Trophy className="w-4 h-4 text-camel-700" />
              )}
              <span>{leadersTitle}</span>
            </h2>
            <Link
              to={leadersUrl}
              className="text-xs font-semibold text-charcoal-700 hover:text-camel-800 flex items-center gap-1"
            >
              <span>Полный рейтинг породы</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-camel-600" />
            </Link>
          </div>

          {isAllTimeFallback && (
            <p className="text-[11px] text-old-money-600 mb-3 bg-cream-50/80 rounded px-2.5 py-1.5 border border-cream-200/60 leading-relaxed">
              В сезоне 2026 забегов породы пока не зафиксировано. Показан общий рейтинг за все сезоны состязаний.
            </p>
          )}

          {isLeadersLoading ? (
            <p className="text-xs text-old-money-600 py-4">Данные загружаются...</p>
          ) : displayDogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-old-money-600">
              <p>В официальных состязаниях РКФ забегов породы пока не зафиксировано.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-cream-200 text-[11px] font-semibold uppercase tracking-wider text-old-money-600">
                      <th className="py-2.5 px-3 w-12 text-center">№</th>
                      <th className="py-2.5 px-3">Собака</th>
                      <th className="py-2.5 px-3 w-28">Пол</th>
                      <th className="py-2.5 px-3 w-32">Сезоны</th>
                      <th className="py-2.5 px-3 w-28 text-right">Забегов</th>
                      <th className="py-2.5 px-3 text-right">
                        {isSpeedMode ? 'Скорость' : 'Награды'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {displayDogs.map((dog, idx) => {
                      const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
                      const speedDog = dog as TopSpeedItem
                      const placDog = dog as TopPlacementItem
                      const sexLabel =
                        dog.sex === 'M' || dog.sex === 'К'
                          ? 'Кобель'
                          : dog.sex === 'F' || dog.sex === 'С'
                          ? 'Сука'
                          : '—'
                      const seasons =
                        dog.year_from && dog.year_to
                          ? dog.year_from === dog.year_to
                            ? `${dog.year_from}`
                            : `${dog.year_from}–${dog.year_to}`
                          : dog.year || '—'

                      return (
                        <tr key={dog.dog_id} className="hover:bg-cream-50/50 transition-colors">
                          <td className="py-3 px-3 text-center font-bold font-sans tabular-nums text-xs text-old-money-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <Link
                              to={`/dog/${dog.dog_id}/`}
                              className="font-medium text-camel-950 hover:text-camel-800 hover:underline block leading-snug"
                            >
                              {primary}
                            </Link>
                            {secondary && (
                              <span className="text-[11px] text-old-money-600 block leading-tight">
                                {secondary}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded border ${
                                sexLabel === 'Кобель'
                                  ? 'bg-sky-50 text-sky-800 border-sky-200/60'
                                  : sexLabel === 'Сука'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200/60'
                                  : 'bg-stone-50 text-stone-600 border-stone-200/60'
                              }`}
                            >
                              {sexLabel}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs font-sans tabular-nums text-old-money-700">
                            {seasons}
                          </td>
                          <td className="py-3 px-3 text-right text-xs font-sans tabular-nums text-old-money-700">
                            {dog.total_starts} заб.
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isSpeedMode && speedDog.best_speed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-camel-100 text-camel-950 font-semibold font-sans tabular-nums text-xs border border-camel-200">
                                {speedDog.best_speed.toFixed(1)} км/ч
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold font-sans tabular-nums">
                                {placDog.gold > 0 && (
                                  <span
                                    className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60"
                                    title="Золото"
                                  >
                                    {placDog.gold} зол.
                                  </span>
                                )}
                                {placDog.silver > 0 && (
                                  <span
                                    className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                    title="Серебро"
                                  >
                                    {placDog.silver} сер.
                                  </span>
                                )}
                                {placDog.bronze > 0 && (
                                  <span
                                    className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200/60"
                                    title="Бронза"
                                  >
                                    {placDog.bronze} бр.
                                  </span>
                                )}
                                {placDog.gold === 0 &&
                                  placDog.silver === 0 &&
                                  placDog.bronze === 0 && (
                                    <span className="text-old-money-400">—</span>
                                  )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <ol className="divide-y divide-cream-100 text-sm sm:hidden">
                {displayDogs.map((dog, idx) => {
                  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
                  const speedDog = dog as TopSpeedItem
                  const placDog = dog as TopPlacementItem
                  return (
                    <li key={dog.dog_id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 text-center font-bold font-sans tabular-nums text-xs text-old-money-500 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            to={`/dog/${dog.dog_id}/`}
                            className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block"
                          >
                            {primary}
                          </Link>
                          {secondary && (
                            <span className="text-[11px] text-old-money-600 truncate block">
                              {secondary}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs shrink-0 text-old-money-600">
                        <span title="Забеги">{dog.total_starts} заб.</span>
                        {isSpeedMode && speedDog.best_speed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-camel-100 text-camel-950 font-semibold font-sans tabular-nums text-xs border border-camel-200">
                            {speedDog.best_speed.toFixed(1)} км/ч
                          </span>
                        ) : placDog.gold > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold font-sans tabular-nums border border-amber-200/60">
                            {placDog.gold} зол.
                          </span>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </>
          )}

          {/* Context footer regarding Donino */}
          <div className="mt-4 pt-3 border-t border-cream-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-old-money-600">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-camel-600 shrink-0" />
              <span>Радарных замеров скорости в Донино для этой породы пока не проводилось.</span>
            </div>
            <Link
              to="/speed-records/"
              className="inline-flex items-center gap-1 font-medium text-camel-800 hover:underline"
            >
              <span>Таблица рекордов скорости всех пород</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      {breedInfo.faqs.length > 0 && (
        <section className="rounded-xl border border-cream-200 bg-white/80 p-4 sm:p-5 shadow-sm">
          <h2 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 flex items-center gap-2 mb-3 pb-2 border-b border-cream-200">
            <HelpCircle className="w-4 h-4 text-camel-700 shrink-0" />
            <span>Частые вопросы о породе {breedInfo.nameRu}</span>
          </h2>

          <div className="divide-y divide-cream-100">
            {breedInfo.faqs.map((faq, i) => (
              <div key={i} className="py-2.5 sm:py-3 first:pt-0 last:pb-0">
                <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 mb-1">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-4xl">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other Breeds Grid */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
          Каталог пород в курсинге и бегах
        </h2>

        <div className="space-y-3">
          {([
            { id: 'sighthound', title: 'Борзые (10 группа FCI и национальные породы)' },
            { id: 'primitive', title: 'Примитивные охотничьи породы (5 группа FCI)' },
            { id: 'sport', title: 'Породы в бегах за механической приманкой (БЗМП)' },
            { id: 'open', title: 'Открытый любительский класс' },
          ] as const).map((cat) => {
            const list = CORE_BREED_HUBS.filter(
              (b) => b.category === cat.id && b.slug !== breedInfo.slug,
            )
            if (list.length === 0) return null
            return (
              <div key={cat.id} className="rounded-xl border border-cream-200 bg-white/60 p-3 sm:p-4">
                <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                  {cat.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.map((b) => (
                    <Link
                      key={b.slug}
                      to={`/breeds/${b.slug}/`}
                      className="cs-glass-pill inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                    >
                      {b.nameRu}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
