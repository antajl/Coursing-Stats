/**
 * Компонент для отображения состояния ошибки
 * 
 * @param {string} title - Заголовок ошибки
 * @param {string} message - Сообщение об ошибке
 * @param {() => void} onRetry - Функция для повтора действия
 * @param {React.ReactNode} action - Опциональное кастомное действие
 */
export default function ErrorState({ title = 'Произошла ошибка', message = '', onRetry = null, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-old-money-600 dark:text-old-money-400 mb-6 max-w-md">{message}</p>
      )}
      <div className="flex gap-3 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-900"
          >
            Повторить
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
