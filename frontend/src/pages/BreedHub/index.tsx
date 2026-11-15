import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Trophy, Gauge, ArrowUpRight, HelpCircle } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, itemPageSchema, breadcrumbListSchema, faqPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS, getBreedHubBySlug } from '../../lib/breed-hubs-data'
import {
  useTopPlacement,
  useTopSpeed,
  useSpeedRecordsByBreed,
  useBreedAnnualLeaders,
  type AnnualDogLeader,
} from '../../hooks/useStaticData'
import { parseDogName } from '../../lib/dogName'
import { matchesBreedFilter } from '../../lib/breedMapping'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'

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

  // Load all-time aggregates for database statistics
  const { data: topPlacementAllRes, isLoading: placementAllLoading } = useTopPlacement('all')
  const { data: topSpeedAllRes, isLoading: speedAllLoading } = useTopSpeed('all')

  // Load Donino speed records
  const { data: doninoSpeedRes, isLoading: doninoLoading } = useSpeedRecordsByBreed(
    breedInfo?.canonicalKey || '',
  )

  // Load annual champions history (2015-2026)
  const { data: annualLeadersRes, isLoading: annualLeadersLoading } = useBreedAnnualLeaders()
  const annualLeaders = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.leaders_by_slug) return []
    return (annualLeadersRes.data.leaders_by_slug[slug] || []) as AnnualDogLeader[]
  }, [slug, annualLeadersRes])

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
    if (speedRecords.length > 0) {
      speedRecords.forEach((r) => {
        if (r.speed_km_h && r.speed_km_h > maxSpeed) maxSpeed = r.speed_km_h
      })
    }

    if (topSpeedAllRes?.data?.items) {
      const matchingSpeed = (topSpeedAllRes.data.items as any[]).filter((d) =>
        matchesBreedFilter(d.breed, breedInfo.canonicalKey),
      )
      matchingSpeed.forEach((d) => {
        if (d.best_speed && d.best_speed > maxSpeed) maxSpeed = d.best_speed
      })
    }

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

  const seoTitle = `${breedInfo.nameRu} (${breedInfo.nameLat}) — лучшие собаки по годам, результаты забегов и рекорды | Coursing Stats`
  const seoDesc = `Персональный хаб породы ${breedInfo.nameRu} (${breedInfo.nameLat}) в курсинге, бегах борзых и БЗМП: зал славы чемпионов по годам с 2015 года, замеры скорости в Донино (км/ч), статистика побед и регламент состязаний.`
  const seoKeywords = [
    breedInfo.nameRu.toLowerCase(),
    breedInfo.nameLat.toLowerCase(),
    breedInfo.canonicalKey.toLowerCase(),
    `курсинг ${breedInfo.nameRu.toLowerCase()}`,
    `бега ${breedInfo.nameRu.toLowerCase()}`,
    `скорость ${breedInfo.nameRu.toLowerCase()}`,
    `рейтинг ${breedInfo.nameRu.toLowerCase()}`,
    `чемпионы ${breedInfo.nameRu.toLowerCase()}`,
  ].join(', ')

  return (
    <div className="max-w-full mx-auto pb-6 space-y-4 sm:space-y-5">
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
              { name: 'Породы', url: '/breeds/' },
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

      {/* Breed Profile Card: стиль Old Money как в карточке судьи и профиле собаки */}
      <div className="cs-glass-card rounded-2xl border border-old-money-200/80 bg-white p-4 sm:p-6 md:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center rounded-md border border-camel-200/90 bg-cream-100/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-camel-800 shrink-0">
                {breedInfo.fci}
              </span>
              <span className="text-xs text-charcoal-500 font-sans tracking-wide">
                {breedInfo.nameLat}
              </span>
              {breedStats.yearsSpan && (
                <span className="text-xs text-charcoal-400 font-sans tabular-nums hidden sm:inline">
                  · Сезоны {breedStats.yearsSpan}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-charcoal-900 tracking-tight">
              {breedInfo.nameRu}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/competitions/ranking/2026/?breed=${encodeURIComponent(breedInfo.canonicalKey)}`}
              className="cs-glass-pill inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shrink-0 cursor-pointer text-charcoal-700 hover:text-camel-800"
              title={`Полный официальный рейтинг породы ${breedInfo.nameRu}`}
            >
              <Trophy className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span>Рейтинг соревнований</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-charcoal-400" aria-hidden />
            </Link>
          </div>
        </div>

        <p className="text-xs sm:text-sm font-medium text-charcoal-800 mb-1 leading-relaxed max-w-4xl">
          {breedInfo.lead}
        </p>
        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-4xl">
          {breedInfo.description}
        </p>

        {/* Real Live Database Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3.5 border-t border-old-money-200/60 mt-3.5">
          <div className="rounded-xl bg-cream-100/70 border border-old-money-200/50 p-2 sm:p-2.5 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
              Собак в состязаниях
            </div>
            <div className="text-base sm:text-lg font-bold font-sans tabular-nums text-charcoal-900">
              {placementAllLoading ? (
                <span className="text-charcoal-400">…</span>
              ) : (
                breedStats.totalDogs.toLocaleString('ru-RU')
              )}
            </div>
            <div className="text-[10px] text-charcoal-500 mt-0.5 hidden sm:block">
              в базе состязаний
            </div>
          </div>

          <div className="rounded-xl bg-cream-100/70 border border-old-money-200/50 p-2 sm:p-2.5 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
              Всего забегов
            </div>
            <div className="text-base sm:text-lg font-bold font-sans tabular-nums text-charcoal-900">
              {placementAllLoading ? (
                <span className="text-charcoal-400">…</span>
              ) : (
                breedStats.totalStarts.toLocaleString('ru-RU')
              )}
            </div>
            <div className="text-[10px] text-charcoal-500 mt-0.5 hidden sm:block">
              в протоколах состязаний
            </div>
          </div>

          <div className="rounded-xl bg-cream-100/70 border border-old-money-200/50 p-2 sm:p-2.5 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
              Побед (золото)
            </div>
            <div className="text-base sm:text-lg font-bold font-sans tabular-nums text-camel-800">
              {placementAllLoading ? (
                <span className="text-charcoal-400">…</span>
              ) : (
                breedStats.totalGold.toLocaleString('ru-RU')
              )}
            </div>
            <div className="text-[10px] text-charcoal-500 mt-0.5 hidden sm:block">
              1-х мест на турнирах
            </div>
          </div>

          <div className="rounded-xl bg-cream-100/70 border border-old-money-200/50 p-2 sm:p-2.5 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500 mb-0.5">
              {breedStats.maxSpeed > 0 ? 'Рекорд скорости' : 'Сезоны состязаний'}
            </div>
            <div className="text-base sm:text-lg font-bold font-sans tabular-nums text-charcoal-900">
              {speedAllLoading || doninoLoading ? (
                <span className="text-charcoal-400">…</span>
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
      </div>

      {/* Зал славы: лучшая собака породы по годам (2015–2026) */}
      <DoninoColumnShell
        plaque={
          <DoninoColumnPlaque
            asHeader
            title={
              <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
                <Trophy className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                <span>Лучшая собака породы по годам</span>
                {annualLeaders.length > 0 && (
                  <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
                    · {annualLeaders.length} {annualLeaders.length === 1 ? 'сезон' : annualLeaders.length < 5 ? 'сезона' : 'сезонов'} (2015–2026)
                  </span>
                )}
              </span>
            }
            actionPlacement="right"
            action={
              <Link
                to={`/competitions/ranking/2026/?breed=${encodeURIComponent(breedInfo.canonicalKey)}`}
                className="cs-glass-pill inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-charcoal-700 hover:text-camel-800 cursor-pointer shrink-0"
              >
                <span>Полный рейтинг</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
              </Link>
            }
          />
        }
      >
        {annualLeadersLoading ? (
          <p className="text-xs text-old-money-600 py-6 text-center">Загрузка архива по годам…</p>
        ) : annualLeaders.length === 0 ? (
          <div className="py-8 text-center text-xs text-old-money-600">
            <p>В официальных протоколах состязаний РКФ с 2015 года забегов породы пока не зафиксировано.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-old-money-200/60 bg-cream-50/50 text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
                    <th className="py-2.5 px-3.5 w-20 text-center">Сезон</th>
                    <th className="py-2.5 px-3.5">Лучшая собака года</th>
                    <th className="py-2.5 px-3 w-24">Пол</th>
                    <th className="py-2.5 px-3 w-24 text-right">Забегов</th>
                    <th className="py-2.5 px-3.5 w-36 text-right">Медали сезона</th>
                    <th className="py-2.5 px-3.5 w-28 text-right">Показатель</th>
                    <th className="py-2.5 px-3.5 w-24 text-right">Рейтинг</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-old-money-100">
                  {annualLeaders.map((item) => {
                    const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
                    const isMale = item.sex === 'M' || item.sex === 'К'
                    const isFemale = item.sex === 'F' || item.sex === 'С'
                    const sexLabel = isMale ? 'Кобель' : isFemale ? 'Сука' : '—'

                    return (
                      <tr key={item.year} className="hover:bg-cream-50/60 transition-colors">
                        <td className="py-3 px-3.5 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 text-camel-950 border border-camel-200/80">
                            {item.year}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <Link
                            to={`/dog/${item.dog_id}/`}
                            className="font-medium text-camel-950 hover:text-camel-800 hover:underline block leading-snug"
                          >
                            {primary}
                          </Link>
                          {secondary && (
                            <span className="text-[11px] text-charcoal-500 block leading-tight">
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
                        <td className="py-3 px-3 text-right text-xs font-sans tabular-nums text-charcoal-700">
                          {item.total_starts} заб.
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 text-xs font-semibold font-sans tabular-nums">
                            {item.gold > 0 && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60"
                                title="Золотые медали"
                              >
                                {item.gold} зол.
                              </span>
                            )}
                            {item.silver > 0 && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                title="Серебряные медали"
                              >
                                {item.silver} сер.
                              </span>
                            )}
                            {item.bronze > 0 && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200/60"
                                title="Бронзовые медали"
                              >
                                {item.bronze} бр.
                              </span>
                            )}
                            {item.gold === 0 && item.silver === 0 && item.bronze === 0 && (
                              <span className="text-charcoal-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          {item.best_speed ? (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded bg-camel-100 text-camel-950 font-semibold font-sans tabular-nums text-xs border border-camel-200"
                              title="Максимальная скорость в сезоне"
                            >
                              {item.best_speed.toFixed(1)} км/ч
                            </span>
                          ) : item.rating_score ? (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-cream-100 text-charcoal-700 font-sans tabular-nums text-xs border border-cream-200"
                              title="Рейтинг качества CS"
                            >
                              {item.rating_score.toFixed(1)} CS
                            </span>
                          ) : (
                            <span className="text-charcoal-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <Link
                            to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(breedInfo.canonicalKey)}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 hover:underline"
                            title={`Открыть полный рейтинг ${breedInfo.nameRu} за ${item.year} год`}
                          >
                            <span>{item.year}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <ol className="divide-y divide-old-money-100 text-sm sm:hidden p-1">
              {annualLeaders.map((item) => {
                const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
                const isMale = item.sex === 'M' || item.sex === 'К'
                const isFemale = item.sex === 'F' || item.sex === 'С'
                const sexLabel = isMale ? 'Кобель' : isFemale ? 'Сука' : ''

                return (
                  <li key={item.year} className="p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 text-camel-950 border border-camel-200/80 shrink-0">
                          {item.year}
                        </span>
                        <Link
                          to={`/dog/${item.dog_id}/`}
                          className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate"
                        >
                          {primary}
                        </Link>
                      </div>
                      <Link
                        to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(breedInfo.canonicalKey)}`}
                        className="text-xs font-semibold text-camel-800 hover:underline shrink-0 flex items-center gap-0.5"
                      >
                        <span>Рейтинг</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {secondary && (
                      <div className="text-[11px] text-charcoal-500 truncate pl-1">
                        {secondary}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-600 pt-0.5">
                      {sexLabel && <span>{sexLabel}</span>}
                      {sexLabel && <span className="text-old-money-300">·</span>}
                      <span>{item.total_starts} заб.</span>
                      {item.gold > 0 && (
                        <>
                          <span className="text-old-money-300">·</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-semibold font-sans tabular-nums border border-amber-200/60">
                            {item.gold} зол.
                          </span>
                        </>
                      )}
                      {item.best_speed && (
                        <>
                          <span className="text-old-money-300">·</span>
                          <span className="px-1.5 py-0.2 rounded bg-camel-100 text-camel-950 font-semibold font-sans tabular-nums border border-camel-200">
                            {item.best_speed.toFixed(1)} км/ч
                          </span>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </DoninoColumnShell>

      {/* Рекорды скорости в Донино (если есть замеры) */}
      {speedRecords.length > 0 && (
        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title={
                <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
                  <Gauge className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                  <span>Рекорды скорости (Донино)</span>
                  <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
                    · {speedRecords.length} лучших замеров
                  </span>
                </span>
              }
              actionPlacement="right"
              action={
                <Link
                  to="/speed-records/"
                  className="cs-glass-pill inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-charcoal-700 hover:text-camel-800 cursor-pointer shrink-0"
                >
                  <span>Все рекорды</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
                </Link>
              }
            />
          }
          bodyClassName="flex flex-col divide-y divide-old-money-100"
        >
          {doninoLoading ? (
            <p className="text-xs text-old-money-600 py-6 text-center">Загрузка замеров скорости…</p>
          ) : (
            <ol className="divide-y divide-old-money-100 text-sm">
              {speedRecords.map((r, i) => (
                <li
                  key={`${r.name}-${i}`}
                  className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 hover:bg-cream-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center font-bold font-sans tabular-nums text-xs text-old-money-500 shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      {r.name && r.breed ? (
                        <Link
                          to={`/donino-dog/${encodeURIComponent(r.name)}/${encodeURIComponent(r.breed)}/`}
                          className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block"
                        >
                          {r.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-camel-950 truncate block">{r.name}</span>
                      )}
                      {r.track_type && (
                        <span className="text-xs text-charcoal-500 block">
                          Трасса: {r.track_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-lg font-sans font-bold tabular-nums text-camel-800">
                      {r.speed_km_h}
                    </span>
                    <span className="text-xs text-charcoal-600 ml-1">км/ч</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </DoninoColumnShell>
      )}

      {/* Частые вопросы о породе в спорте */}
      {breedInfo.faqs.length > 0 && (
        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title={
                <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
                  <HelpCircle className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                  <span>Частые вопросы и регламент состязаний</span>
                  <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
                    · {breedInfo.nameRu}
                  </span>
                </span>
              }
            />
          }
          bodyClassName="flex flex-col divide-y divide-old-money-100"
        >
          {breedInfo.faqs.map((faq, i) => (
            <div key={i} className="p-3.5 sm:p-4 hover:bg-cream-50/50 transition-colors">
              <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 mb-1">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-4xl">
                {faq.answer}
              </p>
            </div>
          ))}
        </DoninoColumnShell>
      )}

      {/* Переход к другим породам */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            Каталог пород в курсинге и бегах
          </h2>
          <Link
            to="/breeds/"
            className="cs-glass-pill inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-camel-800 hover:text-camel-950 cursor-pointer"
          >
            <span>Все 83 породы</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {([
            { id: 'sighthound', title: 'Борзые (10 группа FCI)' },
            { id: 'primitive', title: 'Примитивные (5 группа FCI)' },
            { id: 'sport', title: 'Спорт БЗМП' },
            { id: 'open', title: 'Любительский класс' },
          ] as const).map((cat) => {
            const list = CORE_BREED_HUBS.filter(
              (b) => b.category === cat.id && b.slug !== breedInfo.slug,
            )
            if (list.length === 0) return null
            return (
              <div
                key={cat.id}
                className="cs-glass-card rounded-xl border border-old-money-200/70 bg-white/90 p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                    {cat.title}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.slice(0, 5).map((b) => (
                      <Link
                        key={b.slug}
                        to={`/breeds/${b.slug}/`}
                        className="cs-glass-pill inline-flex h-7 shrink-0 items-center rounded-full px-2 text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap text-charcoal-700 hover:text-camel-800"
                      >
                        {b.nameRu}
                      </Link>
                    ))}
                    {list.length > 5 && (
                      <Link
                        to="/breeds/"
                        className="text-[11px] text-camel-700 font-semibold px-1 py-1 hover:underline"
                      >
                        +{list.length - 5}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
