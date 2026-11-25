import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { localExhibitionPath } from '../../../lib/env'
import type { TitleEvidenceItem } from '../../../lib/cumulativeTitles'

export interface TitleEvidenceListProps {
  heading: string
  items: TitleEvidenceItem[]
  eventResultsUrls?: Record<string | number, string>
}

export function TitleEvidenceList({
  heading,
  items,
  eventResultsUrls = {},
}: TitleEvidenceListProps) {
  if (!items || items.length === 0) return null

  return (
    <div className="pt-2 border-t border-old-money-100/80 space-y-1">
      <div className="text-[11px] font-semibold text-charcoal-700">
        {heading} ({items.length}):
      </div>
      <div className="rounded-lg border border-old-money-200/80 bg-white/90 divide-y divide-old-money-100 overflow-hidden">
        {items.map((ev, idx) => {
          const href =
            ev.kind === 'sport' && ev.eventId
              ? eventResultsUrls[ev.eventId]
              : ev.kind === 'show' && ev.exhibitionId
                ? `${localExhibitionPath}/${ev.exhibitionId}`
                : undefined

          return (
            <div
              key={idx}
              className="px-2.5 py-1.5 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1 flex items-center gap-1.5">
                {ev.award && (
                  <span className="inline-flex shrink-0 rounded bg-cream-100 border border-old-money-200 px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-800 whitespace-nowrap leading-none">
                    {ev.award}
                  </span>
                )}
                {href ? (
                  <Link
                    to={href}
                    className="text-[11.5px] font-medium text-charcoal-900 hover:text-camel-800 hover:underline truncate inline-flex items-center gap-1 min-w-0 flex-1"
                    onClick={(e) => e.stopPropagation()}
                    title={ev.note ? `${ev.title} (${ev.note})` : ev.title}
                  >
                    <span className="truncate">{ev.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-camel-700" aria-hidden />
                  </Link>
                ) : (
                  <span
                    className="text-[11.5px] font-medium text-charcoal-800 truncate min-w-0 flex-1"
                    title={ev.note ? `${ev.title} (${ev.note})` : ev.title}
                  >
                    {ev.title}
                  </span>
                )}
              </div>
              {ev.date && (
                <span className="text-[10.5px] text-charcoal-400 tabular-nums shrink-0 leading-none">
                  {ev.date}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
