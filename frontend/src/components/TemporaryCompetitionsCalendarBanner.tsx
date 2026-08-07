import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Icons } from '../lib/icons'
import { usePublicCalendarVisible } from '../hooks/useStaticData'

const STORAGE_KEY = 'cs-dismiss-competitions-calendar-temp-notice'

/**
 * Плашка под шапкой на /competitions?tab=calendar:
 * раздел временно на нашем сайте, пока procoursing.ru недоступен.
 * Закрытие сохраняется в localStorage.
 */
export default function TemporaryCompetitionsCalendarBanner() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const calendarVisible = usePublicCalendarVisible('competitions')
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  const onCalendarTab =
    location.pathname === '/competitions' &&
    (searchParams.get('tab') || 'ranking') === 'calendar'
  const visible = calendarVisible && onCalendarTab && !dismissed

  if (!visible) return null

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  return (
    <div
      role="status"
      className="border-b border-camel-300/80 bg-camel-100/95 text-charcoal-800 dark:border-camel-700/60 dark:bg-charcoal-800 dark:text-charcoal-100"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-3 py-2.5 sm:items-center sm:px-4 md:px-6 lg:px-8">
        <p className="min-w-0 flex-1 text-sm leading-snug">
          Календарь соревнований временно размещён на Coursing Stats, пока{' '}
          <a
            href="http://procoursing.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-camel-800 underline decoration-camel-500/50 underline-offset-2 hover:text-camel-700 dark:text-camel-300 dark:hover:text-camel-200"
          >
            procoursing.ru
          </a>{' '}
          недоступен.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-charcoal-600 transition-colors hover:bg-camel-200/80 hover:text-charcoal-900 dark:text-charcoal-300 dark:hover:bg-charcoal-700 dark:hover:text-charcoal-50"
          aria-label="Закрыть предупреждение"
        >
          <Icons.close className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  )
}
