/**
 * Обычный <select> для фильтра, со стилем, общим для обеих страниц.
 *
 * @param {string} label - подпись над полем (крупная)
 * @param {string} ariaLabel - подпись для скринридеров, если label не показан
 * @param {string} value
 * @param {(value: string) => void} onChange
 * @param {{ value: string, label: string }[]} options - без опции "Все ..." — она добавляется автоматически
 * @param {string} allLabel - текст для опции "сбросить фильтр" (например "Все года")
 */
import { useId } from 'react'

export default function FilterSelect({
  label,
  ariaLabel,
  value,
  onChange,
  options,
  allLabel,
  disabled = false,
  className = '',
  selectClassName = '',
}: {
  label?: string
  ariaLabel?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  allLabel?: string
  disabled?: boolean
  className?: string
  selectClassName?: string
}) {
  const id = useId()
  const screenReaderLabel = ariaLabel || label
  const selectBase =
    'h-9 w-full min-w-0 max-w-full px-3 bg-white dark:bg-charcoal-800 border-[1.5px] border-old-money-300 dark:border-charcoal-600 rounded-[10px] text-xs font-medium text-charcoal-700 dark:text-charcoal-200 focus:ring-2 focus:ring-gold-400 dark:focus:ring-camel-600 focus:border-transparent transition-colors dark:[color-scheme:dark]'

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-old-money-700 dark:text-old-money-400 mb-2"
        >
          {label}
        </label>
      )}
      {!label && screenReaderLabel && (
        <label htmlFor={id} className="sr-only">
          {screenReaderLabel}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${selectBase} ${selectClassName}`.trim()}
      >
        {allLabel && <option value="">{allLabel}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
