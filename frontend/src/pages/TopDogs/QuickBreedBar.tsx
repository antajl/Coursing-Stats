import { useState, useLayoutEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, X, ArrowUpRight } from 'lucide-react'
import BreedSearchDropdown from '../../components/ui/BreedSearchDropdown'
import { canonicalBreed, displayBreed, matchesBreedFilter } from '../../lib/breedMapping'
import { getBreedHubByCanonicalKey, getBreedHubBySlug } from '../../lib/breed-hubs-data'
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
  { key: 'УИППЕТ', label: 'Уиппет', fullName: 'Уиппет', estWidth: 68 },
  { key: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', label: 'РПБ', fullName: 'Русская псовая борзая', estWidth: 50 },
  { key: 'БАСЕНДЖИ', label: 'Басенджи', fullName: 'Басенджи', estWidth: 78 },
  { key: 'РОДЕЗИЙСКИЙ РИДЖБЕК', label: 'Риджбек', fullName: 'Родезийский риджбек', estWidth: 78 },
  { key: 'САЛЮКИ', label: 'Салюки', fullName: 'Салюки', estWidth: 68 },
  { key: 'ГРЕЙХАУНД', label: 'Грейхаунд', fullName: 'Грейхаунд', estWidth: 88 },
  { key: 'ИРЛАНДСКИЙ ВОЛКОДАВ', label: 'Ирл. волкодав', fullName: 'Ирландский волкодав', estWidth: 108 },
  { key: 'ЧИРНЕКО ДЕЛЬ ЭТНА', label: 'Чирнеко', fullName: 'Чирнеко дель Этна', estWidth: 78 },
  { key: 'ФАРАОНОВА СОБАКА', label: 'Фараон', fullName: 'Фараонова собака', estWidth: 72 },
  { key: 'ЛЕВРЕТКА', label: 'Левретка', fullName: 'Левретка', estWidth: 78 },
  { key: 'АФГАНСКАЯ БОРЗАЯ', label: 'Афган', fullName: 'Афганская борзая', estWidth: 68 },
  { key: 'МАДЬЯР АГАР', label: 'Мадьяр', fullName: 'Мадьяр агар', estWidth: 72 },
  { key: 'АЗАВАК', label: 'Азавак', fullName: 'Азавак', estWidth: 72 },
]

export const SHOW_CANDIDATE_BREEDS: QuickBreedItem[] = [
  { key: 'УИППЕТ', label: 'Уиппет', fullName: 'Уиппет', estWidth: 68 },
  { key: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', label: 'РПБ', fullName: 'Русская псовая борзая', estWidth: 50 },
  { key: 'БАСЕНДЖИ', label: 'Басенджи', fullName: 'Басенджи', estWidth: 78 },
  { key: 'САЛЮКИ', label: 'Салюки', fullName: 'Салюки', estWidth: 68 },
  { key: 'ЛЕВРЕТКА', label: 'Левретка', fullName: 'Левретка', estWidth: 78 },
  { key: 'ИРЛАНДСКИЙ ВОЛКОДАВ', label: 'Ирл. волкодав', fullName: 'Ирландский волкодав', estWidth: 108 },
  { key: 'ГРЕЙХАУНД', label: 'Грейхаунд', fullName: 'Грейхаунд', estWidth: 88 },
  { key: 'АФГАНСКАЯ БОРЗАЯ', label: 'Афган', fullName: 'Афганская борзая', estWidth: 68 },
  { key: 'РОДЕЗИЙСКИЙ РИДЖБЕК', label: 'Риджбек', fullName: 'Родезийский риджбек', estWidth: 78 },
  { key: 'ЧИРНЕКО ДЕЛЬ ЭТНА', label: 'Чирнеко', fullName: 'Чирнеко дель Этна', estWidth: 78 },
  { key: 'ФАРАОНОВА СОБАКА', label: 'Фараон', fullName: 'Фараонова собака', estWidth: 72 },
  { key: 'ТАКСА', label: 'Такса', fullName: 'Такса', estWidth: 62 },
  { key: 'ПУДЕЛЬ', label: 'Пудель', fullName: 'Пудель', estWidth: 68 },
]

export const TOP_QUICK_BREEDS = CANDIDATE_BREEDS

interface QuickBreedBarProps {
  selectedBreed: string
  onSelectBreed: (breed: string) => void
  breedValues?: string[]
  dogIndex?: DogsIndexEntry[]
  candidateBreeds?: QuickBreedItem[]
  className?: string
  strictFilterByBreedValues?: boolean
  showHubLink?: boolean
}

const GAP = 5 // gap-[5px] = 5px
const BUFFER = 4 // Запас против субпиксельного округления в flex и переполнения края контейнера

// Контекстный кэш измерений (по URL/вкладке), исключающий перенос более широких замеров с других вкладок
const cachedWidthByContext = new Map<string, number>()
let cachedMeasured: {
  allW: number
  moreW: number
  minW: number
  widths: Record<string, number>
} | null = null

function getContextKey(): string {
  if (typeof window !== 'undefined') {
    const tab = new URLSearchParams(window.location.search).get('tab') || ''
    return `${window.location.pathname}:${tab}`
  }
  return 'default'
}

function getInitialContainerWidth(): number {
  const key = getContextKey()
  const cached = cachedWidthByContext.get(key)
  if (cached && cached > 0) {
    return cached
  }
  if (typeof window !== 'undefined') {
    // Учитываем каркас сайта App.tsx (md:max-w-7xl = 1280px) и боковые отступы (32-64px)
    const effectiveLayoutWidth = Math.min(window.innerWidth - 32, 1280 - 64)
    // Левые управляющие элементы тулбара на рейтинге занимают ~420px, на архиве ~340px
    const isRanking = window.location.pathname.includes('/ranking') || window.location.search.includes('tab=ranking')
    const estimatedLeftControls = isRanking ? 420 : 340
    return Math.max(260, effectiveLayoutWidth - estimatedLeftControls)
  }
  return 600
}

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
    // Базовые породы-кандидаты являются приоритетными и не должны исчезать/мелькать
    // при частичной асинхронной загрузке данных (например, первой порции page0 в рейтинге).
    // Только если передан строгий фильтр (например, на странице конкретного состязания),
    // мы ограничиваем кандидатов исключительно заявленными породами.
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
  const containerRef = useRef<HTMLDivElement>(null)
  const allBtnRef = useRef<HTMLButtonElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const minBtnRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Начальная ширина: берем из кэша либо вычисляем реалистичную оценку под макет 1280px
  const [containerWidth, setContainerWidth] = useState<number>(getInitialContainerWidth)

  // Точные измеренные ширины элементов из невидимого контейнера (из кэша либо null)
  const [measured, setMeasured] = useState<{
    allW: number
    moreW: number
    minW: number
    widths: Record<string, number>
  } | null>(() => cachedMeasured)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    let isCancelled = false

    const updateContainer = () => {
      if (el) {
        const nextW = el.clientWidth
        if (nextW > 0) {
          cachedWidthByContext.set(getContextKey(), nextW)
          setContainerWidth((prev) => (prev !== nextW ? nextW : prev))
        }
      }
    }
    updateContainer()

    // Точное снятие размеров кнопок в браузере с учетом шрифтов и кернинга
    const remeasure = () => {
      const allW = allBtnRef.current?.offsetWidth || cachedMeasured?.allW || 88
      const moreW = moreBtnRef.current?.offsetWidth || cachedMeasured?.moreW || 105
      const minW = minBtnRef.current?.offsetWidth || cachedMeasured?.minW || 82
      const widths: Record<string, number> = { ...(cachedMeasured?.widths || {}) }
      candidates.forEach((b, i) => {
        widths[b.key] =
          itemRefs.current[i]?.offsetWidth || cachedMeasured?.widths[b.key] || b.estWidth
      })
      setMeasured((prev) => {
        if (
          prev &&
          prev.allW === allW &&
          prev.moreW === moreW &&
          prev.minW === minW &&
          Object.keys(prev.widths).length === Object.keys(widths).length &&
          Object.entries(widths).every(([k, v]) => prev.widths[k] === v)
        ) {
          return prev
        }
        const next = { allW, moreW, minW, widths }
        cachedMeasured = next
        return next
      })
    }

    remeasure()

    // Повторное измерение после загрузки веб-шрифтов (например, Montserrat)
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (!isCancelled) {
          remeasure()
          updateContainer()
        }
      })
    }

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width
          if (w > 0) {
            cachedWidthByContext.set(getContextKey(), w)
            setContainerWidth((prev) => (prev !== w ? w : prev))
          }
        }
      })
      ro.observe(el)
      return () => {
        isCancelled = true
        ro.disconnect()
      }
    } else {
      window.addEventListener('resize', updateContainer)
      return () => {
        isCancelled = true
        window.removeEventListener('resize', updateContainer)
      }
    }
  }, [candidateKeys])

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

  // Расчет: минимальный режим vs обычный + сколько плашек точно помещается
  const { isMinimal, visibleBreeds } = useMemo(() => {
    const avail = Math.max(0, containerWidth - BUFFER)
    const allW = measured?.allW ?? 88
    const moreW = measured?.moreW ?? 105

    // Если выбрана порода, в строке отображаются только 2-3 кнопки:
    // [Все породы] (не светится) + [Выбранная порода ✕] (светится) + [Хаб породы ↗] (если доступен)
    // Все остальные пилюли и кнопка «Ещё породы» скрываются!
    if (normalizedSelected) {
      const selW = targetBreed
        ? (measured?.widths[targetBreed.key] ?? targetBreed.estWidth)
        : Math.max(60, Math.min(130, (selectedLabel.length || 0) * 8 + 36))
      const needed = allW + GAP + selW
      if (avail < needed) {
        return {
          isMinimal: true,
          visibleBreeds: [] as QuickBreedItem[],
        }
      }
      return {
        isMinimal: false,
        visibleBreeds: [] as QuickBreedItem[],
      }
    }

    // Минимальная ширина для обычной строки: [Все породы] + gap + [Ещё породы]
    const normalMinNeeded = allW + GAP + moreW

    // Если пространства меньше порога (окно максимально сужено) — включаем минимальный режим (кнопка «Породы»)
    if (avail < normalMinNeeded) {
      return {
        isMinimal: true,
        visibleBreeds: [] as QuickBreedItem[],
      }
    }

    let remaining = avail - normalMinNeeded

    // Заполняем оставшееся пространство плашками кандидатов
    const visible: QuickBreedItem[] = []
    for (const breed of candidates) {
      const bW = measured?.widths[breed.key] ?? breed.estWidth
      const cost = GAP + bW
      if (remaining >= cost) {
        visible.push(breed)
        remaining -= cost
      } else {
        // Больше не влезает в доступное пространство
        break
      }
    }

    return {
      isMinimal: false,
      visibleBreeds: visible,
    }
  }, [containerWidth, measured, normalizedSelected, targetBreed, selectedLabel, candidates])

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
        className={`flex items-center gap-[5px] flex-nowrap min-w-0 w-full py-2 -my-2 overflow-visible ${className}`.trim()}
        role="toolbar"
        aria-label="Быстрый выбор породы"
      >
        {isMinimal ? (
          /* МАКСИМАЛЬНО СУЖЕННЫЙ РЕЖИМ: просто кнопка «Породы» */
          normalizedSelected ? (
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
          ) : (
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
        ) : normalizedSelected ? (
          /* КОГДА ВЫБРАНА ПОРОДА:
           * 1. Кнопка «Все породы» (не светится / idle) — возврат ко всем породам
           * 2. Выбранная порода (светится / active) — клик или крестик сбрасывает породу
           * 3. Кнопка «Хаб породы ↗» (если доступен хаб)
           * Все остальные породы и кнопка «Ещё породы» скрыты!
           */
          <>
            {/* Кнопка: Все породы (не светится) */}
            <button
              type="button"
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
              <Link
                to={`/breeds/${selectedHub.slug}/`}
                className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-camel-900 border border-camel-300/80 bg-camel-50 hover:bg-camel-100 transition-colors whitespace-nowrap cursor-pointer"
                title={`Хаб породы ${selectedHub.nameRu}`}
                aria-label={`Открыть хаб породы ${selectedHub.nameRu}`}
              >
                <span>Хаб породы</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden="true" />
              </Link>
            )}
          </>
        ) : (
          /* ОБЫЧНЫЙ АДАПТИВНЫЙ РЕЖИМ (порода не выбрана):
           * 1. «Все породы» (подсвечена / active)
           * 2. Пилюли популярных пород-кандидатов (не подсвечены / idle)
           * 3. «Ещё породы» (выпадающий поиск)
           */
          <>
            {/* Кнопка: Все породы */}
            <button
              type="button"
              onClick={() => onSelectBreed('')}
              className="cs-glass-pill-active inline-flex h-8 shrink-0 items-center rounded-full px-2.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              aria-pressed={true}
            >
              Все породы
            </button>

            {/* Топ-породы, которые помещаются в текущую ширину */}
            {visibleBreeds.map((breed) => (
              <button
                key={breed.key}
                type="button"
                onClick={() => handlePillClick(breed.key)}
                title={breed.fullName}
                className="cs-glass-pill inline-flex h-8 shrink-0 items-center rounded-full px-2.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                aria-pressed={false}
                aria-label={`Фильтр по породе ${breed.fullName}`}
              >
                {breed.label}
              </button>
            ))}

            {/* Выпадающий поиск по всем породам */}
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
