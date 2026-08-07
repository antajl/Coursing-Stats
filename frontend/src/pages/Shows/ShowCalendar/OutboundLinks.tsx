import type { ShowRkfCalendarEntry } from '../../../lib/staticData'
import { resolveRkfOnlineExhibitionUrl } from '../../../lib/rkfLinks'

/** Equal-width paired text buttons: Источник + Отчёт (or muted empty label). */
const OUTBOUND_BTN =
  'relative z-10 inline-flex h-5 w-[6.75rem] shrink-0 items-center justify-center whitespace-nowrap rounded-md text-[11px] font-medium leading-none'
export const OUTBOUND_BTN_LINK = `${OUTBOUND_BTN} bg-old-money-100/90 text-camel-700 transition-colors hover:bg-old-money-200/90 hover:text-camel-800 dark:bg-charcoal-700/90 dark:text-camel-400 dark:hover:bg-charcoal-600/90 dark:hover:text-camel-300`
export const OUTBOUND_BTN_MUTED = `${OUTBOUND_BTN} text-charcoal-400 dark:text-charcoal-500`

export function exhibitionRkfUrl(exhibition: ShowRkfCalendarEntry): string {
  return (
    resolveRkfOnlineExhibitionUrl(exhibition.url, exhibition.id) ??
    `https://rkf.online/exhibitions/${exhibition.id}`
  )
}

export function OutboundLinks({
  rkfUrl,
  reportUrl,
  bisReportUrl,
  notStartedYet,
}: {
  rkfUrl: string
  reportUrl: string | null
  bisReportUrl: string | null
  notStartedYet: boolean
}) {
  const reportEmptyLabel = notStartedYet ? 'Ожидается' : 'Отчёта нет'

  return (
    <>
      <a
        href={rkfUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={OUTBOUND_BTN_LINK}
        title="Открыть на rkf.online"
        aria-label="Источник на rkf.online"
      >
        Источник
      </a>
      {reportUrl ? (
        <a
          href={reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={OUTBOUND_BTN_LINK}
          title="Открыть отчёт"
          aria-label="Открыть отчёт"
        >
          Отчёт
        </a>
      ) : (
        <span className={OUTBOUND_BTN_MUTED} aria-label={reportEmptyLabel}>
          {reportEmptyLabel}
        </span>
      )}
      {bisReportUrl && (
        <a
          href={bisReportUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={OUTBOUND_BTN_LINK}
          title="Открыть BIS отчёт"
          aria-label="Открыть BIS отчёт"
        >
          BIS
        </a>
      )}
    </>
  )
}
