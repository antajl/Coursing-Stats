import { Link } from 'react-router-dom'
import { ChevronDown, MapPin, ExternalLink } from 'lucide-react'
import { HistoryPlacement } from '../HistoryPlacement'
import { formatCompetitionsCount } from '../historyFormatters'
import type { DogOrgItem } from '../dogOrganizationsStats'

export interface DogOrganizationRowProps {
  org: DogOrgItem
  variant: 'higher' | 'lower'
  isExpanded: boolean
  onToggle: () => void
}

export function DogOrganizationRow({
  org,
  variant,
  isExpanded,
  onToggle,
}: DogOrganizationRowProps) {
  const isPositive = variant === 'higher'
  const deltaColor = isPositive ? 'text-forest-700 font-semibold' : 'text-rose-700 font-semibold'
  const deltaSign = org.delta_vs_career > 0 ? `+${org.delta_vs_career}%` : `${org.delta_vs_career}%`
  const locationText = org.locations.filter(Boolean).join(', ')

  return (
    <div className="transition-colors hover:bg-cream-50/60">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left min-h-[48px] px-3.5 py-2.5 sm:px-4 flex items-center justify-between gap-2.5 cursor-pointer select-none transition-colors touch-manipulation"
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-charcoal-900 leading-snug">
              {org.short_name || org.org_name}
            </span>
            {locationText && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-charcoal-500 font-normal">
                <MapPin className="w-3 h-3 text-charcoal-500 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{locationText}</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-charcoal-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{formatCompetitionsCount(org.starts_count)}</span>
            <span className="text-old-money-300">·</span>
            <span className="text-forest-800 font-medium">
              {org.wins_count} {org.wins_count === 1 ? 'победа' : org.wins_count < 5 ? 'победы' : 'побед'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs sm:text-sm font-bold text-charcoal-900 tabular-nums">
              {org.win_rate}%
            </div>
            <div className={`text-[10px] tabular-nums ${deltaColor}`}>
              {deltaSign} к карьере
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-charcoal-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-charcoal-700' : ''
            }`}
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      </button>

      {isExpanded && org.events.length > 0 && (
        <div className="px-3.5 sm:px-4 py-2.5 border-t border-old-money-200/80 bg-cream-50/55 animate-in fade-in duration-150">
          <div className="divide-y divide-old-money-200/80">
            {org.events.map((start, idx) => {
              const hasPlace = start.placement !== null && start.placement !== undefined
              const eventLink = start.event_id ? `/event/${start.event_id}/` : null
              const rowInner = (
                <>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {hasPlace ? (
                      <HistoryPlacement placement={start.placement} size="xs" />
                    ) : (
                      <span className="w-5 text-center text-[11px] font-semibold text-charcoal-500 shrink-0">
                        —
                      </span>
                    )}
                    <span className="font-medium text-charcoal-900 truncate">
                      {start.title || 'Состязание'}
                    </span>
                    {eventLink && (
                      <ExternalLink className="w-3 h-3 shrink-0 text-camel-700" strokeWidth={1.75} aria-hidden />
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-charcoal-600 text-[11px] tabular-nums">
                    {start.date && <span>{start.date}</span>}
                    {start.total_score ? <span className="font-semibold text-charcoal-800">{start.total_score} б.</span> : null}
                  </div>
                </>
              )

              return eventLink ? (
                <Link
                  key={idx}
                  to={eventLink}
                  className="min-h-[40px] sm:min-h-[34px] flex items-center justify-between gap-2 py-1.5 text-xs text-charcoal-800 hover:text-camel-800 transition-colors"
                  title="Открыть протокол состязания"
                >
                  {rowInner}
                </Link>
              ) : (
                <div
                  key={idx}
                  className="min-h-[40px] sm:min-h-[34px] flex items-center justify-between gap-2 py-1.5 text-xs text-charcoal-700"
                >
                  {rowInner}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
