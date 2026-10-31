import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Zap,
  Award,
  Timer,
  Sparkles,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react'
import { parseDogName } from '../../lib/dogName'
import { formatBreedName } from '../../lib/breedMapping'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import RankBadge from '../../components/RankBadge'
import type { ChampionshipStanding } from '../../lib/staticData/donino'

interface ChampionshipStatsTabProps {
  standings: ChampionshipStanding[]
}

export default function ChampionshipStatsTab({ standings }: ChampionshipStatsTabProps) {
  const [selectedBreed, setSelectedBreed] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Calculate Aggregate Statistics
  const stats = useMemo(() => {
    let totalPointsAwarded = 0
    let totalPlacePoints = 0
    let totalBonusPoints = 0
    let trackRecordsCount = 0
    let bestFinalsCount = 0
    let bestClassCount = 0
    let bestBreedCount = 0

    const trackRecordHolders: Array<{
      dog: ChampionshipStanding
      date: string
      stage_num: number
      time: number | null
    }> = []

    const finalKings: Array<{
      dog: ChampionshipStanding
      finalsWon: number
    }> = []

    const breedPointsMap = new Map<string, { totalPts: number; dogsCount: number }>()

    for (const d of standings) {
      const pts = d.total_points || 0
      totalPointsAwarded += pts

      // Count breed points
      const bEntry = breedPointsMap.get(d.breed) || { totalPts: 0, dogsCount: 0 }
      bEntry.totalPts += pts
      bEntry.dogsCount += 1
      breedPointsMap.set(d.breed, bEntry)

      let finalsWonForDog = 0

      for (const h of d.history) {
        if (h.points_breakdown) {
          const b = h.points_breakdown
          totalPlacePoints += b.place_points || 0
          const bonuses =
            (b.best_final_points || 0) +
            (b.best_class_points || 0) +
            (b.best_breed_points || 0) +
            (b.track_record_points || 0)
          totalBonusPoints += bonuses

          if (b.track_record_points > 0) {
            trackRecordsCount += 1
            trackRecordHolders.push({
              dog: d,
              date: h.date,
              stage_num: h.stage_num,
              time: h.total_score,
            })
          }
          if (b.best_final_points > 0) {
            bestFinalsCount += 1
            finalsWonForDog += 1
          }
          if (b.best_class_points > 0) bestClassCount += 1
          if (b.best_breed_points > 0) bestBreedCount += 1
        }
      }

      if (finalsWonForDog > 0) {
        finalKings.push({ dog: d, finalsWon: finalsWonForDog })
      }
    }

    finalKings.sort((a, b) => b.finalsWon - a.finalsWon || (b.dog.total_points || 0) - (a.dog.total_points || 0))

    const breedRankings = Array.from(breedPointsMap.entries())
      .map(([breed, val]) => ({
        breed,
        totalPts: val.totalPts,
        dogsCount: val.dogsCount,
        avgPts: val.dogsCount > 0 ? (val.totalPts / val.dogsCount).toFixed(1) : '0',
      }))
      .sort((a, b) => b.totalPts - a.totalPts)

    return {
      totalPointsAwarded,
      totalPlacePoints,
      totalBonusPoints,
      trackRecordsCount,
      bestFinalsCount,
      bestClassCount,
      bestBreedCount,
      trackRecordHolders,
      finalKings: finalKings.slice(0, 6),
      breedRankings,
    }
  }, [standings])

  // Unique breeds for filter
  const uniqueBreeds = useMemo(() => {
    const set = new Set<string>()
    for (const d of standings) {
      if (d.breed) set.add(d.breed)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'))
  }, [standings])

  // Filtered standings for the Matrix table
  const filteredDogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return standings
      .filter((d) => (d.total_points || 0) > 0)
      .filter((d) => {
        if (selectedBreed !== 'all' && d.breed !== selectedBreed) return false
        if (q) {
          const { primary } = parseDogName(d.name_lat || d.name, d.name_ru)
          return (
            primary.toLowerCase().includes(q) ||
            d.name.toLowerCase().includes(q) ||
            d.breed.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0) || (a.best_time ?? 999) - (b.best_time ?? 999))
  }, [standings, selectedBreed, searchQuery])

  // Top 10 for Stacked Bar Anatomy Chart
  const top10Dogs = useMemo(() => {
    return [...standings]
      .filter((d) => (d.total_points || 0) > 0)
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 10)
      .map((d) => {
        let placePts = 0
        let bonusPts = 0
        for (const h of d.history) {
          if (h.points_breakdown) {
            placePts += h.points_breakdown.place_points || 0
            bonusPts +=
              (h.points_breakdown.best_final_points || 0) +
              (h.points_breakdown.best_class_points || 0) +
              (h.points_breakdown.best_breed_points || 0) +
              (h.points_breakdown.track_record_points || 0)
          }
        }
        return {
          dog: d,
          total: d.total_points || 0,
          placePts,
          bonusPts,
          placePct: d.total_points ? Math.round((placePts / d.total_points) * 100) : 0,
          bonusPct: d.total_points ? Math.round((bonusPts / d.total_points) * 100) : 0,
        }
      })
  }, [standings])

  return (
    <div className="space-y-6">
      {/* 1. Header KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-old-money-200 bg-cream-50 shadow-2xs">
          <div className="flex items-center gap-2 text-charcoal-600 text-xs font-semibold">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Всего очков начислено</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              {stats.totalPointsAwarded}
            </span>
            <span className="text-xs font-semibold text-charcoal-500">баллов</span>
          </div>
          <div className="mt-1 text-[11px] text-charcoal-500">
            {stats.totalPlacePoints} за места · {stats.totalBonusPoints} бонусов
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-old-money-200 bg-cream-50 shadow-2xs">
          <div className="flex items-center gap-2 text-charcoal-600 text-xs font-semibold">
            <Zap className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Рекордов трека</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              {stats.trackRecordsCount}
            </span>
            <span className="text-xs font-semibold text-rose-800">+1 б. каждый</span>
          </div>
          <div className="mt-1 text-[11px] text-charcoal-500">
            Установлены на дистанции 350 м
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-old-money-200 bg-cream-50 shadow-2xs">
          <div className="flex items-center gap-2 text-charcoal-600 text-xs font-semibold">
            <Award className="w-4 h-4 text-camel-700 shrink-0" />
            <span>Побед в финалах</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              {stats.bestFinalsCount}
            </span>
            <span className="text-xs font-semibold text-camel-800">заездов</span>
          </div>
          <div className="mt-1 text-[11px] text-charcoal-500">
            Бонус за лучшее время финала
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-old-money-200 bg-cream-50 shadow-2xs">
          <div className="flex items-center gap-2 text-charcoal-600 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-forest-700 shrink-0" />
            <span>Скоростных бонусов</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              {stats.bestClassCount + stats.bestBreedCount}
            </span>
            <span className="text-xs font-semibold text-forest-800">наград</span>
          </div>
          <div className="mt-1 text-[11px] text-charcoal-500">
            {stats.bestClassCount} в классах · {stats.bestBreedCount} в породах
          </div>
        </div>
      </div>

      {/* 2. Super-Achievements Section: Track Record Holders & Final Kings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Track Record Holders */}
        <div className="p-4 sm:p-5 rounded-2xl border border-old-money-200 bg-cream-50 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-charcoal-900">
                  Рекордсмены трека (+1 б.)
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Собаки, установившие новый рекорд 350-метрового трека Донино
                </p>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              {stats.trackRecordHolders.length} собак
            </span>
          </div>

          <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
            {stats.trackRecordHolders.map((item, idx) => {
              const { primary } = parseDogName(item.dog.name_lat || item.dog.name, item.dog.name_ru)
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-old-money-200/80 text-xs hover:border-camel-400 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold font-serif text-charcoal-900 truncate">
                      {primary}
                    </div>
                    <div className="text-[10px] text-charcoal-500">
                      {formatBreedName(item.dog.breed)} · {item.stage_num === 1 ? 'I этап' : 'II этап'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                      {item.time ? `${item.time.toFixed(2)} с` : 'рекорд'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Final Kings */}
        <div className="p-4 sm:p-5 rounded-2xl border border-old-money-200 bg-cream-50 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-charcoal-900">
                  Лидеры финалов
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Победы с абсолютно лучшим временем финального заезда
                </p>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Топ финалисты
            </span>
          </div>

          <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
            {stats.finalKings.map((item, idx) => {
              const { primary } = parseDogName(item.dog.name_lat || item.dog.name, item.dog.name_ru)
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-old-money-200/80 text-xs hover:border-camel-400 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold font-serif text-charcoal-900 truncate">
                      {primary}
                    </div>
                    <div className="text-[10px] text-charcoal-500">
                      {formatBreedName(item.dog.breed)} · Лига «{item.dog.current_league}»
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {item.finalsWon} {item.finalsWon === 1 ? 'победа' : 'победы'}
                    </span>
                    <span className="font-bold text-xs text-charcoal-700">
                      {item.dog.total_points} б.
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. Visual Anatomy of Points Chart (Stacked Bar for Top 10) */}
      <div className="p-4 sm:p-5 rounded-2xl border border-old-money-200 bg-cream-50 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-charcoal-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-camel-700" />
              <span>Анатомия очков: Базовые баллы за места vs Скоростные бонусы</span>
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Наглядное соотношение: сколько очков принесли занятые места (коричневая шкала) против бонусов за лучшее время (янтарная шкала)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 font-medium text-charcoal-700">
              <span className="w-3 h-3 rounded bg-camel-700 inline-block" />
              <span>Место в заезде</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-amber-900">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
              <span>Бонусы скорости</span>
            </span>
          </div>
        </div>

        {/* Stacked Bars List */}
        <div className="space-y-2.5 pt-1">
          {top10Dogs.map((item, idx) => {
            const { primary } = parseDogName(item.dog.name_lat || item.dog.name, item.dog.name_ru)
            const maxPts = 19
            const barWidthPct = Math.min(100, Math.round((item.total / maxPts) * 100))

            return (
              <div key={item.dog.dog_key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-5 text-center font-bold text-charcoal-500 text-[11px] shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold font-serif text-charcoal-900 truncate">
                      {primary}
                    </span>
                    <span className="text-[11px] text-charcoal-500 truncate hidden sm:inline">
                      ({formatBreedName(item.dog.breed)})
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-right font-mono">
                    <span className="text-[11px] text-charcoal-500 hidden sm:inline">
                      {item.placePts} б. + {item.bonusPts} б.
                    </span>
                    <span className="font-bold text-xs text-charcoal-900 min-w-[36px]">
                      {item.total} б.
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="h-3 w-full bg-cream-200/90 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${barWidthPct}%` }}
                    className="h-full flex overflow-hidden rounded-full shadow-2xs"
                  >
                    <div
                      style={{ width: `${item.placePct}%` }}
                      className="h-full bg-camel-700 transition-all duration-500"
                      title={`Баллы за место: ${item.placePts}`}
                    />
                    <div
                      style={{ width: `${item.bonusPct}%` }}
                      className="h-full bg-amber-400 transition-all duration-500"
                      title={`Бонусы за скорость: ${item.bonusPts}`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Complete Matrix Table (Шахматка баллов по этапам) */}
      <div className="p-4 sm:p-5 rounded-2xl border border-old-money-200 bg-cream-50 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-charcoal-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Шахматка баллов по этапам</span>
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Сводная ведомость начислений за I и II этапы с фильтрацией по породе
            </p>
          </div>

          {/* Search & Breed Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[160px]">
              <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск собаки…"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-old-money-200 bg-white text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:border-camel-500"
              />
            </div>

            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-old-money-200 bg-white text-charcoal-800 focus:outline-none focus:border-camel-500 cursor-pointer"
            >
              <option value="all">Все породы ({uniqueBreeds.length})</option>
              {uniqueBreeds.map((b) => (
                <option key={b} value={b}>
                  {formatBreedName(b)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Monolithic Table */}
        <div className="overflow-x-auto rounded-xl border border-old-money-200 bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-camel-100/70 border-b border-old-money-200 text-charcoal-800 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2 px-3 w-10 text-center">№</th>
                <th className="py-2 px-3">Собака и порода</th>
                <th className="py-2 px-3 text-center">Лига</th>
                <th className="py-2 px-3 text-right">I этап (09.08)</th>
                <th className="py-2 px-3 text-right">II этап (20.09)</th>
                <th className="py-2 px-3 text-right">Сумма очков</th>
                <th className="py-2 px-3 text-right">Лучш. время</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-old-money-100">
              {filteredDogs.map((dog, idx) => {
                const { primary, secondary } = parseDogName(dog.name_lat || dog.name, dog.name_ru)
                const s1 = dog.stage_points?.[1] || 0
                const s2 = dog.stage_points?.[2] || 0

                return (
                  <tr key={dog.dog_key} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-2 px-3 text-center font-bold text-charcoal-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        {dog.dog_id ? (
                          <Link
                            to={`/dog/${dog.dog_id}`}
                            title={secondary || undefined}
                            className="font-bold font-serif text-charcoal-900 hover:text-camel-800 transition-colors"
                          >
                            {primary}
                          </Link>
                        ) : (
                          <span title={secondary || undefined} className="font-bold font-serif text-charcoal-900">
                            {primary}
                          </span>
                        )}
                        <OwnerCrownName dogName={primary} />
                        {dog.sex && (
                          <DogSexIcon
                            sex={dog.sex === 'Сука' ? 'f' : 'm'}
                            size={11}
                            variant="neutral"
                            className="shrink-0"
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-charcoal-500">
                        {formatBreedName(dog.breed)}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cream-100 text-charcoal-700 border border-old-money-200">
                        {dog.current_league}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {s1 > 0 ? (
                        <span className="font-bold text-charcoal-900">{s1} б.</span>
                      ) : (
                        <span className="text-charcoal-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {s2 > 0 ? (
                        <span className="font-bold text-charcoal-900">{s2} б.</span>
                      ) : (
                        <span className="text-charcoal-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      <span className="font-serif font-bold text-sm text-camel-900">
                        {dog.total_points || 0} б.
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-charcoal-600">
                      {dog.best_time ? `${dog.best_time.toFixed(2)} с` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
