import { Link } from 'react-router-dom'
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import PlacementMedalBadge from '../../../components/PlacementMedalBadge'
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
  return (
    <div className="transition-colors hover:bg-cream-50/60">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 cursor-pointer min-h-[44px]"
        aria-expanded={isExpanded}
      >
        {/* Левая часть: Название, площадки, победы и дельта */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-semibold text-charcoal-900 text-xs sm:text-sm truncate" title={org.org_name}>
              {org.short_name}
            </span>
            <span className="text-[11px] text-charcoal-400 font-normal shrink-0">
              {org.starts_count} сост.
            </span>
            {org.locations.length > 0 && (
              <span className="text-[11px] text-charcoal-400 shrink-0">
                · {org.locations.join(', ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-[11px] leading-tight flex-wrap text-charcoal-600">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-charcoal-500 mr-0.5">места:</span>
              {(org.placements && org.placements.length > 0
                ? org.placements.slice(0, 5)
                : []
              ).map((pl, idx) => (
                <PlacementMedalBadge key={idx} place={pl} size="xs" />
              ))}
              {org.placements && org.placements.length > 5 && (
                <span className="text-[10px] text-charcoal-400 font-normal">
                  +{org.placements.length - 5}
                </span>
              )}
            </div>

            <span className="text-old-money-300">•</span>

            <span className="text-charcoal-500">
              победы:{' '}
              <strong className="text-charcoal-800 font-semibold">
                {org.wins_count}
              </strong>{' '}
              из {org.starts_count}
            </span>

            <span className="text-old-money-300">•</span>

            {/* Дельта к карьере — чистый цветной текст */}
            {variant === 'higher' ? (
              <span className="font-medium text-forest-700">
                {org.delta_vs_career > 0
                  ? `+${org.delta_vs_career}% к ср.`
                  : '= ср. карьеры'}
              </span>
            ) : (
              <span className="font-medium text-rose-700">
                {org.wins_count === 0
                  ? 'без побед'
                  : `${org.delta_vs_career}% от ср.`}
              </span>
            )}
          </div>
        </div>

        {/* Правая часть: Чистый Win Rate и шеврон */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right tabular-nums">
            <div className={`text-xs sm:text-sm font-bold leading-tight ${variant === 'higher' ? 'text-forest-900' : 'text-charcoal-800'}`}>
              {org.win_rate}%
            </div>
            <div className="text-[9px] text-charcoal-400 uppercase tracking-wide leading-none mt-0.5">
              win rate
            </div>
          </div>

          <div className="text-charcoal-400 ml-1">
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden />
            )}
          </div>
        </div>
      </button>

      {/* Раскрывающийся список турниров с прямыми кликабельными ссылками на протоколы */}
      {isExpanded && (
        <div className="border-t border-old-money-100 bg-cream-50/70 p-2.5 sm:p-3 space-y-1.5 text-xs">
          <div className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider px-1">
            Состязания в этой организации (кликните для перехода в протокол):
          </div>
          {org.events.map((ev, eIdx) => {
            const isWin = ev.placement === 1
            return (
              <Link
                key={eIdx}
                to={`/event/${ev.event_id}/`}
                className={`group flex items-center justify-between gap-2.5 p-2 rounded-lg border transition-colors shadow-2xs ${
                  isWin
                    ? 'bg-amber-50/70 hover:bg-amber-50 border-amber-200/90'
                    : 'bg-white/90 hover:bg-white border-old-money-200/70'
                }`}
                title="Открыть протокол состязания"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate flex items-center gap-1.5">
                    {isWin && (
                      <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden />
                    )}
                    <span className="truncate">{ev.title}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-camel-600 shrink-0" aria-hidden />
                  </div>
                  <div className="text-[10px] text-charcoal-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{ev.date}</span>
                    {ev.location && <span>· {ev.location}</span>}
                    {ev.total_score != null && (
                      <span className="text-charcoal-600 font-medium">
                        · {ev.total_score} б.
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {ev.placement ? (
                    <div className="flex items-center gap-1.5 justify-end">
                      <PlacementMedalBadge place={ev.placement} size="xs" />
                      <span className="text-[11px] font-semibold text-charcoal-700 tabular-nums">
                        {ev.placement}-е место
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-charcoal-400">б/м</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
