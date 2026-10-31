import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  X,
  ExternalLink,
  FileSpreadsheet,
} from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import RankBadge from '../../components/RankBadge'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import QuickBreedBar, { type QuickBreedItem } from '../TopDogs/QuickBreedBar'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName, matchesBreedFilter } from '../../lib/breedMapping'
import { parseDogName } from '../../lib/dogName'
import type { ChampionshipStanding, ChampionshipPromotion } from '../../lib/staticData/donino'

interface ChampionshipStandingsTabProps {
  standings: ChampionshipStanding[]
  promotions: {
    after_stage_1: ChampionshipPromotion[]
    after_stage_2: ChampionshipPromotion[]
  }
  resultsSpreadsheetUrl?: string | null
  pointsSpreadsheetUrl?: string | null
}

type LeagueFilter = 'all' | 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры'

/** Человекопонятные русские статусы для нефинишировавших участников */
function formatChampionshipStatus(status: string | null | undefined): string {
  if (!status) return '—'
  const s = status.toLowerCase().trim()
  if (s === 'dns' || s === 'absent') return 'Неявка'
  if (s === 'withdrawn') return 'Снят'
  if (s === 'dnf') return 'Сошёл'
  if (s === 'dismissed') return 'Отстранён'
  if (s === 'disqualified' || s === 'dq') return 'Дисквалификация'
  return status
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
  const [expandedDogKey, setExpandedDogKey] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<'points' | 'time'>('time')

  // Candidate breeds sorted strictly by participant count descending, then alphabetically
  const candidateBreeds = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of standings) {
      if (d.breed) counts.set(d.breed, (counts.get(d.breed) || 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
      .map(([breedKey]) => {
        const fullName = formatBreedName(breedKey)
        let label = fullName
        if (breedKey === 'РОДЕЗИЙСКИЙ РИДЖБЕК') label = 'Риджбек'
        else if (breedKey === 'РУССКАЯ ПСОВАЯ БОРЗАЯ') label = 'РПБ'
        else if (breedKey === 'ФАРАОНОВА СОБАКА') label = 'ФС'
        else if (breedKey === 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ') label = 'Левретка'
        else if (breedKey === 'ЧИРНЕКО ДЕЛЬ ЭТНА') label = 'Чирнеко'
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

  // Unique breeds for dropdown
  const breedValues = useMemo(() => {
    return candidateBreeds.map((b) => b.key)
  }, [candidateBreeds])

  // Filtered by breed and search query (for dynamic league counts reflecting the breed/query)
  const breedAndSearchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return standings.filter((d) => {
      if (selectedBreed && !matchesBreedFilter(d.breed, selectedBreed)) {
        return false
      }
      if (q) {
        const { primary } = parseDogName(d.name_lat || d.name, d.name_ru)
        const nameMatches =
          primary.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.name_ru.toLowerCase().includes(q) ||
          d.name_lat.toLowerCase().includes(q)
        const breedMatches = d.breed.toLowerCase().includes(q)
        if (!nameMatches && !breedMatches) return false
      }
      return true
    })
  }, [standings, selectedBreed, searchQuery])

  // Counts by league reflecting currently selected breed and search
  const dynamicLeagueCounts = useMemo(() => {
    return {
      all: breedAndSearchFiltered.length,
      Абсолют: breedAndSearchFiltered.filter((d) => d.current_league === 'Абсолют').length,
      Чемпионов: breedAndSearchFiltered.filter((d) => d.current_league === 'Чемпионов').length,
      Прогресс: breedAndSearchFiltered.filter((d) => d.current_league === 'Прогресс').length,
      Юниоры: breedAndSearchFiltered.filter((d) => d.current_league === 'Юниоры').length,
    }
  }, [breedAndSearchFiltered])

  // Map of dog promotions (only meaningful transitions between leagues)
  const dogPromotionsMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const p of promotions.after_stage_1) {
      const k = p.dog_name.trim().toLowerCase()
      const arr = map.get(k) || []
      arr.push(`После I этапа: переведена в ${p.to_league} (${p.reason})`)
      map.set(k, arr)
    }
    for (const p of promotions.after_stage_2) {
      const k = p.dog_name.trim().toLowerCase()
      const arr = map.get(k) || []
      arr.push(`После II этапа: переведена в ${p.to_league} (${p.reason})`)
      map.set(k, arr)
    }
    return map
  }, [promotions])

  // Filtered & sorted standings
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = standings.filter((d) => {
      if (selectedLeague !== 'all' && d.current_league !== selectedLeague) {
        return false
      }
      if (selectedBreed && !matchesBreedFilter(d.breed, selectedBreed)) {
        return false
      }
      if (q) {
        const { primary } = parseDogName(d.name_lat || d.name, d.name_ru)
        const nameMatches =
          primary.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.name_ru.toLowerCase().includes(q) ||
          d.name_lat.toLowerCase().includes(q)
        const breedMatches = d.breed.toLowerCase().includes(q)
        if (!nameMatches && !breedMatches) return false
      }
      return true
    })

    const sorted = [...list]
    if (sortMode === 'points') {
      sorted.sort((a, b) => {
        const ptsA = a.total_points ?? 0
        const ptsB = b.total_points ?? 0
        if (ptsA !== ptsB) return ptsB - ptsA
        if (a.best_time && b.best_time) return a.best_time - b.best_time
        if (a.best_time && !b.best_time) return -1
        if (!a.best_time && b.best_time) return 1
        if (a.stages_count !== b.stages_count) return b.stages_count - a.stages_count
        return a.name.localeCompare(b.name, 'ru')
      })
    } else {
      sorted.sort((a, b) => {
        if (a.best_time && b.best_time) return a.best_time - b.best_time
        if (a.best_time && !b.best_time) return -1
        if (!a.best_time && b.best_time) return 1
        const ptsA = a.total_points ?? 0
        const ptsB = b.total_points ?? 0
        if (ptsA !== ptsB) return ptsB - ptsA
        return a.name.localeCompare(b.name, 'ru')
      })
    }
    return sorted
  }, [standings, selectedLeague, selectedBreed, searchQuery, sortMode])

  // Top 5 dogs for Anatomy of Points from the currently filtered list (reflects breed, league, search)
  const top5AnatomyDogs = useMemo(() => {
    return [...filtered]
      .filter((d) => (d.total_points || 0) > 0)
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0) || (a.best_time ?? 999) - (b.best_time ?? 999))
      .slice(0, 5)
      .map((dog) => {
        let placePts = 0
        let bonusPts = 0

        for (const h of dog.history) {
          if (h.points_breakdown) {
            placePts += h.points_breakdown.place_points || 0
            bonusPts +=
              (h.points_breakdown.best_final_points || 0) +
              (h.points_breakdown.best_class_points || 0) +
              (h.points_breakdown.best_breed_points || 0) +
              (h.points_breakdown.track_record_points || 0)
          }
        }

        const total = dog.total_points || (placePts + bonusPts)
        const placePct = total > 0 ? Math.round((placePts / total) * 100) : 0
        const bonusPct = total > 0 ? 100 - placePct : 0

        return {
          dog,
          placePts,
          bonusPts,
          total,
          placePct,
          bonusPct,
        }
      })
  }, [filtered])

  const maxAnatomyPts = useMemo(() => {
    return top5AnatomyDogs.length > 0 ? top5AnatomyDogs[0].total : 1
  }, [top5AnatomyDogs])

  const hasActiveFilters = Boolean(
    selectedLeague !== 'all' || selectedBreed || searchQuery.trim()
  )

  const handleResetFilters = () => {
    setSelectedLeague('all')
    setSelectedBreed('')
    setSearchQuery('')
  }

  const toggleExpand = (dogKey: string) => {
    setExpandedDogKey((prev) => (prev === dogKey ? null : dogKey))
  }


  return (
    <div className="space-y-4">
      {/* 1. Page Toolbar: Search, League Dropdown, QuickBreedBar, Reset */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search (matches ranking) */}
        <div className="shrink-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Кличка или порода…"
          />
        </div>

        {/* League Dropdown */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(selectedLeague !== 'all')}`}
              >
                <span className="truncate max-w-[125px]">
                  {selectedLeague === 'all'
                    ? 'Все лиги'
                    : `Лига «${selectedLeague}»`}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
            isOpen={leagueDropdownOpen}
            onOpenChange={setLeagueDropdownOpen}
            width="190px"
          >
            <div className="p-1 space-y-0.5">
              {(['all', 'Абсолют', 'Чемпионов', 'Прогресс', 'Юниоры'] as const).map(
                (l) => {
                  const isSel = selectedLeague === l
                  const label = l === 'all' ? 'Все лиги' : `Лига «${l}»`
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setSelectedLeague(l)
                        setLeagueDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                        isSel
                          ? 'bg-camel-500/20 text-charcoal-900 font-bold'
                          : 'text-charcoal-700 hover:bg-cream-100'
                      }`}
                    >
                      <span>{label}</span>
                      <span className="text-[10px] text-charcoal-500 font-normal">
                        ({dynamicLeagueCounts[l]})
                      </span>
                    </button>
                  )
                }
              )}
            </div>
          </ModernDropdown>
        </div>

        <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5 hidden sm:block" aria-hidden="true" />

        {/* QuickBreedBar with breed pills and overflow dropdown */}
        <div className="flex-1 min-w-[200px]">
          <QuickBreedBar
            selectedBreed={selectedBreed}
            onSelectBreed={setSelectedBreed}
            breedValues={breedValues}
            candidateBreeds={candidateBreeds}
          />
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="relative shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-old-money-200 bg-cream-50 text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-100 transition-colors cursor-pointer"
            title="Сбросить фильтры"
            aria-label="Сбросить фильтры"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 2. Main 2-Column Grid Layout (Ranking on Left, Statistics Widgets on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dog Ranking Cards */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-serif uppercase tracking-wider text-charcoal-800">
                Рейтинг участников и лиги
              </h2>
              <span className="text-xs text-charcoal-500 font-medium">
                ({filtered.length} из {standings.length})
              </span>
            </div>

            {/* Toggle Sort: Points vs Time */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-cream-100 border border-old-money-200 shadow-2xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSortMode('time')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  sortMode === 'time'
                    ? 'border border-camel-400 bg-camel-100 text-camel-950 font-bold shadow-2xs'
                    : 'text-charcoal-600 hover:text-charcoal-900 font-medium'
                }`}
              >
                <span>По скорости</span>
              </button>
              <button
                type="button"
                onClick={() => setSortMode('points')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  sortMode === 'points'
                    ? 'border border-camel-400 bg-camel-100 text-camel-950 font-bold shadow-2xs'
                    : 'text-charcoal-600 hover:text-charcoal-900 font-medium'
                }`}
              >
                <span>По баллам</span>
              </button>
            </div>
          </div>

          {/* Dog List */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-8 text-center text-charcoal-600 space-y-2">
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
            <div className="space-y-2">
              {filtered.map((dog, idx) => {
                const rank = idx + 1
                const isExpanded = expandedDogKey === dog.dog_key

                // League badge styling
                const leagueBadgeClass =
                  dog.current_league === 'Абсолют'
                    ? 'bg-amber-100/90 text-amber-900 border border-amber-300/80'
                    : dog.current_league === 'Чемпионов'
                    ? 'bg-camel-100 text-charcoal-900 border border-camel-300'
                    : dog.current_league === 'Прогресс'
                    ? 'bg-cream-200 text-charcoal-700 border border-old-money-300'
                    : 'bg-sky-50 text-sky-800 border border-sky-200'

                const dogPromotions =
                  dogPromotionsMap.get(dog.name.trim().toLowerCase()) ||
                  (dog.name_ru ? dogPromotionsMap.get(dog.name_ru.trim().toLowerCase()) : undefined) ||
                  (dog.name_lat ? dogPromotionsMap.get(dog.name_lat.trim().toLowerCase()) : undefined)
                const { primary, secondary } = parseDogName(dog.name_lat || dog.name, dog.name_ru || dog.name)

                return (
                  <div
                    key={dog.dog_key}
                    className="rounded-xl border border-old-money-200 bg-cream-50/90 shadow-2xs overflow-hidden transition-all hover:border-camel-400 hover:shadow-xs"
                  >
                    {/* Header Row — Clean, uniformly aligned */}
                    <div
                      onClick={() => toggleExpand(dog.dog_key)}
                      className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Rank Badge with Official Medals for 1, 2, 3 */}
                        <div className="shrink-0 flex items-center justify-center w-8 sm:w-9">
                          <RankBadge rank={rank} hideDelta />
                        </div>

                        {/* Dog info: Clean Name and Breed */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {dog.dog_id ? (
                              <Link
                                to={`/dog/${dog.dog_id}`}
                                onClick={(e) => e.stopPropagation()}
                                title={secondary || undefined}
                                className="font-bold font-serif text-charcoal-900 hover:text-camel-800 transition-colors text-xs sm:text-sm truncate"
                              >
                                {primary}
                              </Link>
                            ) : (
                              <span
                                title={secondary || undefined}
                                className="font-bold font-serif text-charcoal-900 text-xs sm:text-sm truncate"
                              >
                                {primary}
                              </span>
                            )}
                            <OwnerCrownName dogName={primary} />
                            {dog.sex && (
                              <DogSexIcon
                                sex={dog.sex === 'Сука' ? 'f' : 'm'}
                                size={12}
                                variant="neutral"
                                className="shrink-0"
                              />
                            )}
                          </div>

                          <div className="text-[11px] text-charcoal-600 mt-0.5">
                            <span className="font-medium">
                              {formatBreedName(dog.breed)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Fixed League Badge, Racing Time, Chevron */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Current League Badge (always in the exact same aligned position) */}
                        <span
                          className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${leagueBadgeClass}`}
                        >
                          Лига «{dog.current_league}»
                        </span>

                        {/* Best Time & Points Display depending on sortMode */}
                        <div className="text-right pl-1 sm:pl-2 shrink-0 min-w-[72px]">
                          {sortMode === 'points' ? (
                            <>
                              <div className="flex items-baseline justify-end gap-1 leading-none">
                                <span className="font-serif text-base sm:text-lg font-bold tabular-nums text-camel-900 leading-none">
                                  {dog.total_points != null && dog.total_points > 0 ? dog.total_points : '—'}
                                </span>
                                {dog.total_points != null && dog.total_points > 0 && (
                                  <span className="text-xs font-semibold text-charcoal-700">б.</span>
                                )}
                              </div>
                              <div className="text-[10px] text-charcoal-500 mt-1 leading-tight font-mono">
                                {dog.best_time ? `${dog.best_time.toFixed(2)} сек` : 'без заездов'}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-baseline justify-end gap-1 leading-none">
                                <span className="font-serif text-base sm:text-lg font-bold tabular-nums text-camel-800 leading-none">
                                  {dog.best_time ? dog.best_time.toFixed(2) : '—'}
                                </span>
                                <span className="text-xs font-semibold text-charcoal-600">сек</span>
                              </div>
                              <div className="text-[10px] text-charcoal-500 mt-1 leading-tight font-medium">
                                {dog.total_points != null && dog.total_points > 0 ? `${dog.total_points} б.` : '0 б.'}
                                {dog.stages_count > 1 ? ` · ${dog.stages_count} заб.` : ''}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Chevron */}
                        <div className="text-charcoal-400 pl-0.5">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Drawer: Stage History */}
                    {isExpanded && (
                      <div className="p-3 sm:p-4 bg-cream-100/80 border-t border-old-money-200 space-y-2.5 animate-fadeIn">
                        <div className="text-xs font-semibold text-charcoal-700 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-camel-700" />
                            <span>История выступлений на этапах:</span>
                          </div>
                          <span className="sm:hidden text-[10px] px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-semibold">
                            Лига «{dog.current_league}»
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {dog.history.map((h, hIdx) => {
                            const b = h.points_breakdown
                            return (
                              <div
                                key={hIdx}
                                className="p-2.5 rounded-xl bg-cream-50 border border-old-money-200 flex flex-col justify-between gap-1.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-bold text-charcoal-900">
                                      {h.stage_num === 1
                                        ? 'I этап'
                                        : h.stage_num === 2
                                        ? 'II этап'
                                        : 'III этап'}{' '}
                                      ({h.date})
                                    </div>
                                    <div className="text-[11px] text-charcoal-600">
                                      {h.breed_class}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className={`font-bold ${h.placement > 0 ? 'text-charcoal-900' : 'text-stone-500 font-medium'}`}>
                                      {h.placement > 0 ? `${h.placement} место` : formatChampionshipStatus(h.status)}
                                      {h.points != null && h.points > 0 ? (
                                        <span className="ml-1 text-camel-900 font-bold">· {h.points} б.</span>
                                      ) : null}
                                    </div>
                                    <div className="font-mono text-camel-800 text-[11px]">
                                      {h.total_score ? `${h.total_score.toFixed(2)} сек` : ''}
                                    </div>
                                  </div>
                                </div>

                                {/* Bonus breakdown badges */}
                                {b && (b.place_points > 0 || b.best_final_points > 0 || b.best_class_points > 0 || b.best_breed_points > 0 || b.track_record_points > 0) && (
                                  <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-old-money-100 text-[10px]">
                                    {b.place_points > 0 && (
                                      <span className="px-1.5 py-0.5 rounded bg-cream-100 text-charcoal-700 font-medium border border-old-money-200/60">
                                        место: +{b.place_points}
                                      </span>
                                    )}
                                    {b.best_final_points > 0 && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-medium border border-amber-200">
                                        финал: +1
                                      </span>
                                    )}
                                    {b.best_class_points > 0 && (
                                      <span className="px-1.5 py-0.5 rounded bg-camel-50 text-camel-900 font-medium border border-camel-200">
                                        класс: +1
                                      </span>
                                    )}
                                    {b.best_breed_points > 0 && (
                                      <span className="px-1.5 py-0.5 rounded bg-forest-50 text-forest-900 font-medium border border-forest-200">
                                        порода: +1
                                      </span>
                                    )}
                                    {b.track_record_points > 0 && (
                                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-900 font-medium border border-rose-200">
                                        рекорд: +1
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Transitions between leagues (only if dog actually transitioned) */}
                        {dogPromotions && dogPromotions.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {dogPromotions.map((note, nIdx) => (
                              <div
                                key={nIdx}
                                className="text-[11px] text-emerald-900 bg-emerald-50/80 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 font-medium"
                              >
                                {note}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Statistics Widgets */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Card 1: Сезон 2026, Участники по лигам & Документы */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3 text-xs text-charcoal-700">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                Сезон 2026
              </span>
              <span className="text-xs font-semibold text-charcoal-800">
                {selectedLeague !== 'all'
                  ? `Лига «${selectedLeague}»: ${filtered.length} из ${dynamicLeagueCounts.total} собак`
                  : `Всего: ${dynamicLeagueCounts.total} собак`}
              </span>
            </div>

            {/* League distribution badges (dynamic, reflecting current breed/search) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {(['Абсолют', 'Чемпионов', 'Прогресс', 'Юниоры'] as const).map((league) => {
                const count = dynamicLeagueCounts[league]
                const isSelected = selectedLeague === league

                const badgeBase =
                  league === 'Абсолют'
                    ? 'bg-amber-50 text-amber-950 border-amber-200'
                    : league === 'Чемпионов'
                    ? 'bg-camel-100 text-charcoal-800 border-old-money-200'
                    : league === 'Прогресс'
                    ? 'bg-cream-100 text-charcoal-800 border-old-money-200'
                    : 'bg-sky-50 text-sky-900 border-sky-200'

                const activeStyle = isSelected
                  ? 'ring-2 ring-camel-600 font-bold shadow-xs'
                  : 'hover:opacity-100'

                return (
                  <button
                    key={league}
                    type="button"
                    onClick={() => setSelectedLeague((prev) => (prev === league ? 'all' : league))}
                    className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-all cursor-pointer ${badgeBase} ${activeStyle} ${
                      count === 0 ? 'opacity-40' : ''
                    }`}
                    title={
                      isSelected
                        ? `Сбросить фильтр лиги «${league}»`
                        : `Фильтровать по лиге «${league}» (${count})`
                    }
                  >
                    {league} <b>{count}</b>
                  </button>
                )
              })}
            </div>

            {/* External Links */}
            <div className="space-y-1.5 pt-2 border-t border-old-money-200">
              <a
                href={resultsSpreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1OKA9-I7oiY3xOisuxiDUOpn6C6bGxSQMkZDcuwtXiJg/edit?gid=22361699#gid=22361699'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs"
                title="Официальная таблица результатов забегов с временами и переходами в лиги"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Результаты забегов (Google)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
              </a>

              <a
                href={pointsSpreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1PGrVO98HfxwzoOxHmd8eRaygvl3iJryIXYfPd7vmyNQ/edit?gid=0#gid=0'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs"
                title="Официальная таблица начисления очков, бонусов за лучшее время и рекорды трека"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Разбалловка и бонусы (Google)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
              </a>

              <a
                href="https://runningdog.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs"
                title="Официальный сайт бегового клуба «Курсинг в Донино»"
              >
                <div className="flex items-center gap-2">
                  <span className="p-0.5 rounded border border-old-money-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0">
                    <img
                      src="/assets/icons/runningdog.png"
                      alt=""
                      width={20}
                      height={12}
                      className="w-[20px] h-[12px] object-contain shrink-0"
                    />
                  </span>
                  <span>Курсинг в Донино</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
              </a>
            </div>
          </div>

          {/* Card 2: Анатомия баллов (Топ-5 текущей выборки) */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3 text-xs text-charcoal-700">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
                Анатомия баллов: Топ-5
              </h3>
              <div className="flex items-center gap-2 text-[10px] shrink-0 font-medium">
                <span className="flex items-center gap-1 text-charcoal-700">
                  <span className="w-2 h-2 rounded-full bg-camel-700 inline-block shrink-0" />
                  <span>Места</span>
                </span>
                <span className="flex items-center gap-1 text-camel-900">
                  <span className="w-2 h-2 rounded-full bg-camel-400 inline-block shrink-0" />
                  <span>Бонусы</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-charcoal-500 leading-tight">
              Базовые очки за места в заездах vs скоростные бонусы (+1 б.) в текущей выборке
            </p>

            {top5AnatomyDogs.length === 0 ? (
              <div className="text-center py-3 text-charcoal-500 text-[11px] italic">
                Нет собак с начисленными баллами
              </div>
            ) : (
              <div className="space-y-2 pt-0.5">
                {top5AnatomyDogs.map((item, idx) => {
                  const { primary, secondary } = parseDogName(item.dog.name_lat || item.dog.name, item.dog.name_ru)
                  const barWidthPct = Math.max(12, Math.min(100, Math.round((item.total / maxAnatomyPts) * 100)))

                  return (
                    <div key={item.dog.dog_key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          <span className="w-4 text-center font-bold text-charcoal-400 text-[10px] shrink-0">
                            #{idx + 1}
                          </span>
                          {item.dog.dog_id ? (
                            <Link
                              to={`/dog/${item.dog.dog_id}`}
                              title={secondary || undefined}
                              className="font-serif font-bold text-charcoal-900 hover:text-camel-800 truncate"
                            >
                              {primary}
                            </Link>
                          ) : (
                            <span title={secondary || undefined} className="font-serif font-bold text-charcoal-900 truncate">
                              {primary}
                            </span>
                          )}
                          {!selectedBreed && (
                            <span className="text-[10px] text-charcoal-400 truncate hidden sm:inline">
                              · {formatBreedName(item.dog.breed)}
                            </span>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 text-right font-mono">
                          <span className="text-[10px] text-charcoal-500">
                            {item.placePts}&nbsp;б. + {item.bonusPts}&nbsp;б.
                          </span>
                          <span className="font-bold text-xs text-charcoal-900 min-w-[28px]">
                            {item.total}&nbsp;б.
                          </span>
                        </div>
                      </div>

                      {/* Stacked bar with noble tone-on-tone Old Money palette */}
                      <div className="h-2 w-full bg-cream-200/90 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${barWidthPct}%` }}
                          className="h-full flex overflow-hidden rounded-full shadow-2xs"
                        >
                          <div
                            style={{ width: `${item.placePct}%` }}
                            className="h-full bg-camel-700 transition-all duration-300"
                            title={`Баллы за место: ${item.placePts}`}
                          />
                          <div
                            style={{ width: `${item.bonusPct}%` }}
                            className="h-full bg-camel-400 transition-all duration-300"
                            title={`Бонусы за скорость: ${item.bonusPts}`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Widget: Начисление баллов и бонусы */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3 text-xs text-charcoal-700">
            <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
              Начисление баллов и бонусы
            </h3>

            {/* Base Points for Places */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-charcoal-800 uppercase tracking-wide">
                Баллы за занятое место:
              </div>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
                <div className="p-1 rounded bg-cream-100 border border-old-money-200">
                  <span className="text-charcoal-500 text-[10px] block">1 место</span>
                  <span className="font-bold text-amber-950">10 б.</span>
                </div>
                <div className="p-1 rounded bg-cream-100 border border-old-money-200">
                  <span className="text-charcoal-500 text-[10px] block">2 место</span>
                  <span className="font-bold text-amber-950">9 б.</span>
                </div>
                <div className="p-1 rounded bg-cream-100 border border-old-money-200">
                  <span className="text-charcoal-500 text-[10px] block">3 место</span>
                  <span className="font-bold text-amber-950">8 б.</span>
                </div>
                <div className="p-1 rounded bg-cream-100 border border-old-money-200">
                  <span className="text-charcoal-500 text-[10px] block">4+ место</span>
                  <span className="font-bold text-amber-950">7..1 б.</span>
                </div>
              </div>
            </div>

            {/* 4 Speed Bonuses */}
            <div className="space-y-1.5 pt-1 border-t border-old-money-200">
              <div className="text-[11px] font-bold text-charcoal-800 uppercase tracking-wide">
                4 бонуса за скорость (по +1 б.):
              </div>
              <ul className="space-y-1 text-[11px] text-charcoal-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold shrink-0">+1</span>
                  <span>Лучшее время финала в классе</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-camel-700 font-bold shrink-0">+1</span>
                  <span>Лучшее время во всём классе</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-forest-700 font-bold shrink-0">+1</span>
                  <span>Лучшее время в породе</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-700 font-bold shrink-0">+1</span>
                  <span>Абсолютный рекорд трека Донино</span>
                </li>
              </ul>
            </div>
          </div>
          </div>
      </div>
    </div>
  )
}
