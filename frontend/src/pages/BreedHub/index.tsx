import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Trophy, Gauge, Award, ArrowUpRight, HelpCircle } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { CORE_BREED_HUBS, getBreedHubBySlug } from '../../lib/breed-hubs-data'
import { useTopPlacement, useSpeedRecordsByBreed } from '../../hooks/useStaticData'

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

  // Load top dogs for 2026
  const { data: topRes } = useTopPlacement('2026')
  // Load speed records
  const { data: speedRes } = useSpeedRecordsByBreed(breedInfo?.canonicalKey || '')

  const topDogs = useMemo(() => {
    if (!breedInfo || !topRes?.data?.items) return []
    const key = breedInfo.canonicalKey.toUpperCase()
    return (topRes.data.items as TopPlacementItem[])
      .filter((d) => (d.breed || '').toUpperCase().includes(key) || (d.breed || '').toUpperCase() === key)
      .slice(0, 10)
  }, [breedInfo, topRes])

  const speedRecords = useMemo(() => {
    if (!breedInfo || !speedRes?.data?.records) return []
    return (speedRes.data.records as SpeedRecordItem[]).slice(0, 6)
  }, [breedInfo, speedRes])

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
              to={`/breeds/${b.slug}`}
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
  const seoDesc = `Всероссийский рейтинг породы ${breedInfo.nameRu} (${breedInfo.nameLat}, ${breedInfo.fci}) в курсинге и бегах борзых: топ сезона, замеры скорости в Донино (км/ч), протоколы соревнований РКФ и результаты забегов на Coursing Stats.`

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonicalUrl={`https://coursing-stats.ru/breeds/${breedInfo.slug}/`}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Хлебные крошки" className="text-xs text-old-money-600 flex items-center gap-1.5 pt-1">
        <Link to="/" className="hover:text-camel-800">Главная</Link>
        <span>→</span>
        <Link to="/competitions" className="hover:text-camel-800">Соревнования</Link>
        <span>→</span>
        <span className="text-camel-900 font-medium">{breedInfo.nameRu}</span>
      </nav>

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
            to={`/competitions?tab=ranking&breed=${encodeURIComponent(breedInfo.canonicalKey)}`}
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
        {/* Leaders Section */}
        <section className="rounded-xl border border-cream-200 bg-white/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-200">
            <h2 className="text-lg font-serif font-bold text-camel-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-camel-700" />
              <span>Лидеры сезона 2026</span>
            </h2>
            <Link
              to={`/competitions?tab=ranking&breed=${encodeURIComponent(breedInfo.canonicalKey)}`}
              className="text-xs font-medium text-camel-800 hover:underline flex items-center gap-1"
            >
              <span>Все</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topDogs.length === 0 ? (
            <p className="text-xs text-old-money-600 py-4">Данные сезона обновляются...</p>
          ) : (
            <ol className="divide-y divide-cream-100 text-sm">
              {topDogs.map((dog, idx) => {
                const name = dog.name_ru || dog.name_lat || 'Собака'
                return (
                  <li key={dog.dog_id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-bold text-xs text-old-money-500">
                        {idx + 1}
                      </span>
                      <Link
                        to={`/dog/${dog.dog_id}`}
                        className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate"
                      >
                        {name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-xs shrink-0 text-old-money-600">
                      <span title="Забеги">{dog.total_starts} заб.</span>
                      {dog.gold > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200/60">
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
              to="/speed-records"
              className="text-xs font-medium text-camel-800 hover:underline flex items-center gap-1"
            >
              <span>Таблица</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {speedRecords.length === 0 ? (
            <p className="text-xs text-old-money-600 py-4">Замеры полигона Донино для породы обрабатываются...</p>
          ) : (
            <ul className="divide-y divide-cream-100 text-sm">
              {speedRecords.map((r, i) => (
                <li key={`${r.name}-${i}`} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Award className="w-4 h-4 text-camel-600 shrink-0" />
                    {r.name && r.breed ? (
                      <Link
                        to={`/donino-dog/${encodeURIComponent(r.name)}/${encodeURIComponent(r.breed)}`}
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
                    <span className="text-base font-serif font-bold text-camel-800">
                      {r.speed_km_h}
                    </span>
                    <span className="text-xs text-old-money-600 ml-1">км/ч</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* FAQs Section */}
      {breedInfo.faqs.length > 0 && (
        <section className="rounded-xl border border-cream-200 bg-white/80 p-5 md:p-6 shadow-sm">
          <h2 className="text-lg font-serif font-bold text-camel-900 flex items-center gap-2 mb-4 pb-2 border-b border-cream-200">
            <HelpCircle className="w-5 h-5 text-camel-700" />
            <span>Частые вопросы о породе {breedInfo.nameRu}</span>
          </h2>

          <div className="space-y-4">
            {breedInfo.faqs.map((faq, i) => (
              <div key={i} className="rounded-lg bg-cream-50/50 p-4 border border-cream-100">
                <h3 className="font-medium text-camel-950 text-sm mb-1.5">{faq.question}</h3>
                <p className="text-xs md:text-sm text-old-money-700 leading-relaxed">{faq.answer}</p>
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
              to={`/breeds/${b.slug}`}
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
