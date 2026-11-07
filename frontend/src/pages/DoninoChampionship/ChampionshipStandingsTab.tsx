import React, { useState, useMemo } from 'react'
import { Trophy, Timer, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import { canonicalBreed, formatBreedName, matchesBreedFilter } from '../../lib/breedMapping'
import type { ChampionshipStanding, ChampionshipPromotion } from '../../lib/staticData/donino'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import ChampionshipDogCard from './components/ChampionshipDogCard'
import ChampionshipAnatomyWidget from './components/ChampionshipAnatomyWidget'
import ChampionshipPointsRulesWidget from './components/ChampionshipPointsRulesWidget'
import ChampionshipLinksCard, { type LeagueFilter, pluralizeDogs } from './components/ChampionshipLinksCard'
import ChampionshipToolbar from './components/ChampionshipToolbar'
import { useChampionshipCarousel } from './hooks/useChampionshipCarousel'

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
  const [selectedSex, setSelectedSex] = useState<string>('')
  const [expandedDogKey, setExpandedDogKey] = useState<string | null>(null)

  const {
    sortMode,
    activeSlide,
    isNudging,
    isAnimating,
    trackRef,
    hadMovedRef,
    triggerNudge,
    handleSortModeChange,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  } = useChampionshipCarousel()

  // Candidate breeds sorted strictly by participant count descending, then alphabetically
  const candidateBreeds = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of standings || []) {
      const b = canonicalBreed(d.breed)
      if (b) counts.set(b, (counts.get(b) || 0) + 1)
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

  // Base filtered list before sorting
  const baseFiltered = useMemo(() => {
    const searchLower = searchQuery.toLowerCase()
    return (standings || []).filter((d) => {
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
  }, [standings, selectedLeague, searchQuery, selectedBreed, selectedSex])

  const filteredByTime = useMemo(() => {
    return [...baseFiltered].sort((a, b) => {
      const timeA = a.best_time ?? 999
      const timeB = b.best_time ?? 999
      if (timeA !== timeB) return timeA - timeB
      return (b.total_points || 0) - (a.total_points || 0)
    })
  }, [baseFiltered])

  const filteredByPoints = useMemo(() => {
    return [...baseFiltered].sort((a, b) => {
      const diff = (b.total_points || 0) - (a.total_points || 0)
      if (diff !== 0) return diff
      const timeA = a.best_time ?? 999
      const timeB = b.best_time ?? 999
      return timeA - timeB
    })
  }, [baseFiltered])

  const filtered = sortMode === 'time' ? filteredByTime : filteredByPoints

  const listLength = Math.max(filteredByTime.length, filteredByPoints.length)
  const { visibleCount, loadMoreRef, hasMore } = useInfiniteScroll(
    listLength,
    [selectedLeague, searchQuery, selectedBreed, selectedSex, sortMode],
    30
  )

  const toggleExpand = (dogKey: string) => {
    setExpandedDogKey((prev) => (prev === dogKey ? null : dogKey))
  }

  const handleResetFilters = () => {
    setSelectedLeague('all')
    setSearchQuery('')
    setSelectedBreed('')
    setSelectedSex('')
  }

  const renderDogList = (list: typeof filteredByTime, mode: 'time' | 'points') => {
    if (list.length === 0) {
      return (
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
      )
    }

    const visibleList = list.slice(0, visibleCount)

    return (
      <div className="divide-y divide-old-money-100">
        {visibleList.map((dog, idx) => {
          const dogNameLower = String(dog.name || '').trim().toLowerCase()
          const dogPromotions =
            (dogNameLower ? dogPromotionsMap.get(dogNameLower) : undefined) ||
            (dog.name_ru ? dogPromotionsMap.get(dog.name_ru.trim().toLowerCase()) : undefined) ||
            (dog.name_lat ? dogPromotionsMap.get(dog.name_lat.trim().toLowerCase()) : undefined)

          return (
            <ChampionshipDogCard
              key={`${mode}-${dog.dog_key}`}
              dog={dog}
              rank={idx + 1}
              isExpanded={expandedDogKey === dog.dog_key}
              sortMode={mode}
              dogPromotions={dogPromotions}
              onToggle={() => toggleExpand(dog.dog_key)}
            />
          )
        })}
      </div>
    )
  }

  const hasActiveFilters =
    selectedLeague !== 'all' || searchQuery !== '' || selectedBreed !== '' || selectedSex !== ''

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <ChampionshipToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSex={selectedSex}
        onSexChange={setSelectedSex}
        selectedBreed={selectedBreed}
        onBreedChange={setSelectedBreed}
        selectedLeague={selectedLeague}
        onLeagueChange={setSelectedLeague}
        dynamicLeagueCounts={dynamicLeagueCounts}
        candidateBreeds={candidateBreeds}
        breedValues={breedValues}
        dogIndex={dogIndex}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Main 2-Column Grid Layout (Ranking on Left, Statistics Widgets on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dog Ranking Cards */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Main Dog Ranking Card with Physical Swipe Carousel */}
          <div
            className="relative overflow-hidden rounded-2xl border border-old-money-200 bg-white shadow-2xs touch-pan-y select-none sm:select-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onClickCapture={(e) => {
              if (hadMovedRef.current) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            {/* Card Header inside */}
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 sm:px-4 py-3 border-b border-old-money-100 bg-cream-50/40">
              <div className={`flex items-center justify-between sm:justify-start gap-2 min-w-0 sm:px-0 ${activeSlide === 0 ? 'pr-20 sm:pr-0' : 'pl-20 sm:pl-0'}`}>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  {activeSlide === 0 ? (
                    <Trophy className="w-4 h-4 text-camel-700 shrink-0" />
                  ) : (
                    <Award className="w-4 h-4 text-camel-700 shrink-0" />
                  )}
                  <h2 className="text-sm sm:text-base font-bold font-serif text-charcoal-900 tracking-tight truncate">
                    <span className="sm:hidden">Рейтинг: {activeSlide === 0 ? 'скорость' : 'баллы'}</span>
                    <span className="hidden sm:inline">Сводный рейтинг: {activeSlide === 0 ? 'по скорости' : 'по баллам'}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-charcoal-600 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200 tabular-nums whitespace-nowrap">
                    {filtered.length < standings.length
                      ? `${filtered.length} из ${standings.length}`
                      : pluralizeDogs(standings.length)}
                  </span>
                </div>
              </div>

              {/* Физический прозрачный язычок с края шапки (Mobile) */}
              <div className="sm:hidden">
                {activeSlide === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleSortModeChange('points')
                      triggerNudge()
                    }}
                    className={`absolute top-1/2 -translate-y-1/2 right-0 z-20 inline-flex items-center gap-1 rounded-l-full border-y border-l border-camel-400/90 bg-camel-100/80 pl-3 pr-2 py-1.5 text-[11px] font-bold text-camel-950 shadow-md backdrop-blur-md transition-all hover:bg-camel-200 active:scale-95 cursor-pointer touch-manipulation ${
                      isNudging ? 'animate-tab-nudge-left' : ''
                    }`}
                    title="Смахните экран или нажмите для перехода к баллам"
                    aria-label="Перейти к баллам"
                  >
                    <span>Баллы</span>
                    <ChevronRight className="w-3.5 h-3.5 text-camel-800 shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleSortModeChange('time')
                      triggerNudge()
                    }}
                    className={`absolute top-1/2 -translate-y-1/2 left-0 z-20 inline-flex items-center gap-1 rounded-r-full border-y border-r border-camel-400/90 bg-camel-100/80 pr-3 pl-2 py-1.5 text-[11px] font-bold text-camel-950 shadow-md backdrop-blur-md transition-all hover:bg-camel-200 active:scale-95 cursor-pointer touch-manipulation ${
                      isNudging ? 'animate-tab-nudge-right' : ''
                    }`}
                    title="Смахните экран или нажмите для перехода к скорости"
                    aria-label="Перейти к скорости"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-camel-800 shrink-0" />
                    <span>Скорость</span>
                  </button>
                )}
              </div>

              {/* Desktop-only Underline Tabs */}
              <div className="hidden sm:flex items-center gap-3.5 self-start sm:self-auto shrink-0 pt-0.5 sm:pt-0" role="tablist" aria-label="Сортировка рейтинга">
                <button
                  type="button"
                  role="tab"
                  aria-selected={sortMode === 'time'}
                  onClick={() => handleSortModeChange('time')}
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
                  onClick={() => handleSortModeChange('points')}
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

            {/* Real Physical Two-Column Slider */}
            <div className="relative overflow-hidden w-full">
              <div
                ref={trackRef}
                className="flex w-full items-start"
                style={{
                  transform: `translate3d(${-activeSlide * 100}%, 0, 0)`,
                  transition: isNudging ? 'none' : 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                }}
              >
                {/* Slide 1: By Speed */}
                <div
                  className={`w-full shrink-0 min-w-0 transition-opacity duration-200 ${
                    !isAnimating && activeSlide === 1
                      ? 'h-0 overflow-hidden opacity-0'
                      : 'h-auto opacity-100'
                  }`}
                >
                  {renderDogList(filteredByTime, 'time')}
                </div>

                {/* Slide 2: By Points */}
                <div
                  className={`w-full shrink-0 min-w-0 transition-opacity duration-200 ${
                    !isAnimating && activeSlide === 0
                      ? 'h-0 overflow-hidden opacity-0'
                      : 'h-auto opacity-100'
                  }`}
                >
                  {renderDogList(filteredByPoints, 'points')}
                </div>
              </div>
            </div>

            {hasMore && (
              <div
                ref={loadMoreRef}
                className="py-4 text-center text-xs font-semibold text-charcoal-400"
              >
                Загрузка участников…
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
