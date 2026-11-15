import { useState, useMemo, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema, itemPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS } from '../../lib/breed-hubs-data'
import { getBreedFciGroup, FCI_GROUPS } from '../../lib/fciGroups'
import { useBreedAnnualLeaders, useTopPlacement, useTopSpeed } from '../../hooks/useStaticData'
import { useListReveal } from '../../hooks/useListReveal'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import EmptyState from '../../components/EmptyState'
import LoadingCard from '../../components/LoadingCard'
import BreedCard, { type BreedStatsData } from '../../components/BreedCard'
import BreedSortDropdown, { type BreedSortKey } from './BreedSortDropdown'
import BreedGroupDropdown from './BreedGroupDropdown'

function formatBreedsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} пород`
  if (mod10 === 1) return `${count} порода`
  if (mod10 >= 2 && mod10 <= 4) return `${count} породы`
  return `${count} пород`
}

export default function BreedsDirectory() {
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<BreedSortKey>('dogs')
  const [visibleCount, setVisibleCount] = useState(25)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const { data: leadersData, isLoading: leadersLoading } = useBreedAnnualLeaders()
  const { data: topPlacementRes, isLoading: placementLoading } = useTopPlacement('all')
  const { data: topSpeedRes, isLoading: speedLoading } = useTopSpeed('all')

  const loading = leadersLoading || placementLoading || speedLoading
  const leadersBySlug = leadersData?.data?.leaders_by_slug

  // Подсчет количества пород в каждой группе FCI
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: CORE_BREED_HUBS.length }
    for (const b of CORE_BREED_HUBS) {
      const g = String(getBreedFciGroup(b.slug))
      counts[g] = (counts[g] || 0) + 1
    }
    return counts
  }, [])

  // Агрегация реальных данных из базы состязаний для всех 82 пород
  const statsMap = useMemo(() => {
    const map: Record<string, BreedStatsData> = {}

    for (const b of CORE_BREED_HUBS) {
      const leaders = leadersBySlug?.[b.slug] || []
      map[b.slug] = {
        dogs: 0,
        starts: 0,
        gold: 0,
        maxSpeed: 0,
        seasonsCount: leaders.length,
        latestLeader: leaders[0]
          ? { year: leaders[0].year, dog_name: leaders[0].dog_name }
          : undefined,
      }
    }

    const placementItems = (topPlacementRes?.data?.items || []) as any[]
    for (const item of placementItems) {
      const bKey = (item.breed || '').toUpperCase().trim()
      for (const b of CORE_BREED_HUBS) {
        if (bKey.includes(b.canonicalKey) || b.canonicalKey.includes(bKey)) {
          const s = map[b.slug]
          s.dogs++
          s.starts += item.total_starts || 0
          s.gold += item.gold || 0
        }
      }
    }

    const speedItems = (topSpeedRes?.data?.items || []) as any[]
    for (const item of speedItems) {
      const bKey = (item.breed || '').toUpperCase().trim()
      for (const b of CORE_BREED_HUBS) {
        if (bKey.includes(b.canonicalKey) || b.canonicalKey.includes(bKey)) {
          const s = map[b.slug]
          if (item.best_speed && item.best_speed > s.maxSpeed) {
            s.maxSpeed = item.best_speed
          }
        }
      }
    }

    return map
  }, [leadersBySlug, topPlacementRes, topSpeedRes])

  const filteredBreeds = useMemo(() => {
    let list = CORE_BREED_HUBS

    if (selectedGroup !== 'all') {
      const gNum = Number(selectedGroup)
      list = list.filter((b) => getBreedFciGroup(b.slug) === gNum)
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
  }, [selectedGroup, searchQuery])

  const sortedBreeds = useMemo(() => {
    const list = filteredBreeds.slice()

    list.sort((a, b) => {
      const statsA = statsMap[a.slug]
      const statsB = statsMap[b.slug]

      switch (sortKey) {
        case 'dogs': {
          const diff = (statsB?.dogs || 0) - (statsA?.dogs || 0)
          if (diff !== 0) return diff
          return a.nameRu.localeCompare(b.nameRu, 'ru')
        }
        case 'starts': {
          const diff = (statsB?.starts || 0) - (statsA?.starts || 0)
          if (diff !== 0) return diff
          return a.nameRu.localeCompare(b.nameRu, 'ru')
        }
        case 'speed': {
          const diff = (statsB?.maxSpeed || 0) - (statsA?.maxSpeed || 0)
          if (diff !== 0) return diff
          return a.nameRu.localeCompare(b.nameRu, 'ru')
        }
        case 'seasons': {
          const diff = (statsB?.seasonsCount || 0) - (statsA?.seasonsCount || 0)
          if (diff !== 0) return diff
          return a.nameRu.localeCompare(b.nameRu, 'ru')
        }
        case 'name':
        default:
          return a.nameRu.localeCompare(b.nameRu, 'ru')
      }
    })

    return list
  }, [filteredBreeds, sortKey, statsMap])

  useEffect(() => {
    if (!loading && sortedBreeds.length > 0) {
      setIsInitialLoad(false)
    }
  }, [loading, sortedBreeds.length])

  // Сброс пагинации при смене поиска, группы или сортировки
  useEffect(() => {
    setVisibleCount(25)
  }, [selectedGroup, searchQuery, sortKey])

  // Lazy loading IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + 20, sortedBreeds.length))
      }
    })
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
    return () => observerRef.current?.disconnect()
  }, [sortedBreeds.length])

  const listRevealRef = useListReveal(!loading && sortedBreeds.length > 0)

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedGroup !== 'all' || sortKey !== 'dogs'

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGroup('all')
    setSortKey('dogs')
  }

  const plaqueTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `По запросу «${searchQuery.trim()}»`
    }
    if (selectedGroup !== 'all') {
      const g = FCI_GROUPS[Number(selectedGroup)]
      return g ? g.shortName : 'Группа пород'
    }
    return 'Все породы'
  }, [searchQuery, selectedGroup])

  const plaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
          <span className="truncate">{plaqueTitle}</span>
          <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
            · {formatBreedsCount(sortedBreeds.length)}
          </span>
        </span>
      }
      actionPlacement="right"
      action={<BreedSortDropdown value={sortKey} onChange={setSortKey} />}
    />
  )

  const seoTitle = 'Каталог пород собак: курсинг, бега борзых и БЗМП | Coursing Stats'
  const seoDesc =
    'Сводный реестр 83 беговых пород собак в курсинге, рейсинге и БЗМП: карточки пород по группам FCI и РКФ, история забегов с 2015 года, рекорды скорости и залы славы чемпионов.'

  if (isInitialLoad && loading) {
    return <LoadingCard count={8} variant="list" />
  }

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

      {/* Toolbar: единый ряд фильтров по классификации FCI/РКФ и поиск */}
      <PageToolbar
        bare
        topRowClassName="flex-nowrap"
        filters={
          <div className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
            {/* Поиск породы или кода FCI: компактная кнопка 32px без лишних обёрток */}
            <ToolbarSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск породы или код FCI…"
            />

            {/* Быстрые фильтры основных спортивных групп с префиксом FCI (без цифр) */}
            {[
              { id: 'all', label: 'Все группы' },
              { id: '10', label: 'FCI 10: Борзые' },
              { id: '5', label: 'FCI 5: Шпицы и аборигенные' },
              { id: '3', label: 'FCI 3: Терьеры' },
            ].map((item) => {
              const active = selectedGroup === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedGroup(item.id)}
                  className={`h-8 rounded-full px-3 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all inline-flex items-center shrink-0 ${
                    active ? 'cs-glass-pill-active' : 'cs-glass-pill'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              )
            })}

            {/* Выпадающий список «Ещё группы» */}
            <BreedGroupDropdown
              value={selectedGroup}
              onChange={setSelectedGroup}
              counts={groupCounts}
            />

            {/* Кнопка сброса при наличии фильтров */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="cs-glass-pill shrink-0 inline-flex h-8 px-2.5 items-center justify-center gap-1 rounded-full text-xs font-semibold !text-charcoal-600 hover:!text-charcoal-900 transition-colors cursor-pointer select-none"
                title="Сбросить фильтры"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Сброс</span>
              </button>
            )}
          </div>
        }
      />

      {/* Список пород: вертикальный шелл DoninoColumnShell с единой плашкой DoninoColumnPlaque */}
      {sortedBreeds.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white">
          <EmptyState
            title="Породы не найдены"
            description="Попробуйте изменить поисковый запрос или выбрать другую группу FCI"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <DoninoColumnShell
            plaque={plaque}
            listRef={listRevealRef}
            bodyClassName="flex flex-col divide-y divide-old-money-100"
          >
            {sortedBreeds.slice(0, visibleCount).map((breed) => (
              <div key={breed.slug} data-list-item>
                <BreedCard
                  breed={breed}
                  stats={statsMap[breed.slug]}
                  variant="embedded"
                />
              </div>
            ))}
          </DoninoColumnShell>

          {/* Lazy load trigger */}
          {sortedBreeds.length > visibleCount && (
            <div ref={loadMoreRef} className="py-3 text-center text-xs text-charcoal-500">
              Загрузка…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
