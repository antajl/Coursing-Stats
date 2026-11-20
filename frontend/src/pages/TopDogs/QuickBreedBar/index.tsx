import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import BreedSearchDropdown from '../../../components/ui/BreedSearchDropdown'
import { canonicalBreed, displayBreed, matchesBreedFilter } from '../../../lib/breedMapping'
import { getBreedHubByCanonicalKey, getBreedHubBySlug } from '../../../lib/breed-hubs-data'
import type { QuickBreedItem, QuickBreedBarProps } from './types'
import {
  CANDIDATE_BREEDS,
  SHOW_CANDIDATE_BREEDS,
  TOP_QUICK_BREEDS,
  GAP,
  BUFFER,
} from './constants'
import { useQuickBreedBarWidth } from './hooks/useQuickBreedBarWidth'
import { useFlipBreedAnimation } from './hooks/useFlipBreedAnimation'
import { SelectedBreedBar } from './components/SelectedBreedBar'
import { MinimalBreedBar } from './components/MinimalBreedBar'

export type { QuickBreedItem, QuickBreedBarProps }
export { CANDIDATE_BREEDS, SHOW_CANDIDATE_BREEDS, TOP_QUICK_BREEDS }

export default function QuickBreedBar({
  selectedBreed,
  onSelectBreed,
  breedValues = [],
  dogIndex,
  candidateBreeds,
  className = '',
  strictFilterByBreedValues = false,
  showHubLink = true,
}: QuickBreedBarProps) {
  const candidates = useMemo(() => {
    const base = candidateBreeds ?? CANDIDATE_BREEDS
    if (!breedValues || breedValues.length === 0) return base
    const active = strictFilterByBreedValues
      ? base.filter((b) =>
          breedValues.some((bv) => matchesBreedFilter(canonicalBreed(bv), b.key))
        )
      : base
    const seen = new Set(active.map((b) => b.key))
    const remainingBreeds = [...breedValues]
      .map((bv) => canonicalBreed(bv))
      .filter((cb) => {
        if (!cb || seen.has(cb)) return false
        seen.add(cb)
        return true
      })
    if (dogIndex && dogIndex.length > 0) {
      const counts = new Map<string, number>()
      dogIndex.forEach((d) => {
        const bKey = d.breed || ''
        counts.set(bKey, (counts.get(bKey) || 0) + (d.competition_count || 1))
      })
      remainingBreeds.sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
    }
    const extraCandidates: QuickBreedItem[] = remainingBreeds.map((cb) => {
      const disp = displayBreed(cb)
      const label = disp.primary || cb
      const fullName = disp.full || disp.primary || cb
      return {
        key: cb,
        label,
        fullName,
        estWidth: Math.max(60, Math.min(130, label.length * 8 + 32)),
      }
    })
    const combined = [...active, ...extraCandidates]
    return combined.length > 0 ? combined : base
  }, [candidateBreeds, breedValues, dogIndex, strictFilterByBreedValues])

  const candidateKeys = useMemo(
    () => candidates.map((c) => c.key).join(','),
    [candidates]
  )

  const {
    containerRef,
    allBtnRef,
    moreBtnRef,
    minBtnRef,
    itemRefs,
    containerWidth,
    measured,
  } = useQuickBreedBarWidth({ candidates, candidateKeys })

  const normalizedSelected = useMemo(
    () => (selectedBreed ? canonicalBreed(selectedBreed) : ''),
    [selectedBreed],
  )

  const targetBreed = useMemo(() => {
    if (!normalizedSelected) return null
    return candidates.find((b) => matchesBreedFilter(normalizedSelected, b.key)) || null
  }, [normalizedSelected, candidates])

  const selectedDisplay = useMemo(() => {
    if (!normalizedSelected) return null
    return displayBreed(normalizedSelected).primary || selectedBreed
  }, [normalizedSelected, selectedBreed])

  const selectedLabel = useMemo(() => {
    if (!normalizedSelected) return ''
    if (targetBreed) return targetBreed.label
    const disp = displayBreed(normalizedSelected)
    return disp.primary || selectedBreed
  }, [normalizedSelected, targetBreed, selectedBreed])

  const selectedFullName = useMemo(() => {
    if (!normalizedSelected) return ''
    if (targetBreed) return targetBreed.fullName
    const disp = displayBreed(normalizedSelected)
    return disp.full || disp.primary || selectedBreed
  }, [normalizedSelected, targetBreed, selectedBreed])

  const selectedHub = useMemo(
    () => {
      if (!selectedBreed) return undefined
      return (
        getBreedHubBySlug(selectedBreed) ||
        getBreedHubByCanonicalKey(normalizedSelected || canonicalBreed(selectedBreed))
      )
    },
    [selectedBreed, normalizedSelected]
  )

  const { isMinimal, visibleBreeds } = useMemo(() => {
    const avail = Math.max(0, containerWidth - BUFFER)
    const allW = measured?.allW ?? 88
    const moreW = measured?.moreW ?? 105

    if (normalizedSelected) {
      const selW = targetBreed
        ? (measured?.widths[targetBreed.key] ?? targetBreed.estWidth)
        : Math.max(60, Math.min(130, (selectedLabel.length || 0) * 8 + 36))
      const needed = allW + GAP + selW
      if (avail < needed) {
        return { isMinimal: true, visibleBreeds: [] as QuickBreedItem[] }
      }
      return { isMinimal: false, visibleBreeds: [] as QuickBreedItem[] }
    }

    const normalMinNeeded = allW + GAP + moreW
    if (avail < normalMinNeeded) {
      return { isMinimal: true, visibleBreeds: [] as QuickBreedItem[] }
    }

    let remaining = avail - normalMinNeeded
    const visible: QuickBreedItem[] = []
    for (const breed of candidates) {
      const bW = measured?.widths[breed.key] ?? breed.estWidth
      const cost = GAP + bW
      if (remaining >= cost) {
        visible.push(breed)
        remaining -= cost
      } else {
        break
      }
    }

    return { isMinimal: false, visibleBreeds: visible }
  }, [containerWidth, measured, normalizedSelected, targetBreed, selectedLabel, candidates])

  const { handlePillClick, handleDropdownSelect } = useFlipBreedAnimation({
    containerRef,
    normalizedSelected,
    onSelectBreed,
  })

  return (
    <>
      {/* Скрытый измеритель размеров кнопок (вне потока) */}
      <div
        aria-hidden="true"
        className="pointer-events-none invisible fixed -left-[9999px] -top-[9999px] -z-50 flex items-center gap-[5px] whitespace-nowrap"
      >
        <button
          ref={allBtnRef}
          type="button"
          className="inline-flex h-8 shrink-0 items-center rounded-full border border-transparent px-2.5 text-xs font-semibold"
        >
          Все породы
        </button>
        <button
          ref={moreBtnRef}
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-transparent px-2.5 text-xs font-semibold"
        >
          <span>Ещё породы</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          ref={minBtnRef}
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-transparent px-2.5 text-xs font-semibold"
        >
          <span>Породы</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {candidates.map((breed, i) => (
          <button
            key={breed.key}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            type="button"
            className="inline-flex h-8 shrink-0 items-center rounded-full border border-transparent px-2.5 text-xs font-semibold"
          >
            {breed.label}
          </button>
        ))}
      </div>

      {/* Основной адаптивный контейнер */}
      <div
        ref={containerRef}
        className={`flex items-center gap-[5px] flex-nowrap min-w-0 w-full py-2 -my-2 relative overflow-visible ${className}`.trim()}
        role="toolbar"
        aria-label="Быстрый выбор породы"
      >
        {isMinimal ? (
          <MinimalBreedBar
            normalizedSelected={normalizedSelected}
            selectedBreed={selectedBreed}
            onSelectBreed={onSelectBreed}
            breedValues={breedValues}
            dogIndex={dogIndex}
            selectedDisplay={selectedDisplay}
            selectedLabel={selectedLabel}
            selectedFullName={selectedFullName}
            showHubLink={showHubLink}
            selectedHub={selectedHub}
          />
        ) : normalizedSelected ? (
          <SelectedBreedBar
            onSelectBreed={onSelectBreed}
            selectedLabel={selectedLabel}
            selectedFullName={selectedFullName}
            showHubLink={showHubLink}
            selectedHub={selectedHub}
          />
        ) : (
          <>
            <button
              type="button"
              data-all-btn="true"
              onClick={() => onSelectBreed('')}
              className="cs-glass-pill-active inline-flex h-8 shrink-0 items-center rounded-full px-2.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              aria-pressed={true}
            >
              Все породы
            </button>

            {visibleBreeds.map((breed) => (
              <button
                key={breed.key}
                type="button"
                data-breed-pill={breed.key}
                onClick={(e) => handlePillClick(breed.key, e)}
                title={breed.fullName}
                className="cs-glass-pill inline-flex h-8 shrink-0 items-center rounded-full px-2.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                aria-pressed={false}
                aria-label={`Фильтр по породе ${breed.fullName}`}
              >
                {breed.label}
              </button>
            ))}

            <div data-more-btn="true" className="ml-auto shrink-0 flex items-center">
              <BreedSearchDropdown
                breeds={breedValues}
                selectedBreed={selectedBreed}
                onSelect={handleDropdownSelect}
                dogIndex={dogIndex}
                align="right"
                trigger={
                  <button
                    type="button"
                    className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
                    title="Выбрать другую породу из полного списка"
                    aria-label="Открыть полный список пород"
                  >
                    <span>Ещё породы</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  </button>
                }
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}
