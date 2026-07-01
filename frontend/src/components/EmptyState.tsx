/**
 * Компонент для отображения пустого состояния (нет данных)
 * 
 * @param {string} title - Заголовок сообщения
 * @param {string} description - Описание сообщения
 * @param {React.ReactNode} action - Опциональное действие (кнопка и т.д.)
 */
const ICONS = {
  default: (
    <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
      <circle cx="40" cy="40" r="30" className="stroke-old-money-200 dark:stroke-old-money-700" strokeWidth="2"/>
      <path d="M28 40 Q40 28 52 40 Q40 52 28 40" className="stroke-camel-300 dark:stroke-camel-600" strokeWidth="2" fill="none"/>
    </svg>
  ),
};

export default function EmptyState({ title = 'Нет данных', description = '', action = null, icon = 'default' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 opacity-70">{ICONS[icon] || ICONS.default}</div>
      <h3 className="text-xl font-bold text-charcoal-800 dark:text-charcoal-100 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-old-money-700 dark:text-old-money-300 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
