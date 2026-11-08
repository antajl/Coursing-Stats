import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Trophy, Gauge, ArrowUpRight, HelpCircle } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, itemPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS, getBreedHubBySlug } from '../../lib/breed-hubs-data'
import { useTopPlacement, useTopSpeed, useSpeedRecordsByBreed } from '../../hooks/useStaticData'

interface TopPlacementItem {
  dog_id: number
  name_ru?: string | null
  name_lat?: string | null
  breed: string
  gold: number
  silver: number
  bronze: number
  total_starts: number
  year: number
}

interface TopSpeedItem {
  dog_id: number
  name_ru?: string | null
  name_lat?: string | null
  breed: string
  best_speed?: number
  avg_speed?: number
  total_starts: number
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

  // Load top dogs for 2026: both speed and placement cascades
  const { data: topSpeedRes, isLoading: speedRankLoading } = useTopSpeed('2026')
  const { data: topPlacementRes, isLoading: placementLoading } = useTopPlacement('2026')

  // Load Donino speed records
  const { data: doninoSpeedRes, isLoading: doninoLoading } = useSpeedRecordsByBreed(
    breedInfo?.canonicalKey || '',
  )

  const topSpeedDogs = useMemo(() => {
    if (!breedInfo || !topSpeedRes?.data?.items) return []
    const key = breedInfo.canonicalKey.toUpperCase()
    return (topSpeedRes.data.items as TopSpeedItem[])
      .filter(
        (d) =>
          (d.breed || '').toUpperCase().includes(key) ||
          key.includes((d.breed || '').toUpperCase()),
      )
      .slice(0, 10)
  }, [breedInfo, topSpeedRes])

  const topPlacementDogs = useMemo(() => {
    if (!breedInfo || !topPlacementRes?.data?.items) return []
    const key = breedInfo.canonicalKey.toUpperCase()
    return (topPlacementRes.data.items as TopPlacementItem[])
      .filter(
        (d) =>
          (d.breed || '').toUpperCase().includes(key) ||
          (d.breed || '').toUpperCase() === key,
      )
      .slice(0, 10)
  }, [breedInfo, topPlacementRes])

  const speedRecords = useMemo(() => {
    if (!breedInfo || !doninoSpeedRes?.data) return []
    const list = Array.isArray(doninoSpeedRes.data)
      ? doninoSpeedRes.data
      : (doninoSpeedRes.data as any)?.records || []
    return (list as SpeedRecordItem[]).slice(0, 6)
  }, [breedInfo, doninoSpeedRes])

  if (!breedInfo) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-serif font-bold text-camel-900 mb-4">Порода не найдена</h1>
        <p className="text-old-money-700 mb-6">
          Пожалуйста, выберите интересующую породу из списка основных беговых пород:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {CORE_BREED_HUBS.map((b) => (
            <Link
              key={b.slug}
              to={`/breeds/${b.slug}/`}
              className="px-3 py-2 text-sm rounded bg-camel-50 text-camel-800 border border-camel-200 hover:bg-camel-100 min-h-[44px] flex items-center"
            >
              {b.nameRu}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const seoTitle = `${breedInfo.nameRu} (${breedInfo.nameLat}) — рейтинг в курсинге, результаты и рекорды`
  const seoDesc = `Всероссийский рейтинг породы ${breedInfo.nameRu} (${breedInfo.nameLat}, ${breedInfo.fci}) в курсинге и бегах борзых: топ сезона по скорости, замеры в Донино (км/ч), протоколы соревнований РКФ и результаты забегов на Coursing Stats.`

  // Speed-first prioritization for leaders section
  const hasSpeedLeaders = topSpeedDogs.length > 0
  const isLeadersLoading = hasSpeedLeaders ? false : speedRankLoading && placementLoading

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonicalUrl={`https://coursing-stats.ru/breeds/${breedInfo.slug}/`}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            itemPageSchema({
              url: `https://coursing-stats.ru/breeds/${breedInfo.slug}/`,
              name: `${breedInfo.nameRu} (${breedInfo.nameLat})`,
              alternateName: [breedInfo.nameLat, breedInfo.nameRu],
              breed: breedInfo.nameRu,
              description: seoDesc,
            }),
          ],
        }}
      />

      {/* Hero Header */}
      <header className="rounded-xl border border-camel-200 bg-white/70 p-5 md:p-8 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-camel-100 text-camel-800 tracking-wide">
                {breedInfo.fci}
              </span>
              <span className="text-xs text-old-money-600 uppercase tracking-wider">
                {breedInfo.nameLat}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-camel-950 tracking-tight">
              {breedInfo.nameRu} в курсинге и бегах
            </h1>
          </div>

          <Link
            to={`/competitions/?tab=ranking&breed=${encodeURIComponent(breedInfo.canonicalKey)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-camel-800 text-white font-medium text-sm hover:bg-camel-900 shadow-sm transition-colors min-h-[44px]"
          >
            <span>Полный рейтинг породы</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-base md:text-lg text-camel-900 font-medium mb-2 leading-relaxed">
          {breedInfo.lead}
        </p>
        <p className="text-sm md:text-base text-old-money-700 leading-relaxed">
          {breedInfo.description}
        </p>
      </header>

      {/* Fast Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leaders Section (Speed First) */}
        <section className="rounded-xl border border-cream-200 bg-white/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-200">
            <h2 className="text-lg font-serif font-bold text-camel-900 flex items-center gap-2">
              {hasSpeedLeaders ? (
                <>
                  <Gauge className="w-5 h-5 text-camel-700" />
                  <span>Лидеры сезона 2026 по скорости</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 text-camel-700" />
                  <span>Лидеры сезона 2026</span>
                </>
              )}
            </h2>
            <Link
              to={
                hasSpeedLeaders
                  ? `/competitions/?tab=ranking&breed=${encodeURIComponent(breedInfo.canonicalKey)}&sort=speed`
                  : `/competitions/?tab=ranking&breed=${encodeURIComponent(breedInfo.canonicalKey)}`
              }
              className="text-xs font-medium text-camel-800 hover:underline flex items-center gap-1"
            >
              <span>Все</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLeadersLoading ? (
            <p className="text-xs text-old-money-600 py-4">Данные сезона загружаются...</p>
          ) : hasSpeedLeaders ? (
            <ol className="divide-y divide-cream-100 text-sm">
              {topSpeedDogs.map((dog, idx) => {
                const name = dog.name_ru || dog.name_lat || 'Собака'
                return (
                  <li key={dog.dog_id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-bold font-sans tabular-nums text-xs text-old-money-500 shrink-0">
                        {idx + 1}
                      </span>
                      <Link
                        to={`/dog/${dog.dog_id}/`}
                        className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate"
                      >
                        {name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-xs shrink-0 text-old-money-600">
                      <span title="Забеги">{dog.total_starts} заб.</span>
                      {dog.best_speed ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded bg-camel-100 text-camel-950 font-semibold font-sans tabular-nums text-xs border border-camel-200 leading-normal"
                          title={
                            dog.avg_speed
                              ? `Лучшая скорость: ${dog.best_speed.toFixed(1)} км/ч, средняя: ${dog.avg_speed.toFixed(1)} км/ч`
                              : `Лучшая скорость: ${dog.best_speed.toFixed(1)} км/ч`
                          }
                        >
                          {dog.best_speed.toFixed(1)} км/ч
                        </span>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          ) : topPlacementDogs.length === 0 ? (
            <p className="text-xs text-old-money-600 py-4">Данные сезона обновляются...</p>
          ) : (
            <ol className="divide-y divide-cream-100 text-sm">
              {topPlacementDogs.map((dog, idx) => {
                const name = dog.name_ru || dog.name_lat || 'Собака'
                return (
                  <li key={dog.dog_id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-bold font-sans tabular-nums text-xs text-old-money-500 shrink-0">
                        {idx + 1}
                      </span>
                      <Link
                        to={`/dog/${dog.dog_id}/`}
                        className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate"
                      >
                        {name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-xs shrink-0 text-old-money-600">
                      <span title="Забеги">{dog.total_starts} заб.</span>
                      {dog.gold > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold font-sans tabular-nums border border-amber-200/60 leading-normal">
                          {dog.gold} зол.
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        {/* Speed Records Section */}
        <section className="rounded-xl border border-cream-200 bg-white/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-200">
            <h2 className="text-lg font-serif font-bold text-camel-900 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-camel-700" />
              <span>Рекорды скорости (Донино)</span>
            </h2>
            <Link
              to="/speed-records/"
              className="text-xs font-medium text-camel-800 hover:underline flex items-center gap-1"
            >
              <span>Таблица</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {doninoLoading ? (
            <p className="text-xs text-old-money-600 py-4">Загрузка замеров скорости...</p>
          ) : speedRecords.length === 0 ? (
            <p className="text-xs text-old-money-600 py-4">
              Замеры полигона Донино для породы обрабатываются...
            </p>
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

      {/* FAQs Section (Compact, Clean, No Spoilers) */}
      {breedInfo.faqs.length > 0 && (
        <section className="rounded-xl border border-cream-200 bg-white/80 p-4 sm:p-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-serif font-bold text-camel-900 flex items-center gap-2 mb-3 pb-2 border-b border-cream-200">
            <HelpCircle className="w-5 h-5 text-camel-700 shrink-0" />
            <span>Частые вопросы о породе {breedInfo.nameRu}</span>
          </h2>

          <div className="divide-y divide-cream-100">
            {breedInfo.faqs.map((faq, i) => (
              <div key={i} className="py-2.5 sm:py-3 first:pt-0 last:pb-0">
                <h3 className="text-xs sm:text-sm font-semibold text-camel-950 mb-1">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-old-money-700 leading-relaxed max-w-4xl">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other Breeds Carousel / Grid */}
      <section className="pt-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-old-money-600 mb-3">
          Другие породы в курсинге
        </h2>
        <div className="flex flex-wrap gap-2">
          {CORE_BREED_HUBS.filter((b) => b.slug !== breedInfo.slug).map((b) => (
            <Link
              key={b.slug}
              to={`/breeds/${b.slug}/`}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-white/80 border border-cream-200 text-old-money-800 hover:border-camel-400 hover:text-camel-900 transition-colors min-h-[44px] flex items-center"
            >
              {b.nameRu}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
