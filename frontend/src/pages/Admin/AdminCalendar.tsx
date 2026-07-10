import { Link } from 'react-router-dom'
import Events from '../Events'

export default function AdminCalendar() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <Link to="/admin" className="text-camel-600 hover:text-camel-700 dark:text-camel-400">
          ← Админ-панель
        </Link>
        <span className="text-charcoal-400 dark:text-charcoal-500">·</span>
        <span className="text-charcoal-500 dark:text-charcoal-400">Только локально (npm run dev)</span>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">
        Календарь и протоколы
      </h1>
      <Events />
    </div>
  )
}
