import { Link } from 'react-router-dom'
import { ChevronDown, MapPin, ExternalLink } from 'lucide-react'
import { PlacementMedalBadge } from '../../../components/PlacementMedalBadge'
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
  const deltaSign = org.delta_to_career > 0 ? `+${org.delta_to_career}%` : `${org.delta_to_career}%`

  return (
    <div className="transition-colors">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
        className="px-3.5 py-2.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-cream-50/70 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-charcoal-900 leading-snug">
              {org.display_name}
            </span>
            {org.location && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-charcoal-500 font-normal">
                <MapPin className="w-3 h-3 text-charcoal-400 shrink-0" aria-hidden />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{org.location}</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>
              {org.starts_count} {org.starts_count === 1 ? 'старт' : org.starts_count < 5 ? 'старта' : 'стартов'}
            </span>
            <span>•</span>
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
            className={`w-4 h-4 text-charcoal-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-charcoal-700' : ''
            }`}
            aria-hidden
          />
        </div>
      </div>

      {isExpanded && org.starts.length > 0 && (
        <div className="px-3.5 sm:px-4 py-2 border-t border-old-money-100/70 bg-cream-50/40 space-y-1.5 animate-in fade-in duration-150">
          {org.starts.map((start, idx) => {
            const hasPlace = start.placement !== null && start.placement !== undefined
            const eventLink = start.event_id ? `/competitions/${start.event_id}` : null

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 py-1 text-xs text-charcoal-700"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {hasPlace ? (
                    <PlacementMedalBadge placement={start.placement} size="sm" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-cream-200/80 text-[10px] font-bold text-charcoal-600 flex items-center justify-center shrink-0">
                      -
                    </span>
                  )}
                  <span className="font-medium text-charcoal-900 truncate">
                    {start.event_title || 'Состязание'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-charcoal-500 text-[11px] tabular-nums">
                  {start.date && <span>{start.date}</span>}
                  {start.score ? <span>{start.score} б.</span> : null}
                  {eventLink && (
                    <Link
                      to={eventLink}
                      className="p-1 text-camel-700 hover:text-camel-950 transition-colors"
                      title="Открыть протокол состязания"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
