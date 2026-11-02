import React from 'react'
import type {
  CategoryGroup,
  DogParticipant,
  RunStatus,
  ActiveRunMenuState,
  ActiveSearchDogState,
  ActiveAwardsMenuState,
  ActiveCategoryMenuState,
  ActiveDogSexMenuState
} from './types'
import type { ExistingDog } from './constants'
import { RunStatusPortal } from './portals/RunStatusPortal'
import { DogSearchPortal } from './portals/DogSearchPortal'
import { AwardsPortal } from './portals/AwardsPortal'
import { BreedSelectPortal } from './portals/BreedSelectPortal'
import { ClassAndSexPortals } from './portals/ClassAndSexPortals'

export interface ProtocolDropdownPortalsProps {
  categories: CategoryGroup[]
  activeRunMenu: ActiveRunMenuState | null
  setActiveRunMenu: (val: ActiveRunMenuState | null) => void
  setRunStatus: (catId: string, dogId: string, rIdx: number, status: RunStatus, reason?: string) => void
  activeSearchDog: ActiveSearchDogState | null
  setActiveSearchDog: (val: ActiveSearchDogState | null) => void
  filteredExistingDogs: ExistingDog[]
  selectExistingDog: (catId: string, dogId: string, exDog: ExistingDog) => void
  activeAwardsMenu: ActiveAwardsMenuState | null
  setActiveAwardsMenu: (val: ActiveAwardsMenuState | null) => void
  toggleAward: (catId: string, dogId: string, title: string) => void
  activeBreedMenu: ActiveCategoryMenuState | null
  setActiveBreedMenu: (val: ActiveCategoryMenuState | null) => void
  breedSearch: string
  setBreedSearch: (val: string) => void
  updateCategoryMeta: (catId: string, updates: Partial<CategoryGroup>) => void
  setCustomBreedCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  activeClassMenu: ActiveCategoryMenuState | null
  setActiveClassMenu: (val: ActiveCategoryMenuState | null) => void
  setCustomClassCatIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  activeCategorySexMenu: ActiveCategoryMenuState | null
  setActiveCategorySexMenu: (val: ActiveCategoryMenuState | null) => void
  activeDogSexMenu: ActiveDogSexMenuState | null
  setActiveDogSexMenu: (val: ActiveDogSexMenuState | null) => void
  updateDog: (catId: string, dogId: string, updates: Partial<DogParticipant>) => void
}

export const ProtocolDropdownPortals: React.FC<ProtocolDropdownPortalsProps> = ({
  categories,
  activeRunMenu,
  setActiveRunMenu,
  setRunStatus,
  activeSearchDog,
  setActiveSearchDog,
  filteredExistingDogs,
  selectExistingDog,
  activeAwardsMenu,
  setActiveAwardsMenu,
  toggleAward,
  activeBreedMenu,
  setActiveBreedMenu,
  breedSearch,
  setBreedSearch,
  updateCategoryMeta,
  setCustomBreedCatIds,
  activeClassMenu,
  setActiveClassMenu,
  setCustomClassCatIds,
  activeCategorySexMenu,
  setActiveCategorySexMenu,
  activeDogSexMenu,
  setActiveDogSexMenu,
  updateDog
}) => {
  return (
    <>
      <RunStatusPortal
        categories={categories}
        activeRunMenu={activeRunMenu}
        onClose={() => setActiveRunMenu(null)}
        onSetStatus={setRunStatus}
      />

      <DogSearchPortal
        activeSearchDog={activeSearchDog}
        filteredExistingDogs={filteredExistingDogs}
        onClose={() => setActiveSearchDog(null)}
        onSelectDog={selectExistingDog}
      />

      <AwardsPortal
        categories={categories}
        activeAwardsMenu={activeAwardsMenu}
        onClose={() => setActiveAwardsMenu(null)}
        onToggleAward={toggleAward}
      />

      <BreedSelectPortal
        categories={categories}
        activeBreedMenu={activeBreedMenu}
        onClose={() => setActiveBreedMenu(null)}
        breedSearch={breedSearch}
        setBreedSearch={setBreedSearch}
        updateCategoryMeta={updateCategoryMeta}
        setCustomBreedCatIds={setCustomBreedCatIds}
      />

      <ClassAndSexPortals
        categories={categories}
        activeClassMenu={activeClassMenu}
        onCloseClassMenu={() => setActiveClassMenu(null)}
        updateCategoryMeta={updateCategoryMeta}
        setCustomClassCatIds={setCustomClassCatIds}
        activeCategorySexMenu={activeCategorySexMenu}
        onCloseCategorySexMenu={() => setActiveCategorySexMenu(null)}
        activeDogSexMenu={activeDogSexMenu}
        onCloseDogSexMenu={() => setActiveDogSexMenu(null)}
        updateDog={updateDog}
      />
    </>
  )
}
