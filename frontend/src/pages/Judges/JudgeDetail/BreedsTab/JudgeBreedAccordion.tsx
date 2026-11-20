import React from 'react'
import { ChevronDown } from 'lucide-react'
import type { BreedStat } from '../types'
import { formatBreedName, getScoreTone } from '../utils'
import { matchesDog } from '../../../../lib/searchEngine'
import { JudgeBreedDogsList } from './JudgeBreedDogsList'

export interface JudgeBreedAccordionProps {
  stat: BreedStat
  searchQuery: string
  isExpanded: boolean
  toggleBreed: (breed: string) => void
  eventBreedFilter: string
  toggleEventBreed: (breed: string) => void
  expandedDogs: Set<string>
  toggleDogExpand: (dogKey: string) => void
}

export const JudgeBreedAccordion: React.FC<JudgeBreedAccordionProps> = ({
  stat,
  searchQuery,
  isExpanded,
  toggleBreed,
  eventBreedFilter,
  toggleEventBreed,
  expandedDogs,
  toggleDogExpand,
}) => {
  const q = searchQuery.trim()
  const matchingDogs = (stat.dogs || []).filter((dog) => {
    if (!q) return true
    return matchesDog(dog, q)
  })
  const tone = getScoreTone(stat.avg_score)
  const score100 = stat.avg_score != null ? (stat.avg_score * 5).toFixed(1) : '—'

  return (
    <div className="transition-colors">
      {/* Breed Row */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => toggleBreed(stat.breed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleBreed(stat.breed)
          }
        }}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 transition-colors cursor-pointer select-none ${
          isExpanded ? 'bg-cream-100/60' : 'hover:bg-cream-50/60'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-charcoal-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-camel-700' : 'group-hover:text-charcoal-600'
              }`}
            />
            <span className="font-bold text-sm sm:text-[15px] text-charcoal-900 group-hover:text-camel-900 transition-colors">
              {formatBreedName(stat.breed)}
            </span>
          </div>
          <div className="mt-1 ml-6 flex flex-wrap items-center gap-2 text-xs text-charcoal-500">
            <span>{stat.dogs?.length || 0} собак</span>
            <span>·</span>
            <span>{stat.evaluations_count || 0} забегов</span>
            {stat.min_score != null && stat.max_score != null && (
              <>
                <span>·</span>
                <span>диапазон {stat.min_score} – {stat.max_score} б.</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleEventBreed(stat.breed)
            }}
            className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              eventBreedFilter === stat.breed
                ? 'bg-camel-100 text-camel-900 border border-camel-300'
                : 'border border-old-money-200 bg-white text-camel-800 hover:bg-cream-50'
            }`}
            title="Показать соревнования по этой породе"
          >
            Соревнования ({stat.events_count ?? new Set(stat.dogs?.flatMap((d) => d.events?.map((e) => e.event_id ?? `${e.date}|${e.title}`)) || []).size})
          </button>

          <div
            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold tabular-nums ${tone.badge}`}
            title={`Средний балл ${stat.avg_score?.toFixed(2)} из 20 за критерий`}
          >
            <span>{score100}</span>
            <span className="text-[10px] font-normal opacity-80">/ 100 б.</span>
          </div>
        </div>
      </div>

      {/* Dogs Spoiler List */}
      {isExpanded && (
        <div className="bg-cream-50/25 border-t border-old-money-100/70">
          <JudgeBreedDogsList
            stat={stat}
            matchingDogs={matchingDogs}
            searchQuery={searchQuery}
            expandedDogs={expandedDogs}
            toggleDogExpand={toggleDogExpand}
          />
        </div>
      )}
    </div>
  )
}
export default JudgeBreedAccordion
