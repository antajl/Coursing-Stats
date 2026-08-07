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
      className="scroll-mt-20 rounded-xl border border-old-money-200/80 bg-white dark:border-charcoal-600 dark:bg-charcoal-800/50"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-old-money-100 px-4 pt-3 dark:border-charcoal-600 md:px-6">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onListTabChange('breeds')}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              listTab === 'breeds'
                ? 'border-b-2 border-camel-600 text-camel-800 dark:border-camel-400 dark:text-camel-300'
                : 'text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-charcoal-200'
            }`}
          >
            Породы
            <span className="ml-1.5 tabular-nums text-charcoal-400 dark:text-charcoal-500">
              {periodBreeds.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onListTabChange('exhibitions')}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              listTab === 'exhibitions'
                ? 'border-b-2 border-camel-600 text-camel-800 dark:border-camel-400 dark:text-camel-300'
                : 'text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-charcoal-200'
            }`}
          >
            Выставки
            <span className="ml-1.5 tabular-nums text-charcoal-400 dark:text-charcoal-500">
              {filteredExhibitions.length}
            </span>
          </button>
        </div>
        {gradeFilterLabel && listTab === 'exhibitions' && (
          <div className="mb-1 ml-auto flex items-center gap-2">
            <span className="rounded-full border border-camel-300 bg-camel-50 px-3 py-1 text-xs font-semibold text-camel-800 dark:border-camel-600 dark:bg-camel-950/40 dark:text-camel-300">
              {gradeFilterLabel}
            </span>
            <button
              type="button"
              onClick={onClearGradeFilter}
              className="text-xs text-charcoal-500 underline hover:text-camel-700 dark:text-charcoal-400 dark:hover:text-camel-400"
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
