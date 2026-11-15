import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ArrowUpRight, X } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema, itemPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS, type BreedCategory } from '../../lib/breed-hubs-data'
import { useBreedAnnualLeaders } from '../../hooks/useStaticData'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import EmptyState from '../../components/EmptyState'

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
    label: 'Спорт БЗМП',
    count: CORE_BREED_HUBS.filter((b) => b.category === 'sport').length,
  },
  {
    id: 'open',
    label: 'Любительский класс',
    count: CORE_BREED_HUBS.filter((b) => b.category === 'open').length,
  },
]

function formatBreedsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} пород`
  if (mod10 === 1) return `${count} порода`
  if (mod10 >= 2 && mod10 <= 4) return `${count} породы`
  return `${count} пород`
}

function formatSeasonsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'сезонов'
  if (mod10 === 1) return 'сезон'
  if (mod10 >= 2 && mod10 <= 4) return 'сезона'
  return 'сезонов'
}

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

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  const activeCategoryLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Все породы'

  const plaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
          <span>{activeCategoryLabel}</span>
          <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
            · {formatBreedsCount(filteredBreeds.length)}
          </span>
        </span>
      }
      actionPlacement="right"
      action={
        <span className="text-[11px] text-charcoal-500 font-medium hidden sm:inline">
          Официальный реестр беговых пород
        </span>
      }
    />
  )

  const seoTitle = 'Каталог пород собак: курсинг, бега борзых и БЗМП | Coursing Stats'
  const seoDesc =
    'Официальный реестр всех 83 беговых пород собак в курсинге, рейсинге и БЗМП: карточки пород, история забегов с 2015 года, рекорды скорости и залы славы чемпионов.'

  return (
    <div className="max-w-full mx-auto pb-4 sm:pb-6 space-y-3 sm:space-y-4">
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

      {/* Toolbar: единый стиль сайтов Old Money (как в Рейтинге, Архиве, Судьях и Донино) */}
      <PageToolbar
        bare
        topRowClassName="flex-nowrap"
        filters={
          <div className="w-full min-w-0">
            {/* Мобильная строка: Поиск + Категории + Сброс */}
            <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
              <ToolbarSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Поиск породы…"
              />

              <div className="flex items-center gap-1 shrink-0">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`h-8 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                        active ? 'cs-glass-pill-active' : 'cs-glass-pill'
                      }`}
                    >
                      <span>{cat.label.split(' ')[0]}</span>
                      <span className={`text-[10px] tabular-nums font-sans px-1 rounded-full ${
                        active ? 'bg-camel-200/80 text-camel-950 font-bold' : 'bg-cream-100 text-charcoal-500'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none ml-auto"
                  title="Сбросить фильтры"
                  aria-label="Сбросить фильтры"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Десктопная строка (>= sm): Полноразмерный поиск + чипы категорий */}
            <div className="hidden sm:flex items-center justify-between gap-3 w-full min-w-0">
              <div className="w-64 lg:w-72 shrink-0">
                <ToolbarSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Поиск породы или код FCI…"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`h-8 rounded-full px-3 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                        active ? 'cs-glass-pill-active' : 'cs-glass-pill'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10.5px] tabular-nums font-sans px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-camel-200/80 text-camel-950 font-bold' : 'bg-cream-100 text-charcoal-500'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cs-glass-pill shrink-0 inline-flex h-8 px-2.5 items-center justify-center gap-1 rounded-full text-xs font-semibold !text-charcoal-600 hover:!text-charcoal-900 transition-colors cursor-pointer select-none ml-auto"
                  title="Сбросить фильтры"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Сброс</span>
                </button>
              )}
            </div>
          </div>
        }
      />

      {/* Список пород: колоночный шелл DoninoColumnShell с единой плашкой DoninoColumnPlaque */}
      {filteredBreeds.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white">
          <EmptyState
            title="Породы не найдены"
            description="Попробуйте изменить поисковый запрос или выбрать другую категорию"
          />
        </div>
      ) : (
        <DoninoColumnShell plaque={plaque} bodyClassName="flex flex-col divide-y divide-old-money-100">
          {filteredBreeds.map((breed) => {
            const leaders = leadersBySlug?.[breed.slug] || []
            const seasonsCount = leaders.length
            const latestLeader = leaders[0]

            return (
              <div
                key={breed.slug}
                className="p-3 sm:p-4 hover:bg-cream-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                {/* Инфо о породе */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center rounded-md border border-camel-200/90 bg-cream-100/90 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-camel-800 shrink-0">
                      {breed.fci}
                    </span>
                    <span className="text-xs font-sans text-charcoal-500 font-medium">
                      {breed.nameLat}
                    </span>
                    {seasonsCount > 0 && (
                      <span className="text-xs text-charcoal-400 font-sans tabular-nums hidden sm:inline">
                        · {seasonsCount} {formatSeasonsCount(seasonsCount)}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/breeds/${breed.slug}/`}
                    className="text-base sm:text-[17px] font-serif font-bold text-charcoal-900 group-hover:text-camel-800 transition-colors inline-block leading-snug"
                  >
                    {breed.nameRu}
                  </Link>

                  <p className="text-xs text-charcoal-600 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed max-w-3xl">
                    {breed.lead}
                  </p>
                </div>

                {/* Блок метрик и быстрых переходов */}
                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-old-money-100/80">
                  {/* Плашка сезонов активности */}
                  <div
                    className="flex flex-col items-center justify-center w-[4.5rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-1 py-1 text-center group-hover:bg-white group-hover:border-camel-300 transition-colors"
                    title={`${seasonsCount} сезонов с зафиксированными официальными результатами`}
                  >
                    <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium">Сезонов</span>
                    <span className="text-sm font-bold tabular-nums text-charcoal-900">
                      {seasonsCount > 0 ? seasonsCount : '—'}
                    </span>
                  </div>

                  {/* Действующий чемпион года */}
                  {latestLeader ? (
                    <div
                      className="hidden lg:flex flex-col items-start justify-center w-[10rem] shrink-0 rounded-lg bg-cream-100/70 border border-old-money-200/50 px-2 py-1 text-left group-hover:bg-white group-hover:border-camel-300 transition-colors truncate"
                      title={`Лидер ${latestLeader.year} года: ${latestLeader.dog_name}`}
                    >
                      <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-medium truncate w-full">
                        Лидер {latestLeader.year}
                      </span>
                      <span className="text-xs font-bold text-camel-800 truncate w-full">
                        {latestLeader.dog_name}
                      </span>
                    </div>
                  ) : null}

                  {/* Кнопки действий */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-1">
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
                      title={`Рейтинг соревнований для ${breed.nameRu}`}
                    >
                      <Trophy className="h-3 w-3 text-camel-700" aria-hidden />
                      <span className="hidden sm:inline">Рейтинг</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </DoninoColumnShell>
      )}
    </div>
  )
}
