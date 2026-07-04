interface ViewToggleProps {
  view: 'table' | 'stats'
  onViewChange: (view: 'table' | 'stats') => void
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const tabClass = (id: 'table' | 'stats') =>
    `flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
      view === id
        ? 'bg-camel-600 text-white shadow-md'
        : 'bg-cream-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600 hover:text-charcoal-900 dark:hover:text-charcoal-100'
    }`

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-gray-300">
      <button type="button" onClick={() => onViewChange('table')} className={tabClass('table')}>
        Таблица
      </button>
      <button type="button" onClick={() => onViewChange('stats')} className={tabClass('stats')}>
        Статистика
      </button>
    </div>
  )
}
