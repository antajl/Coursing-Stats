import React, { useState, useEffect } from 'react'
import { Calendar, Building2, FileSpreadsheet } from 'lucide-react'
import SkeletonLoader from '../../components/SkeletonLoader'
import { getEvent, getEventResults } from '../../lib/staticData'
import ResultsSection from '../Events/EventResults/ResultsSection'
import type { Event, Result } from '../Events/EventResults/types'
import type { ChampionshipStage } from '../../lib/staticData/donino'

interface ChampionshipStageTabProps {
  stage: ChampionshipStage
}

interface StageCacheEntry {
  event: Event
  results: Result[]
}

const stageDataCache = new Map<number, StageCacheEntry>()

export function prefetchStageData(stageId: number): Promise<void> {
  if (stageDataCache.has(stageId)) return Promise.resolve()
  return Promise.all([
    getEvent(String(stageId)),
    getEventResults(String(stageId)),
  ])
    .then(([evRes, resRes]) => {
      if (evRes.success && evRes.data && resRes.success && resRes.data) {
        stageDataCache.set(stageId, {
          event: evRes.data as Event,
          results: Array.isArray(resRes.data) ? (resRes.data as unknown as Result[]) : [],
        })
      }
    })
    .catch(() => {})
}

export default function ChampionshipStageTab({ stage }: ChampionshipStageTabProps) {
  const cached = stageDataCache.get(stage.id)
  const [eventData, setEventData] = useState<Event | null>(cached?.event ?? null)
  const [eventResults, setEventResults] = useState<Result[]>(cached?.results ?? [])
  const [loadingProtocol, setLoadingProtocol] = useState(!cached && stage.has_results)
  const [protocolError, setProtocolError] = useState<string | null>(null)

  // Load native official event results if not already cached
  useEffect(() => {
    if (!stage.has_results) return
    if (stageDataCache.has(stage.id)) {
      const c = stageDataCache.get(stage.id)!
      setEventData(c.event)
      setEventResults(c.results)
      setLoadingProtocol(false)
      return
    }

    let cancelled = false
    setLoadingProtocol(true)
    setProtocolError(null)

    Promise.all([
      getEvent(String(stage.id)),
      getEventResults(String(stage.id)),
    ])
      .then(([evRes, resRes]) => {
        if (cancelled) return
        if (evRes.success && evRes.data && resRes.success && resRes.data) {
          const entry: StageCacheEntry = {
            event: evRes.data as Event,
            results: Array.isArray(resRes.data) ? (resRes.data as unknown as Result[]) : [],
          }
          stageDataCache.set(stage.id, entry)
          setEventData(entry.event)
          setEventResults(entry.results)
        } else {
          setProtocolError('Не удалось загрузить данные протокола')
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

  // Upcoming stage display (when stage has not occurred yet)
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
            Финальный этап клубного чемпионата сезона 2026. Забеги пройдут на овальной трассе в д. Донино с использованием стартовых боксов и фотофиниша.
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

  // Loading state
  if (loadingProtocol) {
    return (
      <div className="p-8">
        <SkeletonLoader count={8} />
      </div>
    )
  }

  // Error state
  if (protocolError || !eventData) {
    return (
      <div className="p-8 text-center bg-cream-50 rounded-2xl border border-old-money-200 text-charcoal-700">
        {protocolError || 'Протокол состязания временно недоступен'}
      </div>
    )
  }

  const eventId = eventData?.id ? String(eventData.id) : null
  const protocolUrl = eventId ? `/protocols/${eventId}.html` : null

  // Official Protocol View (Unified Toolbar + ResultsSection)
  return (
    <div className="space-y-3.5">
      <ResultsSection
        results={eventResults}
        trailing={
          protocolUrl ? (
            <a
              href={protocolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cs-glass-pill group inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold !text-charcoal-700 hover:!text-charcoal-950 transition-all cursor-pointer whitespace-nowrap select-none"
              title="Протокол состязания и прикреплённые документы"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-camel-700 shrink-0 transition-colors group-hover:text-camel-900" aria-hidden />
              <span className="hidden sm:inline">Протокол и документы</span>
              <span className="sm:hidden">Протокол</span>
            </a>
          ) : undefined
        }
      />
    </div>
  )
}
