import { Bell } from 'lucide-react';
import type { TrackerCompetition } from './trackerTypes';
import { formatDateParts } from './trackerCompetitionUtils';

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
  const statusBadgeCls = isApproved
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
    : isDelayed
    ? 'bg-rose-50 text-rose-800 border-rose-300/80 font-bold'
    : 'bg-amber-50 text-amber-800 border-amber-200/90';

  const statusText = isApproved
    ? 'Утверждено'
    : isDelayed
    ? 'Задержано'
    : 'На согласовании';

  const { dayLine, monthLine } = formatDateParts(comp.dateRaw);
  const isChampRank = comp.rank.includes('ЧРКФ') || comp.rank.includes('ЧР');

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[4.2rem_minmax(0,1fr)_13rem_10.5rem] items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-2.5 min-h-[52px] hover:bg-cream-100/50 transition-colors text-xs">
      {/* 1. Календарный блок даты */}
      <div className="flex flex-col items-center justify-center rounded-lg bg-cream-50/90 border border-old-money-200/80 px-1 py-1 w-[3.5rem] sm:w-[4.2rem] shrink-0 text-center shadow-2xs gap-0.5">
        <span className="text-sm sm:text-[15px] font-bold text-charcoal-900 tabular-nums leading-none tracking-tight">
          {dayLine}
        </span>
        <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider leading-none">
          {monthLine}
        </span>
      </div>

      {/* 2. Клуб, Ранг и Регламент */}
      <div className="min-w-0 pr-1 sm:pr-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-semibold text-charcoal-900 text-[13px] sm:text-[13.5px] leading-snug">
            {comp.club}
          </span>
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
        <div className="sm:hidden text-[11px] text-charcoal-600 mt-0.5 truncate">
          {comp.location}
        </div>

        {comp.reglament && (
          <div className="text-[11px] text-charcoal-500 mt-0.5 truncate">
            Регламент: <span className="text-charcoal-700 font-medium">{comp.reglament}</span>
          </div>
        )}
      </div>

      {/* 3. Город и дисциплина (на десктопе в отдельной колонке) */}
      <div className="hidden sm:flex flex-col justify-center min-w-0 pr-2">
        <span className="text-[12px] font-medium text-charcoal-800 truncate" title={comp.location}>
          {comp.location || '—'}
        </span>
        <span className="text-[10.5px] font-mono text-charcoal-400 truncate">
          {comp.discipline}
        </span>
      </div>

      {/* 4. Статус РКФ и кнопка подписки */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        <span
          className={`inline-flex items-center justify-center w-[98px] sm:w-[108px] py-1 rounded-full border text-[11px] font-semibold tracking-wide whitespace-nowrap text-center ${statusBadgeCls}`}
        >
          {statusText}
        </span>
        <button
          type="button"
          onClick={() => onToggleSubscribed(comp.id)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isSubscribed
              ? 'bg-amber-100/90 text-camel-800 border border-camel-400 shadow-2xs'
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
