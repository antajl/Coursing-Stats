import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ShowRkfCalendarEntry } from '../../../lib/staticData'
import {
  collectGroupRanks,
  exhibitionHasProtocol,
  formatChildHeading,
  formatNkpDisplay,
  type RkfCalendarGroup,
} from '../showCalendarGroup'
import { formatShowDateParts } from '../showCalendarDate'

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
  const dateParts = formatShowDateParts(exhibition.date, exhibition.date_end)
  const isLc = group.hasLc
  const hasProtocol = group.hasProtocol

  const singleLocalPath = (() => {
    if (isMulti) return null
    if (isLc && exhibition.lc_exhibition_id) {
      return `/shows/exhibition/${exhibition.lc_exhibition_id}`
    }
    if (exhibition.source === 'rkf' && exhibition.id && hasProtocol) {
      return `/shows/exhibition/${exhibition.id}`
    }
    return null
  })()

  const reportUrl = exhibition.reports_link?.trim() || null
  const place = exhibition.city || exhibition.location || ''
  const subtitle = isMulti ? null : monoSubtitle(exhibition)
  const ranks = isMulti ? collectGroupRanks(group.children) : rankTokens(exhibition)
  const protocolsCount = group.children.filter(exhibitionHasProtocol).length
  const multiLabel = (() => {
    const total = formatShowCount(group.children.length)
    if (protocolsCount === 0) return total
    if (protocolsCount === group.children.length) {
      return `${total} · все с протоколом`
    }
    return `${total} · ${protocolsCount} с протоколом`
  })()

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
    <div data-list-item className="relative">
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
        className={`group block bg-transparent px-3 py-2.5 sm:px-4 sm:py-2.5 transition-colors duration-150 hover:bg-camel-100/60 ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[4.1rem_minmax(0,1fr)_11.5rem_8rem] md:grid-cols-[4.1rem_minmax(0,1fr)_13.5rem_8.5rem] items-center gap-3 sm:gap-4">
          {/* Колонка 1: Календарный блок даты */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-cream-50/90 border border-old-money-200/80 px-1.5 w-[3.7rem] sm:w-full py-1.5 shrink-0 text-center shadow-2xs gap-0.5">
            <span className="text-sm sm:text-[15px] font-bold text-charcoal-900 tabular-nums leading-none tracking-tight">
              {dateParts ? dateParts.dayLine : '—'}
            </span>
            <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider leading-none">
              {dateParts?.metaLine || ''}
            </span>
          </div>

          {/* Колонка 2: Название выставки + ранги + подзаголовок */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Плашка мульти-выставки */}
              {isMulti && (
                <span
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold border shrink-0 ${
                    protocolsCount > 0
                      ? 'bg-warm-blue-100 text-warm-blue-900 border-warm-blue-300'
                      : 'bg-camel-200/80 text-camel-900 border-camel-300'
                  }`}
                >
                  {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  <span className="sm:hidden">{formatShowCount(group.children.length)}</span>
                  <span className="hidden sm:inline">{multiLabel}</span>
                </span>
              )}

              <span
                className={`min-w-0 leading-[1.3em] text-[13.5px] sm:text-sm font-semibold truncate text-charcoal-900 group-hover:text-camel-800 transition-colors`}
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

            {/* На мобильных (< sm) локация и клуб выводятся под названием */}
            <div className="sm:hidden mt-1 flex flex-col gap-0.5 text-left">
              {place && (
                <div className="text-xs font-semibold text-charcoal-800 leading-tight">
                  {place}
                </div>
              )}
              {exhibition.club && exhibition.club !== place && (
                <div className="text-[11px] text-charcoal-500 leading-tight">
                  {exhibition.club}
                </div>
              )}
            </div>
          </div>

          {/* Колонка 3 (Десктоп): Локация и Клуб с идеальным вертикальным выравниванием */}
          <div className="hidden sm:flex flex-col justify-center min-w-0 pl-3.5 border-l border-old-money-200/70 text-left self-stretch">
            <span className="text-[9.5px] uppercase font-bold tracking-wider text-charcoal-400 mb-0.5">
              Локация
            </span>
            <span className="text-xs font-semibold text-charcoal-800 leading-tight truncate">
              {place || 'Локация не указана'}
            </span>
            {exhibition.club && exhibition.club !== place && (
              <span className="text-[11px] text-charcoal-500 mt-0.5 truncate" title={exhibition.club}>
                {exhibition.club}
              </span>
            )}
          </div>

          {/* Колонка 4 (Десктоп): Действие (Развернуть/Свернуть для групп, Результаты > для одиночных) */}
          <div className="hidden sm:flex items-center justify-end shrink-0 pl-3.5 border-l border-old-money-200/80 self-stretch">
            {isMulti ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpanded(group.key)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-camel-300 bg-camel-100/80 px-3 py-1.5 text-xs font-semibold text-camel-900 shadow-2xs hover:bg-camel-200/90 active:bg-camel-300 transition-colors"
              >
                <span>{expanded ? 'Свернуть' : 'Развернуть'}</span>
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            ) : singleLocalPath ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-camel-700 group-hover:text-camel-800 transition-colors">
                <span>Результаты</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            ) : reportUrl ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-charcoal-600 group-hover:text-charcoal-800 transition-colors">
                <span>Отчёт РКФ</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            ) : null}
          </div>
        </div>

        {/* Мобильный подвал карточки (< sm) */}
        {isMulti ? (
          <div className="w-full sm:hidden mt-2 pt-1.5 border-t border-camel-200/60">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpanded(group.key)
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-md bg-camel-100/90 py-1.5 text-xs font-semibold text-camel-900 border border-camel-200/90 active:bg-camel-200 transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{expanded ? 'Свернуть список' : `Показать ${multiLabel}`}</span>
            </button>
          </div>
        ) : (
          <div className="sm:hidden mt-2 pt-1.5 border-t border-old-money-200/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-charcoal-500 truncate">
              {place || exhibition.club || ''}
            </span>
            {singleLocalPath ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-camel-700 shrink-0 ml-auto">
                <span>Результаты</span>
                <ChevronRight className="h-3 w-3" />
              </span>
            ) : reportUrl ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-charcoal-600 shrink-0 ml-auto">
                <span>Отчёт РКФ</span>
                <ChevronRight className="h-3 w-3" />
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Развёрнутый список мульти-выставки (спокойный, без тяжелых рамок и избыточных кнопок) */}
      {expanded ? (
        <ul className="my-1.5 sm:my-2 ml-4 sm:ml-[4.8rem] mr-2 sm:mr-4 border-l-2 border-camel-300/80 pl-3 sm:pl-4 py-1 space-y-1">
          {group.children.map((child) => {
            const childReport = child.reports_link?.trim() || null
            const childHasProtocol = exhibitionHasProtocol(child)
            const childLcPath =
              child.has_lc_protocol && child.lc_exhibition_id
                ? `/shows/exhibition/${child.lc_exhibition_id}`
                : child.source === 'rkf' && child.id && childHasProtocol
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
                className={`group/child flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md transition-colors ${
                  childInteractive ? 'cursor-pointer hover:bg-camel-100/70' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-charcoal-900 group-hover/child:text-camel-800 transition-colors">
                      {childHeading}
                    </span>
                    {childRanks.length > 0 && (
                      <span className="font-mono text-[11px] text-charcoal-500">
                        {childRanks.join(', ')}
                      </span>
                    )}
                  </div>
                  {child.club && (
                    <div className="text-[11px] text-charcoal-500 truncate">
                      {child.club}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center">
                  {childLcPath ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-camel-700 group-hover/child:text-camel-800 transition-colors">
                      <span>Результаты</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/child:translate-x-0.5" />
                    </span>
                  ) : childReport ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-charcoal-500">
                      <span>Отчёт</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
