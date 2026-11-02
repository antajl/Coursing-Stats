import React from 'react'
import { Icons } from '../../../lib/icons'
import { displayBreed } from '../../../lib/breedMapping'
import { parseDogName } from '../../../lib/dogName'
import DogSexIcon from '../../DogSexIcon'
import type {
  BreedHubSearchItem,
  CalendarSearchEvent,
  HomeSearchDog,
  NavigationRouteItem,
  SearchItem,
} from '../quickSearchTypes'

interface QuickSearchResultsProps {
  navItems: Array<{ type: 'nav'; item: NavigationRouteItem; score: number }>
  breedItems: Array<{ type: 'breed'; item: BreedHubSearchItem; score: number }>
  dogItems: Array<{ type: 'dog'; dog: HomeSearchDog; score: number }>
  eventItems: Array<{ type: 'event'; event: CalendarSearchEvent; score: number }>
  allItems: SearchItem[]
  selectedIndex: number
  onSelectItem: (item: SearchItem) => void
  onHoverIndex: (index: number) => void
}

export const QuickSearchResults: React.FC<QuickSearchResultsProps> = ({
  navItems,
  breedItems,
  dogItems,
  eventItems,
  allItems,
  selectedIndex,
  onSelectItem,
  onHoverIndex,
}) => {
  return (
    <>
      {/* Navigation Sections */}
      {navItems.length > 0 && (
        <div className="py-1">
          <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
            <span>Разделы сайта</span>
            <span className="text-[10px] text-charcoal-400 font-normal">Навигация</span>
          </div>
          {navItems.map((item) => {
            const idx = allItems.indexOf(item)
            const isSelected = idx === selectedIndex
            const NavIcon = Icons[item.item.icon] || Icons.flag

            return (
              <button
                key={`nav-${item.item.id}`}
                type="button"
                onClick={() => onSelectItem(item)}
                onMouseEnter={() => onHoverIndex(idx)}
                className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-camel-100/75 border-l-2 border-camel-600'
                    : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-old-money-100 border border-old-money-200 flex items-center justify-center shrink-0 text-camel-800">
                    <NavIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-charcoal-900 truncate">
                        {item.item.title}
                      </span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Раздел
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                      {item.item.subtitle}
                    </p>
                  </div>
                </div>
                <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
              </button>
            )
          })}
        </div>
      )}

      {/* Breed Hubs */}
      {breedItems.length > 0 && (
        <div className="py-1">
          <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
            <span>Породы</span>
            <span className="text-[10px] text-charcoal-400 font-normal">Породный хаб</span>
          </div>
          {breedItems.map((item) => {
            const idx = allItems.indexOf(item)
            const isSelected = idx === selectedIndex

            return (
              <button
                key={`breed-${item.item.slug}`}
                type="button"
                onClick={() => onSelectItem(item)}
                onMouseEnter={() => onHoverIndex(idx)}
                className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-camel-100/75 border-l-2 border-camel-600'
                    : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
                    <Icons.paw className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-charcoal-900 truncate">
                        {item.item.nameRu} ({item.item.nameLat})
                      </span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        Хаб
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                      {item.item.subtitle}
                    </p>
                  </div>
                </div>
                <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
              </button>
            )
          })}
        </div>
      )}

      {/* Dogs Section */}
      {dogItems.length > 0 && (
        <div className="py-1">
          <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
            <span>Собаки ({dogItems.length})</span>
            <span className="text-[10px] text-charcoal-400 font-normal">База собак</span>
          </div>
          {dogItems.map((item) => {
            const idx = allItems.indexOf(item)
            const isSelected = idx === selectedIndex
            const { primary, secondary } = parseDogName(item.dog.name_lat, item.dog.name_ru)
            const display = item.dog.breed ? displayBreed(item.dog.breed) : null

            return (
              <button
                key={`dog-${item.dog.id}`}
                type="button"
                onClick={() => onSelectItem(item)}
                onMouseEnter={() => onHoverIndex(idx)}
                className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-camel-100/75 border-l-2 border-camel-600'
                    : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-charcoal-900 truncate">
                      {primary}
                    </span>
                    {secondary && (
                      <span className="text-xs text-charcoal-500 truncate hidden sm:inline">
                        / {secondary}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-charcoal-500 mt-0.5">
                    <span className="font-medium text-charcoal-700 truncate">
                      {display?.primary || item.dog.breed}
                    </span>
                    {item.dog.sex && (
                      <>
                        <span className="text-charcoal-300">·</span>
                        <DogSexIcon sex={item.dog.sex} size={11} variant="neutral" />
                      </>
                    )}
                    {item.dog.competition_count ? (
                      <>
                        <span className="text-charcoal-300">·</span>
                        <span>{item.dog.competition_count} заб.</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
              </button>
            )
          })}
        </div>
      )}

      {/* Events Section */}
      {eventItems.length > 0 && (
        <div className="py-1">
          <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
            <span>Соревнования ({eventItems.length})</span>
            <span className="text-[10px] text-charcoal-400 font-normal">Турниры</span>
          </div>
          {eventItems.map((item) => {
            const idx = allItems.indexOf(item)
            const isSelected = idx === selectedIndex

            return (
              <button
                key={`event-${item.event.id}`}
                type="button"
                onClick={() => onSelectItem(item)}
                onMouseEnter={() => onHoverIndex(idx)}
                className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-camel-100/75 border-l-2 border-camel-600'
                    : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-charcoal-900 truncate">
                    {item.event.title}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-charcoal-500 mt-0.5 truncate">
                    <span>{item.event.date_start}</span>
                    {item.event.rank_code && (
                      <>
                        <span className="text-charcoal-300">·</span>
                        <span className="font-medium text-camel-800">{item.event.rank_code}</span>
                      </>
                    )}
                    {item.event.location && (
                      <>
                        <span className="text-charcoal-300">·</span>
                        <span className="truncate">{item.event.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
