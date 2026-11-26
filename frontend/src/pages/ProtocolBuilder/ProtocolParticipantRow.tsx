import React from 'react'
import { AlertTriangle, ChevronDown, Trash2 } from 'lucide-react'
import type {
  ActiveAwardsMenuState,
  ActiveDogSexMenuState,
  ActiveRunMenuState,
  ActiveSearchDogState,
  CategoryGroup,
  CompetitionKind,
  CoursingScores,
  DogParticipant,
  RunStatus,
} from './types'
import { getDogOverallStatus, normalizeDogNameKey } from './types'
import { CoursingRunBox } from './components/CoursingRunBox'
import { RacingRunInputs } from './components/RacingRunInputs'

interface ProtocolParticipantRowProps {
  dog: DogParticipant
  category: CategoryGroup
  kind: CompetitionKind
  duplicateNames: Set<string>
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

export const ProtocolParticipantRow: React.FC<ProtocolParticipantRowProps> = ({
  dog,
  category,
  kind,
  duplicateNames,
  updateDog,
  removeDogFromCategory,
  updateRunField,
  cycleBlanket,
  updateRunScore,
  setRunStatus,
  updateRunReason,
  activeAwardsMenu,
  setActiveAwardsMenu,
  activeSearchDog,
  setActiveSearchDog,
  setSearchQuery,
  activeRunMenu,
  setActiveRunMenu,
  setActiveDogSexMenu,
}) => {
  const isDogAbsent = (dog.runs || []).slice(0, category.runsCount).some((r) => r?.status === 'absent')
  const isDogActive =
    activeAwardsMenu?.dogId === dog.id ||
    activeSearchDog?.dogId === dog.id ||
    activeRunMenu?.dogId === dog.id
  const normalizedName = normalizeDogNameKey(dog.dogName)
  const isDuplicate = Boolean(normalizedName && duplicateNames.has(normalizedName))
  const overall = getDogOverallStatus(dog, category.runsCount)

  const openSearchPortal = (el: HTMLInputElement, val: string) => {
    setSearchQuery(val)
    const rect = el.getBoundingClientRect()
    setActiveSearchDog({
      catId: category.id,
      dogId: dog.id,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width },
    })
  }

  return (
    <div
      className={`bg-om-50/75 hover:bg-cream-50 rounded-xl border border-om-200 p-3 xl:p-2 transition-colors shadow-2xs ${
        isDogActive ? 'relative z-30' : 'relative z-0'
      }`}
    >
      <div className="flex flex-col xl:flex-row xl:items-center gap-2.5 xl:gap-2 text-xs">
        {/* Строка 1: № по каталогу + Кличка (автоподбор) + Пол + (удаление на < xl) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 min-w-0">
          <input
            type="text"
            value={dog.catalogNumber}
            onChange={(e) => updateDog(category.id, dog.id, { catalogNumber: e.target.value })}
            className="w-12 xl:w-10 min-h-[44px] xl:min-h-[36px] px-1 text-center font-bold bg-white rounded-lg border border-om-300/90 text-xs text-charcoal-900 shrink-0 tabular-nums focus:outline-none focus:ring-2 focus:ring-camel-500/40"
            placeholder="№"
            aria-label="Номер по каталогу"
            title="Номер по каталогу"
          />

          <div className="relative flex-1 min-w-[160px] xl:w-52 xl:flex-none">
            <input
              type="text"
              value={dog.dogName}
              onChange={(e) => {
                updateDog(category.id, dog.id, { dogName: e.target.value })
                openSearchPortal(e.currentTarget, e.target.value)
              }}
              onFocus={(e) => openSearchPortal(e.currentTarget, dog.dogName)}
              className={`w-full min-h-[44px] xl:min-h-[36px] px-2.5 bg-white rounded-lg border text-xs font-semibold text-charcoal-900 placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-camel-500/40 ${
                isDuplicate ? 'border-terracotta-400 pr-16' : 'border-om-300/90'
              }`}
              placeholder="Кличка собаки"
              aria-label="Кличка собаки"
            />
            {isDuplicate && (
              <span
                className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-terracotta-100 text-terracotta-800 text-[10px] font-semibold pointer-events-none"
                title="Похожая кличка уже добавлена в этом протоколе"
              >
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                <span>Дубль</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setActiveDogSexMenu({
                catId: category.id,
                dogId: dog.id,
                rect: {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: rect.left,
                  right: rect.right,
                  width: rect.width,
                },
              })
            }}
            className="min-h-[44px] xl:min-h-[36px] w-24 xl:w-[88px] px-2.5 bg-white hover:bg-cream-100 rounded-lg border border-om-300/90 text-xs text-charcoal-800 shrink-0 font-semibold flex items-center justify-between transition-colors cursor-pointer"
            title="Пол собаки"
          >
            <span className="truncate">{dog.sex === 'male' ? 'Кобель' : 'Сука'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => removeDogFromCategory(category.id, dog.id)}
            disabled={category.dogs.length <= 1}
            className="xl:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal-500 hover:text-terracotta-700 hover:bg-terracotta-50 rounded-lg border border-transparent hover:border-terracotta-200 transition-colors disabled:opacity-25 shrink-0 cursor-pointer"
            aria-label="Удалить собаку"
            title="Удалить собаку"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Блок забегов (курсинг) или заездов (рейсинг) */}
        {kind === 'coursing' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 xl:flex xl:items-center xl:gap-1.5 min-w-0">
            {Array.from({ length: category.runsCount }).map((_, rIdx) => {
              if (isDogAbsent && rIdx > 0) return null
              const prevWithdrawn = (dog.runs || []).slice(0, rIdx).some((pr) => pr?.status === 'withdrawn')
              if (prevWithdrawn) return null

              return (
                <CoursingRunBox
                  key={rIdx}
                  catId={category.id}
                  dog={dog}
                  rIdx={rIdx}
                  runsCount={category.runsCount}
                  activeRunMenu={activeRunMenu}
                  setActiveRunMenu={setActiveRunMenu}
                  updateRunField={updateRunField}
                  cycleBlanket={cycleBlanket}
                  updateRunScore={updateRunScore}
                  setRunStatus={setRunStatus}
                  updateRunReason={updateRunReason}
                />
              )
            })}
          </div>
        ) : (
          <RacingRunInputs catId={category.id} dog={dog} updateDog={updateDog} />
        )}

        {/* Итог, Титулы и Удаление (десктоп) */}
        <div className="flex items-center justify-between xl:justify-end gap-2 pt-2 border-t border-om-200/70 xl:pt-0 xl:border-0 xl:ml-auto shrink-0">
          <div
            className={`min-h-[44px] xl:min-h-[36px] flex items-center justify-center border px-3 xl:px-2 rounded-lg text-center min-w-[76px] xl:w-[74px] shrink-0 ${
              overall.type === 'withdrawn' || overall.type === 'disqualified'
                ? 'bg-terracotta-50 border-terracotta-200 text-terracotta-800'
                : overall.type === 'absent'
                ? 'bg-om-100 border-om-200 text-charcoal-600'
                : 'bg-camel-100 border-camel-300 text-charcoal-900'
            }`}
            title={overall.reason ? `Статус: ${overall.label} (${overall.reason})` : 'Итоговая сумма баллов'}
          >
            <span className={`text-xs tabular-nums ${overall.type === 'normal' ? 'font-bold' : 'font-semibold'}`}>
              {overall.label}
            </span>
          </div>

          {!isDogAbsent ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (activeAwardsMenu && activeAwardsMenu.dogId === dog.id) {
                  setActiveAwardsMenu(null)
                } else {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setActiveAwardsMenu({
                    catId: category.id,
                    dogId: dog.id,
                    rect: {
                      top: rect.top,
                      bottom: rect.bottom,
                      left: rect.left,
                      right: rect.right,
                      width: rect.width,
                    },
                  })
                }
              }}
              className={`min-h-[44px] xl:min-h-[36px] flex-1 xl:flex-none xl:w-28 flex items-center justify-between gap-1.5 px-3 xl:px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                (dog.awards || []).length > 0
                  ? 'bg-camel-600 text-white border-camel-700 shadow-2xs'
                  : 'bg-white text-charcoal-700 border-om-300/90 hover:border-camel-400'
              }`}
              title={(dog.awards || []).length > 0 ? `Титулы: ${(dog.awards || []).join(', ')}` : 'Назначить титулы и сертификаты'}
            >
              <span className="truncate flex-1 text-left">
                {(dog.awards || []).length > 0 ? (dog.awards || []).join(', ') : 'Титулы'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80 shrink-0" />
            </button>
          ) : (
            <div className="xl:w-28 shrink-0" />
          )}

          <button
            type="button"
            onClick={() => removeDogFromCategory(category.id, dog.id)}
            disabled={category.dogs.length <= 1}
            className="hidden xl:flex w-9 h-9 items-center justify-center text-charcoal-500 hover:text-terracotta-700 hover:bg-terracotta-50 transition-colors rounded-lg disabled:opacity-25 shrink-0 cursor-pointer"
            aria-label="Удалить собаку"
            title="Удалить собаку"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
