import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react'
import type { SpeedRecordRow, CoursingRecordRow } from '../SpeedRecords/stats/doninoStatsUtils'
import { canonicalBreed, formatBreedName } from '../../lib/breedMapping'

interface BreedStatsRow {
  canonicalKey: string
  displayName: string
  dogCount: number
  // Speed (Radar)
  speedRunCount: number
  avgSpeed: number | null
  bestSpeed: {
    speed: number
    dogName: string
  } | null
  // Coursing (350 m)
  coursingRunCount: number
  avgTime: number | null
  bestTime: {
    time: number
    dogName: string
  } | null
}

type SortField = 'breed' | 'dogCount' | 'avgSpeed' | 'bestSpeed' | 'avgTime' | 'bestTime'
type SortDir = 'asc' | 'desc'

interface BreedStatsTableProps {
  speedRecords: SpeedRecordRow[]
  coursingRecords: CoursingRecordRow[]
}

function getNormalizedCanonicalBreed(breed: string): string {
  const cleaned = (breed || '').trim().replace(/[\u2018\u2019`]/g, "'")
  const c = canonicalBreed(cleaned) || cleaned
  return c.replace(/[\u2018\u2019`]/g, "'")
}

export default function BreedStatsTable({
  speedRecords,
  coursingRecords,
}: BreedStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('dogCount')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Aggregate stats per canonical breed
  const allRows = useMemo(() => {
    const breedMap = new Map<
      string,
      {
        canonicalKey: string
        dogs: Set<string>
        speedValues: number[]
        bestSpeed: { speed: number; dogName: string } | null
        timeValues: number[]
        bestTime: { time: number; dogName: string } | null
      }
    >()

    // Speed records
    for (const r of speedRecords) {
      const raw = (r.breed || '').trim() || 'Не указана'
      const cKey = getNormalizedCanonicalBreed(raw)
      if (!breedMap.has(cKey)) {
        breedMap.set(cKey, {
          canonicalKey: cKey,
          dogs: new Set(),
          speedValues: [],
          bestSpeed: null,
          timeValues: [],
          bestTime: null,
        })
      }
      const entry = breedMap.get(cKey)!
      if (r.name) entry.dogs.add(r.name)
      const sp = parseFloat(String(r.speed_km_h))
      if (sp > 0) {
        entry.speedValues.push(sp)
        if (!entry.bestSpeed || sp > entry.bestSpeed.speed) {
          entry.bestSpeed = { speed: sp, dogName: r.name }
        }
      }
    }

    // Coursing records
    for (const r of coursingRecords) {
      const raw = (r.breed || '').trim() || 'Не указана'
      const cKey = getNormalizedCanonicalBreed(raw)
      if (!breedMap.has(cKey)) {
        breedMap.set(cKey, {
          canonicalKey: cKey,
          dogs: new Set(),
          speedValues: [],
          bestSpeed: null,
          timeValues: [],
          bestTime: null,
        })
      }
      const entry = breedMap.get(cKey)!
      if (r.name) entry.dogs.add(r.name)
      const tm = parseFloat(String(r.time_seconds))
      if (tm > 0) {
        entry.timeValues.push(tm)
        if (!entry.bestTime || tm < entry.bestTime.time) {
          entry.bestTime = { time: tm, dogName: r.name }
        }
      }
    }

    const rows: BreedStatsRow[] = []
    for (const entry of breedMap.values()) {
      if (entry.dogs.size === 0 && !entry.bestSpeed && !entry.bestTime) continue

      const avgSpeed =
        entry.speedValues.length > 0
          ? entry.speedValues.reduce((a, b) => a + b, 0) / entry.speedValues.length
          : null

      const avgTime =
        entry.timeValues.length > 0
          ? entry.timeValues.reduce((a, b) => a + b, 0) / entry.timeValues.length
          : null

      rows.push({
        canonicalKey: entry.canonicalKey,
        displayName: formatBreedName(entry.canonicalKey) || entry.canonicalKey,
        dogCount: entry.dogs.size,
        speedRunCount: entry.speedValues.length,
        avgSpeed,
        bestSpeed: entry.bestSpeed,
        coursingRunCount: entry.timeValues.length,
        avgTime,
        bestTime: entry.bestTime,
      })
    }

    return rows
  }, [speedRecords, coursingRecords])

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...allRows].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'breed':
          cmp = a.displayName.localeCompare(b.displayName, 'ru')
          break
        case 'dogCount':
          cmp = a.dogCount - b.dogCount
          break
        case 'avgSpeed':
          cmp = (a.avgSpeed ?? -1) - (b.avgSpeed ?? -1)
          break
        case 'bestSpeed':
          cmp = (a.bestSpeed?.speed ?? -1) - (b.bestSpeed?.speed ?? -1)
          break
        case 'avgTime':
          cmp = (b.avgTime ?? 999) - (a.avgTime ?? 999)
          break
        case 'bestTime':
          cmp = (b.bestTime?.time ?? 999) - (a.bestTime?.time ?? 999)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [allRows, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir(field === 'breed' ? 'asc' : 'desc')
    }
  }

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-charcoal-700 shrink-0" />
      )
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-camel-800 shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-camel-800 shrink-0" />
    )
  }

  return (
    <div className="rounded-2xl border border-old-money-200 bg-white/95 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cream-200/80 px-3.5 sm:px-4 pt-3 sm:pt-3.5 pb-2.5 bg-cream-50/40">
        <h2 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-camel-700" />
          Сводная статистика пород полигона
        </h2>
        <span className="text-[11px] font-semibold text-charcoal-600 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200 tabular-nums">
          {sortedRows.length} пород
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <colgroup>
              <col className="min-w-[140px]" />
              <col className="w-14 sm:w-16" />
              <col className="w-20 sm:w-24" />
              <col className="w-28 sm:w-32" />
              <col className="w-20 sm:w-24" />
              <col className="w-28 sm:w-32" />
            </colgroup>
            <thead>
              <tr className="bg-cream-100/90 border-b border-old-money-200/90 text-[10px] sm:text-[11px] font-serif font-bold text-charcoal-700 uppercase tracking-wider select-none">
                <th
                  onClick={() => handleSort('breed')}
                  className="py-2 px-3 sm:px-3.5 cursor-pointer hover:bg-cream-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>Порода</span>
                    {renderSortIndicator('breed')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dogCount')}
                  className="py-2 px-2 sm:px-2.5 cursor-pointer hover:bg-cream-200/70 transition-colors text-right group"
                >
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span>Собак</span>
                    {renderSortIndicator('dogCount')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgSpeed')}
                  className="py-2 px-2 sm:px-2.5 cursor-pointer hover:bg-cream-200/70 transition-colors text-right group"
                >
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span>Ср. радар</span>
                    {renderSortIndicator('avgSpeed')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bestSpeed')}
                  className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-cream-200/70 transition-colors text-right group"
                >
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span>Рекорд радара</span>
                    {renderSortIndicator('bestSpeed')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgTime')}
                  className="py-2 px-2 sm:px-2.5 cursor-pointer hover:bg-cream-200/70 transition-colors text-right group"
                >
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span>Ср. 350 м</span>
                    {renderSortIndicator('avgTime')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bestTime')}
                  className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-cream-200/70 transition-colors text-right group"
                >
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span className="whitespace-nowrap">Рекорд 350&nbsp;м</span>
                    {renderSortIndicator('bestTime')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200/70 text-xs sm:text-sm">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-charcoal-500 italic">
                    По вашему запросу пород не найдено
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => (
                  <tr
                    key={row.canonicalKey}
                    className="hover:bg-cream-50/80 transition-colors group"
                  >
                    {/* Порода */}
                    <td className="py-1.5 px-3 sm:px-3.5 font-serif font-bold text-charcoal-900 leading-tight text-xs sm:text-sm">
                      {row.displayName}
                    </td>

                    {/* Собак */}
                    <td className="py-1.5 px-2 sm:px-2.5 text-right font-mono font-semibold text-charcoal-800 tabular-nums whitespace-nowrap leading-tight text-xs sm:text-sm">
                      {row.dogCount}
                    </td>

                    {/* Ср. скорость */}
                    <td className="py-1.5 px-2 sm:px-2.5 text-right font-mono text-charcoal-700 tabular-nums whitespace-nowrap leading-tight text-xs sm:text-sm">
                      {row.avgSpeed ? (
                        <span>
                          {row.avgSpeed.toFixed(1)}{' '}
                          <span className="text-[10px] font-sans text-charcoal-500">км/ч</span>
                        </span>
                      ) : (
                        <span className="text-charcoal-300 leading-tight">—</span>
                      )}
                    </td>

                    {/* Рекорд радара */}
                    <td className="py-1.5 px-2 sm:px-3 text-right tabular-nums whitespace-nowrap">
                      {row.bestSpeed ? (
                        <div className="inline-flex flex-col items-end leading-tight">
                          <span className="font-mono font-bold text-camel-800 leading-tight">
                            {row.bestSpeed.speed}{' '}
                            <span className="text-[10px] font-sans font-normal text-charcoal-500">
                              км/ч
                            </span>
                          </span>
                          <Link
                            to={`/donino-dog/${encodeURIComponent(row.bestSpeed.dogName)}/${encodeURIComponent(row.displayName)}/`}
                            className="text-[10px] text-camel-700 hover:text-camel-950 hover:underline max-w-[110px] sm:max-w-[125px] truncate block leading-tight pt-0.5"
                            title={`Профиль собаки ${row.bestSpeed.dogName}`}
                          >
                            {row.bestSpeed.dogName}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-charcoal-300 leading-tight">—</span>
                      )}
                    </td>

                    {/* Ср. время 350 м */}
                    <td className="py-1.5 px-2 sm:px-2.5 text-right font-mono text-charcoal-700 tabular-nums whitespace-nowrap leading-tight text-xs sm:text-sm">
                      {row.avgTime ? (
                        <span>
                          {row.avgTime.toFixed(2)}{' '}
                          <span className="text-[10px] font-sans text-charcoal-500">сек</span>
                        </span>
                      ) : (
                        <span className="text-charcoal-300 leading-tight">—</span>
                      )}
                    </td>

                    {/* Рекорд 350 м */}
                    <td className="py-1.5 px-2 sm:px-3 text-right tabular-nums whitespace-nowrap">
                      {row.bestTime ? (
                        <div className="inline-flex flex-col items-end leading-tight">
                          <span className="font-mono font-bold text-camel-800 leading-tight">
                            {row.bestTime.time.toFixed(2)}{' '}
                            <span className="text-[10px] font-sans font-normal text-charcoal-500">
                              сек
                            </span>
                          </span>
                          <Link
                            to={`/donino-dog/${encodeURIComponent(row.bestTime.dogName)}/${encodeURIComponent(row.displayName)}/`}
                            className="text-[10px] text-camel-700 hover:text-camel-950 hover:underline max-w-[110px] sm:max-w-[125px] truncate block leading-tight pt-0.5"
                            title={`Профиль собаки ${row.bestTime.dogName}`}
                          >
                            {row.bestTime.dogName}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-charcoal-300 leading-tight">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-cream-50/70 border-t border-cream-200/80 px-3.5 py-1.5 text-[11px] text-charcoal-500 flex flex-wrap items-center justify-between gap-2">
          <span>Всего пород: {sortedRows.length}</span>
          <span>Нажмите на заголовок столбца для сортировки</span>
        </div>
      </div>
  )
}
