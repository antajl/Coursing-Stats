import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, ArrowUpRight, Trophy, Layers } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema, itemPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS, type BreedCategory } from '../../lib/breed-hubs-data'
import { useBreedAnnualLeaders } from '../../hooks/useStaticData'

const CATEGORIES: Array<{ id: 'all' | BreedCategory; label: string; count: number }> = [
  { id: 'all', label: 'Все породы', count: CORE_BREED_HUBS.length },
  {
    id: 'sighthound',
    label: 'Борзые (10 группа FCI)',
    count: CORE_BREED_HUBS.filter((b) => b.category === 'sighthound').length,
  },
  {
    id: 'primitive',
    label: 'Примитивные (5 группа FCI)',
    count: CORE_BREED_HUBS.filter((b) => b.category === 'primitive').length,
  },
  {
    id: 'sport',
    label: 'Спортивный класс БЗМП',
    count: CORE_BREED_HUBS.filter((b) => b.category === 'sport').length,
  },
  {
    id: 'open',
    label: 'Любительский класс',
    count: CORE_BREED_HUBS.filter((b) => b.category === 'open').length,
  },
]

export default function BreedsDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | BreedCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: leadersData } = useBreedAnnualLeaders()
  const leadersBySlug = leadersData?.data?.leaders_by_slug

  const filteredBreeds = useMemo(() => {
    let list = CORE_BREED_HUBS

    if (selectedCategory !== 'all') {
      list = list.filter((b) => b.category === selectedCategory)
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((b) => {
        return (
          b.nameRu.toLowerCase().includes(q) ||
          b.nameLat.toLowerCase().includes(q) ||
          b.canonicalKey.toLowerCase().includes(q) ||
          b.fci.toLowerCase().includes(q) ||
          (b.aliases && b.aliases.some((a) => a.toLowerCase().includes(q)))
        )
      })
    }

    return list
  }, [selectedCategory, searchQuery])

  const seoTitle = 'Каталог пород собак: курсинг, бега борзых и БЗМП | Coursing Stats'
  const seoDesc =
    'Официальный реестр всех 83 беговых пород собак в курсинге, рейсинге и БЗМП: карточки пород, история забегов с 2015 года, рекорды скорости и залы славы чемпионов.'

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonicalUrl="https://coursing-stats.ru/breeds/"
        keywords="породы собак, курсинг породы, бега борзых, уиппет, салюки, рпб, басенджи, бзмп, fci"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Породы', url: '/breeds/' },
            ]),
            itemPageSchema({
              url: 'https://coursing-stats.ru/breeds/',
              name: seoTitle,
              description: seoDesc,
            }),
          ],
        }}
      />

      {/* Hero Header */}
      <header className="rounded-xl border border-cream-200 bg-white/80 p-4 sm:p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-camel-100 text-camel-900 border border-camel-200/80">
            <Layers className="h-3 w-3 text-camel-700" aria-hidden />
            <span>Каталог пород</span>
          </span>
          <span className="text-xs text-charcoal-500 font-sans tabular-nums">
            {CORE_BREED_HUBS.length} пород в базе состязаний
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-900 tracking-tight mb-2">
          Породы в курсинге, бегах борзых и БЗМП
        </h1>

        <p className="text-xs sm:text-sm text-charcoal-600 max-w-3xl leading-relaxed">
          Официальный справочник всех признанных и спортивных пород собак. Выберите интересующую
          породу для перехода в персональный хаб со статистикой состязаний, рекордами скорости в
          Донино, залом славы по годам и полным рейтингом.
        </p>

        {/* Toolbar: Search input & category pills */}
        <div className="mt-4 pt-4 border-t border-cream-200/80 space-y-3">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск породы по названию или коду FCI..."
              className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm rounded-full border border-cream-300 bg-white/90 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-1 focus:ring-camel-400 focus:border-camel-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 cursor-pointer p-0.5"
                aria-label="Очистить поиск"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 h-8 rounded-full px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    active ? 'cs-glass-pill-active' : 'cs-glass-pill'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-camel-200/80 text-camel-950' : 'bg-cream-100 text-charcoal-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Grid of Breed Cards */}
      {filteredBreeds.length === 0 ? (
        <div className="rounded-xl border border-cream-200 bg-white/80 p-8 text-center text-charcoal-600">
          <p className="text-sm font-medium mb-2">По вашему запросу ничего не найдено</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
            className="cs-glass-pill inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredBreeds.map((breed) => {
            const leaders = leadersBySlug?.[breed.slug] || []
            const activeSeasonsCount = leaders.length

            return (
              <div
                key={breed.slug}
                className="rounded-xl border border-cream-200 bg-white/85 p-4 sm:p-5 flex flex-col justify-between hover:border-camel-300 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cream-100 text-charcoal-700 border border-cream-200 tracking-wide">
                      {breed.fci}
                    </span>
                    {activeSeasonsCount > 0 && (
                      <span className="text-[10px] text-charcoal-500 font-sans tabular-nums">
                        {activeSeasonsCount} {activeSeasonsCount === 1 ? 'сезон' : activeSeasonsCount < 5 ? 'сезона' : 'сезонов'}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/breeds/${breed.slug}/`}
                    className="block group-hover:text-camel-800 transition-colors"
                  >
                    <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900 leading-snug">
                      {breed.nameRu}
                    </h2>
                    <div className="text-xs text-charcoal-500 font-sans tracking-wide mt-0.5 mb-2">
                      {breed.nameLat}
                    </div>
                  </Link>

                  <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed mb-4">
                    {breed.lead}
                  </p>
                </div>

                <div className="pt-3 border-t border-cream-200/80 flex items-center justify-between gap-2">
                  <Link
                    to={`/breeds/${breed.slug}/`}
                    className="cs-glass-pill-active inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    <span>Хаб породы</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-camel-800" aria-hidden />
                  </Link>

                  <Link
                    to={`/competitions/?tab=ranking&breed=${encodeURIComponent(breed.canonicalKey)}`}
                    className="cs-glass-pill inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-charcoal-700 hover:text-camel-800 cursor-pointer"
                    title={`Открыть рейтинг породы ${breed.nameRu}`}
                  >
                    <Trophy className="h-3 w-3 text-camel-700" aria-hidden />
                    <span>Рейтинг</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
