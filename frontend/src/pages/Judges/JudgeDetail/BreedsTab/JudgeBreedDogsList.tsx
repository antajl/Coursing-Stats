import React, { useState, useMemo, useEffect, useRef } from 'react'
import type { BreedStat, DogStat } from '../types'
import { JudgeBreedDogRow } from './JudgeBreedDogRow'

const INITIAL_DOGS_BATCH = 25
const BATCH_INCREMENT = 25

export interface JudgeBreedDogsListProps {
  stat: BreedStat
  matchingDogs: DogStat[]
  searchQuery: string
  expandedDogs: Set<string>
  toggleDogExpand: (dogKey: string) => void
}

export const JudgeBreedDogsList: React.FC<JudgeBreedDogsListProps> = ({
  stat,
  matchingDogs,
  searchQuery,
  expandedDogs,
  toggleDogExpand,
}) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_DOGS_BATCH)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, matchingDogs.length))
        }
      },
      { rootMargin: '300px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [matchingDogs.length])

  const displayedDogs = useMemo(
    () => matchingDogs.slice(0, visibleCount),
    [matchingDogs, visibleCount],
  )

  if (matchingDogs.length === 0) {
    return (
      <div className="py-5 px-4 text-center text-xs text-charcoal-500">
        Собаки по запросу «{searchQuery}» не найдены
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y divide-old-money-100/50">
        {displayedDogs.map((dog, dogIdx) => {
          const dogKey = `${stat.breed}|${dog.name}|${dogIdx}`
          return (
            <JudgeBreedDogRow
              key={dogKey}
              dog={dog}
              stat={stat}
              dogIdx={dogIdx}
              dogKey={dogKey}
              isDogOpen={expandedDogs.has(dogKey)}
              toggleDogExpand={toggleDogExpand}
            />
          )
        })}
      </div>

      {/* Lazy scroll sentinel and fallback control */}
      {visibleCount < matchingDogs.length && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-cream-100/40 border-t border-old-money-100/60 text-xs text-charcoal-600"
        >
          <span>
            Показано <strong className="font-semibold text-charcoal-900 tabular-nums">{displayedDogs.length}</strong> из{' '}
            <strong className="font-semibold text-charcoal-900 tabular-nums">{matchingDogs.length}</strong> собак
          </span>
          <button
            type="button"
            onClick={() =>
              setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, matchingDogs.length))
            }
            className="rounded-full border border-camel-400 bg-white px-3 py-1 text-xs font-semibold text-camel-900 shadow-3xs transition-all hover:bg-camel-50 hover:border-camel-500 active:scale-95 cursor-pointer"
          >
            Показать ещё {Math.min(BATCH_INCREMENT, matchingDogs.length - visibleCount)}
          </button>
        </div>
      )}

      {visibleCount >= matchingDogs.length && matchingDogs.length > INITIAL_DOGS_BATCH && (
        <div className="py-2 text-center text-[11px] text-charcoal-400 bg-cream-50/20 border-t border-old-money-100/40">
          Все {matchingDogs.length} собак показаны
        </div>
      )}
    </div>
  )
}
export default JudgeBreedDogsList
