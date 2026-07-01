/**
 * Компонент для отображения состояния ошибки
 * 
 * @param {string} title - Заголовок ошибки
 * @param {string} message - Сообщение об ошибке
 * @param {() => void} onRetry - Функция для повтора действия
 * @param {React.ReactNode} action - Опциональное кастомное действие
 */
const ICONS = {
  default: (
    <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
      <circle cx="40" cy="40" r="30" className="stroke-terracotta-200 dark:stroke-terracotta-700" strokeWidth="2"/>
      <path d="M40 25 L40 40 M40 50 L40 55" className="stroke-terracotta-500 dark:stroke-terracotta-400" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
};

export default function ErrorState({ title = 'Произошла ошибка', message = '', onRetry = null, action = null, icon = 'default' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 opacity-70">{ICONS[icon] || ICONS.default}</div>
      <h3 className="text-xl font-bold text-terracotta-700 dark:text-terracotta-400 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-old-money-700 dark:text-old-money-300 max-w-sm leading-relaxed mb-6">{message}</p>
      )}
      <div className="flex gap-3 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-300 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-900"
          >
            Повторить
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
