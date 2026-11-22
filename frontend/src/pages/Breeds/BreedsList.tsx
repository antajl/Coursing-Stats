import React from 'react'
import type { BreedHubMeta } from '../../lib/breed-hubs-data'
import type { BreedStatsData, BreedCardDesignVariant } from '../../components/BreedCard/types'
import BreedCard from '../../components/BreedCard'
import EmptyState from '../../components/EmptyState'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import BreedSortDropdown, { type BreedSortKey } from './BreedSortDropdown'
import { formatBreedsCount } from './useBreedsFilterAndSort'
import { useListReveal } from '../../hooks/useListReveal'

export interface BreedsListProps {
  sortedBreeds: BreedHubMeta[]
  statsMap: Record<string, BreedStatsData>
  visibleCount: number
  sortKey: BreedSortKey
  setSortKey: (k: BreedSortKey) => void
  plaqueTitle: string
  loadMoreRef: React.RefObject<HTMLDivElement | null>
  loading: boolean
  layoutVariant?: BreedCardDesignVariant
}

export const BreedsList: React.FC<BreedsListProps> = ({
  sortedBreeds,
  statsMap,
  visibleCount,
  sortKey,
  setSortKey,
  plaqueTitle,
  loadMoreRef,
  loading,
  layoutVariant = 'passport',
}) => {
  const listRevealRef = useListReveal(!loading && sortedBreeds.length > 0)

  const plaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
          <span className="truncate">{plaqueTitle}</span>
          <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
            · {formatBreedsCount(sortedBreeds.length)}
          </span>
        </span>
      }
      actionPlacement="right"
      action={<BreedSortDropdown value={sortKey} onChange={setSortKey} />}
    />
  )

  if (sortedBreeds.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-old-money-200 bg-white">
        <EmptyState
          title="Породы не найдены"
          description="Попробуйте изменить поисковый запрос или выбрать другую группу FCI"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DoninoColumnShell
        plaque={plaque}
        listRef={listRevealRef}
        bodyClassName="flex flex-col divide-y divide-old-money-100"
      >
        {sortedBreeds.slice(0, visibleCount).map((breed) => (
          <div
            key={breed.slug}
            id={`breed-${breed.slug}`}
            data-list-item
            data-breed-slug={breed.slug}
          >
            <BreedCard
              breed={breed}
              stats={statsMap[breed.slug]}
              variant="embedded"
              layoutVariant={layoutVariant}
            />
          </div>
        ))}
      </DoninoColumnShell>

      {/* Lazy load trigger */}
      {sortedBreeds.length > visibleCount && (
        <div ref={loadMoreRef} className="py-3 text-center text-xs text-charcoal-500">
          Загрузка…
        </div>
      )}
    </div>
  )
}
export default BreedsList
