/**
 * Компонент для отображения пустого состояния (нет данных)
 */

const ICONS = {
  default: (
    <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none" aria-hidden>
      <circle cx="40" cy="40" r="36" className="fill-camel-100/80 dark:fill-camel-900/35" />
      <rect
        x="21"
        y="25"
        width="38"
        height="34"
        rx="5"
        className="fill-cream-50 stroke-camel-500 dark:fill-charcoal-800 dark:stroke-camel-400"
        strokeWidth="1.75"
      />
      <rect x="21" y="25" width="38" height="9" rx="5" className="fill-camel-300/70 dark:fill-camel-700/80" />
      <path d="M21 34h38" className="stroke-camel-500 dark:stroke-camel-400" strokeWidth="1.75" />
      <path
        d="M30 21v7M50 21v7"
        className="stroke-camel-600 dark:stroke-camel-300"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <circle cx="29" cy="42" r="2" className="fill-old-money-300 dark:fill-old-money-600" />
      <circle cx="40" cy="42" r="2" className="fill-old-money-300 dark:fill-old-money-600" />
      <circle cx="51" cy="42" r="2" className="fill-old-money-200 dark:fill-old-money-700" opacity="0.45" />
      <circle cx="29" cy="51" r="2" className="fill-old-money-200 dark:fill-old-money-700" opacity="0.45" />
      <circle cx="40" cy="51" r="2" className="fill-old-money-200 dark:fill-old-money-700" opacity="0.45" />
      <circle cx="51" cy="51" r="2" className="fill-old-money-200 dark:fill-old-money-700" opacity="0.35" />
      <circle
        cx="55"
        cy="55"
        r="8"
        className="fill-cream-50/90 stroke-charcoal-500 dark:fill-charcoal-800/90 dark:stroke-charcoal-400"
        strokeWidth="2"
      />
      <path
        d="M61 61l6 6"
        className="stroke-charcoal-500 dark:stroke-charcoal-400"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  ),
};

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: keyof typeof ICONS
}

export default function EmptyState({
  title = 'Нет данных',
  description = '',
  action = null,
  icon = 'default',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6">{ICONS[icon] || ICONS.default}</div>
      <h3 className="mb-2 text-xl font-bold text-charcoal-800 dark:text-charcoal-100">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-relaxed text-old-money-700 dark:text-old-money-300">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
