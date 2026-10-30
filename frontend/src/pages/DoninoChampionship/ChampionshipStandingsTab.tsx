import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
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
  const [selectedBreed, setSelectedBreed] = useState('all')
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

  // Filtered standings
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return standings.filter((d) => {
      if (selectedLeague !== 'all' && d.current_league !== selectedLeague) {
        return false
      }
      if (selectedBreed !== 'all' && d.breed !== selectedBreed) {
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

  const toggleExpand = (dogKey: string) => {
    setExpandedDogKey((prev) => (prev === dogKey ? null : dogKey))
  }

  return (
    <div className="space-y-6">
      {/* Banner / Promotions Toggle */}
      <div className="rounded-2xl border border-old-money-200 bg-cream-50/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-camel-500/15 border border-camel-400/40 flex items-center justify-center text-camel-700 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-charcoal-900">
                Турнирная таблица и статус участников
              </h2>
              <p className="text-xs text-charcoal-600">
                Лиги обновляются по итогам каждого этапа согласно правилам переходов (1 победа — вверх, 3 поражения — вниз)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPromotions(!showPromotions)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-camel-400/60 bg-cream-100 hover:bg-cream-200 text-charcoal-900 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-camel-700" />
            <span>Хроника переходов ({promotions.after_stage_1.length + promotions.after_stage_2.length})</span>
            {showPromotions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Promotions collapsible section */}
        {showPromotions && (
          <div className="mt-4 pt-4 border-t border-old-money-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* After Stage 2 */}
            <div className="bg-cream-100/60 rounded-xl p-3.5 border border-old-money-200">
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
            <div className="bg-cream-100/60 rounded-xl p-3.5 border border-old-money-200">
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        {/* League Selector Pills */}
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Фильтр по лигам">
          {(['all', 'Абсолют', 'Чемпионов', 'Прогресс', 'Юниоры'] as const).map((l) => {
            const isActive = selectedLeague === l
            const label = l === 'all' ? 'Все лиги' : `Лига «${l}»`
            const count = leagueCounts[l]
            return (
              <button
                key={l}
                type="button"
                onClick={() => setSelectedLeague(l)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-charcoal-900 text-cream-50 border-charcoal-900 shadow-xs'
                    : 'bg-cream-50 text-charcoal-700 border-old-money-300 hover:bg-cream-100 hover:text-charcoal-900'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-charcoal-800 text-cream-100' : 'bg-old-money-200/70 text-charcoal-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Breed Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск собаки или породы..."
              className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs rounded-xl border border-old-money-300 bg-cream-50 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-camel-600 focus:border-camel-600"
            />
          </div>

          {/* Breed Dropdown */}
          <div className="relative">
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="min-h-[44px] pl-3 pr-8 py-2 text-xs rounded-xl border border-old-money-300 bg-cream-50 text-charcoal-900 focus:outline-hidden focus:ring-1 focus:ring-camel-600 focus:border-camel-600 cursor-pointer appearance-none"
              aria-label="Фильтр по породе"
            >
              <option value="all">Все породы ({breeds.length})</option>
              {breeds.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Standings Cards List */}
      <div className="space-y-2.5">
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

            return (
              <div
                key={dog.dog_key}
                className="rounded-2xl border border-old-money-200 bg-cream-50 hover:bg-cream-100/70 transition-all overflow-hidden"
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(dog.dog_key)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
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
                        <span>Этапов: {dog.stages_count}</span>
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

                  {/* Right: Badges & Best Time */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-old-money-200/50">
                    {/* Status & League Badge */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border ${leagueBadgeClass}`}
                      >
                        {dog.current_league === 'Абсолют' && <Award className="w-3.5 h-3.5 mr-1 text-amber-700" />}
                        Лига {dog.current_league}
                      </span>

                      {dog.status_badge === 'promoted_up' && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                          <span>Лифт вверх</span>
                        </span>
                      )}

                      {dog.status_badge === 'relegated_down' && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                          <span>Лифт вниз</span>
                        </span>
                      )}
                    </div>

                    {/* Best Time */}
                    <div className="text-right pl-2">
                      <div className="text-xs text-charcoal-500">Лучшее время</div>
                      <div className="font-mono text-sm sm:text-base font-bold text-charcoal-900">
                        {dog.best_time ? `${dog.best_time.toFixed(2)} с` : '—'}
                      </div>
                    </div>

                    <div className="text-charcoal-400 pl-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Stage History */}
                {isExpanded && (
                  <div className="p-3.5 sm:p-4 bg-cream-100/80 border-t border-old-money-200 space-y-2">
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
                              {h.stage_num === 1 ? 'I этап' : h.stage_num === 2 ? 'II этап' : 'III этап'} ({h.date})
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
