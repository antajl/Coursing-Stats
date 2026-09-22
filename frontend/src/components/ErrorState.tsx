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
      <circle cx="40" cy="40" r="30" className="stroke-terracotta-200" strokeWidth="2"/>
      <path d="M40 25 L40 40 M40 50 L40 55" className="stroke-terracotta-500" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
};

export default function ErrorState({ title = 'Произошла ошибка', message = '', onRetry = null, action = null, icon = 'default' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 opacity-70">{ICONS[icon] || ICONS.default}</div>
      <h3 className="text-xl font-bold text-terracotta-700 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-old-money-700 max-w-sm leading-relaxed mb-6">{message}</p>
      )}
      <div className="flex gap-3 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-xl border-2 border-camel-300 bg-white px-4 py-2 text-sm font-semibold text-camel-700 transition-all hover:bg-camel-50 hover:border-camel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2"
          >
            Повторить
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
