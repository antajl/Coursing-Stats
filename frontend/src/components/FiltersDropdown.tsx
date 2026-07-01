import { useState, useRef, useEffect } from 'react'

/**
 * Единая кнопка + панель "Больше фильтров".
 *
 * Раньше Events.jsx и TopDogs.jsx каждый реализовывали кнопку, открытие/
 * закрытие панели и клик-вне-области отдельно и независимо друг от друга —
 * из-за этого они разошлись по виду (разная кнопка, разный/отсутствующий
 * заголовок панели, разный футер). Теперь это один компонент: страница
 * передаёт только содержимое полей (children) и обработчик сброса
 * (onReset), всё остальное — общее и не может разойтись в будущем.
 *
 * @param {React.ReactNode} children - содержимое полей фильтра, специфичное для страницы
 * @param {() => void} onReset - обработчик кнопки "Сбросить"
 * @param {string} [label] - текст на кнопке-триггере
 */
export default function FiltersDropdown({ children, onReset, label = 'Больше фильтров' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="filters-panel"
        aria-label="Расширенные фильтры"
        className={`h-12 px-5 py-3 border-2 rounded-xl hover:bg-old-money-50 dark:hover:bg-charcoal-700 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm font-medium flex items-center gap-2 ${
          open ? 'bg-camel-600 text-white border-camel-600' : 'bg-white dark:bg-charcoal-800 border-old-money-300 dark:border-charcoal-600 text-old-money-800 dark:text-charcoal-200'
        }`}
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div id="filters-panel" className="absolute right-0 mt-2 w-[320px] md:w-[600px] max-w-[calc(100vw-2rem)] bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl border-2 border-old-money-200 dark:border-charcoal-600 z-50 overflow-visible">
          <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-charcoal-800 dark:text-charcoal-100">Фильтры</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200 transition-colors"
                aria-label="Закрыть фильтры"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">{children}</div>
          </div>

          <div className="border-t-2 border-old-money-200 dark:border-charcoal-600 p-6">
            <div className="flex gap-3">
              <button
                onClick={onReset}
                className="flex-1 h-12 px-4 py-3 bg-old-money-100 dark:bg-charcoal-700 text-old-money-800 dark:text-charcoal-200 rounded-xl hover:bg-old-money-200 dark:hover:bg-charcoal-600 transition-colors font-medium"
              >
                Сбросить
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 h-12 px-4 py-3 bg-camel-600 dark:bg-camel-700 text-white rounded-xl hover:bg-camel-700 dark:hover:bg-camel-600 transition-colors font-medium"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
