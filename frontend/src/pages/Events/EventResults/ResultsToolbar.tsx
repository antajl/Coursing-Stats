import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import QuickBreedBar, { type QuickBreedItem } from '../../TopDogs/QuickBreedBar'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import { formatBreedName } from '../../../lib/breedMapping'
import type { DogsIndexEntry } from '../../../lib/competingBreeds'
import DogSexIcon from '../../../components/DogSexIcon'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'

export interface ResultsToolbarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedSex: string
  setSelectedSex: (s: string) => void
  breeds: string[]
  candidateBreeds: QuickBreedItem[]
  dogIndex: DogsIndexEntry[]
  selectedBreed: string
  setSelectedBreed: (b: string) => void
  availableLeagues: string[]
  selectedLeague: string
  setSelectedLeague: (l: string) => void
  leagueCounts: Record<string, number>
  activeResultsCount: number
  isFiltered: boolean
  handleResetFilters: () => void
  trailing?: React.ReactNode
}

export function ResultsToolbar({
  searchQuery,
  setSearchQuery,
  selectedSex,
  setSelectedSex,
  breeds,
  candidateBreeds,
  dogIndex,
  selectedBreed,
  setSelectedBreed,
  availableLeagues,
  selectedLeague,
  setSelectedLeague,
  leagueCounts,
  activeResultsCount,
  isFiltered,
  handleResetFilters,
  trailing,
}: ResultsToolbarProps) {
  const [sexDropdownOpen, setSexDropdownOpen] = useState(false)
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false)

  const isSexActive = Boolean(selectedSex)
  const sexTriggerLabel = selectedSex === 'm' ? 'Кобели' : selectedSex === 'f' ? 'Суки' : 'Пол'

  const sexTrigger = (
    <button
      type="button"
      className={`shrink-0 ${toolbarPillTriggerClass(isSexActive)}`}
    >
      {selectedSex === 'm' && <DogSexIcon sex="m" size={12} variant="neutral" className="shrink-0 text-current" />}
      {selectedSex === 'f' && <DogSexIcon sex="f" size={12} variant="neutral" className="shrink-0 text-current" />}
      <span>{sexTriggerLabel}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </button>
  )

  const renderSexMenu = (setOpen: (v: boolean) => void) => (
    <div className="p-1 min-w-[125px]" role="menu">
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setSelectedSex('')
          setOpen(false)
        }}
        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
          !selectedSex
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        Все
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setSelectedSex('m')
          setOpen(false)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
          selectedSex === 'm'
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        <DogSexIcon sex="m" size={14} className={selectedSex === 'm' ? 'text-charcoal-900' : 'text-slate-500'} />
        <span>Кобели</span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setSelectedSex('f')
          setOpen(false)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
          selectedSex === 'f'
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        <DogSexIcon sex="f" size={14} className={selectedSex === 'f' ? 'text-charcoal-900' : 'text-rose-500'} />
        <span>Суки</span>
      </button>
    </div>
  )

  const renderLeagueDropdown = () => (
    <ModernDropdown
      isOpen={leagueDropdownOpen}
      onOpenChange={setLeagueDropdownOpen}
      width="180px"
      trigger={
        <button
          type="button"
          className={`shrink-0 ${toolbarPillTriggerClass(selectedLeague !== 'all')}`}
          title="Фильтр по лигам"
        >
          <span>{selectedLeague === 'all' ? 'Все лиги' : `Лига «${selectedLeague}»`}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      }
    >
      <div className="p-1 space-y-0.5 min-w-[170px]" role="menu">
        <button
          type="button"
          onClick={() => {
            setSelectedLeague('all')
            setLeagueDropdownOpen(false)
          }}
          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center justify-between ${
            selectedLeague === 'all'
              ? 'bg-camel-100 text-camel-950 font-semibold'
              : 'text-charcoal-700 hover:bg-cream-100'
          }`}
        >
          <span>Все лиги ({leagueCounts.all ?? activeResultsCount})</span>
          {selectedLeague === 'all' && (
            <span className="w-1.5 h-1.5 rounded-full bg-camel-600" />
          )}
        </button>
        {availableLeagues.map((league) => {
          const count = leagueCounts[league] ?? 0
          const isSelected = selectedLeague === league
          const isEmpty = count === 0
          return (
            <button
              key={league}
              type="button"
              disabled={isEmpty}
              onClick={() => {
                setSelectedLeague(league)
                setLeagueDropdownOpen(false)
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'border border-camel-400 bg-camel-100 text-camel-950 font-semibold shadow-2xs'
                  : isEmpty
                  ? 'opacity-40 cursor-not-allowed text-charcoal-400'
                  : 'text-charcoal-700 hover:bg-cream-100'
              }`}
            >
              <span>{league} ({count})</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-camel-600" />
              )}
            </button>
          )
        })}
      </div>
    </ModernDropdown>
  )

  return (
    <>
      {/* 1. Мобильная консоль: Поиск + Пол + Порода + Лига + Сброс + Trailing */}
      <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Кличка собаки…"
        />

        {/* Выбор пола */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={sexTrigger}
            isOpen={sexDropdownOpen}
            onOpenChange={setSexDropdownOpen}
            width="130px"
          >
            {renderSexMenu(setSexDropdownOpen)}
          </ModernDropdown>
        </div>

        {/* Выбор лиги (уникальный фильтр турнира) */}
        {availableLeagues.length > 0 && (
          <div className="shrink-0">
            {renderLeagueDropdown()}
          </div>
        )}

        {/* Выбор породы */}
        {breeds.length > 1 && (
          <div className="shrink-0">
            <BreedSearchDropdown
              breeds={breeds}
              selectedBreed={selectedBreed}
              onSelect={setSelectedBreed}
              trigger={
                <button
                  type="button"
                  className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedBreed))}`}
                >
                  <span className="truncate max-w-[85px]">
                    {selectedBreed ? formatBreedName(selectedBreed) : 'Порода'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </button>
              }
              dogIndex={dogIndex}
            />
          </div>
        )}

        <div className="ml-auto shrink-0 flex items-center gap-1.5">
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="cs-glass-pill relative shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 before:absolute before:-inset-1.5 before:content-[''] cursor-pointer select-none"
              title="Сбросить фильтры"
              aria-label="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {trailing && <div className="shrink-0 flex items-center gap-1.5">{trailing}</div>}
        </div>
      </div>

      {/* 2. Десктопная консоль: Поиск + Пол + Лиги + Разделитель + QuickBreedBar + Сброс + Trailing */}
      <div className="hidden sm:flex sm:items-center gap-2 w-full min-w-0">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Кличка собаки…"
        />

        {/* Выбор пола */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={sexTrigger}
            isOpen={sexDropdownOpen}
            onOpenChange={setSexDropdownOpen}
            width="130px"
          >
            {renderSexMenu(setSexDropdownOpen)}
          </ModernDropdown>
        </div>

        {/* Выбор лиги (уникальный фильтр турнира) */}
        {availableLeagues.length > 0 && (
          <div className="shrink-0">
            {renderLeagueDropdown()}
          </div>
        )}

        {/* Trailing action (например, переключатель вида) — слева перед разделителем */}
        {trailing && (
          <div className="flex items-center gap-2 shrink-0">
            {trailing}
          </div>
        )}

        {/* Сброс фильтров — слева перед разделителем */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
            title="Сбросить фильтры"
            aria-label="Сбросить фильтры"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {breeds.length > 1 && (
          <>
            <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />
            {/* Породы — всегда самая правая часть панели */}
            <div className="flex-1 min-w-0">
              <QuickBreedBar
                selectedBreed={selectedBreed}
                onSelectBreed={(b) => setSelectedBreed(b)}
                breedValues={breeds}
                candidateBreeds={candidateBreeds}
                dogIndex={dogIndex}
                strictFilterByBreedValues={true}
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}
