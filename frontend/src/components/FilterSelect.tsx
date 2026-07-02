/**
 * Обычный <select> для фильтра, со стилем, общим для обеих страниц.
 * Заменяет ранее использовавшийся в Events.jsx кастомный паттерн
 * "кнопка + абсолютно спозиционированный список с radio-инпутами" —
 * нативный select даёт то же самое (клавиатура, скринридеры, мобильные
 * пикеры) бесплатно, без своего стейта на открытие/закрытие.
 *
 * @param {string} label - подпись над полем
 * @param {string} value
 * @param {(value: string) => void} onChange
 * @param {{ value: string, label: string }[]} options - без опции "Все ..." — она добавляется автоматически
 * @param {string} allLabel - текст для опции "сбросить фильтр" (например "Все года")
 */
export default function FilterSelect({ label, value, onChange, options, allLabel, disabled = false, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-old-money-700 dark:text-old-money-400 mb-2">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-12 px-4 py-3 bg-white dark:bg-charcoal-800 border-2 border-old-money-300 dark:border-charcoal-600 rounded-xl text-old-money-800 dark:text-charcoal-200 focus:ring-2 focus:ring-gold-400 dark:focus:ring-camel-600 focus:border-transparent transition-all duration-300 dark:[color-scheme:dark]"
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-gray-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
