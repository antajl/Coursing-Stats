import type { ReactNode } from 'react'
import RKFAttribution from './RKFAttribution'
import DoninoAttribution from './DoninoAttribution'

export type SectionFooterSource = 'procoursing' | 'rkf' | 'donino' | 'multi'

interface SectionFooterProps {
  source?: SectionFooterSource
  disclaimer?: string
  note?: ReactNode
  className?: string
}

/**
 * Единый подвал / атрибуция источника для разделов CoursingStats.
 */
export function SectionFooter({
  source,
  disclaimer,
  note,
  className = '',
}: SectionFooterProps) {
  return (
    <footer
      className={`mt-8 rounded-xl border border-old-money-100 bg-cream-50/40 px-4 py-3 text-center sm:text-left ${className}`.trim()}
    >
      {disclaimer && (
        <p className="text-[11px] sm:text-xs leading-relaxed text-charcoal-500">
          {disclaimer}
        </p>
      )}
      {(source || note) && (
        <div
          className={`flex flex-wrap items-center justify-center sm:justify-between gap-2 text-[11px] text-charcoal-500 ${
            disclaimer ? 'mt-2 pt-2 border-t border-old-money-100/80' : ''
          }`.trim()}
        >
          {source === 'rkf' && <RKFAttribution variant="inline" />}
          {source === 'donino' && <DoninoAttribution variant="inline" />}
          {source === 'procoursing' && (
            <p className="inline-flex items-center gap-1.5">
              <span>Источник:</span>
              <a
                href="https://procoursing.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline"
              >
                ProCoursing.ru и протоколы организаторов
              </a>
            </p>
          )}
          {source === 'multi' && (
            <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Источники:</span>
              <a
                href="https://procoursing.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline"
              >
                ProCoursing.ru
              </a>
              <span className="text-old-money-300" aria-hidden>
                ·
              </span>
              <a
                href="https://rkf.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline"
              >
                Портал РКФ
              </a>
              <span className="text-old-money-300" aria-hidden>
                ·
              </span>
              <a
                href="https://runningdog.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-camel-700 underline-offset-2 hover:text-camel-800 hover:underline"
              >
                Курсинг Донино
              </a>
            </p>
          )}
          {note && <span>{note}</span>}
        </div>
      )}
    </footer>
  )
}
