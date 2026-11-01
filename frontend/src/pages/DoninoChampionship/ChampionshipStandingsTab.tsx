import React, { useState, useMemo, useRef } from 'react'
import { X, ChevronDown, Trophy, Timer, Award } from 'lucide-react'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import QuickBreedBar, { type QuickBreedItem } from '../TopDogs/QuickBreedBar'
import DogSexIcon from '../../components/DogSexIcon'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName, matchesBreedFilter } from '../../lib/breedMapping'
import type { ChampionshipStanding, ChampionshipPromotion } from '../../lib/staticData/donino'
import ChampionshipDogCard from './components/ChampionshipDogCard'
import ChampionshipAnatomyWidget from './components/ChampionshipAnatomyWidget'
import ChampionshipPointsRulesWidget from './components/ChampionshipPointsRulesWidget'
import ChampionshipLinksCard, { type LeagueFilter, pluralizeDogs } from './components/ChampionshipLinksCard'

interface ChampionshipStandingsTabProps {
  standings: ChampionshipStanding[]
  promotions: {
    after_stage_1: ChampionshipPromotion[]
    after_stage_2: ChampionshipPromotion[]
    after_stage_3?: ChampionshipPromotion[]
  }
  resultsSpreadsheetUrl?: string | null
  pointsSpreadsheetUrl?: string | null
}

export default function ChampionshipStandingsTab({
  standings,
  promotions,
  resultsSpreadsheetUrl,
  pointsSpreadsheetUrl,
}: ChampionshipStandingsTabProps) {
  const [selectedLeague, setSelectedLeague] = useState<LeagueFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false)
  const [selectedSex, setSelectedSex] = useState<string>('')
  const [sexDropdownOpen, setSexDropdownOpen] = useState(false)
  const [expandedDogKey, setExpandedDogKey] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<'points' | 'time'>('time')

  // Mobile swipe gesture to toggle between "По скорости" and "По баллам"
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    gestureLockRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 10 && absDy < 10) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const isHorizontal = gestureLockRef.current === 'horizontal'
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    if (isHorizontal) {
      const isSwipeLeft = dx < -45 || (dx < -25 && velocity > 0.25)
      const isSwipeRight = dx > 45 || (dx > 25 && velocity > 0.25)

      if (isSwipeLeft && sortMode === 'time') {
        setSortMode('points')
        ;(e.nativeEvent as any)._doninoSwipeConsumed = true
      } else if (isSwipeRight && sortMode === 'points') {
        setSortMode('time')
        ;(e.nativeEvent as any)._doninoSwipeConsumed = true
      }
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
  }

  // Candidate breeds sorted strictly by participant count descending, then alphabetically
  const candidateBreeds = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of standings || []) {
      if (d.breed) counts.set(d.breed, (counts.get(d.breed) || 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
      .map(([breedKey]) => {
        const fullName = formatBreedName(breedKey)
        let label = fullName
        if (breedKey === 'РОДЕЗИЙСКИЙ РИДЖБЕК') label = 'Риджбек'
        else if (breedKey === 'РУССКАЯ ПСОВАЯ БОРЗАЯ') label = 'РПБ'
        else if (breedKey === 'ФАРАОНОВА СОБАКА') label = 'Фараон'
        else if (breedKey === 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ' || breedKey === 'ЛЕВРЕТКА') label = 'Левретка'
        else if (breedKey === 'ЧИРНЕКО ДЕЛЬ ЭТНА') label = 'Чирнеко'
        else if (breedKey === 'ИРЛАНДСКИЙ ВОЛКОДАВ') label = 'Ирл. волкодав'
        else if (breedKey === 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР') label = 'АСТ'
        else if (breedKey === 'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА') label = 'Малинуа'
        else if (breedKey === 'ИСПАНСКИЙ ГАЛЬГО') label = 'Гальго'
        return {
          key: breedKey,
          label,
          fullName,
          estWidth: label.length * 9 + 32,
        }
      })
  }, [standings])

  const dogIndex = useMemo(() => {
    return standings.map((d) => ({
      breed: d.breed,
      competition_count: 1,
    }))
  }, [standings])

  // Unique breeds for dropdown
  const breedValues = useMemo(() => {
    return candidateBreeds.map((b) => b.key)
  }, [candidateBreeds])

  // Promotions map by dog name
  const dogPromotionsMap = useMemo(() => {
    const map = new Map<string, string[]>()
    const all = [
      ...(promotions.after_stage_1 || []),
      ...(promotions.after_stage_2 || []),
      ...(promotions.after_stage_3 || []),
    ]
    for (const p of all) {
      const key = p.dog_name.trim().toLowerCase()
      if (!map.has(key)) map.set(key, [])
      const stageRoman = p.stage_from === 1 ? 'I' : p.stage_from === 2 ? 'II' : 'III'
      const text = `Переход после ${stageRoman} этапа: ${p.from_league} → ${p.to_league}${p.reason ? ` (${p.reason})` : ''}`
      map.get(key)!.push(text)
    }
    return map
  }, [promotions])

  // Dynamic league counts reflecting current breed and search query
  const dynamicLeagueCounts = useMemo(() => {
    const searchLower = searchQuery.toLowerCase()
    const breedAndSearchFiltered = (standings || []).filter((d) => {
      const matchesSearch =
        searchQuery === '' ||
        String(d.name || '').toLowerCase().includes(searchLower) ||
        Boolean(d.name_ru && d.name_ru.toLowerCase().includes(searchLower)) ||
        Boolean(d.name_lat && d.name_lat.toLowerCase().includes(searchLower))
      const matchesBreed =
        selectedBreed === '' || matchesBreedFilter(d.breed, selectedBreed)
      const matchesSex =
        !selectedSex ||
        (selectedSex === 'm' && ((d.sex || '').toLowerCase().startsWith('к') || d.sex === 'm')) ||
        (selectedSex === 'f' && ((d.sex || '').toLowerCase().startsWith('с') || d.sex === 'f'))
      return matchesSearch && matchesBreed && matchesSex
    })

    const counts: Record<string, number> = {
      Абсолют: 0,
      Чемпионов: 0,
      Прогресс: 0,
      Юниоры: 0,
      all: breedAndSearchFiltered.length,
      total: breedAndSearchFiltered.length,
    }
    for (const d of breedAndSearchFiltered) {
      if (counts[d.current_league] !== undefined) {
        counts[d.current_league]++
      }
    }
    return counts
  }, [standings, searchQuery, selectedBreed, selectedSex])

  // Filtered and sorted standings
  const filtered = useMemo(() => {
    const searchLower = searchQuery.toLowerCase()
    const res = (standings || []).filter((d) => {
      const matchesLeague =
        selectedLeague === 'all' || d.current_league === selectedLeague
      const matchesSearch =
        searchQuery === '' ||
        String(d.name || '').toLowerCase().includes(searchLower) ||
        Boolean(d.name_ru && d.name_ru.toLowerCase().includes(searchLower)) ||
        Boolean(d.name_lat && d.name_lat.toLowerCase().includes(searchLower))
      const matchesBreed =
        selectedBreed === '' || matchesBreedFilter(d.breed, selectedBreed)
      const matchesSex =
        !selectedSex ||
        (selectedSex === 'm' && ((d.sex || '').toLowerCase().startsWith('к') || d.sex === 'm')) ||
        (selectedSex === 'f' && ((d.sex || '').toLowerCase().startsWith('с') || d.sex === 'f'))
      return matchesLeague && matchesSearch && matchesBreed && matchesSex
    })

    if (sortMode === 'points') {
      return res.sort((a, b) => {
        const diff = (b.total_points || 0) - (a.total_points || 0)
        if (diff !== 0) return diff
        const timeA = a.best_time ?? 999
        const timeB = b.best_time ?? 999
        return timeA - timeB
      })
    }
    return res.sort((a, b) => {
      const timeA = a.best_time ?? 999
      const timeB = b.best_time ?? 999
      if (timeA !== timeB) return timeA - timeB
      return (b.total_points || 0) - (a.total_points || 0)
    })
  }, [standings, selectedLeague, searchQuery, selectedBreed, selectedSex, sortMode])

  const toggleExpand = (dogKey: string) => {
    setExpandedDogKey((prev) => (prev === dogKey ? null : dogKey))
  }

  const handleResetFilters = () => {
    setSelectedLeague('all')
    setSearchQuery('')
    setSelectedBreed('')
    setSelectedSex('')
  }

  const hasActiveFilters =
    selectedLeague !== 'all' || searchQuery !== '' || selectedBreed !== '' || selectedSex !== ''

  const leagueOrder: LeagueFilter[] = ['Чемпионов', 'Абсолют', 'Прогресс', 'Юниоры']
  const sortedLeagues = [...leagueOrder].sort(
    (a, b) => (dynamicLeagueCounts[b] || 0) - (dynamicLeagueCounts[a] || 0)
  )

  const leagueOptions: { label: string; value: LeagueFilter; count: number }[] = [
    { label: `Все лиги (${dynamicLeagueCounts.all})`, value: 'all', count: dynamicLeagueCounts.all },
    ...sortedLeagues.map((league) => ({
      label: `${league} (${dynamicLeagueCounts[league] || 0})`,
      value: league,
      count: dynamicLeagueCounts[league] || 0,
    })),
  ]

  return (
    <div className="space-y-4">
      {/* 1. Мобильная консоль: Поиск + Пол + Порода + Лига + Сброс (строго 1 компактный ряд) */}
      <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск по кличке..."
        />

        {/* Выбор пола */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedSex))}`}
                title="Фильтр по полу"
              >
                {selectedSex === 'm' && <DogSexIcon sex="m" size={12} variant="neutral" className="shrink-0 text-current" />}
                {selectedSex === 'f' && <DogSexIcon sex="f" size={12} variant="neutral" className="shrink-0 text-current" />}
                <span>{!selectedSex ? 'Пол' : selectedSex === 'm' ? 'Кобели' : 'Суки'}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
            isOpen={sexDropdownOpen}
            onOpenChange={setSexDropdownOpen}
            width="130px"
          >
            <div className="p-1 min-w-[125px]" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setSelectedSex('')
                  setSexDropdownOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                  !selectedSex
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-camel-100'
                }`}
              >
                Все
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setSelectedSex('m')
                  setSexDropdownOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                  selectedSex === 'm'
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-camel-100'
                }`}
              >
                <DogSexIcon sex="m" size={14} className={selectedSex === 'm' ? 'text-charcoal-900' : 'text-slate-500'} />
                <span>Кобели</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setSelectedSex('f')
                  setSexDropdownOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                  selectedSex === 'f'
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-camel-100'
                }`}
              >
                <DogSexIcon sex="f" size={14} className={selectedSex === 'f' ? 'text-charcoal-900' : 'text-slate-500'} />
                <span>Суки</span>
              </button>
            </div>
          </ModernDropdown>
        </div>

        {/* Выбор породы */}
        <div className="shrink-0">
          <BreedSearchDropdown
            breeds={breedValues}
            selectedBreed={selectedBreed}
            onSelect={setSelectedBreed}
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedBreed))}`}
              >
                <span className="truncate max-w-[85px]">
                  {selectedBreed ? formatBreedName(selectedBreed) : 'Порода'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
            dogIndex={dogIndex}
          />
        </div>

        {/* Выбор лиги (уникальный фильтр) */}
        <div className="shrink-0">
          <ModernDropdown
            isOpen={leagueDropdownOpen}
            onOpenChange={setLeagueDropdownOpen}
            width="180px"
            portal
            closeOnScroll
            trigger={
              <button
                type="button"
                onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
                className={`shrink-0 ${toolbarPillTriggerClass(selectedLeague !== 'all')}`}
                title="Фильтр по лигам"
              >
                <span>{selectedLeague === 'all' ? 'Все лиги' : `Лига «${selectedLeague}»`}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
            }
          >
            <div className="p-1 space-y-0.5 min-w-[170px]">
              {leagueOptions.map((opt) => {
                const isSelected = selectedLeague === opt.value
                const isEmpty = opt.count === 0 && opt.value !== 'all'

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isEmpty}
                    onClick={() => {
                      setSelectedLeague(opt.value)
                      setLeagueDropdownOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border border-camel-400 bg-camel-100 text-camel-950 font-semibold shadow-2xs'
                        : isEmpty
                        ? 'opacity-40 cursor-not-allowed text-charcoal-400'
                        : 'text-charcoal-700 hover:bg-cream-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-camel-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </ModernDropdown>
        </div>

        {/* Сброс */}
        {hasActiveFilters && (
          <div className="ml-auto shrink-0">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-800 transition-colors shrink-0 cursor-pointer"
              title="Сбросить все фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Десктопная консоль: Поиск + Пол + Разделитель + QuickBreedBar + Лига + Сброс */}
      <div className="hidden sm:flex sm:items-center gap-2 w-full min-w-0">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск по кличке..."
        />

        {/* Выбор пола */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedSex))}`}
                title="Фильтр по полу"
              >
                {selectedSex === 'm' && <DogSexIcon sex="m" size={12} variant="neutral" className="shrink-0 text-current" />}
                {selectedSex === 'f' && <DogSexIcon sex="f" size={12} variant="neutral" className="shrink-0 text-current" />}
                <span>{!selectedSex ? 'Пол' : selectedSex === 'm' ? 'Кобели' : 'Суки'}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
            isOpen={sexDropdownOpen}
            onOpenChange={setSexDropdownOpen}
            width="130px"
          >
            <div className="p-1 min-w-[125px]" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setSelectedSex('')
                  setSexDropdownOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                  !selectedSex
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-camel-100'
                }`}
              >
                Все
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setSelectedSex('m')
                  setSexDropdownOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                  selectedSex === 'm'
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-camel-100'
                }`}
              >
                <DogSexIcon sex="m" size={14} className={selectedSex === 'm' ? 'text-charcoal-900' : 'text-slate-500'} />
                <span>Кобели</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setSelectedSex('f')
                  setSexDropdownOpen(false)
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                  selectedSex === 'f'
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-camel-100'
                }`}
              >
                <DogSexIcon sex="f" size={14} className={selectedSex === 'f' ? 'text-charcoal-900' : 'text-slate-500'} />
                <span>Суки</span>
              </button>
            </div>
          </ModernDropdown>
        </div>

        <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

        {/* QuickBreedBar with breed pills and overflow dropdown */}
        <div className="flex-1 min-w-[200px]">
          <QuickBreedBar
            selectedBreed={selectedBreed}
            onSelectBreed={setSelectedBreed}
            breedValues={breedValues}
            candidateBreeds={candidateBreeds}
            dogIndex={dogIndex}
          />
        </div>

        {/* League Dropdown */}
        <div className="shrink-0">
          <ModernDropdown
            isOpen={leagueDropdownOpen}
            onOpenChange={setLeagueDropdownOpen}
            width="180px"
            portal
            closeOnScroll
            trigger={
              <button
                type="button"
                onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
                className={`shrink-0 ${toolbarPillTriggerClass(selectedLeague !== 'all')}`}
                title="Фильтр по лигам"
              >
                <span>{selectedLeague === 'all' ? 'Все лиги' : `Лига «${selectedLeague}»`}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
            }
          >
            <div className="p-1 space-y-0.5 min-w-[170px]">
              {leagueOptions.map((opt) => {
                const isSelected = selectedLeague === opt.value
                const isEmpty = opt.count === 0 && opt.value !== 'all'

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isEmpty}
                    onClick={() => {
                      setSelectedLeague(opt.value)
                      setLeagueDropdownOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border border-camel-400 bg-camel-100 text-camel-950 font-semibold shadow-2xs'
                        : isEmpty
                        ? 'opacity-40 cursor-not-allowed text-charcoal-400'
                        : 'text-charcoal-700 hover:bg-cream-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-camel-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </ModernDropdown>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-800 transition-colors shrink-0 cursor-pointer"
            title="Сбросить все фильтры"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 2. Main 2-Column Grid Layout (Ranking on Left, Statistics Widgets on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dog Ranking Cards */}
        <div className="lg:col-span-7 xl:col-span-8">
          {/* Main Dog Ranking Card */}
          <div
            className="overflow-hidden rounded-2xl border border-old-money-200 bg-white shadow-2xs touch-pan-y select-none sm:select-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
          >
            {/* Card Header inside */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 sm:px-4 py-3 border-b border-old-money-100 bg-cream-50/40">
              <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy className="w-4 h-4 text-camel-700 shrink-0" />
                  <h2 className="text-sm sm:text-base font-bold font-serif text-charcoal-900 tracking-tight truncate">
                    Сводный рейтинг чемпионата<span className="hidden sm:inline"> Донино</span>
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-charcoal-600 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200 tabular-nums whitespace-nowrap shrink-0">
                  {filtered.length < standings.length
                    ? `${filtered.length} из ${standings.length}`
                    : pluralizeDogs(standings.length)}
                </span>
              </div>

              {/* Toggle Sort: Points vs Time (Clean Borderless Underline Tabs) */}
              <div className="flex items-center gap-3.5 self-start sm:self-auto shrink-0 pt-0.5 sm:pt-0" role="tablist" aria-label="Сортировка рейтинга">
                <button
                  type="button"
                  role="tab"
                  aria-selected={sortMode === 'time'}
                  onClick={() => setSortMode('time')}
                  className={`inline-flex items-center gap-1.5 pb-1 text-xs transition-all cursor-pointer border-b-2 ${
                    sortMode === 'time'
                      ? 'border-camel-600 text-charcoal-900 font-bold'
                      : 'border-transparent text-charcoal-400 hover:text-charcoal-700 font-medium'
                  }`}
                >
                  <Timer className={`w-3.5 h-3.5 ${sortMode === 'time' ? 'text-camel-700' : 'text-charcoal-400'}`} aria-hidden />
                  <span>По скорости</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={sortMode === 'points'}
                  onClick={() => setSortMode('points')}
                  className={`inline-flex items-center gap-1.5 pb-1 text-xs transition-all cursor-pointer border-b-2 ${
                    sortMode === 'points'
                      ? 'border-camel-600 text-charcoal-900 font-bold'
                      : 'border-transparent text-charcoal-400 hover:text-charcoal-700 font-medium'
                  }`}
                >
                  <Award className={`w-3.5 h-3.5 ${sortMode === 'points' ? 'text-camel-700' : 'text-charcoal-400'}`} aria-hidden />
                  <span>По баллам</span>
                </button>
              </div>
            </div>

            {/* Dog List or Empty State */}
            {filtered.length === 0 ? (
              <div className="bg-cream-50/50 p-8 text-center text-charcoal-600 space-y-2">
                <div className="text-sm font-semibold">Ничего не найдено</div>
                <div className="text-xs text-charcoal-500">
                  Попробуйте изменить поисковый запрос или сбросить фильтры
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-camel-600 text-white hover:bg-camel-700 cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="divide-y divide-old-money-100">
              {filtered.map((dog, idx) => {
                const dogNameLower = String(dog.name || '').trim().toLowerCase()
                const dogPromotions =
                  (dogNameLower ? dogPromotionsMap.get(dogNameLower) : undefined) ||
                  (dog.name_ru ? dogPromotionsMap.get(dog.name_ru.trim().toLowerCase()) : undefined) ||
                  (dog.name_lat ? dogPromotionsMap.get(dog.name_lat.trim().toLowerCase()) : undefined)

                return (
                  <ChampionshipDogCard
                    key={dog.dog_key}
                    dog={dog}
                    rank={idx + 1}
                    isExpanded={expandedDogKey === dog.dog_key}
                    sortMode={sortMode}
                    dogPromotions={dogPromotions}
                    onToggle={() => toggleExpand(dog.dog_key)}
                  />
                )
              })}
            </div>
          )}
          </div>
        </div>

        {/* Right Column: Statistics Widgets */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <ChampionshipLinksCard
            selectedLeague={selectedLeague}
            onSelectLeague={setSelectedLeague}
            dynamicLeagueCounts={dynamicLeagueCounts}
            filteredCount={filtered.length}
            resultsSpreadsheetUrl={resultsSpreadsheetUrl}
            pointsSpreadsheetUrl={pointsSpreadsheetUrl}
          />

          <ChampionshipAnatomyWidget
            standings={filtered}
            selectedBreed={selectedBreed}
          />

          <ChampionshipPointsRulesWidget />
        </div>
      </div>
    </div>
  )
}
