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

function formatDocumentTitle(title: string): string {
  if (!title) return '';
  const upperCount = (title.match(/[А-ЯЁ]/g) || []).length;
  const lowerCount = (title.match(/[а-яё]/g) || []).length;
  if (upperCount > 5 && lowerCount === 0) {
    const lowered = title.toLowerCase();
    const capitalized = lowered.charAt(0).toUpperCase() + lowered.slice(1);
    return capitalized.replace(
      /\b(ркф|чркф|гчркф|чр|саст|cacl|cacit|ючр|вчр|по рк)\b/gi,
      (m) => m.toUpperCase()
    );
  }
  return title;
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
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
    : isRejected
    ? 'bg-rose-50 text-rose-800 border-rose-300/80 font-bold'
    : 'bg-amber-50 text-amber-800 border-amber-200/90';

  const docTitle = formatDocumentTitle(app.documentName);

  return (
    <div
      className={`transition-colors ${
        isCollected ? 'opacity-55 saturate-50 bg-sand-50/30' : 'hover:bg-cream-100/50'
      }`}
    >
      <div
        onClick={onToggleAccordion}
        className="grid grid-cols-[24px_minmax(0,1fr)_auto] sm:grid-cols-[24px_minmax(220px,1.2fr)_minmax(260px,1.5fr)_130px_28px] items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-2.5 min-h-[50px] cursor-pointer select-none text-xs"
      >
        {/* 1. Чекбокс «Забрано» */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleReceived(app.barcode);
          }}
          className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isCollected
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
              : 'border-old-money-300 hover:border-camel-600 bg-white'
          }`}
          title={isCollected ? 'Отметить как неполученный' : 'Отметить как забранный'}
        >
          {isCollected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* 2. Кличка собаки и номер РКФ */}
        <div className="min-w-0 pr-1 sm:pr-2">
          <div className="font-semibold text-charcoal-900 text-[13px] sm:text-[13.5px] leading-snug">
            {app.dogName}
          </div>
          <div className="font-mono text-[11px] text-charcoal-500 mt-0.5">
            {app.pedigreeNumber ? `РКФ ${app.pedigreeNumber}` : 'Без номера'}
          </div>
        </div>

        {/* 3. Название документа и ссылка на штрихкод */}
        <div className="hidden sm:block min-w-0 pr-2">
          <div className="text-charcoal-800 font-medium text-xs leading-snug">
            {docTitle}
          </div>
          <a
            href={`https://rkf.online/barcode/${app.barcode}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-camel-800 hover:underline mt-0.5"
          >
            <span>№ {app.barcode}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        </div>

        {/* 4. Статус заявки и дата */}
        <div className="flex flex-col items-end shrink-0">
          <span
            className={`inline-flex items-center justify-center w-[116px] sm:w-[124px] py-1 rounded-full border text-[11px] font-semibold tracking-wide whitespace-nowrap text-center ${badgeCls}`}
          >
            {app.currentStatus}
          </span>
          <span className="text-[10px] font-mono text-charcoal-400 mt-1">
            {formatDate(app.lastUpdated)}
          </span>
        </div>

        {/* 5. Стрелка аккордеона */}
        <div className="hidden sm:flex items-center justify-center text-charcoal-400">
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-camel-700' : ''
            }`}
          />
        </div>
      </div>

      {/* Выпадающая история заявки */}
      {isOpen && (
        <div className="px-4 py-3 border-t border-old-money-100 bg-cream-50/60">
          <div className="text-[11px] font-semibold text-charcoal-500 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-camel-700" />
            <span>Хронология обработки заявки в РКФ</span>
          </div>
          <div className="space-y-1.5 pl-2.5 border-l-2 border-camel-400">
            {app.history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-[11.5px]">
                <span className="font-mono text-charcoal-500 text-[11px] w-20 shrink-0">
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
