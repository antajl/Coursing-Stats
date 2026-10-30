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
  Timer,
  X,
  Flame,
  FileText,
} from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../components/ui/ModernDropdown'
import QuickBreedBar, { type QuickBreedItem } from '../TopDogs/QuickBreedBar'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import { formatBreedName, matchesBreedFilter } from '../../lib/breedMapping'
import { toDogTitleCase } from '../../lib/dogName'
import type { ChampionshipStanding, ChampionshipPromotion } from '../../lib/staticData/donino'

interface ChampionshipStandingsTabProps {
  standings: ChampionshipStanding[]
  promotions: {
    after_stage_1: ChampionshipPromotion[]
    after_stage_2: ChampionshipPromotion[]
  }
  onSelectRulesTab?: () => void
}

type LeagueFilter = 'all' | 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры'

const DONINO_CANDIDATE_BREEDS: QuickBreedItem[] = [
  { key: 'УИППЕТ', label: 'Уиппет', fullName: 'Уиппет', estWidth: 76 },
  { key: 'ФАРАОНОВА СОБАКА', label: 'ФС', fullName: 'Фараонова собака', estWidth: 58 },
  { key: 'БАСЕНДЖИ', label: 'Басенджи', fullName: 'Басенджи', estWidth: 86 },
  { key: 'САЛЮКИ', label: 'Салюки', fullName: 'Салюки', estWidth: 76 },
  { key: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', label: 'РПБ', fullName: 'Русская псовая борзая', estWidth: 64 },
  { key: 'ЧИРНЕКО ДЕЛЬ ЭТНА', label: 'Чирнеко', fullName: 'Чирнеко дель Этна', estWidth: 86 },
  { key: 'РОДЕЗИЙСКИЙ РИДЖБЕК', label: 'Родезийский риджбек', fullName: 'Родезийский риджбек', estWidth: 120 },
  { key: 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ', label: 'Левретка', fullName: 'Малая итальянская борзая', estWidth: 86 },
  { key: 'ИСПАНСКИЙ ГАЛЬГО', label: 'Гальго', fullName: 'Испанский гальго', estWidth: 76 },
  { key: 'АПБТ', label: 'АПБТ', fullName: 'Американский питбультерьер', estWidth: 68 },
]

export default function ChampionshipStandingsTab({
  standings,
  promotions,
  onSelectRulesTab,
}: ChampionshipStandingsTabProps) {
  const [selectedLeague, setSelectedLeague] = useState<LeagueFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBreed, setSelectedBreed] = useState('')
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false)
  const [expandedDogKey, setExpandedDogKey] = useState<string | null>(null)
  const [promotionsExpanded, setPromotionsExpanded] = useState(false)

  // Unique breeds
  const breedValues = useMemo(() => {
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
      if (selectedBreed && !matchesBreedFilter(d.breed, selectedBreed)) {
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

  // Track records (top 5 fastest times across all dogs)
  const fastestDogs = useMemo(() => {
    return [...standings]
      .filter((d) => typeof d.best_time === 'number' && d.best_time > 0)
      .sort((a, b) => (a.best_time ?? 999) - (b.best_time ?? 999))
      .slice(0, 5)
  }, [standings])

  // League Leaders
  const leagueLeaders = useMemo(() => {
    const absolut = standings.find((d) => d.current_league === 'Абсолют')
    const champions = standings.find((d) => d.current_league === 'Чемпионов')
    const progress = standings.find((d) => d.current_league === 'Прогресс')
    return { absolut, champions, progress }
  }, [standings])

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
    <div className="space-y-5">
      {/* 1. Page Toolbar: Search, League Dropdown, QuickBreedBar, Reset */}
      <div className="rounded-2xl border border-old-money-200 bg-cream-50/80 p-2 sm:p-2.5 shadow-2xs">
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
                          ({leagueCounts[l]})
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
              candidateBreeds={DONINO_CANDIDATE_BREEDS}
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
      </div>

      {/* 2. Main 2-Column Grid Layout (Ranking on Left, Statistics Widgets on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dog Ranking Cards */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-camel-700" />
              <h2 className="text-sm font-bold font-serif uppercase tracking-wider text-charcoal-800">
                Рейтинг участников и лиги
              </h2>
            </div>
            <span className="text-xs text-charcoal-500 font-medium">
              Показано: {filtered.length} из {standings.length} собак
            </span>
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

                // Rank badge styling
                const rankBadgeClass =
                  rank === 1
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                    : rank === 2
                    ? 'bg-slate-100 text-slate-800 border border-slate-300 font-bold'
                    : rank === 3
                    ? 'bg-amber-900/10 text-amber-950 border border-amber-900/20 font-bold'
                    : 'bg-cream-100 text-charcoal-600 border border-old-money-200 font-medium'

                // League badge styling
                const leagueBadgeClass =
                  dog.current_league === 'Абсолют'
                    ? 'bg-amber-100/90 text-amber-900 border border-amber-300/80'
                    : dog.current_league === 'Чемпионов'
                    ? 'bg-camel-100 text-charcoal-900 border border-camel-300'
                    : dog.current_league === 'Прогресс'
                    ? 'bg-cream-200 text-charcoal-700 border border-old-money-300'
                    : 'bg-sky-50 text-sky-800 border border-sky-200'

                // Promotion labels
                const promotionLabelText =
                  dog.promotion_label === 'Переход в Лигу Абсолют'
                    ? '↑ В Абсолют'
                    : dog.promotion_label === 'Переход в Лигу Чемпионов'
                    ? '↑ В Чемпионы'
                    : dog.status_badge === 'promoted_up'
                    ? '↑ Вверх'
                    : dog.status_badge === 'relegated_down'
                    ? '↓ В Прогресс'
                    : null

                return (
                  <div
                    key={dog.dog_key}
                    className="rounded-xl border border-old-money-200 bg-cream-50/90 shadow-2xs overflow-hidden transition-all hover:border-camel-400 hover:shadow-xs"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(dog.dog_key)}
                      className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Rank Pill */}
                        <div
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${rankBadgeClass}`}
                        >
                          {rank}
                        </div>

                        {/* Dog info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {dog.dog_id ? (
                              <Link
                                to={`/dog/${dog.dog_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold font-serif text-charcoal-900 hover:text-camel-800 transition-colors text-xs sm:text-sm truncate"
                              >
                                {toDogTitleCase(dog.name)}
                              </Link>
                            ) : (
                              <span className="font-bold font-serif text-charcoal-900 text-xs sm:text-sm truncate">
                                {toDogTitleCase(dog.name)}
                              </span>
                            )}
                            <OwnerCrownName dogName={dog.name} />
                            {dog.sex && (
                              <DogSexIcon
                                sex={dog.sex === 'Сука' ? 'f' : 'm'}
                                size={12}
                                variant="neutral"
                                className="shrink-0"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-charcoal-600 flex-wrap mt-0.5">
                            <span className="font-medium">
                              {formatBreedName(dog.breed)}
                            </span>
                            {dog.wins_count > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-amber-700 font-semibold">
                                <Award className="w-3 h-3 text-amber-600" />
                                <span>
                                  {dog.wins_count}{' '}
                                  {dog.wins_count === 1 ? 'победа' : 'победы'}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: League Badge, Promotion Badge, Racing Time, Chevron */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Current League Badge */}
                        <span
                          className={`hidden sm:inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${leagueBadgeClass}`}
                        >
                          Лига «{dog.current_league}»
                        </span>

                        {/* Promotion tag */}
                        {promotionLabelText && dog.status_badge === 'promoted_up' && (
                          <span
                            title={dog.promotion_label || 'Переход в следующую лигу'}
                            className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            <span>{promotionLabelText}</span>
                          </span>
                        )}

                        {promotionLabelText && dog.status_badge === 'relegated_down' && (
                          <span
                            title={dog.promotion_label || 'Переход в предыдущую лигу'}
                            className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                          >
                            <ArrowDownRight className="w-3 h-3 text-rose-600" />
                            <span>{promotionLabelText}</span>
                          </span>
                        )}

                        {/* Best Time — Racing Style */}
                        <div className="text-right pl-1 sm:pl-2 shrink-0">
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
                                <div className="text-[11px] text-charcoal-600">
                                  {h.breed_class}
                                </div>
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
              })}
            </div>
          )}
        </div>

        {/* Right Column: Statistics Widgets */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Widget 1: Рекорды трассы 350 м */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-camel-700" />
                <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
                  Рекорды трассы 350 м
                </h3>
              </div>
              <Flame className="w-3.5 h-3.5 text-amber-600" />
            </div>

            <div className="space-y-1.5">
              {fastestDogs.map((d, idx) => (
                <div
                  key={d.dog_key}
                  className="flex items-center justify-between p-2 rounded-xl bg-cream-100/70 border border-old-money-200/80 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-center font-bold text-charcoal-500 text-[11px]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-charcoal-900 truncate">
                        {toDogTitleCase(d.name)}
                      </div>
                      <div className="text-[10px] text-charcoal-500">
                        {formatBreedName(d.breed)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="font-bold font-mono text-camel-800 text-xs">
                      {d.best_time?.toFixed(2)} с
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Лидеры лиг */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-camel-700" />
              <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
                Лидеры лиг сезона
              </h3>
            </div>

            <div className="space-y-2">
              {/* Absolut */}
              {leagueLeaders.absolut && (
                <div className="p-2.5 rounded-xl border border-amber-300/80 bg-amber-50/40 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-900">Лига «Абсолют»</span>
                    <span className="font-mono font-bold text-camel-800">
                      {leagueLeaders.absolut.best_time?.toFixed(2)} с
                    </span>
                  </div>
                  <div className="font-bold text-charcoal-900 truncate">
                    {toDogTitleCase(leagueLeaders.absolut.name)}
                  </div>
                  <div className="text-[10px] text-charcoal-600">
                    {formatBreedName(leagueLeaders.absolut.breed)} · {leagueLeaders.absolut.wins_count} победы
                  </div>
                </div>
              )}

              {/* Champions */}
              {leagueLeaders.champions && (
                <div className="p-2.5 rounded-xl border border-camel-300 bg-camel-50/40 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-charcoal-900">Лига «Чемпионов»</span>
                    <span className="font-mono font-bold text-camel-800">
                      {leagueLeaders.champions.best_time?.toFixed(2)} с
                    </span>
                  </div>
                  <div className="font-bold text-charcoal-900 truncate">
                    {toDogTitleCase(leagueLeaders.champions.name)}
                  </div>
                  <div className="text-[10px] text-charcoal-600">
                    {formatBreedName(leagueLeaders.champions.breed)} · {leagueLeaders.champions.wins_count} победы
                  </div>
                </div>
              )}

              {/* Progress */}
              {leagueLeaders.progress && (
                <div className="p-2.5 rounded-xl border border-old-money-200 bg-cream-100/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-charcoal-800">Лига «Прогресс»</span>
                    <span className="font-mono font-bold text-camel-800">
                      {leagueLeaders.progress.best_time?.toFixed(2)} с
                    </span>
                  </div>
                  <div className="font-bold text-charcoal-900 truncate">
                    {toDogTitleCase(leagueLeaders.progress.name)}
                  </div>
                  <div className="text-[10px] text-charcoal-600">
                    {formatBreedName(leagueLeaders.progress.breed)} · {leagueLeaders.progress.wins_count} побед
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Widget 3: Хроника ротации лиг */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-camel-700" />
                <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
                  Хроника ротаций
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPromotionsExpanded(!promotionsExpanded)}
                className="text-xs font-semibold text-camel-800 hover:text-camel-900 cursor-pointer flex items-center gap-0.5"
              >
                <span>{totalPromotions} переходов</span>
                {promotionsExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="text-xs text-charcoal-600 space-y-1.5">
              <div className="p-2 rounded-xl bg-cream-100/70 border border-old-money-200/80 flex items-center justify-between">
                <span>К III этапу (после II этапа):</span>
                <span className="font-bold text-emerald-800">
                  +{promotions.after_stage_2.length} собаки
                </span>
              </div>
              <div className="p-2 rounded-xl bg-cream-100/70 border border-old-money-200/80 flex items-center justify-between">
                <span>Ко II этапу (после I этапа):</span>
                <span className="font-bold text-emerald-800">
                  +{promotions.after_stage_1.length} собаки
                </span>
              </div>
            </div>

            {/* Collapsible List of Promotions */}
            {promotionsExpanded && (
              <div className="pt-2 border-t border-old-money-200 space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                <div className="font-bold text-[11px] text-charcoal-800">
                  После II этапа:
                </div>
                {promotions.after_stage_2.map((p, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-1.5 rounded-lg bg-cream-100 border border-old-money-200/70 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-charcoal-900 truncate">
                        {toDogTitleCase(p.dog_name)}
                      </div>
                      <div className="text-[10px] text-charcoal-500">
                        {formatBreedName(p.breed)}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                      {p.to_league}
                    </span>
                  </div>
                ))}

                <div className="font-bold text-[11px] text-charcoal-800 pt-1">
                  После I этапа:
                </div>
                {promotions.after_stage_1.map((p, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-1.5 rounded-lg bg-cream-100 border border-old-money-200/70 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-charcoal-900 truncate">
                        {toDogTitleCase(p.dog_name)}
                      </div>
                      <div className="text-[10px] text-charcoal-500">
                        {formatBreedName(p.breed)}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                      {p.to_league}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget 4: Регламент и правила переходов */}
          {onSelectRulesTab && (
            <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-camel-700" />
                <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
                  Регламент турнира
                </h3>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Правила распределения по лигам «Прогресс», «Чемпионов» и «Абсолют», порядок переходов и условия финалов.
              </p>
              <button
                type="button"
                onClick={onSelectRulesTab}
                className="w-full mt-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-camel-400 bg-cream-50 text-xs font-semibold text-camel-900 hover:bg-cream-100 transition-colors cursor-pointer"
              >
                <span>Открыть полный регламент</span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
