import { Check, ExternalLink, ChevronDown, Clock } from 'lucide-react';
import type { TrackerApplication } from './trackerTypes';

interface TrackerApplicationRowProps {
  app: TrackerApplication;
  isCollected: boolean;
  isOpen: boolean;
  onToggleReceived: (barcode: string) => void;
  onToggleAccordion: () => void;
  formatDate: (iso: string) => string;
}

export function TrackerApplicationRow({
  app,
  isCollected,
  isOpen,
  onToggleReceived,
  onToggleAccordion,
  formatDate,
}: TrackerApplicationRowProps) {
  const isReady = app.statusGroup === 'ready';
  const isRejected = app.statusGroup === 'rejected';
  const badgeCls = isReady
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
    : isRejected
    ? 'bg-rose-50 text-rose-800 border-rose-200/80'
    : 'bg-amber-50 text-amber-800 border-amber-200/80';

  return (
    <div
      className={`transition-colors ${
        isCollected ? 'opacity-55 saturate-50 bg-sand-50/30' : 'hover:bg-sand-50/50'
      }`}
    >
      <div
        onClick={onToggleAccordion}
        className="grid grid-cols-[28px_1fr_auto_auto] sm:grid-cols-[28px_240px_1fr_160px_32px] items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[46px] cursor-pointer select-none text-xs"
      >
        {/* Checkbox Received */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleReceived(app.barcode);
          }}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            isCollected
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-old-money-300 hover:border-camel-600 bg-white'
          }`}
          title={isCollected ? 'Отметить как неполученный' : 'Отметить как забранный'}
        >
          {isCollected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Dog Name & Pedigree */}
        <div className="min-w-0">
          <div className="font-semibold text-charcoal-900 truncate text-[12.5px] sm:text-xs">
            {app.dogName}
          </div>
          <div className="font-mono text-[10.5px] text-charcoal-500">
            {app.pedigreeNumber ? `РКФ ${app.pedigreeNumber}` : 'Без номера'}
          </div>
        </div>

        {/* Document Title & Barcode link */}
        <div className="hidden sm:block min-w-0">
          <div className="text-charcoal-800 truncate font-medium text-xs">
            {app.documentName}
          </div>
          <a
            href={`https://rkf.online/barcode/${app.barcode}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] text-camel-800 hover:underline"
          >
            <span>№ {app.barcode}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col sm:items-end">
          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${badgeCls}`}>
            {app.currentStatus}
          </span>
          <span className="text-[10px] text-charcoal-400 mt-0.5">
            {formatDate(app.lastUpdated)}
          </span>
        </div>

        {/* Chevron Accordion Toggle */}
        <div className="hidden sm:flex items-center justify-center text-charcoal-400">
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-camel-700' : ''
            }`}
          />
        </div>
      </div>

      {/* Expanded Timeline Accordion */}
      {isOpen && (
        <div className="px-4 pb-3 pt-1 border-t border-old-money-100/60 bg-sand-50/40">
          <div className="text-[11px] font-semibold text-charcoal-500 mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Хронология обработки заявки в РКФ</span>
          </div>
          <div className="space-y-1.5 pl-2 border-l-2 border-camel-300">
            {app.history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-[11.5px]">
                <span className="font-mono text-charcoal-400 text-[10.5px] w-20 shrink-0">
                  {formatDate(h.date)}
                </span>
                <span className="text-charcoal-800 font-medium">{h.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
