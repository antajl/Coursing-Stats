import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ShowRkfCalendarEntry } from '../../../lib/staticData'
import {
  collectGroupRanks,
  formatNkpDisplay,
  type RkfCalendarGroup,
} from '../showCalendarGroup'
import { formatShowDate, isShowNotStartedYet } from '../showCalendarDate'
import { exhibitionRkfUrl, OutboundLinks } from './OutboundLinks'

const RANK_CHIP =
  'inline-flex h-5 shrink-0 items-center justify-center rounded-md bg-old-money-100/90 px-1.5 font-mono text-xs font-semibold text-charcoal-600 dark:bg-charcoal-700/90 dark:text-charcoal-200'

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

function rowSurfaceClass(hasProtocol: boolean): string {
  return hasProtocol
    ? 'border border-warm-blue-200 dark:border-warm-blue-800 border-l-4 border-l-warm-blue-500 dark:border-l-warm-blue-400 bg-warm-blue-50/60 dark:bg-warm-blue-900/30 hover:bg-warm-blue-100/80 dark:hover:bg-warm-blue-900/40'
    : 'border border-old-money-200 dark:border-charcoal-600 border-l-4 border-l-camel-500 bg-cream-50 dark:bg-charcoal-800 hover:bg-camel-100 dark:hover:bg-charcoal-700'
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
    // LC exhibitions with protocol
    if (isLc && exhibition.lc_exhibition_id) {
      return `/shows/exhibition/${exhibition.lc_exhibition_id}`
    }
    // RKF exhibitions (now in Turso) - always link to local detail page
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

  const titleClass = singleLocalPath
    ? 'min-w-0 truncate leading-[1.3em] text-[13.5px] font-semibold text-charcoal-900 dark:text-charcoal-100 group-hover:text-camel-700 dark:group-hover:text-camel-300'
    : 'min-w-0 truncate leading-[1.3em] text-[13.5px] font-semibold text-charcoal-900 dark:text-charcoal-100'

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
    <div className="mb-1.5">
      <div
        role={interactive ? (isMulti ? 'button' : 'link') : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-expanded={isMulti ? expanded : undefined}
        aria-label={
          isMulti
            ? `${expanded ? 'Свернуть' : 'Развернуть'} варианты: ${exhibition.title}`
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
        className={`group grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[5rem_minmax(0,1fr)_7.75rem] items-center gap-3 sm:gap-4 rounded-lg px-3 py-2.5 sm:px-3 sm:py-2.5 transition-colors ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        } ${rowSurfaceClass(hasProtocol)}`}
      >
        <div className="w-[4.75rem] shrink-0 self-center text-sm leading-tight text-charcoal-800 dark:text-charcoal-100 sm:w-[5rem]">
          {dateParts ? (
            <span className="block whitespace-nowrap font-semibold tabular-nums">
              {dateParts}
            </span>
          ) : (
            '—'
          )}
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            {isMulti ? (
              <ChevronRight
                className={`h-3.5 w-3.5 shrink-0 text-charcoal-500 transition-transform dark:text-charcoal-300 ${
                  expanded ? 'rotate-90' : ''
                }`}
                aria-hidden
              />
            ) : null}
            <span className={titleClass}>{exhibition.title}</span>
            {ranks.length > 0 && (
              <div className="flex shrink-0 flex-wrap items-center gap-1">
                {ranks.map((rank) => (
                  <span key={rank} className={RANK_CHIP}>
                    {rank}
                  </span>
                ))}
              </div>
            )}
          </div>
          {subtitle && (
            <div className="mt-0.5 truncate text-xs font-medium text-charcoal-700 dark:text-charcoal-200">
              {subtitle}
            </div>
          )}
          {(place || exhibition.club) && (
            <div className="mt-0.5 truncate text-xs text-charcoal-500 dark:text-charcoal-300">
              {[place, exhibition.club].filter(Boolean).join(' · ')}
            </div>
          )}
          {/* Mobile: outbound links only for single rows (multi → children). */}
          {!isMulti && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:hidden">
              <OutboundLinks
                rkfUrl={rkfUrl}
                reportUrl={reportUrl}
                bisReportUrl={bisReportUrl}
                notStartedYet={notStartedYet}
              />
            </div>
          )}
          {isMulti && (
            <div className="mt-1 text-[11px] text-charcoal-500 dark:text-charcoal-400 sm:hidden">
              {group.children.length} НКП · нажмите, чтобы{' '}
              {expanded ? 'свернуть' : 'развернуть'}
            </div>
          )}
        </div>

        <div className="hidden sm:flex w-[7.75rem] shrink-0 flex-col items-end justify-center gap-1 self-stretch pl-3 border-l border-old-money-200/80 dark:border-charcoal-600/80">
          {!isMulti ? (
            <OutboundLinks
              rkfUrl={rkfUrl}
              reportUrl={reportUrl}
              bisReportUrl={bisReportUrl}
              notStartedYet={notStartedYet}
            />
          ) : (
            <span className="w-full whitespace-nowrap text-right text-[11px] leading-tight text-charcoal-500 dark:text-charcoal-400">
              {group.children.length} НКП
            </span>
          )}
        </div>
      </div>

      {expanded ? (
        <ul className="mt-0.5 mb-1 ml-[4.75rem] sm:ml-[5rem] space-y-0.5 border-l border-old-money-200/80 pl-3 dark:border-charcoal-600/80">
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
            const nkpLabel = formatNkpDisplay(
              child.national_breed_club_name?.trim() || child.breeds?.trim() || '',
            )
            const childRanks = rankTokens(child)
            const childHeading =
              nkpLabel !== 'НКП'
                ? nkpLabel
                : childRanks.length > 0
                  ? childRanks.join(', ')
                  : `ID ${child.id}`

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
                className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md px-2.5 py-1.5 text-xs ${
                  child.has_lc_protocol
                    ? 'bg-warm-blue-50/70 dark:bg-warm-blue-900/25'
                    : 'bg-cream-50/80 dark:bg-charcoal-800/60'
                } ${childInteractive ? 'cursor-pointer hover:bg-camel-100 dark:hover:bg-charcoal-700' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-charcoal-800 dark:text-charcoal-100">
                    {childHeading}
                  </span>
                  {nkpLabel !== 'НКП' && childRanks.length > 0 ? (
                    <span className="ml-2 text-[11px] text-charcoal-500 dark:text-charcoal-400">
                      {childRanks.join(', ')}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
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
