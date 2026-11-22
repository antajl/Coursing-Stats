import React from 'react'
import { SlidersHorizontal, Eye } from 'lucide-react'
import type { BreedCardDesignVariant } from '../../components/BreedCard/types'

export interface BreedsVariantSwitcherProps {
  currentVariant: BreedCardDesignVariant
  onChangeVariant: (v: BreedCardDesignVariant) => void
  showSummary: boolean
  onToggleSummary: () => void
}

const VARIANTS: Array<{
  id: BreedCardDesignVariant
  title: string
  shortTitle: string
  badge?: string
  description: string
}> = [
  {
    id: 'passport',
    title: 'Вариант 1: Спортивный паспорт',
    shortTitle: '1. Паспорт',
    badge: 'Рекомендуемый',
    description: '3 колонки: FCI + авторский лид породы, бейдж группы, чемпион сезона с кубком, трио ключевых метрик со скоростью.',
  },
  {
    id: 'showcase',
    title: 'Вариант 2: Богатая витрина',
    shortTitle: '2. Витрина',
    description: 'Микро-чипы дисциплин (Курсинг, САС, Моно), золотые победы, чемпион года, развернутая карточка.',
  },
  {
    id: 'editorial',
    title: 'Вариант 3: Журнальный Luxe',
    shortTitle: '3. Журнальный',
    description: 'Выделенный медальон рекорда скорости слева, крупная Vollkorn-типографика, цитата-лид породы.',
  },
  {
    id: 'legacy',
    title: 'Базовый вид (как было)',
    shortTitle: 'Было (базовый)',
    description: 'Прежний минималистичный вид с 4 серыми коробочками справа для мгновенного сравнения «было / стало».',
  },
]

export const BreedsVariantSwitcher: React.FC<BreedsVariantSwitcherProps> = ({
  currentVariant,
  onChangeVariant,
  showSummary,
  onToggleSummary,
}) => {
  const activeDesc = VARIANTS.find((v) => v.id === currentVariant)?.description

  return (
    <div className="rounded-2xl border border-camel-200/90 bg-gradient-to-r from-cream-50 via-white to-cream-50/90 p-3 sm:p-3.5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-old-money-200/60">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-camel-100 text-camel-800">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          </div>
          <span className="text-xs font-serif font-bold text-charcoal-900">
            Интерактивный выбор дизайна каталога
          </span>
          <span className="text-[11px] text-charcoal-500 font-sans hidden sm:inline">
            (выберите вариант для мгновенного просмотра)
          </span>
        </div>

        {/* Переключатель баннера сводки */}
        <button
          type="button"
          onClick={onToggleSummary}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
            showSummary
              ? 'bg-camel-100/90 text-camel-950 border border-camel-300'
              : 'bg-white text-charcoal-600 border border-old-money-200 hover:bg-cream-100'
          }`}
        >
          <Eye className="h-3 w-3 text-camel-700" />
          <span>{showSummary ? 'Скрыть сводку' : 'Показать сводку каталога'}</span>
        </button>
      </div>

      {/* Горизонтальный переключатель вариантов */}
      <div className="flex items-center gap-1.5 sm:gap-2 pt-2.5 overflow-x-auto no-scrollbar">
        {VARIANTS.map((v) => {
          const isActive = currentVariant === v.id
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChangeVariant(v.id)}
              className={`relative inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-charcoal-900 text-white shadow-xs'
                  : 'bg-white text-charcoal-700 border border-old-money-200/80 hover:bg-cream-100 hover:border-camel-300'
              }`}
            >
              <span>{v.title}</span>
              {v.badge && (
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-camel-500 text-charcoal-950'
                      : 'bg-camel-100 text-camel-900 border border-camel-300'
                  }`}
                >
                  {v.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Описание выбранного варианта */}
      {activeDesc && (
        <p className="text-[11.5px] text-charcoal-600 font-medium leading-relaxed mt-2 pt-1.5 border-t border-old-money-100">
          <strong className="text-charcoal-900 font-semibold">Особенности:</strong> {activeDesc}
        </p>
      )}
    </div>
  )
}
export default BreedsVariantSwitcher
