import { useNavigate } from 'react-router-dom'
import { FolderPlus } from 'lucide-react'
import { usePublicCalendarVisible } from '../../hooks/useStaticData'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import { SEO } from '../../components/SEO'
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
  type BreedGroupItem,
} from './constants'

export default function ProtocolBuilder() {
  const navigate = useNavigate()
  const calendarVisible = usePublicCalendarVisible('competitions')
  const state = useProtocolBuilderState()

  return (
    <>
      <SEO
        title="Конструктор протокола соревнований — Курсинг и рейсинг РКФ | Курсинг Статс"
        description="Онлайн-конструктор протоколов по курсингу и бегам борзых (рейсингу): ввод оценок по 5 критериям М/Р/В/П/Э, попоны, дисквалификации, автосохранение и экспорт в PDF, Excel и JSON."
        canonicalUrl="https://coursing-stats.ru/protocol-builder/"
      />

      <MobileSubNavTabs
        tabs={[
          { id: 'ranking', label: 'Рейтинг' },
          ...(calendarVisible ? [{ id: 'archive', label: 'Архив' }] : []),
          { id: 'judges', label: 'Судьи' },
          { id: 'builder', label: 'Конструктор' },
        ]}
        activeTab="builder"
        onChange={(tabId) => {
          if (tabId === 'ranking') navigate('/competitions/ranking/2026/')
          else if (tabId === 'archive') navigate('/competitions/archive/2026/')
          else if (tabId === 'judges') navigate('/competitions/judges/2026/')
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
          importError={state.importError}
          setImportError={state.setImportError}
          handleDownloadPDF={state.handleDownloadPDF}
          handlePrint={state.handlePrint}
          onLoadSample={state.loadSampleProtocol}
          onImportJson={state.importFromJsonText}
          onResetConfirmed={state.resetProtocol}
        />

        <div className="space-y-4 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
              Категории соревнований ({state.categories.length})
            </h2>

            <button
              type="button"
              onClick={state.addCategory}
              className="min-h-[44px] sm:min-h-[38px] flex items-center gap-1.5 px-4 bg-camel-600 hover:bg-camel-700 text-white rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Добавить категорию</span>
            </button>
          </div>

          <div className="space-y-4">
            {state.categories.map((category) => (
              <ProtocolCategoryCard
                key={category.id}
                category={category}
                kind={state.kind}
                categoriesCount={state.categories.length}
                duplicateNames={state.duplicateNames}
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

        <ProtocolPrintView
          printableRef={state.printableRef}
          header={state.header}
          kind={state.kind}
          categories={state.categories}
        />

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
