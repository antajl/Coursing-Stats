import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { JsonLd, itemPageSchema, breadcrumbListSchema, faqPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS, getBreedHubBySlug } from '../../lib/breed-hubs-data'
import { useBreedHubData } from './hooks/useBreedHubData'
import { BreedHubHeader } from './components/BreedHubHeader'
import { BreedHubFaq } from './components/BreedHubFaq'
import { BreedHubCatalogNav } from './components/BreedHubCatalogNav'
import BreedHubColumns from './BreedHubColumns'
import BreedShowsColumns from './components/BreedShowsColumns'
import { BreedHallOfFame } from './components/BreedHallOfFame'

export default function BreedHub() {
  const { slug } = useParams<{ slug: string }>()
  const breedInfo = useMemo(() => (slug ? getBreedHubBySlug(slug) : undefined), [slug])
  const [statsMode, setStatsMode] = useState<'sport' | 'shows'>('sport')

  const {
    breedArchiveUrl,
    placementAllLoading,
    speedAllLoading,
    doninoLoading,
    annualLeadersLoading,
    coursingLeaders,
    racingLeaders,
    showsCacLeaders,
    showsMonoLeaders,
    showsAllTimeTop,
    showsMonoAllTimeTop,
    sportCoursingAllTime,
    sportRacingAllTime,
    showsStats,
    annualLeaders,
    doninoAnnualLeaders,
    speedRecords,
    breedStats,
  } = useBreedHubData(slug, breedInfo)

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

  const seoTitle = `${breedInfo.nameRu} (${breedInfo.nameLat}) — спорт, выставки РКФ, лучшие собаки по годам и рекорды | Курсинг Статс`
  const seoDesc = `Персональный хаб породы ${breedInfo.nameRu} (${breedInfo.nameLat}) в курсинге, бегах борзых, выставках РКФ и смотрах НКП: зал славы чемпионов с 2015 года, замеры скорости в Донино (км/ч), рейтинг САС и монопородок.`
  const seoKeywords = [
    breedInfo.nameRu.toLowerCase(),
    breedInfo.nameLat.toLowerCase(),
    breedInfo.canonicalKey.toLowerCase(),
    `курсинг ${breedInfo.nameRu.toLowerCase()}`,
    `бега ${breedInfo.nameRu.toLowerCase()}`,
    `выставки ${breedInfo.nameRu.toLowerCase()}`,
    `монопородка ${breedInfo.nameRu.toLowerCase()}`,
    `рейтинг нкп ${breedInfo.nameRu.toLowerCase()}`,
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

      {/* Шапка породы, описание, быстрые ссылки и паспортные метрики */}
      <BreedHubHeader
        breedInfo={breedInfo}
        breedStats={breedStats}
        showsStats={showsStats}
        breedArchiveUrl={breedArchiveUrl}
        placementAllLoading={placementAllLoading}
        speedAllLoading={speedAllLoading}
        doninoLoading={doninoLoading}
        annualLeadersLoading={annualLeadersLoading}
        statsMode={statsMode}
        setStatsMode={setStatsMode}
      />

      {/* 1. Зал славы породы: Топ-5 собак всех времён (Спорт слева | Выставки справа) */}
      <BreedHallOfFame
        breedNameRu={breedInfo.nameRu}
        breedSlug={breedInfo.slug}
        canonicalKey={breedInfo.canonicalKey}
        sportCoursingDogs={sportCoursingAllTime}
        sportRacingDogs={sportRacingAllTime}
        showsAllBreedDogs={showsAllTimeTop}
        showsMonoDogs={showsMonoAllTimeTop}
        isLoading={placementAllLoading || speedAllLoading || annualLeadersLoading}
      />

      {/* 2. Блок спортивных дисциплин и рекордов скорости */}
      <BreedHubColumns
        coursingLeaders={coursingLeaders}
        racingLeaders={racingLeaders}
        doninoLeaders={doninoAnnualLeaders}
        annualLeaders={annualLeaders}
        annualLeadersLoading={annualLeadersLoading}
        speedRecords={speedRecords}
        doninoLoading={doninoLoading}
        canonicalKey={breedInfo.canonicalKey}
        breedNameRu={breedInfo.nameRu}
        breedSlug={breedInfo.slug}
      />

      {/* 3. Блок выставок РКФ по годам */}
      <BreedShowsColumns
        showsCacLeaders={showsCacLeaders}
        showsMonoLeaders={showsMonoLeaders}
        annualLeadersLoading={annualLeadersLoading}
        canonicalKey={breedInfo.canonicalKey}
        breedNameRu={breedInfo.nameRu}
        breedSlug={breedInfo.slug}
      />

      {/* 4. Частые вопросы о породе в спорте (FAQ) */}
      <BreedHubFaq breedInfo={breedInfo} />

      {/* 5. Переход к другим породам */}
      <BreedHubCatalogNav currentSlug={breedInfo.slug} />
    </div>
  )
}
