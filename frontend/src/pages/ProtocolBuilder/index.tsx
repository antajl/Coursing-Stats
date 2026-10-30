import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderPlus } from 'lucide-react'
import { usePublicCalendarVisible } from '../../hooks/useStaticData'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import { useProtocolBuilderState } from './useProtocolBuilderState'
import { ProtocolHeaderPanel } from './ProtocolHeaderPanel'
import { ProtocolCategoryCard } from './ProtocolCategoryCard'
import { ProtocolPrintView } from './ProtocolPrintView'
import { ProtocolDropdownPortals } from './ProtocolDropdownPortals'

export {
  STORAGE_KEY,
  BREED_GROUPS,
  ALL_KNOWN_BREEDS,
  CLASSES,
  TITLES_LIST,
  type BreedGroupItem
} from './constants'

export default function ProtocolBuilder() {
  const navigate = useNavigate()
  const calendarVisible = usePublicCalendarVisible('competitions')
  const state = useProtocolBuilderState()

  return (
    <>
      {/* Mobile-only tab switcher */}
      <MobileSubNavTabs
        tabs={[
          { id: 'ranking', label: 'Рейтинг' },
          ...(calendarVisible ? [{ id: 'archive', label: 'Архив' }] : []),
          { id: 'judges', label: 'Судьи' },
          { id: 'builder', label: 'Конструктор' },
        ]}
        activeTab="builder"
        onChange={(tabId) => {
          if (tabId === 'ranking') navigate('/competitions?tab=ranking')
          else if (tabId === 'archive') navigate('/competitions?tab=archive')
          else if (tabId === 'judges') navigate('/competitions?tab=judges')
        }}
        ariaLabel="Разделы соревнований"
        className="print:hidden"
      />

      <div className="space-y-5 pb-20">
        <ProtocolHeaderPanel
          header={state.header}
          setHeader={state.setHeader}
          kind={state.kind}
          setKind={state.setKind}
          categories={state.categories}
          isDownloadOpen={state.isDownloadOpen}
          setIsDownloadOpen={state.setIsDownloadOpen}
          isExportingPDF={state.isExportingPDF}
          downloadMenuRef={state.downloadMenuRef}
          handleDownloadPDF={state.handleDownloadPDF}
          handlePrint={state.handlePrint}
          handleResetToDefault={state.handleResetToDefault}
        />

        {/* Рабочая область категорий (скрывается при печати) */}
        <div className="space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-char-900">
              Категории соревнований ({state.categories.length})
            </h2>

            <button
              onClick={state.addCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-camel-600 hover:bg-camel-700 text-white rounded-lg text-xs font-medium shadow-xs transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Добавить категорию
            </button>
          </div>

          <div className="space-y-4">
            {state.categories.map((category) => (
              <ProtocolCategoryCard
                key={category.id}
                category={category}
                kind={state.kind}
                categoriesCount={state.categories.length}
                customBreedCatIds={state.customBreedCatIds}
                setCustomBreedCatIds={state.setCustomBreedCatIds}
                customClassCatIds={state.customClassCatIds}
                setCustomClassCatIds={state.setCustomClassCatIds}
                addDogToCategory={state.addDogToCategory}
                removeCategory={state.removeCategory}
                updateCategoryMeta={state.updateCategoryMeta}
                setCategoryRunsCount={state.setCategoryRunsCount}
                setActiveBreedMenu={state.setActiveBreedMenu}
                setBreedSearch={state.setBreedSearch}
                setActiveClassMenu={state.setActiveClassMenu}
                setActiveCategorySexMenu={state.setActiveCategorySexMenu}
                updateDog={state.updateDog}
                removeDogFromCategory={state.removeDogFromCategory}
                updateRunField={state.updateRunField}
                cycleBlanket={state.cycleBlanket}
                updateRunScore={state.updateRunScore}
                setRunStatus={state.setRunStatus}
                updateRunReason={state.updateRunReason}
                activeAwardsMenu={state.activeAwardsMenu}
                setActiveAwardsMenu={state.setActiveAwardsMenu}
                activeSearchDog={state.activeSearchDog}
                setActiveSearchDog={state.setActiveSearchDog}
                setSearchQuery={state.setSearchQuery}
                activeRunMenu={state.activeRunMenu}
                setActiveRunMenu={state.setActiveRunMenu}
                setActiveDogSexMenu={state.setActiveDogSexMenu}
              />
            ))}
          </div>
        </div>

        {/* Официальная сводная ведомость результатов (для печати и PDF) */}
        <ProtocolPrintView
          printableRef={state.printableRef}
          header={state.header}
          kind={state.kind}
          categories={state.categories}
        />

        {/* Выпадающие меню и порталы автокомплита */}
        <ProtocolDropdownPortals
          categories={state.categories}
          activeRunMenu={state.activeRunMenu}
          setActiveRunMenu={state.setActiveRunMenu}
          setRunStatus={state.setRunStatus}
          activeSearchDog={state.activeSearchDog}
          setActiveSearchDog={state.setActiveSearchDog}
          filteredExistingDogs={state.filteredExistingDogs}
          selectExistingDog={state.selectExistingDog}
          activeAwardsMenu={state.activeAwardsMenu}
          setActiveAwardsMenu={state.setActiveAwardsMenu}
          toggleAward={state.toggleAward}
          activeBreedMenu={state.activeBreedMenu}
          setActiveBreedMenu={state.setActiveBreedMenu}
          breedSearch={state.breedSearch}
          setBreedSearch={state.setBreedSearch}
          updateCategoryMeta={state.updateCategoryMeta}
          setCustomBreedCatIds={state.setCustomBreedCatIds}
          activeClassMenu={state.activeClassMenu}
          setActiveClassMenu={state.setActiveClassMenu}
          setCustomClassCatIds={state.setCustomClassCatIds}
          activeCategorySexMenu={state.activeCategorySexMenu}
          setActiveCategorySexMenu={state.setActiveCategorySexMenu}
          activeDogSexMenu={state.activeDogSexMenu}
          setActiveDogSexMenu={state.setActiveDogSexMenu}
          updateDog={state.updateDog}
        />
      </div>
    </>
  )
}
