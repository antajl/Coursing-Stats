/**
 * Компонент для отображения пустого состояния (нет данных)
 * 
 * @param {string} title - Заголовок сообщения
 * @param {string} description - Описание сообщения
 * @param {React.ReactNode} action - Опциональное действие (кнопка и т.д.)
 */
export default function EmptyState({ title = 'Нет данных', description = '', action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h3 className="text-xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-old-money-600 dark:text-old-money-400 mb-6 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
