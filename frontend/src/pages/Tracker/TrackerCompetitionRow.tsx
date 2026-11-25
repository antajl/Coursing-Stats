import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ExternalLink, ChevronDown } from 'lucide-react';
import type { TrackerCompetition } from './trackerTypes';
import { formatDateParts, getCompetitionEventId } from './trackerCompetitionUtils';

interface TrackerCompetitionRowProps {
  comp: TrackerCompetition;
  isSubscribed: boolean;
  onToggleSubscribed: (id: string) => void;
  formatShortDate?: (raw: string) => string;
}

export function TrackerCompetitionRow({
  comp,
  isSubscribed,
  onToggleSubscribed,
}: TrackerCompetitionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isApproved = comp.status === 'APPROVED';
  const isDelayed = comp.status === 'DELAYED';
  const hasDetails = Boolean(
    comp.rank ||
      comp.location ||
      comp.discipline ||
      comp.reglament ||
      comp.judges ||
      comp.summary ||
      comp.decision ||
      comp.notes
  );

  const statusText = isApproved
    ? 'Утверждено'
    : isDelayed
    ? 'Задержано'
    : 'На согласовании';

  const { dayLine, monthLine } = formatDateParts(comp.dateRaw);
  const isChampRank = comp.rank.includes('ЧРКФ') || comp.rank.includes('ЧР');
  const eventId = comp.eventId || getCompetitionEventId(comp.id);

  return (
    <div className="transition-colors hover:bg-cream-100/50">
      <div
        onClick={() => hasDetails && setExpanded((prev) => !prev)}
        className={`grid grid-cols-[3.65rem_minmax(0,1fr)] sm:grid-cols-[3.8rem_minmax(0,1fr)_auto] items-start sm:items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px] text-xs ${
          hasDetails ? 'cursor-pointer' : ''
        }`}
      >
        {/* 1. Календарный блок даты */}
        <div className="flex flex-col items-center justify-center rounded-lg bg-cream-50/90 border border-old-money-200/80 px-1 py-1 w-[3.65rem] sm:w-[3.8rem] shrink-0 text-center shadow-2xs gap-0.5 mt-0.5 sm:mt-0">
          <span className="text-[13px] sm:text-[14.5px] font-bold text-charcoal-900 tabular-nums whitespace-nowrap leading-none tracking-tight">
            {dayLine}
          </span>
          <span className="text-[9.5px] font-semibold text-charcoal-500 uppercase tracking-wider leading-none">
            {monthLine}
          </span>
        </div>

        {/* 2. Название клуба (+ на мобильном сверху строка статуса и кнопок) */}
        <div className="min-w-0 pr-0 sm:pr-2">
          <div className="flex sm:hidden items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isApproved
                      ? 'bg-emerald-600 ring-2 ring-emerald-600/20'
                      : isDelayed
                      ? 'bg-rose-600 ring-2 ring-rose-600/20'
                      : 'bg-amber-600 ring-2 ring-amber-600/20'
                  }`}
                />
                <span
                  className={`text-xs font-semibold tracking-tight whitespace-nowrap ${
                    isApproved
                      ? 'text-emerald-900'
                      : isDelayed
                      ? 'text-rose-900 font-bold'
                      : 'text-amber-900'
                  }`}
                >
                  {statusText}
                </span>
              </div>

              {eventId && (
                <Link
                  to={`/event/${eventId}/`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-camel-800 bg-camel-100/80 hover:bg-camel-200 border border-camel-300/80 rounded px-1.5 py-0.5 shrink-0 no-underline"
                  title="Перейти к протоколу соревнований на сайте"
                >
                  <span>Протокол</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0 -mr-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSubscribed(comp.id);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isSubscribed
                    ? 'bg-amber-100 text-camel-800 border border-camel-400 shadow-2xs'
                    : 'text-charcoal-400 hover:text-camel-700 hover:bg-cream-100'
                }`}
                title={isSubscribed ? 'Отписаться от турнира' : 'Отслеживать состязание'}
                aria-label="Отслеживать"
              >
                <Bell className={`w-4 h-4 ${isSubscribed ? 'fill-camel-600 text-camel-800' : ''}`} />
              </button>
              {hasDetails && (
                <ChevronDown
                  className={`w-4 h-4 text-charcoal-400 transition-transform duration-200 ${
                    expanded ? 'rotate-180 text-camel-700' : ''
                  }`}
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-charcoal-900 text-[13px] sm:text-[13.5px] leading-snug break-words">
              {comp.club}
            </span>
            {eventId && (
              <Link
                to={`/event/${eventId}/`}
                onClick={(e) => e.stopPropagation()}
                className="hidden sm:inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-camel-800 bg-camel-100/80 hover:bg-camel-200 border border-camel-300/80 rounded px-1.5 py-0.2 shrink-0 no-underline"
                title="Перейти к протоколу соревнований на сайте"
              >
                <span>Протокол</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
              </Link>
            )}
          </div>
        </div>

        {/* 3. Статус РКФ, кнопка оповещения и стрелка спойлера (на десктопе) */}
        <div className="hidden sm:flex items-center justify-end gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 min-w-[105px] justify-end">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isApproved
                  ? 'bg-emerald-600 ring-2 ring-emerald-600/20'
                  : isDelayed
                  ? 'bg-rose-600 ring-2 ring-rose-600/20'
                  : 'bg-amber-600 ring-2 ring-amber-600/20'
              }`}
            />
            <span
              className={`text-xs font-semibold tracking-tight ${
                isApproved
                  ? 'text-emerald-900'
                  : isDelayed
                  ? 'text-rose-900 font-bold'
                  : 'text-amber-900'
              }`}
            >
              {statusText}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSubscribed(comp.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isSubscribed
                ? 'bg-amber-100 text-camel-800 border border-camel-400 shadow-2xs'
                : 'text-charcoal-400 hover:text-camel-700 hover:bg-cream-100'
            }`}
            title={isSubscribed ? 'Отписаться от турнира' : 'Отслеживать состязание'}
            aria-label="Отслеживать"
          >
            <Bell className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-camel-600 text-camel-800' : ''}`} />
          </button>
          {hasDetails && (
            <ChevronDown
              className={`w-3.5 h-3.5 text-charcoal-400 transition-transform duration-200 ${
                expanded ? 'rotate-180 text-camel-700' : ''
              }`}
            />
          )}
        </div>
      </div>

      {/* Спойлер со всей дополнительной информацией */}
      {expanded && hasDetails && (
        <div className="px-3.5 sm:px-4 py-2.5 border-t border-old-money-100 bg-cream-50/60 text-[11.5px] text-charcoal-700 space-y-1.5">
          {(comp.rank || comp.discipline) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {comp.rank && (
                <span
                  className={
                    isChampRank
                      ? 'inline-flex items-center rounded-md bg-amber-100 border border-amber-300/80 px-1.5 py-0.5 text-[10.5px] font-mono font-bold text-amber-950'
                      : 'inline-flex items-center rounded-md bg-sand-200/80 border border-old-money-200/70 px-1.5 py-0.5 text-[10.5px] font-mono font-bold text-charcoal-700'
                  }
                >
                  {comp.rank}
                </span>
              )}
              {comp.discipline && (
                <span className="text-[11px] font-mono text-charcoal-500">
                  {comp.discipline}
                </span>
              )}
            </div>
          )}
          {comp.location && (
            <div>
              <span className="font-semibold text-charcoal-800">Место:</span> {comp.location}
            </div>
          )}
          {comp.reglament && (
            <div>
              <span className="font-semibold text-charcoal-800">Регламент:</span> {comp.reglament}
            </div>
          )}
          {comp.judges && (
            <div>
              <span className="font-semibold text-charcoal-800">Судьи:</span> {comp.judges}
            </div>
          )}
          {comp.summary && (
            <div>
              <span className="font-semibold text-charcoal-800">Сводка:</span> {comp.summary}
            </div>
          )}
          {comp.decision && (
            <div>
              <span className="font-semibold text-charcoal-800">Решение комиссии:</span> {comp.decision}
            </div>
          )}
          {comp.notes && (
            <div>
              <span className="font-semibold text-charcoal-800">Примечание:</span> {comp.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
