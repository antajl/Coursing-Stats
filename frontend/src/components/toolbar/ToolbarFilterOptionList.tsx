import { useMemo, useState, type ReactNode } from 'react'
import {
  TOOLBAR_FILTER_OPTION_ROW,
  TOOLBAR_FILTER_OPTION_ROW_ACTIVE,
  TOOLBAR_FILTER_SEARCH,
} from '../../lib/toolbar'

export type ToolbarFilterOption = {
  value: string
  label: ReactNode
  searchText?: string
}

interface ToolbarFilterOptionListProps {
  options: Array<string | ToolbarFilterOption>
  mode?: 'single' | 'multi'
  /** single: выбранное значение; multi: выбранные значения */
  value: string | string[]
  /** Клик по опции (toggle делает родитель). */
  onSelect: (value: string) => void
  searchable?: boolean
  searchPlaceholder?: string
  emptyText?: string
  /** Список растягивается и скроллится внутри. */
  fill?: boolean
  className?: string
}

function normalizeOptions(options: Array<string | ToolbarFilterOption>): ToolbarFilterOption[] {
  return options.map((item) =>
    typeof item === 'string' ? { value: item, label: item, searchText: item } : item
  )
}

function isSelected(mode: 'single' | 'multi', value: string | string[], option: string) {
  if (mode === 'multi') return Array.isArray(value) && value.includes(option)
  return value === option
}

export default function ToolbarFilterOptionList({
  options,
  mode = 'single',
  value,
  onSelect,
  searchable = false,
  searchPlaceholder = 'Найти…',
  emptyText = 'Ничего не найдено',
  fill = false,
  className = '',
}: ToolbarFilterOptionListProps) {
  const [query, setQuery] = useState('')
  const normalized = useMemo(() => normalizeOptions(options), [options])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return normalized
    return normalized.filter((opt) => {
      const hay = (opt.searchText ?? String(opt.value)).toLowerCase()
      return hay.includes(q)
    })
  }, [normalized, query])

  return (
    <div className={`flex min-h-0 flex-col ${fill ? 'flex-1' : ''} ${className}`}>
      {searchable ? (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className={`${TOOLBAR_FILTER_SEARCH} mb-2 shrink-0`}
          autoComplete="off"
          enterKeyHint="search"
        />
      ) : null}
      <div
        className={`space-y-0.5 overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg border border-old-money-200/70 bg-white/70 p-1 [-webkit-overflow-scrolling:touch] dark:border-charcoal-600 dark:bg-charcoal-900/40 ${
          fill ? 'min-h-0 max-h-[min(220px,36vh)] flex-1' : 'max-h-44'
        }`}
        role="listbox"
        aria-multiselectable={mode === 'multi'}
      >
        {filtered.length === 0 ? (
          <p className="px-2.5 py-3 text-xs text-charcoal-500 dark:text-charcoal-400">{emptyText}</p>
        ) : (
          filtered.map((opt) => {
            const selected = isSelected(mode, value, opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(opt.value)}
                className={`${TOOLBAR_FILTER_OPTION_ROW} min-w-0 w-full ${selected ? TOOLBAR_FILTER_OPTION_ROW_ACTIVE : ''}`}
              >
                <span
                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
                    mode === 'multi' ? 'rounded-[3px]' : 'rounded-full'
                  } ${
                    selected
                      ? 'border-camel-600 bg-camel-500'
                      : 'border-old-money-300 bg-white dark:border-charcoal-500 dark:bg-charcoal-800'
                  }`}
                  aria-hidden
                >
                  {selected ? (
                    mode === 'multi' ? (
                      <span className="text-[9px] font-bold leading-none text-charcoal-900">✓</span>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-charcoal-900" />
                    )
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 break-words text-left [overflow-wrap:anywhere]">
                  {opt.label}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
