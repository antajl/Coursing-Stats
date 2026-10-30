import { useState, useLayoutEffect, useRef, useMemo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { canonicalBreed, displayBreed, matchesBreedFilter } from '../../lib/breedMapping'
import type { DogsIndexEntry } from '../../lib/competingBreeds'

export interface QuickBreedItem {
  key: string
  label: string
  fullName: string
  estWidth: number
}

/**
 * Кандидаты в быстрые плашки в порядке спортивной популярности на курсинге.
 * Заполняют доступное пространство между фильтрами года и кнопкой «О рейтинге».
 */
export const CANDIDATE_BREEDS: QuickBreedItem[] = [
  { key: 'УИППЕТ', label: 'Уиппет', fullName: 'Уиппет', estWidth: 76 },
  { key: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', label: 'РПБ', fullName: 'Русская псовая борзая', estWidth: 58 },
  { key: 'БАСЕНДЖИ', label: 'Басенджи', fullName: 'Басенджи', estWidth: 86 },
  { key: 'РОДЕЗИЙСКИЙ РИДЖБЕК', label: 'Риджбек', fullName: 'Родезийский риджбек', estWidth: 86 },
  { key: 'САЛЮКИ', label: 'Салюки', fullName: 'Салюки', estWidth: 76 },
  { key: 'ГРЕЙХАУНД', label: 'Грейхаунд', fullName: 'Грейхаунд', estWidth: 96 },
  { key: 'ИРЛАНДСКИЙ ВОЛКОДАВ', label: 'Ирл. волкодав', fullName: 'Ирландский волкодав', estWidth: 116 },
  { key: 'ЧИРНЕКО ДЕЛЬ ЭТНА', label: 'Чирнеко', fullName: 'Чирнеко дель Этна', estWidth: 86 },
  { key: 'ФАРАОНОВА СОБАКА', label: 'Фараон', fullName: 'Фараонова собака', estWidth: 80 },
  { key: 'ЛЕВРЕТКА', label: 'Левретка', fullName: 'Левретка', estWidth: 86 },
  { key: 'АФГАНСКАЯ БОРЗАЯ', label: 'Афган', fullName: 'Афганская борзая', estWidth: 76 },
  { key: 'МАДЬЯР АГАР', label: 'Мадьяр', fullName: 'Мадьяр агар', estWidth: 80 },
  { key: 'АЗАВАК', label: 'Азавак', fullName: 'Азавак', estWidth: 80 },
]

export const SHOW_CANDIDATE_BREEDS: QuickBreedItem[] = [
  { key: 'УИППЕТ', label: 'Уиппет', fullName: 'Уиппет', estWidth: 76 },
  { key: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', label: 'РПБ', fullName: 'Русская псовая борзая', estWidth: 58 },
  { key: 'БАСЕНДЖИ', label: 'Басенджи', fullName: 'Басенджи', estWidth: 86 },
  { key: 'САЛЮКИ', label: 'Салюки', fullName: 'Салюки', estWidth: 76 },
  { key: 'ЛЕВРЕТКА', label: 'Левретка', fullName: 'Левретка', estWidth: 86 },
  { key: 'ИРЛАНДСКИЙ ВОЛКОДАВ', label: 'Ирл. волкодав', fullName: 'Ирландский волкодав', estWidth: 116 },
  { key: 'ГРЕЙХАУНД', label: 'Грейхаунд', fullName: 'Грейхаунд', estWidth: 96 },
  { key: 'АФГАНСКАЯ БОРЗАЯ', label: 'Афган', fullName: 'Афганская борзая', estWidth: 76 },
  { key: 'РОДЕЗИЙСКИЙ РИДЖБЕК', label: 'Риджбек', fullName: 'Родезийский риджбек', estWidth: 86 },
  { key: 'ЧИРНЕКО ДЕЛЬ ЭТНА', label: 'Чирнеко', fullName: 'Чирнеко дель Этна', estWidth: 86 },
  { key: 'ФАРАОНОВА СОБАКА', label: 'Фараон', fullName: 'Фараонова собака', estWidth: 80 },
  { key: 'ТАКСА', label: 'Такса', fullName: 'Такса', estWidth: 70 },
  { key: 'ПУДЕЛЬ', label: 'Пудель', fullName: 'Пудель', estWidth: 76 },
]

export const TOP_QUICK_BREEDS = CANDIDATE_BREEDS

interface QuickBreedBarProps {
  selectedBreed: string
  onSelectBreed: (breed: string) => void
  breedValues: string[]
  dogIndex?: DogsIndexEntry[]
  candidateBreeds?: QuickBreedItem[]
  className?: string
}

const GAP = 6 // gap-1.5 = 6px
const BUFFER = 16 // Запас против субпиксельного округления в flex

export default function QuickBreedBar({
  selectedBreed,
  onSelectBreed,
  breedValues,
  dogIndex,
  candidateBreeds,
  className = '',
}: QuickBreedBarProps) {
  const candidates = useMemo(() => {
    const base = candidateBreeds ?? CANDIDATE_BREEDS
    if (!breedValues || breedValues.length === 0) return base
    const active = base.filter((b) =>
      breedValues.some((bv) => matchesBreedFilter(canonicalBreed(bv), b.key))
    )
    return active.length > 0 ? active : base
  }, [candidateBreeds, breedValues])
  const containerRef = useRef<HTMLDivElement>(null)
  const allBtnRef = useRef<HTMLButtonElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const minBtnRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Начальная ширина до первого измерения через ResizeObserver
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.max(260, window.innerWidth - 560)
    }
    return 600
  })

  // Точные измеренные ширины элементов из невидимого контейнера
  const [measured, setMeasured] = useState<{
    allW: number
    moreW: number
    minW: number
    widths: Record<string, number>
  } | null>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateContainer = () => {
      if (el) {
        setContainerWidth(el.clientWidth)
      }
    }
    updateContainer()

    // Точное снятие размеров кнопок в браузере с учетом шрифтов и кернинга
    const allW = allBtnRef.current?.offsetWidth || 96
    const moreW = moreBtnRef.current?.offsetWidth || 114
    const minW = minBtnRef.current?.offsetWidth || 86
    const widths: Record<string, number> = {}
    candidates.forEach((b, i) => {
      widths[b.key] = itemRefs.current[i]?.offsetWidth || b.estWidth
    })
    setMeasured({ allW, moreW, minW, widths })

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width
          if (w > 0) {
            setContainerWidth(w)
          }
        }
      })
      ro.observe(el)
      return () => ro.disconnect()
    } else {
      window.addEventListener('resize', updateContainer)
      return () => window.removeEventListener('resize', updateContainer)
    }
  }, [candidates])

  const normalizedSelected = useMemo(
    () => (selectedBreed ? canonicalBreed(selectedBreed) : ''),
    [selectedBreed],
  )

  const selectedDisplay = useMemo(() => {
    if (!normalizedSelected) return null
    return displayBreed(normalizedSelected).primary || selectedBreed
  }, [normalizedSelected, selectedBreed])

  // Расчет: минимальный режим vs обычный + сколько плашек точно помещается
  const { isMinimal, visibleBreeds, rareBreedChip } = useMemo(() => {
    const avail = Math.max(0, containerWidth - BUFFER)
    const allW = measured?.allW ?? 96
    const moreW = measured?.moreW ?? 114

    // Минимальная ширина для обычной строки: [Все породы] + gap + [Ещё породы]
    const normalMinNeeded = allW + GAP + moreW

    // Если пространства меньше порога (окно максимально сужено) — включаем минимальный режим (кнопка «Породы»)
    if (avail < normalMinNeeded) {
      return {
        isMinimal: true,
        visibleBreeds: [] as QuickBreedItem[],
        rareBreedChip: null as string | null,
      }
    }

    let remaining = avail - normalMinNeeded

    // Если выбрана порода, которой нет в топ-кандидатах — резервируем место под её чип
    let rareChip: string | null = null
    if (normalizedSelected) {
      const isCandidate = candidates.some((b) =>
        matchesBreedFilter(normalizedSelected, b.key),
      )
      if (!isCandidate) {
        rareChip = selectedDisplay
        const rareCost =
          GAP + Math.max(75, Math.min(160, (selectedDisplay?.length || 0) * 7.5 + 44))
        remaining = Math.max(0, remaining - rareCost)
      }
    }

    // Заполняем оставшееся пространство плашками в порядке популярности
    const visible: QuickBreedItem[] = []
    let isSelectedInVisible = false

    for (const breed of candidates) {
      const bW = measured?.widths[breed.key] ?? breed.estWidth
      const cost = GAP + bW
      if (remaining >= cost) {
        visible.push(breed)
        remaining -= cost
        if (matchesBreedFilter(normalizedSelected, breed.key)) {
          isSelectedInVisible = true
        }
      } else {
        // Больше не влезает в доступное пространство
        break
      }
    }

    // Если кандидат был выбран, но из-за сужения не вошел в видимые — показываем его чипом
    if (normalizedSelected && !isSelectedInVisible && !rareChip) {
      rareChip = selectedDisplay
    }

    return {
      isMinimal: false,
      visibleBreeds: visible,
      rareBreedChip: rareChip,
    }
  }, [containerWidth, measured, normalizedSelected, selectedDisplay, candidates])

  const handlePillClick = (breedKey: string) => {
    if (matchesBreedFilter(normalizedSelected, breedKey)) {
      onSelectBreed('')
    } else {
      onSelectBreed(breedKey)
    }
  }

  return (
    <>
      {/* Скрытый измеритель размеров кнопок (вне потока) */}
      <div
        aria-hidden="true"
        className="pointer-events-none invisible fixed -left-[9999px] -top-[9999px] -z-50 flex items-center gap-1.5 whitespace-nowrap"
      >
        <button
          ref={allBtnRef}
          type="button"
          className="inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold"
        >
          Все породы
        </button>
        <button
          ref={moreBtnRef}
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold"
        >
          <span>Ещё породы</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          ref={minBtnRef}
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold"
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
            className="inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold"
          >
            {breed.label}
          </button>
        ))}
      </div>

      {/* Основной адаптивный контейнер */}
      <div
        ref={containerRef}
        className={`flex items-center gap-1.5 flex-nowrap min-w-0 w-full overflow-hidden py-1 ${className}`.trim()}
        role="toolbar"
        aria-label="Быстрый выбор породы"
      >
        {isMinimal ? (
          /* МАКСИМАЛЬНО СУЖЕННЫЙ РЕЖИМ: просто кнопка «Породы» */
          normalizedSelected ? (
            <span
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-camel-400 bg-camel-100 px-3 text-xs font-semibold text-camel-950 shadow-2xs whitespace-nowrap"
              title={`Выбрана порода: ${selectedDisplay}`}
            >
              <BreedSearchDropdown
                breeds={breedValues}
                selectedBreed={selectedBreed}
                onSelect={onSelectBreed}
                dogIndex={dogIndex}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 cursor-pointer max-w-[130px] truncate"
                    title="Сменить породу"
                    aria-label={`Выбрана порода: ${selectedDisplay}. Нажмите для смены.`}
                  >
                    <span className="truncate">{selectedDisplay}</span>
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
                aria-label={`Сбросить фильтр породы ${selectedDisplay}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          ) : (
            <BreedSearchDropdown
              breeds={breedValues}
              selectedBreed={selectedBreed}
              onSelect={onSelectBreed}
              dogIndex={dogIndex}
              trigger={
                <button
                  type="button"
                  className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-old-money-200/80 bg-cream-50 px-3 text-xs font-semibold text-charcoal-700 hover:bg-old-money-50 hover:text-charcoal-900 transition-colors whitespace-nowrap cursor-pointer"
                  title="Выбрать породу из полного списка"
                  aria-label="Открыть список пород"
                >
                  <span>Породы</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
                </button>
              }
            />
          )
        ) : (
          /* ОБЫЧНЫЙ АДАПТИВНЫЙ РЕЖИМ: плашки заполняют все свободное пространство */
          <>
            {/* Кнопка: Все породы */}
            <button
              type="button"
              onClick={() => onSelectBreed('')}
              className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                !normalizedSelected
                  ? 'border border-camel-400 bg-camel-100 text-camel-950 shadow-2xs'
                  : 'border border-old-money-200/80 bg-cream-50 text-charcoal-700 hover:bg-old-money-50 hover:text-charcoal-900'
              }`}
              aria-pressed={!normalizedSelected}
            >
              Все породы
            </button>

            {/* Топ-породы, которые помещаются в текущую ширину */}
            {visibleBreeds.map((breed) => {
              const isActive = matchesBreedFilter(normalizedSelected, breed.key)
              return (
                <button
                  key={breed.key}
                  type="button"
                  onClick={() => handlePillClick(breed.key)}
                  title={breed.fullName}
                  className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border border-camel-400 bg-camel-100 text-camel-950 shadow-2xs'
                      : 'border border-old-money-200/80 bg-cream-50 text-charcoal-700 hover:bg-old-money-50 hover:text-charcoal-900'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Фильтр по породе ${breed.fullName}`}
                >
                  {breed.label}
                </button>
              )
            })}

            {/* Чип для выбранной редкой породы или породы, не вошедшей в visible */}
            {rareBreedChip && (
              <span
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-camel-400 bg-camel-100 px-3 text-xs font-semibold text-camel-950 shadow-2xs whitespace-nowrap"
                title={`Выбрана порода: ${rareBreedChip}`}
              >
                <span>{rareBreedChip}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectBreed('')
                  }}
                  className="rounded-full p-0.5 hover:bg-camel-200/60 text-camel-950 transition-colors cursor-pointer"
                  title="Сбросить породу"
                  aria-label={`Сбросить фильтр породы ${rareBreedChip}`}
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
          </>
        )}
      </div>
    </>
  )
}
