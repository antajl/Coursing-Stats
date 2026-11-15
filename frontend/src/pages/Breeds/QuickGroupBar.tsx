import { useState, useMemo, useRef, useLayoutEffect } from 'react'
import { ChevronDown, Check, Layers } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'
import { FCI_GROUPS, type FciGroupInfo } from '../../lib/fciGroups'

export interface QuickGroupItem {
  id: string
  label: string
  fullName: string
  estWidth: number
}

// Порядок приоритета групп для отображения в быстрых плашках
export const CANDIDATE_GROUPS: QuickGroupItem[] = [
  { id: '10', label: 'FCI 10: Борзые', fullName: 'FCI 10: Борзые (и нац. породы)', estWidth: 112 },
  { id: '5', label: 'FCI 5: Шпицы', fullName: 'FCI 5: Шпицы и аборигенные породы', estWidth: 105 },
  { id: '3', label: 'FCI 3: Терьеры', fullName: 'FCI 3: Терьеры', estWidth: 100 },
  { id: '2', label: 'FCI 2: Пинчеры', fullName: 'FCI 2: Пинчеры, шнауцеры, молоссы', estWidth: 105 },
  { id: '1', label: 'FCI 1: Пастушьи', fullName: 'FCI 1: Пастушьи и скотогонные', estWidth: 105 },
  { id: '8', label: 'FCI 8: Ретриверы', fullName: 'FCI 8: Ретриверы и спаниели', estWidth: 110 },
  { id: '6', label: 'FCI 6: Гончие', fullName: 'FCI 6: Гончие и родственные', estWidth: 95 },
  { id: '7', label: 'FCI 7: Легавые', fullName: 'FCI 7: Легавые', estWidth: 95 },
  { id: '4', label: 'FCI 4: Таксы', fullName: 'FCI 4: Таксы', estWidth: 85 },
  { id: '9', label: 'FCI 9: Декоративные', fullName: 'FCI 9: Декоративные', estWidth: 120 },
]

interface QuickGroupBarProps {
  value: string
  onChange: (value: string) => void
  counts: Record<string, number>
  className?: string
}

const GAP = 5
const BUFFER = 4

export default function QuickGroupBar({
  value,
  onChange,
  counts,
  className = '',
}: QuickGroupBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const allBtnRef = useRef<HTMLButtonElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [containerWidth, setContainerWidth] = useState<number>(360)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [measured, setMeasured] = useState<{
    allW: number
    moreW: number
    widths: Record<string, number>
  } | null>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateContainer = () => {
      if (el) {
        const nextW = el.clientWidth
        if (nextW > 0) {
          setContainerWidth((prev) => (prev !== nextW ? nextW : prev))
        }
      }
    }
    updateContainer()

    const remeasure = () => {
      const allW = allBtnRef.current?.offsetWidth || 88
      const moreW = moreBtnRef.current?.offsetWidth || 105
      const widths: Record<string, number> = {}
      CANDIDATE_GROUPS.forEach((g, i) => {
        widths[g.id] = itemRefs.current[i]?.offsetWidth || g.estWidth
      })
      setMeasured({ allW, moreW, widths })
    }
    remeasure()

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width
          if (w > 0) {
            setContainerWidth((prev) => (prev !== w ? w : prev))
          }
        }
      })
      ro.observe(el)
      return () => ro.disconnect()
    } else {
      window.addEventListener('resize', updateContainer)
      return () => window.removeEventListener('resize', updateContainer)
    }
  }, [])

  const isAll = value === 'all'
  const activeGroup = !isAll ? FCI_GROUPS[Number(value)] : undefined

  // Расчет видимых плашек групп, которые помещаются в доступную ширину
  const { visibleGroups, rareGroupChip } = useMemo(() => {
    const avail = Math.max(0, containerWidth - BUFFER)
    const allW = measured?.allW ?? 88
    const moreW = measured?.moreW ?? 105

    const normalMinNeeded = allW + GAP + moreW
    if (avail < normalMinNeeded) {
      return {
        visibleGroups: [] as QuickGroupItem[],
        rareGroupChip: null as QuickGroupItem | null,
      }
    }

    let remaining = avail - normalMinNeeded
    let rareChip: QuickGroupItem | null = null

    // Если выбрана группа, которой нет в топ-кандидатах
    if (!isAll) {
      const isTopCandidate = CANDIDATE_GROUPS.some((g) => g.id === value)
      if (!isTopCandidate && activeGroup) {
        rareChip = {
          id: value,
          label: activeGroup.shortName,
          fullName: activeGroup.name,
          estWidth: Math.max(90, Math.min(150, activeGroup.shortName.length * 8 + 32)),
        }
        const rareCost = GAP + rareChip.estWidth
        remaining = Math.max(0, remaining - rareCost)
      }
    }

    const visible: QuickGroupItem[] = []
    let isSelectedInVisible = false

    for (const group of CANDIDATE_GROUPS) {
      const gW = measured?.widths[group.id] ?? group.estWidth
      const cost = GAP + gW
      if (remaining >= cost) {
        visible.push(group)
        remaining -= cost
        if (value === group.id) {
          isSelectedInVisible = true
        }
      } else {
        break
      }
    }

    // Если группа была выбрана, но из-за нехватки ширины не вошла в видимые
    if (!isAll && !isSelectedInVisible && !rareChip && activeGroup) {
      rareChip = {
        id: value,
        label: activeGroup.shortName,
        fullName: activeGroup.name,
        estWidth: 110,
      }
    }

    return {
      visibleGroups: visible,
      rareGroupChip: rareChip,
    }
  }, [containerWidth, measured, isAll, value, activeGroup])

  const visibleGroupIds = useMemo(
    () => new Set(visibleGroups.map((g) => g.id)),
    [visibleGroups],
  )

  const isOverflowActive = Boolean(rareGroupChip)
  const moreButtonLabel = rareGroupChip ? rareGroupChip.label : 'Ещё группы'

  const sortedGroupKeys = useMemo(
    () =>
      Object.keys(FCI_GROUPS).sort(
        (a, b) => FCI_GROUPS[Number(a)].order - FCI_GROUPS[Number(b)].order,
      ),
    [],
  )

  const moreTrigger = (
    <button
      type="button"
      className={`h-8 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all inline-flex items-center gap-1 shrink-0 ${
        isOverflowActive ? 'cs-glass-pill-active' : 'cs-glass-pill'
      }`}
      title={isOverflowActive ? `Выбрана группа: ${moreButtonLabel}` : 'Открыть все группы пород FCI / РКФ'}
    >
      <Layers className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
      <span className="truncate max-w-[120px] sm:max-w-none">{moreButtonLabel}</span>
      <ChevronDown
        className={`h-3 w-3 shrink-0 transition-transform ${
          isOverflowActive ? 'text-camel-800' : 'text-charcoal-400 group-hover:text-charcoal-700'
        }`}
        aria-hidden
      />
    </button>
  )

  return (
    <>
      {/* Скрытый измеритель размеров для точного расчетного переноса */}
      <div
        aria-hidden="true"
        className="pointer-events-none invisible fixed -left-[9999px] -top-[9999px] -z-50 flex items-center gap-[5px] whitespace-nowrap"
      >
        <button
          ref={allBtnRef}
          type="button"
          className="inline-flex h-8 shrink-0 items-center rounded-full border border-transparent px-3 text-xs font-semibold"
        >
          Все группы
        </button>
        <button
          ref={moreBtnRef}
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-transparent px-2.5 text-xs font-semibold"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Ещё группы</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {CANDIDATE_GROUPS.map((group, i) => (
          <button
            key={group.id}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            type="button"
            className="inline-flex h-8 shrink-0 items-center rounded-full border border-transparent px-3 text-xs font-semibold"
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Основной видимый контейнер групп на всю отведенную ширину */}
      <div
        ref={containerRef}
        className={`flex items-center gap-[5px] w-full min-w-0 overflow-hidden ${className}`}
      >
        {/* Кнопка «Все группы» */}
        <button
          type="button"
          onClick={() => onChange('all')}
          className={`h-8 rounded-full px-3 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all inline-flex items-center shrink-0 ${
            isAll ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
          title="Показать все группы пород"
        >
          <span>Все группы</span>
        </button>

        {/* Видимые плашки основных групп */}
        {visibleGroups.map((group) => {
          const active = value === group.id
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onChange(active ? 'all' : group.id)}
              className={`h-8 rounded-full px-3 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all inline-flex items-center shrink-0 ${
                active ? 'cs-glass-pill-active' : 'cs-glass-pill'
              }`}
              title={group.fullName}
            >
              <span>{group.label}</span>
            </button>
          )
        })}

        {/* Выпадающий список «Ещё группы» */}
        <div className="ml-auto shrink-0 flex items-center">
          <ModernDropdown
            trigger={moreTrigger}
            isOpen={dropdownOpen}
            onOpenChange={setDropdownOpen}
            width="300px"
            portal
            closeOnScroll
          >
            {(close) => (
              <div className="p-1 space-y-0.5 text-xs" role="menu">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 border-b border-old-money-100">
                  Группы пород по классификации FCI / РКФ
                </div>

                {/* Все группы */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onChange('all')
                    close()
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                    isAll
                      ? 'bg-camel-100/90 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-cream-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Все группы пород</span>
                    <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500">
                      {counts['all'] || 82}
                    </span>
                  </div>
                  {isAll && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
                </button>

                {/* Список групп по порядку FCI */}
                {sortedGroupKeys.map((key) => {
                  const group = FCI_GROUPS[Number(key)]
                  const count = counts[key] || 0
                  if (count === 0) return null
                  const isSelected = value === key

                  return (
                    <button
                      key={key}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onChange(isSelected ? 'all' : key)
                        close()
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100/90 text-camel-950 font-semibold'
                          : 'text-charcoal-700 hover:bg-cream-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{group.name}</span>
                        <span className="text-[10px] tabular-nums font-sans px-1.5 py-0.2 rounded-full bg-cream-100 text-charcoal-500 shrink-0">
                          {count}
                        </span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0 ml-1.5" />}
                    </button>
                  )
                })}
              </div>
            )}
          </ModernDropdown>
        </div>
      </div>
    </>
  )
}
