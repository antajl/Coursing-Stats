import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  X,
} from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName } from '../../lib/breedMapping'
import { toDogTitleCase } from '../../lib/dogName'
import type { ChampionshipStanding, ChampionshipPromotion } from '../../lib/staticData/donino'

interface ChampionshipStandingsTabProps {
  standings: ChampionshipStanding[]
  promotions: {
    after_stage_1: ChampionshipPromotion[]
    after_stage_2: ChampionshipPromotion[]
  }
}

type LeagueFilter = 'all' | 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры'

export default function ChampionshipStandingsTab({
  standings,
  promotions,
}: ChampionshipStandingsTabProps) {
  const [selectedLeague, setSelectedLeague] = useState<LeagueFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false)
  const [expandedDogKey, setExpandedDogKey] = useState<string | null>(null)
  const [showPromotions, setShowPromotions] = useState(false)

  // Unique breeds
  const breeds = useMemo(() => {
    const set = new Set<string>()
    for (const d of standings) {
      if (d.breed) set.add(d.breed)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'))
  }, [standings])

  // Counts by league
  const leagueCounts = useMemo(() => {
    return {
      all: standings.length,
      Абсолют: standings.filter((d) => d.current_league === 'Абсолют').length,
      Чемпионов: standings.filter((d) => d.current_league === 'Чемпионов').length,
      Прогресс: standings.filter((d) => d.current_league === 'Прогресс').length,
      Юниоры: standings.filter((d) => d.current_league === 'Юниоры').length,
    }
  }, [standings])

  // Filtered standings
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return standings.filter((d) => {
      if (selectedLeague !== 'all' && d.current_league !== selectedLeague) {
        return false
      }
      if (selectedBreed && d.breed !== selectedBreed) {
        return false
      }
      if (q) {
        const nameMatches =
          d.name.toLowerCase().includes(q) ||
          d.name_ru.toLowerCase().includes(q) ||
          d.name_lat.toLowerCase().includes(q)
        const breedMatches = d.breed.toLowerCase().includes(q)
        if (!nameMatches && !breedMatches) return false
      }
      return true
    })
  }, [standings, selectedLeague, selectedBreed, searchQuery])

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

  const totalPromotions =
    promotions.after_stage_1.length + promotions.after_stage_2.length

  return (
    <div className="space-y-4">
      {/* 1. Toolbar: Search, League Dropdown, Breed Dropdown, Reset, Promotions Button */}
      <div className="rounded-2xl border border-old-money-200 bg-cream-50/80 p-2 sm:p-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search (same as in ranking) */}
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
                          ({leagueCounts[l]})
                        </span>
                      </button>
                    )
                  }
                )}
              </div>
            </ModernDropdown>
          </div>

          {/* Breed Dropdown (same as in ranking) */}
          <div className="shrink-0">
            <BreedSearchDropdown
              breeds={breeds}
              selectedBreed={selectedBreed}
              onSelect={(b) => setSelectedBreed(b || '')}
              trigger={
                <button
                  type="button"
                  className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedBreed))}`}
                >
                  <span className="truncate max-w-[120px]">
                    {selectedBreed ? formatBreedName(selectedBreed) : 'Порода'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </button>
              }
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

          {/* Right: Promotions Chronicle Button */}
          <div className="ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowPromotions(!showPromotions)}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                showPromotions
                  ? 'border-camel-500 bg-camel-500/20 text-charcoal-900 font-bold'
                  : 'border-old-money-200 bg-cream-50 text-charcoal-700 hover:border-camel-400 hover:bg-cream-100'
              }`}
              title="Хроника переходов между лигами"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-camel-700" />
              <span>Переходы ({totalPromotions})</span>
              {showPromotions ? (
                <ChevronUp className="w-3.5 h-3.5 text-charcoal-600" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Promotions Box */}
        {showPromotions && (
          <div className="mt-3 pt-3 border-t border-old-money-200 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* After Stage 2 */}
            <div className="bg-cream-100/70 rounded-xl p-3 border border-old-money-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-serif text-charcoal-900">
                  Переходы после II этапа (к III этапу)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-camel-200/60 text-charcoal-800 font-medium">
                  {promotions.after_stage_2.length} собак
                </span>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
                {promotions.after_stage_2.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-cream-50 border border-old-money-200/70"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-charcoal-900 truncate">
                        {toDogTitleCase(p.dog_name)}
                      </div>
                      <div className="text-[10px] text-charcoal-500 truncate">{p.breed}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{p.to_league.replace('Лига ', '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* After Stage 1 */}
            <div className="bg-cream-100/70 rounded-xl p-3 border border-old-money-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-serif text-charcoal-900">
                  Переходы после I этапа (ко II этапу)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-camel-200/60 text-charcoal-800 font-medium">
                  {promotions.after_stage_1.length} собак
                </span>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
                {promotions.after_stage_1.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-cream-50 border border-old-money-200/70"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-charcoal-900 truncate">
                        {toDogTitleCase(p.dog_name)}
                      </div>
                      <div className="text-[10px] text-charcoal-500 truncate">{p.breed}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{p.to_league.replace('Лига ', '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Standings Cards List */}
      <div className="space-y-2">
        <div className="text-xs text-charcoal-600 px-1 flex items-center justify-between">
          <span>
            Показано: <strong className="text-charcoal-900">{filtered.length}</strong> из{' '}
            {standings.length} участников
          </span>
          <span className="hidden sm:inline text-old-money-500">
            Нажмите на карточку собаки для просмотра истории забегов
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-cream-50 rounded-2xl border border-old-money-200 text-charcoal-600">
            По заданным фильтрам участники не найдены.
          </div>
        ) : (
          filtered.map((dog, idx) => {
            const isExpanded = expandedDogKey === dog.dog_key
            const dogLink = dog.dog_id
              ? `/dog/${dog.dog_id}/`
              : `/donino-dog/${encodeURIComponent(dog.name)}/${encodeURIComponent(dog.breed)}/`

            // League badge styles
            let leagueBadgeClass = 'bg-stone-100 text-stone-800 border-stone-300'
            if (dog.current_league === 'Абсолют') {
              leagueBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
            } else if (dog.current_league === 'Чемпионов') {
              leagueBadgeClass = 'bg-camel-100 text-charcoal-900 border-camel-300 font-semibold'
            } else if (dog.current_league === 'Юниоры') {
              leagueBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }

            // Natural Russian promotion label (instead of "лифт вверх")
            let promotionLabelText = ''
            if (dog.status_badge === 'promoted_up') {
              if (dog.current_league === 'Абсолют') {
                promotionLabelText = 'В Абсолют'
              } else if (dog.current_league === 'Чемпионов') {
                promotionLabelText = 'В Чемпионы'
              } else {
                promotionLabelText = 'Повышение'
              }
            } else if (dog.status_badge === 'relegated_down') {
              if (dog.current_league === 'Прогресс') {
                promotionLabelText = 'В Прогресс'
              } else {
                promotionLabelText = 'Понижение'
              }
            }

            return (
              <div
                key={dog.dog_key}
                className="rounded-xl border border-old-money-200 bg-cream-50 hover:bg-cream-100/70 transition-all overflow-hidden shadow-2xs"
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(dog.dog_key)}
                  className="p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  {/* Left: Dog info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-cream-200/70 border border-old-money-300/70 text-charcoal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={dogLink}
                          onClick={(e) => e.stopPropagation()}
                          className="font-serif font-bold text-sm sm:text-base text-charcoal-900 hover:text-camel-800 transition-colors"
                        >
                          <OwnerCrownName name={dog.name} breed={dog.breed} kind="donino">
                            {toDogTitleCase(dog.name)}
                          </OwnerCrownName>
                        </Link>
                        {dog.sex && <DogSexIcon sex={dog.sex} />}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-600 mt-0.5">
                        <span className="font-medium">{dog.breed}</span>
                        <span className="text-old-money-300">·</span>
                        <span>{dog.stages_count} заб.</span>
                        {dog.wins_count > 0 && (
                          <>
                            <span className="text-old-money-300">·</span>
                            <span className="inline-flex items-center gap-1 text-camel-700 font-semibold">
                              <Trophy className="w-3 h-3 text-camel-600" />
                              {dog.wins_count} {dog.wins_count === 1 ? 'победа' : 'победы'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges & Best Time (formatted as Racing in rating) */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-old-money-200/50">
                    {/* Status & League Badge */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs border ${leagueBadgeClass}`}
                      >
                        {dog.current_league === 'Абсолют' && (
                          <Award className="w-3.5 h-3.5 mr-1 text-amber-700" />
                        )}
                        Лига {dog.current_league}
                      </span>

                      {dog.status_badge === 'promoted_up' && (
                        <span
                          title={dog.promotion_label || 'Переход в следующую лигу'}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                          <span>{promotionLabelText}</span>
                        </span>
                      )}

                      {dog.status_badge === 'relegated_down' && (
                        <span
                          title={dog.promotion_label || 'Переход в предыдущую лигу'}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                        >
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                          <span>{promotionLabelText}</span>
                        </span>
                      )}
                    </div>

                    {/* Best Time — Racing Style from Ranking */}
                    <div className="flex items-center gap-2 sm:gap-3 pl-2 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5 leading-none whitespace-nowrap">
                          <span className="text-base sm:text-lg font-bold tabular-nums text-camel-700 leading-none">
                            {dog.best_time ? dog.best_time.toFixed(2) : '—'}
                          </span>
                          {dog.best_time && (
                            <span className="flex flex-col text-[7.5px] sm:text-[8px] font-semibold uppercase tracking-wide text-charcoal-500 leading-[1.1]">
                              <span>лучш.</span>
                              <span>сек</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-charcoal-500 mt-0.5">
                          {dog.stages_count} заб.
                        </div>
                      </div>

                      <div className="text-charcoal-400 pl-0.5">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Stage History */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 bg-cream-100/80 border-t border-old-money-200 space-y-2">
                    <div className="text-xs font-semibold text-charcoal-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-camel-700" />
                      <span>История выступлений на этапах:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {dog.history.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="p-2.5 rounded-xl bg-cream-50 border border-old-money-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-charcoal-900">
                              {h.stage_num === 1
                                ? 'I этап'
                                : h.stage_num === 2
                                ? 'II этап'
                                : 'III этап'}{' '}
                              ({h.date})
                            </div>
                            <div className="text-[11px] text-charcoal-600">{h.breed_class}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-charcoal-900">
                              {h.placement > 0 ? `${h.placement} место` : h.status}
                            </div>
                            <div className="font-mono text-camel-800 text-[11px]">
                              {h.total_score ? `${h.total_score.toFixed(2)} сек` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {dog.promotion_label && (
                      <div className="text-[11px] text-charcoal-700 italic pt-1">
                        Примечание: {dog.promotion_label}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
