import React, { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import ToolbarSearch from '../../../components/toolbar/ToolbarSearch'
import ModernDropdown from '../../../components/ui/ModernDropdown'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import QuickBreedBar, { type QuickBreedItem } from '../../TopDogs/QuickBreedBar'
import DogSexIcon from '../../../components/DogSexIcon'
import { toolbarPillTriggerClass } from '../../../lib/toolbar'
import { formatBreedName } from '../../../lib/breedMapping'
import type { LeagueFilter } from './ChampionshipLinksCard'

interface ChampionshipToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedSex: string
  onSexChange: (sex: string) => void
  selectedBreed: string
  onBreedChange: (breed: string) => void
  selectedLeague: LeagueFilter
  onLeagueChange: (league: LeagueFilter) => void
  dynamicLeagueCounts: Record<string, number>
  candidateBreeds: QuickBreedItem[]
  breedValues: string[]
  dogIndex: { breed: string; competition_count: number }[]
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export default function ChampionshipToolbar({
  searchQuery,
  onSearchChange,
  selectedSex,
  onSexChange,
  selectedBreed,
  onBreedChange,
  selectedLeague,
  onLeagueChange,
  dynamicLeagueCounts,
  candidateBreeds,
  breedValues,
  dogIndex,
  hasActiveFilters,
  onResetFilters,
}: ChampionshipToolbarProps) {
  const [sexDropdownOpen, setSexDropdownOpen] = useState(false)
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false)

  const leagueOrder: LeagueFilter[] = ['Чемпионов', 'Абсолют', 'Прогресс', 'Юниоры']
  const sortedLeagues = [...leagueOrder].sort(
    (a, b) => (dynamicLeagueCounts[b] || 0) - (dynamicLeagueCounts[a] || 0)
  )

  const leagueOptions: { label: string; value: LeagueFilter; count: number }[] = [
    { label: `Все лиги (${dynamicLeagueCounts.all ?? 0})`, value: 'all', count: dynamicLeagueCounts.all ?? 0 },
    ...sortedLeagues.map((league) => ({
      label: `${league} (${dynamicLeagueCounts[league] || 0})`,
      value: league,
      count: dynamicLeagueCounts[league] || 0,
    })),
  ]

  const sexDropdownContent = (
    <div className="p-1 min-w-[125px]" role="menu">
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSexChange('')
          setSexDropdownOpen(false)
        }}
        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
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
          onSexChange('m')
          setSexDropdownOpen(false)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
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
          onSexChange('f')
          setSexDropdownOpen(false)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
          selectedSex === 'f'
            ? 'bg-camel-100 text-camel-950 font-semibold'
            : 'text-charcoal-700 hover:bg-camel-100'
        }`}
      >
        <DogSexIcon sex="f" size={14} className={selectedSex === 'f' ? 'text-charcoal-900' : 'text-slate-500'} />
        <span>Суки</span>
      </button>
    </div>
  )

  const leagueDropdownContent = (
    <div className="p-1 space-y-0.5 min-w-[170px]">
      {leagueOptions.map((opt) => {
        const isSelected = selectedLeague === opt.value
        const isEmpty = opt.count === 0 && opt.value !== 'all'

        return (
          <button
            key={opt.value}
            type="button"
            disabled={isEmpty}
            onClick={() => {
              onLeagueChange(opt.value)
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
            <span>{opt.label}</span>
            {isSelected && (
              <span className="w-1.5 h-1.5 rounded-full bg-camel-600" />
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <>
      {/* 1. Мобильная консоль: Поиск + Пол + Порода + Лига + Сброс (строго 1 компактный ряд) */}
      <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Поиск по кличке..."
        />

        {/* Выбор пола */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedSex))}`}
                title="Фильтр по полу"
              >
                {selectedSex === 'm' && <DogSexIcon sex="m" size={12} variant="neutral" className="shrink-0 text-current" />}
                {selectedSex === 'f' && <DogSexIcon sex="f" size={12} variant="neutral" className="shrink-0 text-current" />}
                <span>{!selectedSex ? 'Пол' : selectedSex === 'm' ? 'Кобели' : 'Суки'}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
            isOpen={sexDropdownOpen}
            onOpenChange={setSexDropdownOpen}
            width="130px"
          >
            {sexDropdownContent}
          </ModernDropdown>
        </div>

        {/* Выбор лиги */}
        <div className="shrink-0">
          <ModernDropdown
            isOpen={leagueDropdownOpen}
            onOpenChange={setLeagueDropdownOpen}
            width="180px"
            portal
            closeOnScroll
            trigger={
              <button
                type="button"
                onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
                className={`shrink-0 ${toolbarPillTriggerClass(selectedLeague !== 'all')}`}
                title="Фильтр по лигам"
              >
                <span>{selectedLeague === 'all' ? 'Все лиги' : `Лига «${selectedLeague}»`}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
            }
          >
            {leagueDropdownContent}
          </ModernDropdown>
        </div>

        {/* Выбор породы */}
        <div className="shrink-0">
          <BreedSearchDropdown
            breeds={breedValues}
            selectedBreed={selectedBreed}
            onSelect={onBreedChange}
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

        {/* Сброс */}
        {hasActiveFilters && (
          <div className="ml-auto shrink-0">
            <button
              type="button"
              onClick={onResetFilters}
              className="cs-glass-pill inline-flex h-8 w-8 items-center justify-center rounded-full text-charcoal-600 hover:text-charcoal-900 shrink-0 cursor-pointer"
              title="Сбросить все фильтры"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Десктопная консоль: Поиск + Пол + Разделитель + QuickBreedBar + Лига + Сброс */}
      <div className="hidden sm:flex sm:items-center gap-2 w-full min-w-0">
        <ToolbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Поиск по кличке..."
        />

        {/* Выбор пола */}
        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={`shrink-0 ${toolbarPillTriggerClass(Boolean(selectedSex))}`}
                title="Фильтр по полу"
              >
                {selectedSex === 'm' && <DogSexIcon sex="m" size={12} variant="neutral" className="shrink-0 text-current" />}
                {selectedSex === 'f' && <DogSexIcon sex="f" size={12} variant="neutral" className="shrink-0 text-current" />}
                <span>{!selectedSex ? 'Пол' : selectedSex === 'm' ? 'Кобели' : 'Суки'}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
            isOpen={sexDropdownOpen}
            onOpenChange={setSexDropdownOpen}
            width="130px"
          >
            {sexDropdownContent}
          </ModernDropdown>
        </div>

        {/* League Dropdown */}
        <div className="shrink-0">
          <ModernDropdown
            isOpen={leagueDropdownOpen}
            onOpenChange={setLeagueDropdownOpen}
            width="180px"
            portal
            closeOnScroll
            trigger={
              <button
                type="button"
                onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
                className={`shrink-0 ${toolbarPillTriggerClass(selectedLeague !== 'all')}`}
                title="Фильтр по лигам"
              >
                <span>{selectedLeague === 'all' ? 'Все лиги' : `Лига «${selectedLeague}»`}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
            }
          >
            {leagueDropdownContent}
          </ModernDropdown>
        </div>

        {/* Reset button — слева перед разделителем */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="cs-glass-pill inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors shrink-0 cursor-pointer select-none"
            title="Сбросить все фильтры"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

        {/* QuickBreedBar with breed pills and overflow dropdown — всегда самая правая часть панели */}
        <div className="flex-1 min-w-0">
          <QuickBreedBar
            selectedBreed={selectedBreed}
            onSelectBreed={onBreedChange}
            breedValues={breedValues}
            candidateBreeds={candidateBreeds}
            dogIndex={dogIndex}
            strictFilterByBreedValues={true}
          />
        </div>
      </div>
    </>
  )
}
