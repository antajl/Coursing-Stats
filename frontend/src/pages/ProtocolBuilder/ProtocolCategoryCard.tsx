import React from 'react'
import type {
  ActiveAwardsMenuState,
  ActiveCategoryMenuState,
  ActiveDogSexMenuState,
  ActiveRunMenuState,
  ActiveSearchDogState,
  CategoryGroup,
  CompetitionKind,
  CoursingScores,
  DogParticipant,
  RunStatus,
} from './types'
import { COURSING_CRITERIA_META } from './types'
import { CategoryCardHeader } from './components/CategoryCardHeader'
import { ProtocolParticipantRow } from './ProtocolParticipantRow'

interface ProtocolCategoryCardProps {
  category: CategoryGroup
  kind: CompetitionKind
  categoriesCount: number
  duplicateNames: Set<string>
  customBreedCatIds: Record<string, boolean>
  setCustomBreedCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  customClassCatIds: Record<string, boolean>
  setCustomClassCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  addDogToCategory: (categoryId: string) => void
  removeCategory: (categoryId: string) => void
  updateCategoryMeta: (categoryId: string, updates: Partial<CategoryGroup>) => void
  setCategoryRunsCount: (categoryId: string, count: 1 | 2 | 3) => void
  setActiveBreedMenu: (state: ActiveCategoryMenuState | null) => void
  setBreedSearch: (query: string) => void
  setActiveClassMenu: (state: ActiveCategoryMenuState | null) => void
  setActiveCategorySexMenu: (state: ActiveCategoryMenuState | null) => void
  updateDog: (categoryId: string, dogId: string, updates: Partial<DogParticipant>) => void
  removeDogFromCategory: (categoryId: string, dogId: string) => void
  updateRunField: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    field: 'heat' | 'blanket',
    value: string
  ) => void
  cycleBlanket: (categoryId: string, dogId: string, runIndex: number) => void
  updateRunScore: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    criterion: keyof CoursingScores,
    value: string
  ) => void
  setRunStatus: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    status: RunStatus,
    reason?: string
  ) => void
  updateRunReason: (categoryId: string, dogId: string, runIndex: number, reason: string) => void
  activeAwardsMenu: ActiveAwardsMenuState | null
  setActiveAwardsMenu: (state: ActiveAwardsMenuState | null) => void
  activeSearchDog: ActiveSearchDogState | null
  setActiveSearchDog: (state: ActiveSearchDogState | null) => void
  setSearchQuery: (query: string) => void
  activeRunMenu: ActiveRunMenuState | null
  setActiveRunMenu: (state: ActiveRunMenuState | null) => void
  setActiveDogSexMenu: (state: ActiveDogSexMenuState | null) => void
}

export const ProtocolCategoryCard: React.FC<ProtocolCategoryCardProps> = (props) => {
  const { category, kind, duplicateNames } = props
  const isCategoryActive = (category.dogs || []).some(
    (d) =>
      d.id === props.activeAwardsMenu?.dogId ||
      d.id === props.activeSearchDog?.dogId ||
      props.activeRunMenu?.dogId === d.id
  )

  const sortedCategoryDogs = [...(category.dogs || [])].sort((a, b) => {
    const aAbsent = (a.runs || []).slice(0, category.runsCount).some((r) => r?.status === 'absent')
    const bAbsent = (b.runs || []).slice(0, category.runsCount).some((r) => r?.status === 'absent')
    return (aAbsent ? 1 : 0) - (bAbsent ? 1 : 0)
  })

  return (
    <div
      className={`bg-cream-50/95 rounded-2xl border border-om-200 shadow-xs ${
        isCategoryActive ? 'relative z-20' : 'relative z-0'
      }`}
    >
      <CategoryCardHeader
        category={category}
        kind={kind}
        categoriesCount={props.categoriesCount}
        customBreedCatIds={props.customBreedCatIds}
        setCustomBreedCatIds={props.setCustomBreedCatIds}
        customClassCatIds={props.customClassCatIds}
        setCustomClassCatIds={props.setCustomClassCatIds}
        addDogToCategory={props.addDogToCategory}
        removeCategory={props.removeCategory}
        updateCategoryMeta={props.updateCategoryMeta}
        setCategoryRunsCount={props.setCategoryRunsCount}
        setActiveBreedMenu={props.setActiveBreedMenu}
        setBreedSearch={props.setBreedSearch}
        setActiveClassMenu={props.setActiveClassMenu}
        setActiveCategorySexMenu={props.setActiveCategorySexMenu}
      />

      {kind === 'coursing' && (
        <div className="px-3.5 py-2 bg-cream-100/50 border-b border-om-200/70 text-[11px] text-charcoal-700 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-camel-800">Оценки (0–20):</span>
          {COURSING_CRITERIA_META.map((c) => (
            <span key={c.key} className="whitespace-nowrap">
              <strong className="font-bold text-charcoal-900">{c.short}</strong> — {c.label}
            </span>
          ))}
        </div>
      )}

      <div className="p-2.5 sm:p-3 space-y-2">
        {sortedCategoryDogs.map((dog) => (
          <ProtocolParticipantRow
            key={dog.id}
            dog={dog}
            category={category}
            kind={kind}
            duplicateNames={duplicateNames}
            updateDog={props.updateDog}
            removeDogFromCategory={props.removeDogFromCategory}
            updateRunField={props.updateRunField}
            cycleBlanket={props.cycleBlanket}
            updateRunScore={props.updateRunScore}
            setRunStatus={props.setRunStatus}
            updateRunReason={props.updateRunReason}
            activeAwardsMenu={props.activeAwardsMenu}
            setActiveAwardsMenu={props.setActiveAwardsMenu}
            activeSearchDog={props.activeSearchDog}
            setActiveSearchDog={props.setActiveSearchDog}
            setSearchQuery={props.setSearchQuery}
            activeRunMenu={props.activeRunMenu}
            setActiveRunMenu={props.setActiveRunMenu}
            setActiveDogSexMenu={props.setActiveDogSexMenu}
          />
        ))}
      </div>
    </div>
  )
}
