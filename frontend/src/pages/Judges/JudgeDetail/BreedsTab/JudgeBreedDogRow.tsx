import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ExternalLink } from 'lucide-react'
import ProcoursingEventLink from '../../../../components/ProcoursingEventLink'
import RankBadge from '../../../../components/RankBadge'
import { formatBreedSentenceCase } from '../../../../lib/breedMapping'
import type { BreedStat, DogStat } from '../types'
import { CRITERIA_META } from '../constants'
import { formatDate } from '../utils'

export interface JudgeBreedDogRowProps {
  dog: DogStat
  stat: BreedStat
  dogIdx: number
  dogKey: string
  isDogOpen: boolean
  toggleDogExpand: (dogKey: string) => void
}

export const JudgeBreedDogRow: React.FC<JudgeBreedDogRowProps> = ({
  dog,
  stat,
  dogIdx,
  dogKey,
  isDogOpen,
  toggleDogExpand,
}) => {
  const rank = dogIdx + 1
  const startsCount = dog.total_evaluations || (dog.events ? dog.events.length : 1)
  const dogScore100 = dog.avg_score != null ? (dog.avg_score * 5).toFixed(1) : '—'

  return (
    <div className="transition-colors">
      <div className="flex flex-row items-center justify-between p-3 sm:p-3.5 hover:bg-cream-100/50 transition-colors">
        {/* Left: Rank Badge */}
        <div className="w-10 sm:w-12 shrink-0 flex items-center justify-center">
          <RankBadge rank={rank} />
        </div>

        {/* Center: Dog Info */}
        <div className="min-w-0 flex-1 px-2.5 sm:px-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              to={`/dog/${encodeURIComponent(dog.name)}/`}
              className="font-bold text-sm sm:text-[15px] leading-snug text-charcoal-900 truncate hover:text-camel-800 hover:underline transition-colors"
              title={dog.name_ru ? `${dog.name} / ${dog.name_ru}` : dog.name}
            >
              {dog.name}
            </Link>
          </div>

          {/* Subtitle 1: Breed + Russian name */}
          <div className="flex items-center gap-1 text-[10.5px] sm:text-xs text-charcoal-500 font-medium mt-0.5">
            <span className="truncate">{formatBreedSentenceCase(stat.breed)}</span>
            {dog.name_ru && !dog.name.includes(dog.name_ru) && (
              <>
                <span className="text-charcoal-300">·</span>
                <span className="truncate text-charcoal-400">{dog.name_ru}</span>
              </>
            )}
          </div>

          {/* Subtitle 2: Average Score */}
          <div className="flex items-center gap-1 text-[11px] sm:text-[11.5px] text-charcoal-600 font-medium mt-0.5">
            <span>Ср. балл:</span>
            <strong className="font-bold text-charcoal-900 tabular-nums">
              {dogScore100}
            </strong>
            <span className="text-[10px] text-charcoal-400 font-normal">из 100</span>
            {dog.avg_score != null && (
              <span className="text-[10px] text-charcoal-400 hidden sm:inline">
                ({dog.avg_score.toFixed(2)} из 20)
              </span>
            )}
          </div>
        </div>

        {/* Right: Starts & Criteria toggle */}
        <div className="shrink-0 flex flex-col items-end justify-center gap-1 pl-2 text-right">
          <div className="flex items-center gap-1.5 min-w-0 justify-end">
            <span className="text-xs text-charcoal-600 font-medium">Забегов</span>
            <strong className="font-bold text-charcoal-900 tabular-nums text-sm">
              {startsCount}
            </strong>
          </div>

          <button
            type="button"
            onClick={() => toggleDogExpand(dogKey)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
              isDogOpen
                ? 'bg-camel-100 border-camel-300 text-camel-900'
                : 'bg-cream-100/80 border-old-money-200/60 text-charcoal-700 hover:bg-cream-200/80 hover:text-camel-900'
            }`}
            title="Оценки по критериям и забегам"
          >
            <span>Оценки</span>
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${
                isDogOpen ? 'rotate-180 text-camel-700' : 'text-charcoal-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dog Details Drawer: Criteria Breakdown & Events */}
      {isDogOpen && (
        <div className="border-t border-old-money-100/70 bg-cream-50/40 p-3 sm:p-4 space-y-3">
          {dog.scores_by_criteria && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
                Оценки по критериям (шкала 0–20):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {CRITERIA_META.map((meta) => {
                  const scores = dog.scores_by_criteria?.[meta.id] || []
                  const valid = scores.filter((s) => s != null && !Number.isNaN(s))
                  if (valid.length === 0) return null
                  const cAvg = valid.reduce((a, b) => a + b, 0) / valid.length
                  const cPct = Math.min(100, Math.max(0, (cAvg / 20) * 100))
                  const Icon = meta.icon

                  return (
                    <div
                      key={meta.id}
                      className="rounded-lg border border-old-money-200/60 bg-cream-50/60 p-2"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="inline-flex items-center gap-1 text-charcoal-700 font-medium">
                          <Icon className="h-3 w-3 text-camel-600" />
                          {meta.name}
                        </span>
                        <span className="font-bold tabular-nums text-charcoal-900">
                          {cAvg.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-old-money-100">
                        <div
                          className={`h-full rounded-full ${meta.color}`}
                          style={{ width: `${cPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {dog.events && dog.events.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mb-1.5">
                Соревнования под судейством:
              </p>
              <div className="divide-y divide-old-money-100 rounded-lg border border-old-money-200/60 bg-white">
                {dog.events.map((ev, evIdx) => (
                  <div
                    key={evIdx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {ev.event_id ? (
                          <ProcoursingEventLink
                            eventId={ev.event_id}
                            className="text-charcoal-900 font-semibold hover:text-camel-800 hover:underline inline-flex items-center gap-1 transition-colors"
                            title={`Открыть протокол: ${ev.title}`}
                          >
                            <span>{ev.title || 'Соревнование'}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                          </ProcoursingEventLink>
                        ) : (
                          <span className="font-semibold text-charcoal-900">
                            {ev.title || 'Соревнование'}
                          </span>
                        )}
                        {ev.date && (
                          <span className="text-charcoal-400 text-[11px]">
                            {formatDate(ev.date)}
                          </span>
                        )}
                      </div>

                      {ev.heats && ev.heats.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {ev.heats.map((h) => (
                            <span
                              key={h.heat_number}
                              className="inline-flex items-center gap-1 rounded bg-old-money-50/80 px-2 py-0.5 font-mono text-[11px] text-old-money-700 border border-old-money-200/60"
                            >
                              <span className="text-charcoal-500">Забег {h.heat_number}:</span>
                              <span className="font-semibold text-charcoal-900">{h.total} б.</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-old-money-100/60">
                      {ev.total != null && (
                        <span className="font-bold tabular-nums text-camel-800 text-sm">
                          {ev.total} б.
                        </span>
                      )}
                      {ev.heats && ev.heats.length > 1 && ev.avg_score != null && (
                        <span className="text-[10px] text-charcoal-400 tabular-nums">
                          ср. {ev.avg_score} б.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
