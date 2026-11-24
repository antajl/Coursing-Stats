import { Link } from 'react-router-dom';
import { Bell, ExternalLink } from 'lucide-react';
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
  const isApproved = comp.status === 'APPROVED';
  const isDelayed = comp.status === 'DELAYED';

  const statusText = isApproved
    ? 'Утверждено'
    : isDelayed
    ? 'Задержано'
    : 'На согласовании';

  const { dayLine, monthLine } = formatDateParts(comp.dateRaw);
  const isChampRank = comp.rank.includes('ЧРКФ') || comp.rank.includes('ЧР');
  const eventId = comp.eventId || getCompetitionEventId(comp.id);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[3.8rem_minmax(0,1fr)_13rem_11rem] items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 min-h-[44px] hover:bg-cream-100/50 transition-colors text-xs">
      {/* 1. Календарный блок даты */}
      <div className="flex flex-col items-center justify-center rounded-lg bg-cream-50/90 border border-old-money-200/80 px-1 py-0.5 w-[3.2rem] sm:w-[3.8rem] shrink-0 text-center shadow-2xs gap-0.5">
        <span className="text-sm sm:text-[14.5px] font-bold text-charcoal-900 tabular-nums leading-none tracking-tight">
          {dayLine}
        </span>
        <span className="text-[9.5px] font-semibold text-charcoal-500 uppercase tracking-wider leading-none">
          {monthLine}
        </span>
      </div>

      {/* 2. Клуб, Ранг и Регламент */}
      <div className="min-w-0 pr-1 sm:pr-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {eventId ? (
            <Link
              to={`/event/${eventId}/`}
              className="group/link inline-flex items-center gap-1.5 hover:text-camel-800 transition-colors"
              title="Перейти к протоколу соревнований на сайте"
            >
              <span className="font-semibold text-charcoal-900 group-hover/link:text-camel-800 group-hover/link:underline text-[13px] sm:text-[13.5px] leading-snug">
                {comp.club}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-camel-800 bg-camel-100/80 hover:bg-camel-200 border border-camel-300/80 rounded px-1.5 py-0.2 shrink-0">
                <span>Протокол</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
              </span>
            </Link>
          ) : (
            <span className="font-semibold text-charcoal-900 text-[13px] sm:text-[13.5px] leading-snug">
              {comp.club}
            </span>
          )}
          {comp.rank && (
            <span
              className={
                isChampRank
                  ? 'inline-flex items-center rounded-md bg-amber-100 border border-amber-300/80 px-1.5 py-0.5 text-[10.5px] font-mono font-bold text-amber-950 shrink-0'
                  : 'inline-flex items-center rounded-md bg-sand-200/80 border border-old-money-200/70 px-1.5 py-0.5 text-[10.5px] font-mono font-bold text-charcoal-700 shrink-0'
              }
            >
              {comp.rank}
            </span>
          )}
        </div>

        {/* На мобильных (< sm) город выводится под клубом */}
        <div className="sm:hidden text-xs text-charcoal-600 mt-0.5 truncate">
          {comp.location}
        </div>

        {comp.reglament && (
          <div className="text-xs text-charcoal-500 mt-0.5 truncate">
            Регламент: <span className="text-charcoal-700 font-medium">{comp.reglament}</span>
          </div>
        )}
      </div>

      {/* 3. Город и дисциплина (на десктопе в отдельной колонке) */}
      <div className="hidden sm:flex flex-col justify-center min-w-0 pr-2">
        <span className="text-[12px] font-medium text-charcoal-800 truncate" title={comp.location}>
          {comp.location || '—'}
        </span>
        <span className="text-xs font-mono text-charcoal-500 truncate">
          {comp.discipline}
        </span>
      </div>

      {/* 4. Статус РКФ и кнопка подписки (согласованный статус-индикатор Old Money) */}
      <div className="flex items-center justify-end gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-[95px] sm:min-w-[105px] justify-end">
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
          onClick={() => onToggleSubscribed(comp.id)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isSubscribed
              ? 'bg-amber-100 text-camel-800 border border-camel-400 shadow-2xs'
              : 'text-charcoal-400 hover:text-camel-700 hover:bg-cream-100'
          }`}
          title={isSubscribed ? 'Отписаться от турнира' : 'Отслеживать состязание'}
          aria-label="Отслеживать"
        >
          <Bell className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-camel-600 text-camel-800' : ''}`} />
        </button>
      </div>
    </div>
  );
}
