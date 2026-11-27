import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, X, ArrowRight } from 'lucide-react'

const DISMISS_STORAGE_KEY = 'cs_2027_notify_banner_dismissed'

function readInitiallyDismissed(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(DISMISS_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Ненавязчивый интерактивный баннер на странице сезона 2027 с предложением
 * включить уведомления об изменениях графика и статуса согласования в РКФ Трекере.
 */
export function Season2027NotifyBanner() {
  const [dismissed, setDismissed] = useState(readInitiallyDismissed)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, '1')
    } catch {
      // ignore storage errors in private mode
    }
  }

  return (
    <div
      role="region"
      aria-label="Уведомления о сезоне 2027"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-camel-300/80 bg-cream-100/90 px-4 py-3 shadow-2xs"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-camel-300/80 bg-white text-camel-700">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-xs sm:text-[13px] font-semibold text-charcoal-900">
            Уведомления об изменениях графика 2027
          </div>
          <p className="text-[11.5px] sm:text-xs text-charcoal-600 leading-snug mt-0.5">
            График обновляется по мере согласования клубами в РКФ. Подпишитесь на нужные турниры в Трекере, чтобы получать уведомления при переносах и утверждении.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Link
          to="/tracker/?tab=competitions"
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-camel-700 hover:bg-camel-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors no-underline"
        >
          <span>Настроить в Трекере</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal-500 hover:bg-cream-200/70 hover:text-charcoal-800 transition-colors cursor-pointer"
          aria-label="Скрыть подсказку"
          title="Скрыть подсказку"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
