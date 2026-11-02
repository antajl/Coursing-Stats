import React from 'react'
import { Icons } from '../../../lib/icons'
import { POPULAR_BREEDS, QUICK_NAV_SHORTCUTS } from '../quickSearchData'

interface QuickSearchEmptyStateProps {
  query: string
  hasNoResults: boolean
  onSelectShortcut: (to: string) => void
  onSelectBreed: (breed: string) => void
}

export const QuickSearchEmptyState: React.FC<QuickSearchEmptyStateProps> = ({
  query,
  hasNoResults,
  onSelectShortcut,
  onSelectBreed,
}) => {
  if (hasNoResults) {
    return (
      <div className="py-8 px-4 text-center">
        <p className="text-sm font-medium text-charcoal-700 mb-1">
          Ничего не найдено по запросу «{query}»
        </p>
        <p className="text-xs text-charcoal-400">
          Попробуйте ввести кличку собаки, название раздела (например «судьи», «донино», «календарь») или породу
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-5">
      {/* Quick Navigation Shortcuts */}
      <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2.5">
        Быстрый переход по сайту
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {QUICK_NAV_SHORTCUTS.map((item) => {
          const ItemIcon = Icons[item.icon]
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => onSelectShortcut(item.to)}
              className="px-2.5 py-2 text-left rounded-xl border border-old-money-200 bg-white hover:bg-old-money-50 hover:border-camel-300 text-charcoal-800 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <ItemIcon className="w-4 h-4 text-camel-700 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold truncate">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Popular Breeds */}
      <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
        Популярные породы
      </p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
        {POPULAR_BREEDS.map((breed) => (
          <button
            key={breed}
            type="button"
            onClick={() => onSelectBreed(breed)}
            className="px-2.5 py-1 text-xs rounded-lg border border-old-money-200 bg-white hover:bg-old-money-50 hover:border-camel-300 text-charcoal-700 transition-colors cursor-pointer"
          >
            {breed}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-charcoal-400 leading-relaxed border-t border-old-money-100 pt-3">
        Введите кличку собаки, породу, турнир или раздел сайта (например: «судьи», «календарь», «правила», «донино», «протокол», «рпб»).
      </p>
    </div>
  )
}
