import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ShowRkfCalendarEntry } from '../../../lib/staticData'
import {
  collectGroupRanks,
  formatChildHeading,
  formatNkpDisplay,
  type RkfCalendarGroup,
} from '../showCalendarGroup'
import { formatShowDate, isShowNotStartedYet } from '../showCalendarDate'
import { exhibitionRkfUrl, OutboundLinks } from './OutboundLinks'

const RANK_CHIP =
  'inline-flex h-5 shrink-0 items-center justify-center rounded-md bg-old-money-100/90 px-1.5 font-mono text-xs font-semibold text-charcoal-600'

function formatShowCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} выставок`
  if (mod10 === 1) return `${count} выставка`
  if (mod10 >= 2 && mod10 <= 4) return `${count} выставки`
  return `${count} выставок`
}

/** Подзаголовок mono: НКП или список пород. */
function monoSubtitle(exhibition: ShowRkfCalendarEntry): string | null {
  const nkp = exhibition.national_breed_club_name?.trim()
  if (nkp) return formatNkpDisplay(nkp)
  const breeds = exhibition.breeds?.trim()
  return breeds || null
}

function rankTokens(exhibition: ShowRkfCalendarEntry): string[] {
  const raw = exhibition.ranks || exhibition.rank || ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function rowSurfaceClass(isMulti: boolean, hasProtocol: boolean): string {
  if (isMulti) {
    return 'border border-camel-200/90 border-l-4 border-l-camel-600 bg-[#FDFBF7] hover:bg-camel-50/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
  }
  return hasProtocol
    ? 'border border-warm-blue-200/90 border-l-4 border-l-warm-blue-500 bg-warm-blue-50/50 hover:bg-warm-blue-100/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
    : 'border border-old-money-200 border-l-4 border-l-camel-300 bg-cream-50 hover:bg-camel-100/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
}

export interface ShowCalendarRowProps {
  group: RkfCalendarGroup
  expanded: boolean
  onToggleExpanded: (key: string) => void
}

export function ShowCalendarRow({
  group,
  expanded,
  onToggleExpanded,
}: ShowCalendarRowProps) {
  const navigate = useNavigate()
  const exhibition = group.representative
  const isMulti = group.children.length > 1
  const dateParts = formatShowDate(exhibition.date)
  const isLc = group.hasLc
  const hasProtocol = group.hasProtocol

  const singleLocalPath = (() => {
    if (isMulti) return null
    if (isLc && exhibition.lc_exhibition_id) {
      return `/shows/exhibition/${exhibition.lc_exhibition_id}`
    }
    if (exhibition.source === 'rkf' && exhibition.id) {
      return `/shows/exhibition/${exhibition.id}`
    }
    return null
  })()

  const rkfUrl = exhibitionRkfUrl(exhibition)
  const reportUrl = exhibition.reports_link?.trim() || null
  const bisReportUrl = exhibition.bis_reports_link?.trim() || null
  const notStartedYet = isShowNotStartedYet(exhibition.date)
  const place = exhibition.city || exhibition.location || ''
  const subtitle = isMulti ? null : monoSubtitle(exhibition)
  const ranks = isMulti ? collectGroupRanks(group.children) : rankTokens(exhibition)

  const openReport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const onRowActivate = () => {
    if (isMulti) {
      onToggleExpanded(group.key)
      return
    }
    if (singleLocalPath) {
      navigate(singleLocalPath)
    } else if (reportUrl) {
      openReport()
    }
  }

  const interactive = isMulti || Boolean(singleLocalPath) || Boolean(reportUrl)

  return (
    <div className="mb-2">
      <div
        role={interactive ? (isMulti ? 'button' : 'link') : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-expanded={isMulti ? expanded : undefined}
        aria-label={
          isMulti
            ? `${expanded ? 'Свернуть' : 'Развернуть'} группу: ${exhibition.title}`
            : singleLocalPath
              ? `Открыть результаты: ${exhibition.title}`
              : undefined
        }
        onClick={interactive ? onRowActivate : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRowActivate()
                }
              }
            : undefined
        }
        className={`group flex flex-col sm:grid sm:grid-cols-[5rem_minmax(0,1fr)_auto] items-start sm:items-center gap-2 sm:gap-4 rounded-lg p-3 sm:py-2.5 transition-all ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        } ${rowSurfaceClass(isMulti, hasProtocol)}`}
      >
        {/* Date + Title / Details container */}
        <div className="flex items-start sm:contents w-full gap-3">
          {/* Date Column */}
          <div className="w-[4.5rem] sm:w-[5rem] shrink-0 pt-0.5 sm:pt-0 text-sm leading-tight text-charcoal-800">
            {dateParts ? (
              <span className="block whitespace-nowrap font-semibold tabular-nums">
                {dateParts}
              </span>
            ) : (
              '—'
            )}
          </div>

          {/* Main Info Column */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Multi-indicator pill on left of title */}
              {isMulti && (
                <span className="inline-flex items-center gap-1 rounded bg-camel-200/80 px-2 py-0.5 text-[11px] font-semibold text-camel-900 border border-camel-300">
                  {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  <span>{formatShowCount(group.children.length)}</span>
                </span>
              )}

              {/* Single Protocol Badge for desktop */}
              {!isMulti && singleLocalPath && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-warm-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-warm-blue-800 border border-warm-blue-200">
                  Протокол
                </span>
              )}

              <span
                className={`min-w-0 leading-[1.3em] text-[13.5px] font-semibold ${
                  singleLocalPath
                    ? 'text-charcoal-900 group-hover:text-warm-blue-700 transition-colors'
                    : isMulti
                      ? 'text-charcoal-900 group-hover:text-camel-800 transition-colors'
                      : 'text-charcoal-900'
                }`}
              >
                {exhibition.title}
              </span>

              {ranks.length > 0 && (
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  {ranks.slice(0, 4).map((rank) => (
                    <span key={rank} className={RANK_CHIP}>
                      {rank}
                    </span>
                  ))}
                  {ranks.length > 4 && (
                    <span className={RANK_CHIP}>
                      +{ranks.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            {subtitle && (
              <div className="mt-0.5 truncate text-xs font-medium text-charcoal-700">
                {subtitle}
              </div>
            )}
            {(place || exhibition.club) && (
              <div className="mt-0.5 truncate text-xs text-charcoal-500">
                {[place, exhibition.club].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Action Rows */}
        {isMulti && (
          <div className="w-full sm:hidden mt-1 pt-1.5 border-t border-camel-200/60">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpanded(group.key)
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-md bg-camel-100/90 py-1.5 text-xs font-semibold text-camel-900 border border-camel-200/90 active:bg-camel-200 transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{expanded ? 'Свернуть список' : `Показать ${formatShowCount(group.children.length)}`}</span>
            </button>
          </div>
        )}

        {!isMulti && (
          <div className="w-full sm:hidden mt-1 pt-1.5 border-t border-old-money-200/60 flex flex-wrap items-center justify-between gap-1.5">
            {singleLocalPath ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(singleLocalPath)
                }}
                className="inline-flex items-center gap-1 rounded-md bg-warm-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm active:bg-warm-blue-700 transition-colors"
              >
                <span>Протокол</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              <OutboundLinks
                rkfUrl={rkfUrl}
                reportUrl={reportUrl}
                bisReportUrl={bisReportUrl}
                notStartedYet={notStartedYet}
              />
            </div>
          </div>
        )}

        {/* Desktop Action Column (Right) */}
        <div className="hidden sm:flex shrink-0 flex-col items-end justify-center gap-1.5 self-stretch pl-4 border-l border-old-money-200/80 min-w-[9.5rem]">
          {isMulti ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpanded(group.key)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-camel-300 bg-camel-100/80 px-3 py-1 text-xs font-semibold text-camel-900 shadow-sm hover:bg-camel-200/90 active:bg-camel-300 transition-colors"
            >
              <span>{expanded ? 'Свернуть' : 'Развернуть'}</span>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          ) : singleLocalPath ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(singleLocalPath)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-warm-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-warm-blue-700 active:bg-warm-blue-800 transition-colors"
              >
                <span>Протокол</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-1">
                <OutboundLinks
                  rkfUrl={rkfUrl}
                  reportUrl={reportUrl}
                  bisReportUrl={bisReportUrl}
                  notStartedYet={notStartedYet}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <OutboundLinks
                rkfUrl={rkfUrl}
                reportUrl={reportUrl}
                bisReportUrl={bisReportUrl}
                notStartedYet={notStartedYet}
              />
            </div>
          )}
        </div>
      </div>

      {/* Expanded Multi-exhibitions List */}
      {expanded ? (
        <ul className="mt-1 mb-2 ml-2 sm:ml-[5.5rem] space-y-1.5 border-l-2 border-camel-300 pl-2 sm:pl-3">
          {group.children.map((child) => {
            const childRkf = exhibitionRkfUrl(child)
            const childReport = child.reports_link?.trim() || null
            const childBisReport = child.bis_reports_link?.trim() || null
            const childNotStarted = isShowNotStartedYet(child.date)
            const childLcPath =
              child.has_lc_protocol && child.lc_exhibition_id
                ? `/shows/exhibition/${child.lc_exhibition_id}`
                : child.source === 'rkf' && child.id
                  ? `/shows/exhibition/${child.id}`
                  : null
            const childRanks = rankTokens(child)
            const childHeading = formatChildHeading(child)

            const handleChildClick = () => {
              if (childLcPath) {
                navigate(childLcPath)
              } else if (childReport) {
                window.open(childReport, '_blank', 'noopener,noreferrer')
              }
            }

            const childInteractive = Boolean(childLcPath || childReport)

            return (
              <li
                key={child.id}
                role={childInteractive ? 'button' : undefined}
                tabIndex={childInteractive ? 0 : undefined}
                onClick={childInteractive ? handleChildClick : undefined}
                onKeyDown={
                  childInteractive
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleChildClick()
                        }
                      }
                    : undefined
                }
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-old-money-200/80 bg-white/90 p-2.5 text-xs transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                  childInteractive ? 'cursor-pointer hover:border-camel-300 hover:bg-camel-50/50' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-charcoal-900">
                      {childHeading}
                    </span>
                    {childRanks.length > 0 && (
                      <span className="font-mono text-[11px] text-charcoal-500">
                        {childRanks.join(', ')}
                      </span>
                    )}
                  </div>
                  {child.club && (
                    <div className="text-[11px] text-charcoal-500 mt-0.5 truncate">
                      {child.club}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5 self-start sm:self-auto">
                  {childLcPath && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(childLcPath)
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-warm-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm hover:bg-warm-blue-700 active:bg-warm-blue-800 transition-colors"
                    >
                      <span>Протокол</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                  <OutboundLinks
                    rkfUrl={childRkf}
                    reportUrl={childReport}
                    bisReportUrl={childBisReport}
                    notStartedYet={childNotStarted}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
