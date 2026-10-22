import { useMemo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { canonicalBreed, displayBreed, matchesBreedFilter } from '../../lib/breedMapping'
import type { DogsIndexEntry } from '../../lib/competingBreeds'

export interface QuickBreedItem {
  key: string
  label: string
  fullName: string
}

export const TOP_QUICK_BREEDS: QuickBreedItem[] = [
  { key: 'УИППЕТ', label: 'Уиппет', fullName: 'Уиппет' },
  { key: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', label: 'РПБ', fullName: 'Русская псовая борзая' },
  { key: 'БАСЕНДЖИ', label: 'Басенджи', fullName: 'Басенджи' },
  { key: 'РОДЕЗИЙСКИЙ РИДЖБЕК', label: 'Риджбек', fullName: 'Родезийский риджбек' },
  { key: 'САЛЮКИ', label: 'Салюки', fullName: 'Салюки' },
  { key: 'ЧИРНЕКО ДЕЛЬ ЭТНА', label: 'Чирнеко', fullName: 'Чирнеко дель Этна' },
  { key: 'ФАРАОНОВА СОБАКА', label: 'Фараон', fullName: 'Фараонова собака' },
  { key: 'ГРЕЙХАУНД', label: 'Грейхаунд', fullName: 'Грейхаунд' },
]

interface QuickBreedBarProps {
  selectedBreed: string
  onSelectBreed: (breed: string) => void
  breedValues: string[]
  dogIndex?: DogsIndexEntry[]
  className?: string
}

export default function QuickBreedBar({
  selectedBreed,
  onSelectBreed,
  breedValues,
  dogIndex,
  className = '',
}: QuickBreedBarProps) {
  const normalizedSelected = useMemo(
    () => (selectedBreed ? canonicalBreed(selectedBreed) : ''),
    [selectedBreed],
  )

  const isTopBreedSelected = useMemo(() => {
    if (!normalizedSelected) return false
    return TOP_QUICK_BREEDS.some((b) => matchesBreedFilter(normalizedSelected, b.key))
  }, [normalizedSelected])

  const rareBreedLabel = useMemo(() => {
    if (!normalizedSelected || isTopBreedSelected) return null
    const disp = displayBreed(normalizedSelected)
    return disp.primary || selectedBreed
  }, [normalizedSelected, isTopBreedSelected, selectedBreed])

  const handlePillClick = (breedKey: string) => {
    if (matchesBreedFilter(normalizedSelected, breedKey)) {
      onSelectBreed('')
    } else {
      onSelectBreed(breedKey)
    }
  }

  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full ${className}`.trim()}
      role="toolbar"
      aria-label="Быстрый выбор породы"
    >
      {/* Кнопка: Все породы */}
      <button
        type="button"
        onClick={() => onSelectBreed('')}
        className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-all cursor-pointer ${
          !normalizedSelected
            ? 'bg-camel-500 text-charcoal-900 border border-camel-600 shadow-xs'
            : 'border border-old-money-200/80 bg-cream-50 text-charcoal-700 hover:bg-old-money-50 hover:text-charcoal-900'
        }`}
        aria-pressed={!normalizedSelected}
      >
        Все породы
      </button>

      {/* Топ-породы */}
      {TOP_QUICK_BREEDS.map((breed) => {
        const isActive = matchesBreedFilter(normalizedSelected, breed.key)
        return (
          <button
            key={breed.key}
            type="button"
            onClick={() => handlePillClick(breed.key)}
            title={breed.fullName}
            className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-camel-500 text-charcoal-900 border border-camel-600 shadow-xs'
                : 'border border-old-money-200/80 bg-cream-50 text-charcoal-700 hover:bg-old-money-50 hover:text-charcoal-900'
            }`}
            aria-pressed={isActive}
            aria-label={`Фильтр по породе ${breed.fullName}`}
          >
            {breed.label}
          </button>
        )
      })}

      {/* Динамический чип для редкой породы с кнопкой сброса ✕ */}
      {rareBreedLabel && (
        <span
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-camel-600 bg-camel-500 px-3 text-xs font-semibold text-charcoal-900 shadow-xs whitespace-nowrap"
          title={`Выбрана порода: ${rareBreedLabel}`}
        >
          <span>{rareBreedLabel}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelectBreed('')
            }}
            className="rounded-full p-0.5 hover:bg-camel-600/30 text-charcoal-900 transition-colors"
            title="Сбросить породу"
            aria-label={`Сбросить фильтр породы ${rareBreedLabel}`}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </span>
      )}

      {/* Выпадающий поиск по всем породам */}
      <BreedSearchDropdown
        breeds={breedValues}
        selectedBreed={selectedBreed}
        onSelect={onSelectBreed}
        dogIndex={dogIndex}
        trigger={
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-old-money-200/80 bg-cream-50 px-3 text-xs font-semibold text-charcoal-700 hover:bg-old-money-50 hover:text-charcoal-900 transition-colors whitespace-nowrap cursor-pointer"
            title="Выбрать другую породу из полного списка"
            aria-label="Открыть полный список пород"
          >
            <span>Ещё породы</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </button>
        }
      />
    </div>
  )
}
