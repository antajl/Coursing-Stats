export const TOOLBAR_CHIP =
  'inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors'

export const TOOLBAR_CHIP_IDLE =
  'border-old-money-200 bg-cream-50 text-charcoal-700 hover:bg-old-money-50'

export const TOOLBAR_CHIP_ACTIVE =
  'border-camel-500 bg-camel-500 text-charcoal-900'

/** Pill filter trigger with chevron (ModernDropdown). */
export function toolbarPillTriggerClass(active: boolean, extra = '') {
  return `inline-flex gap-1.5 ${TOOLBAR_CHIP} ${active ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}${extra ? ` ${extra}` : ''}`
}

export const TOOLBAR_PANEL =
  'rounded-xl border border-old-money-200/80 bg-cream-100/70 p-3'

export const TOOLBAR_SEGMENT_GROUP =
  'inline-flex shrink-0 rounded-lg border border-old-money-200 bg-white p-0.5'

export const TOOLBAR_SEGMENT =
  'rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors'

export const TOOLBAR_SEGMENT_IDLE =
  'text-charcoal-600 hover:text-charcoal-800'

export const TOOLBAR_SEGMENT_ACTIVE =
  'bg-camel-500 text-charcoal-900 shadow-sm'

export const TOOLBAR_SORT_CHIP =
  'inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-colors'

export const TOOLBAR_SORT_IDLE =
  'border-old-money-200 bg-white text-charcoal-600 hover:border-old-money-300 hover:bg-cream-50'

export const TOOLBAR_SORT_ACTIVE =
  'border-camel-400 bg-camel-50 text-camel-900'

export const TOOLBAR_ACTIVE_FILTER =
  'inline-flex h-7 max-w-[200px] items-center gap-1 rounded-full border border-old-money-200 bg-white pl-2.5 pr-1 text-xs font-medium text-charcoal-700'

export const TOOLBAR_FILTER_BTN =
  'inline-flex h-8 min-w-[96px] items-center justify-between gap-2 rounded-lg border border-old-money-300 bg-white px-3 text-xs font-medium text-charcoal-700 transition-colors hover:bg-old-money-50'

export const TOOLBAR_FILTER_PANEL =
  'absolute z-20 mt-1 max-h-60 min-w-[160px] overflow-y-auto rounded-lg border border-old-money-200 bg-white py-1 shadow-xl'

export const TOOLBAR_RESET_LINK =
  'h-8 shrink-0 px-1 text-xs font-medium text-charcoal-500 underline-offset-2 hover:text-camel-700 hover:underline'

export const TOOLBAR_NUMBER_INPUT =
  'h-8 w-full rounded-lg border border-old-money-300 bg-white px-3 text-xs font-medium text-charcoal-800 outline-none placeholder:text-charcoal-400 focus:border-camel-400 focus:ring-1 focus:ring-camel-400/40 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

export const TOOLBAR_FILTER_SECTION_LABEL =
  'mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-old-money-500'

export const TOOLBAR_FILTER_CHECKBOX_ROW =
  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-charcoal-700 hover:bg-cream-50'

/** Компактные чипы года в панели фильтров. */
export const TOOLBAR_FILTER_YEAR_CHIP =
  'inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[11px] font-semibold tabular-nums transition-colors'

/** Строка выбора породы (single-select). */
export const TOOLBAR_FILTER_OPTION_ROW =
  'flex w-full min-w-0 cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm leading-snug text-charcoal-700 transition-colors hover:bg-white'

export const TOOLBAR_FILTER_OPTION_ROW_ACTIVE =
  'bg-camel-50 text-charcoal-900 ring-1 ring-camel-300/70'

export const TOOLBAR_FILTER_SEARCH =
  'h-8 w-full rounded-lg border border-old-money-300 bg-white px-3 text-xs font-medium text-charcoal-800 outline-none placeholder:text-charcoal-400 focus:border-camel-400 focus:ring-1 focus:ring-camel-400/40'
