import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react'
import { CORE_BREED_HUBS } from '../../lib/breed-hubs-data'
import { getBreedFciGroup, FCI_GROUPS } from '../../lib/fciGroups'
import { useBreedAnnualLeaders, useTopPlacement, useTopSpeed } from '../../hooks/useStaticData'
import { matchesSearchText } from '../../lib/searchEngine'
import { matchesBreedFilter } from '../../lib/breedMapping'
import type { BreedStatsData } from '../../components/BreedCard'
import type { BreedSortKey } from './BreedSortDropdown'

export function formatBreedsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} пород`
  if (mod10 === 1) return `${count} порода`
  if (mod10 >= 2 && mod10 <= 4) return `${count} породы`
  return `${count} пород`
}

export function useBreedsFilterAndSort() {
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedBreed, setSelectedBreed] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<BreedSortKey>('dogs')
  const [visibleCount, setVisibleCount] = useState(() => {
    try {
      const lastSlug = sessionStorage.getItem('cs_last_breed_slug')
      if (lastSlug) {
        const idx = CORE_BREED_HUBS.findIndex((b) => b.slug === lastSlug)
        if (idx >= 0) {
          return Math.max(25, idx + 20)
        }
      }
    } catch {}
    return 25
  })
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
          ? {
              year: leaders[0].year,
              dog_name: leaders[0].dog_name || leaders[0].name_ru || leaders[0].name_lat || '',
            }
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
      const numA = Number(a)
      const numB = Number(b)
      if (numA === 0 && numB !== 0) return 1
      if (numB === 0 && numA !== 0) return -1
      return numA - numB
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
      else if (b.slug === 'amstaff') label = 'Амстафф'
      else if (b.slug === 'staffordshire-bull-terrier') label = 'Стаффбуль'
      else if (b.slug === 'miniature-bull-terrier') label = 'Мини-буль'
      else if (b.slug === 'jack-russell-terrier') label = 'Джек-рассел'
      else if (b.slug === 'irish-terrier') label = 'Ирл. терьер'
      else if (b.slug === 'miniature-pinscher') label = 'Цвергпинчер'
      else if (b.slug === 'dobermann') label = 'Доберман'
      else if (b.slug === 'german-shepherd') label = 'НО'
      else if (b.slug === 'australian-shepherd') label = 'Аусси'
      else if (b.slug === 'border-collie') label = 'Бордер-колли'
      else if (b.slug === 'welsh-corgi-pembroke') label = 'Корги'

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

    const q = searchQuery.trim()
    if (q) {
      list = list.filter((b) =>
        matchesSearchText(
          [b.nameRu, b.nameLat, b.canonicalKey, b.fci, ...(b.aliases || [])],
          q
        )
      )
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

  const isFilterMountRef = useRef(true)
  // Сброс пагинации при смене поиска, группы, породы или сортировки (пропускаем начальный mount)
  useEffect(() => {
    if (isFilterMountRef.current) {
      isFilterMountRef.current = false
      return
    }
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

  // Автоматическая прокрутка к последней просмотренной породе при возврате назад
  const hasRestoredScrollRef = useRef(false)
  useLayoutEffect(() => {
    if (hasRestoredScrollRef.current) return

    let lastSlug: string | null = null
    try {
      lastSlug = sessionStorage.getItem('cs_last_breed_slug')
    } catch {}

    if (!lastSlug && typeof window !== 'undefined' && window.location.hash) {
      lastSlug = window.location.hash.replace(/^#breed-/, '').replace(/^#/, '')
    }

    if (!lastSlug) return

    const targetId = `breed-${lastSlug}`
    const el = document.getElementById(targetId)

    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      if (!loading) {
        hasRestoredScrollRef.current = true
        try {
          sessionStorage.removeItem('cs_last_breed_slug')
        } catch {}
      }
    } else {
      const raf = requestAnimationFrame(() => {
        const elRetry = document.getElementById(targetId)
        if (elRetry) {
          elRetry.scrollIntoView({ block: 'center', behavior: 'instant' })
        }
        if (!loading) {
          hasRestoredScrollRef.current = true
          try {
            sessionStorage.removeItem('cs_last_breed_slug')
          } catch {}
        }
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [loading, sortedBreeds])

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
    if (b) {
      const gNum = String(getBreedFciGroup(b.slug))
      setSelectedGroup(gNum)
    }
  }

  const quickBreedBarValue = useMemo(() => {
    if (selectedBreed === 'all' || !selectedBreed) return ''
    const b = CORE_BREED_HUBS.find(
      (item) => item.slug === selectedBreed || item.canonicalKey === selectedBreed,
    )
    return b ? b.canonicalKey : selectedBreed
  }, [selectedBreed])

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
      return g ? g.name : 'Группа пород'
    }
    return 'Все породы'
  }, [searchQuery, selectedBreed, selectedGroup])

  return {
    selectedGroup,
    selectedBreed,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    visibleCount,
    isInitialLoad,
    loading,
    groupCounts,
    statsMap,
    allBreedKeys,
    sortedGroupKeys,
    mobileBreedList,
    breedCandidates,
    sortedBreeds,
    quickBreedBarValue,
    plaqueTitle,
    loadMoreRef,
    handleSelectGroup,
    handleSelectBreed,
  }
}
