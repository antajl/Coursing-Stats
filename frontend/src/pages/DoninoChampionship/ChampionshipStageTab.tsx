import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Calendar,
  MapPin,
  User,
  Trophy,
  Award,
  Search,
  Filter,
  Layers,
  LayoutGrid,
} from 'lucide-react'
import DogSexIcon from '../../components/DogSexIcon'
import OwnerCrownName from '../../components/OwnerCrownName'
import SkeletonLoader from '../../components/SkeletonLoader'
import { toDogTitleCase } from '../../lib/dogName'
import { getEvent, getEventResults } from '../../lib/staticData'
import EventHeader from '../Events/EventResults/EventHeader'
import ResultsSection from '../Events/EventResults/ResultsSection'
import type { Event, Result } from '../Events/EventResults/types'
import type { ChampionshipStage } from '../../lib/staticData/donino'

interface ChampionshipStageTabProps {
  stage: ChampionshipStage
}

type StageViewMode = 'protocol' | 'summary'

export default function ChampionshipStageTab({ stage }: ChampionshipStageTabProps) {
  const [viewMode, setViewMode] = useState<StageViewMode>('protocol')
  const [eventData, setEventData] = useState<Event | null>(null)
  const [eventResults, setEventResults] = useState<Result[]>([])
  const [loadingProtocol, setLoadingProtocol] = useState(false)
  const [protocolError, setProtocolError] = useState<string | null>(null)

  // Local summary search and filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')

  const results = stage.results || []

  // Load native event results when protocol mode is active
  useEffect(() => {
    if (!stage.has_results) return
    let cancelled = false
    setLoadingProtocol(true)
    setProtocolError(null)

    Promise.all([
      getEvent(String(stage.id)),
      getEventResults(String(stage.id)),
    ])
      .then(([evRes, resRes]) => {
        if (cancelled) return
        if (evRes.success && evRes.data) {
          setEventData(evRes.data as Event)
        } else {
          setProtocolError('Не удалось загрузить данные протокола')
        }

        if (resRes.success && resRes.data) {
          setEventResults(Array.isArray(resRes.data) ? (resRes.data as unknown as Result[]) : [])
        }
      })
      .catch((err) => {
        if (!cancelled) setProtocolError(String(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingProtocol(false)
      })

    return () => {
      cancelled = true
    }
  }, [stage.id, stage.has_results])

  // Unique classes for summary
  const classes = useMemo(() => {
    const set = new Set<string>()
    for (const r of results) {
      if (r.breed_class) set.add(r.breed_class)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'))
  }, [results])

  // Filtered results for summary
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return results.filter((r) => {
      if (selectedClass !== 'all' && r.breed_class !== selectedClass) {
        return false
      }
      if (q) {
        const nameMatches =
          r.dog_name.toLowerCase().includes(q) ||
          r.name_ru.toLowerCase().includes(q) ||
          r.name_lat.toLowerCase().includes(q)
        const breedMatches = r.breed.toLowerCase().includes(q)
        if (!nameMatches && !breedMatches) return false
      }
      return true
    })
  }, [results, selectedClass, searchQuery])

  // Upcoming stage display
  if (!stage.has_results) {
    return (
      <div className="rounded-3xl border border-old-money-200 bg-cream-50 p-6 sm:p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-camel-500/15 border border-camel-400/40 flex items-center justify-center text-camel-700 mx-auto">
          <Calendar className="w-7 h-7" />
        </div>
        <div className="max-w-xl mx-auto space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            Запланировано
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-900">
            {stage.title}
          </h2>
          <p className="text-sm text-charcoal-600">
            Финальный этап клубного чемпионата сезона 2026. Забеги пройдут на песчаной трассе в д. Донино с использованием стартовых боксов и фотофиниша.
          </p>
        </div>

        <div className="pt-4 border-t border-old-money-200 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal-700">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cream-100 border border-old-money-200">
            <Calendar className="w-4 h-4 text-camel-700 shrink-0" />
            <span>31 октября – 1 ноября 2026</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cream-100 border border-old-money-200">
            <Building2 className="w-4 h-4 text-camel-700 shrink-0" />
            <span>Организатор: Курсинг в Донино</span>
          </div>
        </div>

        <p className="text-xs text-charcoal-500 pt-2">
          Итоговые протоколы и ротация лиг будут загружены и опубликованы сразу после завершения заездов.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Switcher: Official Protocol vs Compact Summary */}
      <div className="flex items-center justify-between pb-2 border-b border-old-money-200">
        <div className="text-xs text-charcoal-600 font-medium">
          Режим отображения этапа:
        </div>
        <div className="inline-flex rounded-xl p-0.5 bg-cream-200/80 border border-old-money-300 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('protocol')}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'protocol'
                ? 'bg-cream-50 text-charcoal-900 shadow-xs font-bold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-camel-700" />
            <span>Официальный протокол</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('summary')}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'summary'
                ? 'bg-cream-50 text-charcoal-900 shadow-xs font-bold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-camel-700" />
            <span>Краткая сводка</span>
          </button>
        </div>
      </div>

      {/* 1. OFFICIAL PROTOCOL VIEW (Как на /event/...) */}
      {viewMode === 'protocol' ? (
        loadingProtocol ? (
          <div className="p-8">
            <SkeletonLoader count={8} />
          </div>
        ) : protocolError || !eventData ? (
          <div className="p-8 text-center bg-cream-50 rounded-2xl border border-old-money-200 text-charcoal-700">
            {protocolError || 'Протокол состязания временно недоступен'}
          </div>
        ) : (
          <div className="space-y-6">
            <EventHeader event={eventData} results={eventResults} />
            <ResultsSection results={eventResults} />
          </div>
        )
      ) : (
        /* 2. COMPACT SUMMARY VIEW (Подиум + Таблица) */
        <div className="space-y-6">
          {/* Stage Header Info Card */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-camel-500/15 text-charcoal-900 border border-camel-400/40">
                    {stage.stage_num} этап сезона 2026
                  </span>
                  <span className="text-xs text-charcoal-500">Дистанция: 350 метров</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-serif font-bold text-charcoal-900">
                  {stage.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-charcoal-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-camel-700" />
                    {stage.date_start}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-camel-700" />
                    {stage.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-camel-700" />
                    Руководитель серии: {stage.judge}
                  </span>
                  <span>
                    Участников: <strong>{stage.participants_count}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {stage.catalog_url && (
                  <a
                    href={stage.catalog_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-old-money-300 bg-cream-100 hover:bg-cream-200 text-charcoal-900 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-charcoal-600" />
                    <span>Каталог</span>
                  </a>
                )}

                {stage.rules_url && (
                  <a
                    href={stage.rules_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-old-money-300 bg-cream-100 hover:bg-cream-200 text-charcoal-900 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-charcoal-600" />
                    <span>Регламент</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Winners Highlights (Podium) */}
          {stage.winners && stage.winners.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Trophy className="w-4 h-4 text-camel-700" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-charcoal-900">
                  Победители классов этапа (1 место в финале)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {stage.winners.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-old-money-200 bg-cream-50 hover:bg-cream-100/60 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-charcoal-900 truncate">
                        {toDogTitleCase(w.dog_name)}
                      </div>
                      <div className="text-[11px] text-charcoal-500 truncate">{w.breed_class}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-camel-100 text-charcoal-800 border border-camel-300/50">
                        Лига {w.league}
                      </div>
                      {w.time && (
                        <div className="font-mono text-xs font-bold text-charcoal-900 mt-0.5">
                          {w.time.toFixed(2)} с
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Filter & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по кличке или номеру..."
                className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs rounded-xl border border-old-money-300 bg-cream-50 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-camel-600 focus:border-camel-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-charcoal-500" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="min-h-[44px] pl-3 pr-8 py-2 text-xs rounded-xl border border-old-money-300 bg-cream-50 text-charcoal-900 focus:outline-hidden focus:ring-1 focus:ring-camel-600 focus:border-camel-600 cursor-pointer"
                aria-label="Фильтр по классу"
              >
                <option value="all">Все классы ({classes.length})</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-cream-100/80 border-b border-old-money-200 text-charcoal-700 font-serif font-bold">
                    <th className="py-3 px-3 w-12 text-center">Место</th>
                    <th className="py-3 px-3 w-14 text-center">№ кат.</th>
                    <th className="py-3 px-3 min-w-[180px]">Собака</th>
                    <th className="py-3 px-3 min-w-[160px]">Класс и Лига</th>
                    <th className="py-3 px-3 text-center">1-й круг</th>
                    <th className="py-3 px-3 text-center">2-й круг</th>
                    <th className="py-3 px-3 text-center">Финал</th>
                    <th className="py-3 px-3 text-right">Итог</th>
                    <th className="py-3 px-3 text-center w-24">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-old-money-200/60">
                  {filtered.map((r, idx) => {
                    const dogLink = r.dog_id
                      ? `/dog/${r.dog_id}/`
                      : `/donino-dog/${encodeURIComponent(r.dog_name)}/${encodeURIComponent(r.breed)}/`

                    const heat1 = r.heats.find((h) => h.heat_no === 1)
                    const heat2 = r.heats.find((h) => h.heat_no === 2)
                    const heat3 = r.heats.find((h) => h.heat_no === 3)
                    const isWinner = r.placement === 1

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-cream-100/50 transition-colors ${
                          isWinner ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-bold">
                          {isWinner ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                              1
                            </span>
                          ) : r.placement > 0 ? (
                            <span className="text-charcoal-700">{r.placement}</span>
                          ) : (
                            <span className="text-charcoal-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-charcoal-500">
                          {r.catalog_no || '—'}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={dogLink}
                              className="font-bold text-charcoal-900 hover:text-camel-800 transition-colors"
                            >
                              <OwnerCrownName name={r.dog_name} breed={r.breed} kind="donino">
                                {toDogTitleCase(r.dog_name)}
                              </OwnerCrownName>
                            </Link>
                            {r.sex && <DogSexIcon sex={r.sex} />}
                          </div>
                          <div className="text-[11px] text-charcoal-500">{r.breed}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-charcoal-800 font-medium">{r.breed_class}</div>
                          <div className="text-[10px] text-charcoal-500">Лига {r.league}</div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-charcoal-700">
                          {heat1?.time ? `${heat1.time.toFixed(2)} с` : '—'}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-charcoal-700">
                          {heat2?.time ? `${heat2.time.toFixed(2)} с` : '—'}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-charcoal-700">
                          {heat3?.time ? `${heat3.time.toFixed(2)} с` : '—'}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-charcoal-900">
                          {r.total_score ? `${r.total_score.toFixed(2)} с` : '—'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {r.status_reason ? (
                            <span
                              title={r.status_reason}
                              className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                            >
                              Сход
                            </span>
                          ) : isWinner ? (
                            <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Победа
                            </span>
                          ) : (
                            <span className="text-[11px] text-charcoal-600">Финиш</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
