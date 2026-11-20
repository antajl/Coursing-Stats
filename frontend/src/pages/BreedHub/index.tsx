import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Trophy, ArrowUpRight, HelpCircle, ChevronLeft } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, itemPageSchema, breadcrumbListSchema, faqPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS, getBreedHubBySlug } from '../../lib/breed-hubs-data'
import { time350ToSpeedKmh } from '../../lib/recordDates'
import {
  useTopPlacement,
  useTopSpeed,
  useSpeedRecordsByBreed,
  useCoursingRecordsByBreed,
  useBreedAnnualLeaders,
  type AnnualDogLeader,
} from '../../hooks/useStaticData'
import { matchesBreedFilter } from '../../lib/breedMapping'
import { getBreedArchiveUrl } from '../../lib/breedArchive'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import BreedHubColumns, { type SpeedRecordItem } from './BreedHubColumns'

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

export default function BreedHub() {
  const { slug } = useParams<{ slug: string }>()
  const breedInfo = useMemo(() => (slug ? getBreedHubBySlug(slug) : undefined), [slug])

  // Ссылка на международную базу родословных The Breed Archive (если поддерживается для породы)
  const breedArchiveUrl = useMemo(
    () => (breedInfo ? getBreedArchiveUrl(breedInfo.slug) || getBreedArchiveUrl(breedInfo.canonicalKey) : null),
    [breedInfo],
  )

  // Load all-time aggregates for database statistics
  const { data: topPlacementAllRes, isLoading: placementAllLoading } = useTopPlacement('all')
  const { data: topSpeedAllRes, isLoading: speedAllLoading } = useTopSpeed('all')

  // Load Donino speed records and coursing 350m records
  const { data: doninoSpeedRes, isLoading: doninoSpeedLoading } = useSpeedRecordsByBreed(
    breedInfo?.canonicalKey || '',
  )
  const { data: doninoCoursingRes, isLoading: doninoCoursingLoading } = useCoursingRecordsByBreed(
    breedInfo?.canonicalKey || '',
  )
  const doninoLoading = doninoSpeedLoading || doninoCoursingLoading

  // Load annual champions history (2015-2026)
  const { data: annualLeadersRes, isLoading: annualLeadersLoading } = useBreedAnnualLeaders()
  const coursingLeaders = useMemo(() => {
    if (!slug) return []
    const bySlug = annualLeadersRes?.data?.coursing_by_slug || annualLeadersRes?.data?.leaders_by_slug
    if (!bySlug) return []
    return (bySlug[slug] || []) as AnnualDogLeader[]
  }, [slug, annualLeadersRes])

  const racingLeaders = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.racing_by_slug) return []
    return (annualLeadersRes.data.racing_by_slug[slug] || []) as AnnualDogLeader[]
  }, [slug, annualLeadersRes])

  const annualLeaders = useMemo(() => {
    if (!slug || !annualLeadersRes?.data?.leaders_by_slug) return []
    return (annualLeadersRes.data.leaders_by_slug[slug] || []) as AnnualDogLeader[]
  }, [slug, annualLeadersRes])

  const speedRecords = useMemo(() => {
    if (!breedInfo) return []
    const speedList: SpeedRecordItem[] = Array.isArray(doninoSpeedRes?.data)
      ? doninoSpeedRes.data
      : (doninoSpeedRes?.data as any)?.records || []
    const coursingList: any[] = Array.isArray(doninoCoursingRes?.data)
      ? doninoCoursingRes.data
      : (doninoCoursingRes?.data as any)?.records || []

    const map = new Map<string, SpeedRecordItem & { best_speed?: number }>()

    // 1. Радарные замеры максимальной скорости на прямой
    for (const s of speedList) {
      const normName = (s.name || '').trim().toLowerCase()
      if (!normName) continue
      map.set(normName, {
        ...s,
        mode: 'speed',
        speed_km_h: s.speed_km_h,
        best_speed: s.speed_km_h,
      })
    }

    // 2. Объединяем с бегами 350 м (пересчёт времени в скорость по формуле полигона: 350 / t * 3.6)
    for (const c of coursingList) {
      const normName = (c.name || '').trim().toLowerCase()
      if (!normName) continue
      const speedFromTime = c.time_seconds ? time350ToSpeedKmh(c.time_seconds) : 0
      if (map.has(normName)) {
        const existing = map.get(normName)!
        if (c.time_seconds) existing.time_seconds = c.time_seconds
        if (speedFromTime > (existing.best_speed || 0)) {
          existing.best_speed = speedFromTime
        }
      } else {
        map.set(normName, {
          name: c.name,
          breed: c.breed || breedInfo.canonicalKey,
          sex: c.sex,
          date: c.date,
          status: c.status,
          history: c.history,
          speed_km_h: speedFromTime,
          best_speed: speedFromTime,
          time_seconds: c.time_seconds,
          screenshot_url: c.screenshot_url,
          track_type: c.track_type || '350 м',
          mode: 'coursing',
        })
      }
    }

    return Array.from(map.values())
      .sort((a, b) => (b.best_speed || b.speed_km_h || 0) - (a.best_speed || a.speed_km_h || 0))
      .slice(0, 15)
  }, [breedInfo, doninoSpeedRes, doninoCoursingRes])

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
          Пожалуйста, выберите интересующую породу из каталога беговых пород:
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

  const seoTitle = `${breedInfo.nameRu} (${breedInfo.nameLat}) — лучшие собаки по годам, результаты забегов и рекорды | Курсинг Статс`
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
              <Link
                to="/breeds/"
                className="cs-glass-pill inline-flex h-6 items-center gap-1 rounded-full px-2 text-[10.5px] font-semibold text-charcoal-700 hover:text-camel-800 cursor-pointer"
                title="Вернуться в каталог пород"
              >
                <ChevronLeft className="h-3 w-3" />
                <span>Каталог пород</span>
              </Link>
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

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              to={`/competitions/ranking/2026/?breed=${breedInfo.slug}`}
              className="cs-glass-pill inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shrink-0 cursor-pointer text-charcoal-700 hover:text-camel-800"
              title={`Полный рейтинг породы ${breedInfo.nameRu}`}
            >
              <Trophy className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span>Рейтинг соревнований</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-charcoal-400" aria-hidden />
            </Link>

            {breedArchiveUrl && (
              <a
                href={breedArchiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-glass-pill inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shrink-0 cursor-pointer text-charcoal-700 hover:text-camel-800"
                title={`Международная база родословных The Breed Archive (${breedInfo.nameLat})`}
              >
                <img
                  src="/assets/icons/breedarchive.webp"
                  alt=""
                  className="h-3.5 w-3.5 rounded-xs shrink-0"
                  loading="lazy"
                />
                <span>Breed Archive</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-charcoal-400" aria-hidden />
              </a>
            )}
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

      {/* Колонки состязаний и Донино: на десктопе 3 параллельные колонки (Курсинг | Рейсинг | Донино), на мобильном свайп жестами */}
      <BreedHubColumns
        coursingLeaders={coursingLeaders}
        racingLeaders={racingLeaders}
        annualLeaders={annualLeaders}
        annualLeadersLoading={annualLeadersLoading}
        speedRecords={speedRecords}
        doninoLoading={doninoLoading}
        canonicalKey={breedInfo.canonicalKey}
        breedNameRu={breedInfo.nameRu}
      />

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
        <DoninoColumnShell
          plaque={
            <DoninoColumnPlaque
              asHeader
              title={
                <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
                  <span>Каталог пород в курсинге и бегах</span>
                  <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
                    · 83 породы
                  </span>
                </span>
              }
              actionPlacement="right"
              action={
                <Link
                  to="/breeds/"
                  className="cs-glass-pill inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-charcoal-700 hover:text-camel-800 cursor-pointer shrink-0"
                >
                  <span>Все породы</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
                </Link>
              }
            />
          }
          bodyClassName="p-3.5 sm:p-4 bg-white"
        >
          <div className="space-y-3">
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
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 sm:w-44 shrink-0">
                    {cat.title}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {list.map((b) => (
                      <Link
                        key={b.slug}
                        to={`/breeds/${b.slug}/`}
                        className="cs-glass-pill inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap text-charcoal-700 hover:text-camel-800"
                      >
                        {b.nameRu}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </DoninoColumnShell>
      </div>
    </div>
  )
}
