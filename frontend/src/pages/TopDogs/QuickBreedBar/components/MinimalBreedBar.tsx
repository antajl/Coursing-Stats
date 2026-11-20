import { Link } from 'react-router-dom'
import { ChevronDown, X, ArrowUpRight } from 'lucide-react'
import BreedSearchDropdown from '../../../../components/ui/BreedSearchDropdown'
import type { DogsIndexEntry } from '../../../../lib/competingBreeds'
import type { BreedHubInfo } from '../../../../lib/breed-hubs-data'

interface MinimalBreedBarProps {
  normalizedSelected: string
  selectedBreed: string
  onSelectBreed: (breed: string) => void
  breedValues?: string[]
  dogIndex?: DogsIndexEntry[]
  selectedDisplay: string | null
  selectedLabel: string
  selectedFullName: string
  showHubLink?: boolean
  selectedHub?: BreedHubInfo
}

export function MinimalBreedBar({
  normalizedSelected,
  selectedBreed,
  onSelectBreed,
  breedValues,
  dogIndex,
  selectedDisplay,
  selectedLabel,
  selectedFullName,
  showHubLink = true,
  selectedHub,
}: MinimalBreedBarProps) {
  if (normalizedSelected) {
    return (
      <div className="ml-auto shrink-0 flex items-center gap-1.5">
        <span
          className="cs-glass-pill-active inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap"
          title={`Выбрана порода: ${selectedDisplay}`}
        >
          <BreedSearchDropdown
            breeds={breedValues}
            selectedBreed={selectedBreed}
            onSelect={onSelectBreed}
            dogIndex={dogIndex}
            align="right"
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-1 cursor-pointer max-w-[130px] truncate"
                title="Сменить породу"
                aria-label={`Выбрана порода: ${selectedFullName}. Нажмите для смены.`}
              >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 shrink-0" aria-hidden />
              </button>
            }
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelectBreed('')
            }}
            className="rounded-full p-0.5 hover:bg-camel-200/60 text-camel-950 transition-colors shrink-0 cursor-pointer"
            title="Сбросить породу"
            aria-label={`Сбросить фильтр породы ${selectedFullName}`}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </span>
        {showHubLink && selectedHub && (
          <Link
            to={`/breeds/${selectedHub.slug}/`}
            className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-semibold text-camel-900 border border-camel-300/80 bg-camel-50 hover:bg-camel-100 transition-colors whitespace-nowrap cursor-pointer"
            title={`Хаб породы ${selectedHub.nameRu}`}
            aria-label={`Открыть хаб породы ${selectedHub.nameRu}`}
          >
            <span>Хаб</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="ml-auto shrink-0 flex items-center">
      <BreedSearchDropdown
        breeds={breedValues}
        selectedBreed={selectedBreed}
        onSelect={onSelectBreed}
        dogIndex={dogIndex}
        align="right"
        trigger={
          <button
            type="button"
            className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium whitespace-nowrap cursor-pointer"
            title="Выбрать породу из полного списка"
            aria-label="Открыть список пород"
          >
            <span>Породы</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </button>
        }
      />
    </div>
  )
}
