import { Link } from 'react-router-dom'
import { X, ArrowUpRight } from 'lucide-react'
import type { BreedHubInfo } from '../../../../lib/breed-hubs-data'

interface SelectedBreedBarProps {
  onSelectBreed: (breed: string) => void
  selectedLabel: string
  selectedFullName: string
  showHubLink?: boolean
  selectedHub?: BreedHubInfo
}

export function SelectedBreedBar({
  onSelectBreed,
  selectedLabel,
  selectedFullName,
  showHubLink = true,
  selectedHub,
}: SelectedBreedBarProps) {
  return (
    <>
      {/* Кнопка: Все породы (не светится) */}
      <button
        type="button"
        data-all-btn="true"
        onClick={() => onSelectBreed('')}
        className="cs-glass-pill inline-flex h-8 shrink-0 items-center rounded-full px-2.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
        aria-pressed={false}
        title="Показать все породы"
      >
        Все породы
      </button>

      {/* Выбранная порода (светится) */}
      <button
        type="button"
        data-selected-pill="true"
        onClick={() => onSelectBreed('')}
        className="cs-glass-pill-active inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all"
        aria-pressed={true}
        title={`Выбрана порода: ${selectedFullName}. Нажмите, чтобы сбросить.`}
      >
        <span>{selectedLabel}</span>
        <X className="h-3.5 w-3.5 opacity-80 hover:opacity-100 shrink-0" aria-hidden="true" />
      </button>

      {/* Ссылка на хаб выбранной породы */}
      {showHubLink && selectedHub && (
        <div data-hub-link="true" className="shrink-0 flex items-center">
          <Link
            to={`/breeds/${selectedHub.slug}/`}
            className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-camel-900 border border-camel-300/80 bg-camel-50 hover:bg-camel-100 transition-colors whitespace-nowrap cursor-pointer"
            title={`Хаб породы ${selectedHub.nameRu}`}
            aria-label={`Открыть хаб породы ${selectedHub.nameRu}`}
          >
            <span>Хаб породы</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  )
}
