import { Bell } from 'lucide-react';
import type { TrackerCompetition } from './trackerTypes';

interface TrackerCompetitionRowProps {
  comp: TrackerCompetition;
  isSubscribed: boolean;
  onToggleSubscribed: (id: string) => void;
  formatShortDate: (raw: string) => string;
}

export function TrackerCompetitionRow({
  comp,
  isSubscribed,
  onToggleSubscribed,
  formatShortDate,
}: TrackerCompetitionRowProps) {
  const isApproved = comp.status === 'APPROVED';
  const isDelayed = comp.status === 'DELAYED';
  const statusBadgeCls = isApproved
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
    : isDelayed
    ? 'bg-rose-50 text-rose-800 border-rose-200/90'
    : 'bg-amber-50 text-amber-800 border-amber-200/90';

  const statusText = isApproved
    ? 'Утверждено'
    : isDelayed
    ? 'Задержано'
    : 'На согласовании';

  const shortDate = formatShortDate(comp.dateRaw);

  return (
    <div className="grid grid-cols-[72px_1fr_auto_36px] sm:grid-cols-[84px_1fr_130px_36px] items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 min-h-[44px] hover:bg-sand-50/50 transition-colors text-xs">
      {/* Date Block */}
      <div className="shrink-0">
        <span className="inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-sand-100 text-charcoal-700">
          {shortDate}
        </span>
      </div>

      {/* Club, Rank & Location */}
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-charcoal-900 truncate text-[12.5px]">
            {comp.club}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sand-200/80 text-charcoal-700 shrink-0">
            {comp.rank}
          </span>
        </div>
        <div className="text-[11px] text-charcoal-500 truncate">
          {comp.location}
          {comp.reglament && <span className="hidden sm:inline"> • {comp.reglament}</span>}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-end">
        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold whitespace-nowrap ${statusBadgeCls}`}>
          {statusText}
        </span>
      </div>

      {/* Subscribe Bell Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onToggleSubscribed(comp.id)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            isSubscribed
              ? 'bg-amber-50 text-camel-800 border border-camel-300'
              : 'text-charcoal-400 hover:text-camel-700 hover:bg-sand-100/60'
          }`}
          title={isSubscribed ? 'Отписаться от турнира' : 'Отслеживать состязание'}
          aria-label="Отслеживать"
        >
          <Bell
            className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-camel-600 text-camel-800' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}
