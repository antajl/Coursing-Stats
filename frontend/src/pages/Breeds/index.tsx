import { useState, useMemo, useRef, useEffect } from 'react'
import { X, ChevronDown, Check, Layers } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema, itemPageSchema } from '../../components/JsonLd'
import { CORE_BREED_HUBS } from '../../lib/breed-hubs-data'
import { getBreedFciGroup, FCI_GROUPS } from '../../lib/fciGroups'
import { useBreedAnnualLeaders, useTopPlacement, useTopSpeed } from '../../hooks/useStaticData'
import { useListReveal } from '../../hooks/useListReveal'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import EmptyState from '../../components/EmptyState'
import LoadingCard from '../../components/LoadingCard'
import BreedCard, { type BreedStatsData } from '../../components/BreedCard'
import BreedSortDropdown, { type BreedSortKey } from './BreedSortDropdown'
import QuickGroupBar from './QuickGroupBar'
import QuickBreedBar from '../TopDogs/QuickBreedBar'
import { matchesBreedFilter } from '../../lib/breedMapping'

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
  const [selectedBreed, setSelectedBreed] = useState<string>('all')
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

  const allBreedKeys = useMemo(() => CORE_BREED_HUBS.map((b) => b.canonicalKey), [])

  const sortedGroupKeys = useMemo(() => {
    return Object.keys(FCI_GROUPS).sort((a, b) => {
      const nameA = FCI_GROUPS[Number(a)]?.name.replace(/^FCI\s*\d+:\s*/i, '').trim() || ''
      const nameB = FCI_GROUPS[Number(b)]?.name.replace(/^FCI\s*\d+:\s*/i, '').trim() || ''
      return nameA.localeCompare(nameB, 'ru')
    })
  }, [])

  const mobileBreedList = useMemo(() => {
    let list = CORE_BREED_HUBS
    if (selectedGroup !== 'all') {
      const gNum = Number(selectedGroup)
      list = list.filter((b) => getBreedFciGroup(b.slug) === gNum)
    }
    return list.map((b) => b.canonicalKey)
  }, [selectedGroup])

  const breedCandidates = useMemo(() => {
    let list = CORE_BREED_HUBS

    if (selectedGroup !== 'all') {
      const gNum = Number(selectedGroup)
      list = list.filter((b) => getBreedFciGroup(b.slug) === gNum)
    }

    const sorted = list.slice().sort((a, b) => {
      const dogsA = statsMap[a.slug]?.dogs || 0
      const dogsB = statsMap[b.slug]?.dogs || 0
      if (dogsB !== dogsA) return dogsB - dogsA
      return a.nameRu.localeCompare(b.nameRu, 'ru')
    })

    return sorted.map((b) => {
      let label = b.nameRu
      if (b.slug === 'borzoi' || b.slug === 'russian-borzoi') label = 'РПБ'
      else if (b.slug === 'rhodesian-ridgeback') label = 'Риджбек'
      else if (b.slug === 'irish-wolfhound') label = 'Ирл. волкодав'
      else if (b.slug === 'cirneco-delletna') label = 'Чирнеко'
      else if (b.slug === 'pharaoh-hound') label = 'Фараон'
      else if (b.slug === 'italian-greyhound') label = 'Левретка'
      else if (b.slug === 'afghan-hound') label = 'Афган'
      else if (b.slug === 'hortaya-borzaya') label = 'Хортая'
      else if (b.slug === 'spanish-galgo') label = 'Гальго'

      return {
        key: b.canonicalKey,
        label,
        fullName: b.nameRu,
        estWidth: Math.max(50, Math.min(130, label.length * 8 + 32)),
      }
    })
  }, [selectedGroup, statsMap])

  const filteredBreeds = useMemo(() => {
    let list = CORE_BREED_HUBS

    if (selectedBreed !== 'all') {
      list = list.filter(
        (b) =>
          b.slug === selectedBreed ||
          b.canonicalKey === selectedBreed ||
          matchesBreedFilter(b.canonicalKey, selectedBreed),
      )
    }

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
  }, [selectedBreed, selectedGroup, searchQuery])

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

  // Сброс пагинации при смене поиска, группы, породы или сортировки
  useEffect(() => {
    setVisibleCount(25)
  }, [selectedGroup, selectedBreed, searchQuery, sortKey])

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

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedGroup !== 'all' ||
    selectedBreed !== 'all' ||
    sortKey !== 'dogs'

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroup(groupId)
    if (selectedBreed !== 'all' && groupId !== 'all') {
      const b = CORE_BREED_HUBS.find(
        (item) => item.slug === selectedBreed || item.canonicalKey === selectedBreed,
      )
      if (b && String(getBreedFciGroup(b.slug)) !== groupId) {
        setSelectedBreed('all')
      }
    }
  }

  const handleSelectBreed = (key: string) => {
    if (!key || key === 'all') {
      setSelectedBreed('all')
      return
    }
    const b = CORE_BREED_HUBS.find(
      (item) =>
        item.canonicalKey === key ||
        item.slug === key.toLowerCase() ||
        matchesBreedFilter(item.canonicalKey, key),
    )
    const nextVal = b ? b.slug : key
    setSelectedBreed(nextVal)
    if (b && selectedGroup !== 'all') {
      const gNum = String(getBreedFciGroup(b.slug))
      if (gNum !== selectedGroup) {
        setSelectedGroup('all')
      }
    }
  }

  const quickBreedBarValue = useMemo(() => {
    if (selectedBreed === 'all' || !selectedBreed) return ''
    const b = CORE_BREED_HUBS.find(
      (item) => item.slug === selectedBreed || item.canonicalKey === selectedBreed,
    )
    return b ? b.canonicalKey : selectedBreed
  }, [selectedBreed])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGroup('all')
    setSelectedBreed('all')
    setSortKey('dogs')
  }

  const plaqueTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `По запросу «${searchQuery.trim()}»`
    }
    if (selectedBreed !== 'all') {
      const b = CORE_BREED_HUBS.find((item) => item.slug === selectedBreed)
      return b ? `Порода: ${b.nameRu}` : 'Выбранная порода'
    }
    if (selectedGroup !== 'all') {
      const g = FCI_GROUPS[Number(selectedGroup)]
      return g ? g.shortName : 'Группа пород'
    }
    return 'Все породы'
  }, [searchQuery, selectedBreed, selectedGroup])

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

      {/* 1. Мобильная панель фильтров: Поиск + Группа ▾ + Порода ▾ + Сброс */}
      <div className="flex items-center gap-1.5 w-full md:hidden py-1 overflow-x-auto no-scrollbar">
        {/* Поиск */}
        <div className="shrink-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск породы…"
          />
        </div>

        {/* Выпадающий список групп FCI */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={toolbarPillTriggerClass(selectedGroup !== 'all', 'shrink-0')}
                aria-label="Выбрать группу пород"
              >
                <Layers className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                <span className="truncate max-w-[95px] sm:max-w-[120px]">
                  {selectedGroup !== 'all'
                    ? (selectedGroup === '0' ? 'Спорт' : `FCI ${selectedGroup}`)
                    : 'Группы'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" aria-hidden="true" />
              </button>
            }
            width="280px"
            closeOnScroll
            portal
          >
            {(close) => (
              <div className="p-1 space-y-0.5 text-xs" role="menu">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 border-b border-old-money-100">
                  Группы пород по классификации FCI / РКФ
                </div>

                {/* Все группы */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    handleSelectGroup('all')
                    close()
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                    selectedGroup === 'all'
                      ? 'bg-camel-100/90 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-cream-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Все группы пород</span>
                    <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500">
                      {groupCounts['all'] || 82}
                    </span>
                  </div>
                  {selectedGroup === 'all' && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
                </button>

                {/* Список групп по порядку FCI */}
                {sortedGroupKeys.map((key) => {
                  const group = FCI_GROUPS[Number(key)]
                  const count = groupCounts[key] || 0
                  if (count === 0) return null
                  const isSelected = selectedGroup === key

                  return (
                    <button
                      key={key}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        handleSelectGroup(isSelected ? 'all' : key)
                        close()
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100/90 text-camel-950 font-semibold'
                          : 'text-charcoal-700 hover:bg-cream-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{group.name}</span>
                        <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500 shrink-0">
                          {count}
                        </span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
                    </button>
                  )
                })}
              </div>
            )}
          </ModernDropdown>
        </div>

        {/* Выпадающий список пород */}
        <div className="shrink-0">
          <BreedSearchDropdown
            breeds={mobileBreedList}
            selectedBreed={quickBreedBarValue}
            onSelect={handleSelectBreed}
            trigger={
              <button
                type="button"
                className={toolbarPillTriggerClass(selectedBreed !== 'all', 'shrink-0')}
                aria-label="Выбрать породу"
              >
                <span className="truncate max-w-[95px] sm:max-w-[120px]">
                  {selectedBreed !== 'all'
                    ? (CORE_BREED_HUBS.find((b) => b.slug === selectedBreed || b.canonicalKey === selectedBreed)?.nameRu || 'Порода')
                    : 'Породы'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" aria-hidden="true" />
              </button>
            }
          />
        </div>

        {/* Сброс фильтров */}
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

      {/* 2. Десктопный тулбар: две симметричные половины (ровно 50% / 50%) с центральным разделителем */}
      <div className="hidden md:block">
        <PageToolbar
          bare
          topRowClassName="w-full flex-nowrap"
          filters={
            <div className="flex items-center w-full min-w-0 py-2 -my-2 overflow-x-auto md:overflow-visible no-scrollbar">
              {/* Левая половина: ровно 50% ширины страницы (Поиск + Породы) */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2">
                <div className="shrink-0">
                  <ToolbarSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Поиск породы или код FCI…"
                  />
                </div>

                <div className="h-5 w-px bg-old-money-300/80 shrink-0 hidden sm:block" aria-hidden="true" />

                <div className="flex-1 min-w-0">
                  <QuickBreedBar
                    selectedBreed={quickBreedBarValue}
                    onSelectBreed={handleSelectBreed}
                    candidateBreeds={breedCandidates}
                    breedValues={allBreedKeys}
                    showHubLink={false}
                  />
                </div>
              </div>

              {/* Центральный разделитель: строго зафиксирован ровно по центру 50% */}
              <div className="h-5 w-px bg-old-money-300/80 shrink-0 mx-2 sm:mx-2.5 hidden md:block" aria-hidden="true" />

              {/* Правая половина: ровно 50% ширины страницы (Группы + Сброс) */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <QuickGroupBar
                    value={selectedGroup}
                    onChange={handleSelectGroup}
                    counts={groupCounts}
                  />
                </div>

                {/* Кнопка сброса при наличии активных фильтров */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="cs-glass-pill shrink-0 inline-flex h-8 px-2.5 items-center justify-center gap-1 rounded-full text-xs font-semibold !text-charcoal-600 hover:!text-charcoal-900 transition-colors cursor-pointer select-none"
                    title="Сбросить фильтры"
                    aria-label="Сбросить фильтры"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Сброс</span>
                  </button>
                )}
              </div>
            </div>
          }
        />
      </div>

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
