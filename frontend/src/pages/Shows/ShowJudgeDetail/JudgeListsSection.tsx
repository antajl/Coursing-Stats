import type { RefObject } from 'react'
import { JudgeBreedPanel } from './JudgeBreedPanel'
import { JudgeExhibitionPanel } from './JudgeExhibitionPanel'
import { GRADE_TILES, type GradeFilterKey, type ListTab } from './judgeDetailAggregates'

type BreedRow = { breed: string; count: number }
type ExhibitionRow = {
  id: number
  date: string
  title: string
  rkf_url?: string
  grade_counts?: Partial<Record<GradeFilterKey, number>>
}

export function JudgeListsSection({
  listTab,
  onListTabChange,
  periodBreeds,
  filteredExhibitions,
  gradeFilter,
  showAllBreeds,
  showAllExhibitions,
  onToggleShowAllBreeds,
  onToggleShowAllExhibitions,
  onClearGradeFilter,
  listsRef,
}: {
  listTab: ListTab
  onListTabChange: (tab: ListTab) => void
  periodBreeds: BreedRow[]
  filteredExhibitions: ExhibitionRow[]
  gradeFilter: GradeFilterKey | null
  showAllBreeds: boolean
  showAllExhibitions: boolean
  onToggleShowAllBreeds: () => void
  onToggleShowAllExhibitions: () => void
  onClearGradeFilter: () => void
  listsRef: RefObject<HTMLDivElement | null>
}) {
  const gradeFilterLabel = gradeFilter
    ? GRADE_TILES.find((t) => t.key === gradeFilter)?.label || gradeFilter
    : null

  return (
    <div
      ref={listsRef}
      id="judge-exhibitions"
      className="scroll-mt-20 rounded-xl border border-old-money-200/80 bg-white"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-old-money-100 px-4 pt-3 md:px-6">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onListTabChange('breeds')}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              listTab === 'breeds'
                ? 'border-b-2 border-camel-600 text-camel-800'
                : 'text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Породы
            <span className="ml-1.5 tabular-nums text-charcoal-400">
              {periodBreeds.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onListTabChange('exhibitions')}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              listTab === 'exhibitions'
                ? 'border-b-2 border-camel-600 text-camel-800'
                : 'text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            Выставки
            <span className="ml-1.5 tabular-nums text-charcoal-400">
              {filteredExhibitions.length}
            </span>
          </button>
        </div>
        {gradeFilterLabel && listTab === 'exhibitions' && (
          <div className="mb-1 ml-auto flex items-center gap-2">
            <span className="rounded-full border border-camel-300 bg-camel-50 px-3 py-1 text-xs font-semibold text-camel-800">
              {gradeFilterLabel}
            </span>
            <button
              type="button"
              onClick={onClearGradeFilter}
              className="text-xs text-charcoal-500 underline hover:text-camel-700"
            >
              Сбросить
            </button>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6">
        {listTab === 'breeds' ? (
          <JudgeBreedPanel
            breeds={periodBreeds}
            showAll={showAllBreeds}
            onToggleShowAll={onToggleShowAllBreeds}
          />
        ) : (
          <JudgeExhibitionPanel
            exhibitions={filteredExhibitions}
            gradeFilter={gradeFilter}
            showAll={showAllExhibitions}
            onToggleShowAll={onToggleShowAllExhibitions}
          />
        )}
      </div>
    </div>
  )
}
