import { Check, ExternalLink, ChevronDown, Clock } from 'lucide-react';
import type { TrackerApplication } from './trackerTypes';
import { getRkfApplicationUrl } from './trackerData';
import { toDogTitleCase } from '../../lib/dogName';

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
      /(?<![а-яёА-ЯЁa-zA-Z0-9])(россии|ркф|чркф|гчркф|нч рк|нч|чр|саст|cacl|cacit|ючр|вчр|рк)(?![а-яёА-ЯЁa-zA-Z0-9])/gi,
      (m) => (m.toLowerCase() === 'россии' ? 'России' : m.toUpperCase())
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

  const docTitle = formatDocumentTitle(app.documentName);

  return (
    <div
      className={`transition-colors ${
        isCollected ? 'opacity-55 saturate-50 bg-sand-50/30' : 'hover:bg-cream-100/50'
      }`}
    >
      <div
        onClick={onToggleAccordion}
        className="grid grid-cols-[36px_minmax(0,1fr)_auto] sm:grid-cols-[36px_16rem_minmax(0,1fr)_auto_20px] items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 min-h-[52px] cursor-pointer select-none text-xs"
      >
        {/* 1. Чекбокс «Забрано» (44px touch target, доступен только после изготовления) */}
        <div className="w-9 h-9 flex items-center justify-center shrink-0">
          {isReady ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleReceived(app.barcode);
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer group/chk`}
              title={isCollected ? 'Отметить как неполученный' : 'Отметить как забранный'}
              aria-label={isCollected ? 'Отметить как неполученный' : 'Отметить как забранный'}
            >
              <span
                className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-all ${
                  isCollected
                    ? 'bg-emerald-700 border-emerald-700 text-white shadow-2xs'
                    : 'border-old-money-400 group-hover/chk:border-camel-600 bg-white shadow-2xs'
                }`}
              >
                {isCollected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </span>
            </button>
          ) : (
            <span
              className="w-1.5 h-1.5 rounded-full bg-sand-300/90"
              title="Отметка «Забрано» доступна после изготовления документа"
            />
          )}
        </div>

        {/* 2. Кличка собаки, номер РКФ и (на мобильном) название документа */}
        <div className="min-w-0 pr-1 sm:pr-2">
          <div className="font-semibold text-charcoal-900 text-[13.5px] leading-tight truncate sm:whitespace-normal">
            {app.dogName ? toDogTitleCase(app.dogName) : 'Собака не указана'}
          </div>
          <div className="sm:hidden text-[12px] text-charcoal-700 font-medium leading-snug mt-0.5 line-clamp-2">
            {docTitle}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] sm:text-xs text-charcoal-500 font-medium mt-0.5">
            <span>{app.pedigreeNumber ? `РКФ ${app.pedigreeNumber}` : 'Без номера'}</span>
            <a
              href={getRkfApplicationUrl(app.barcode)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="sm:hidden inline-flex items-center gap-0.5 text-camel-800 hover:underline"
              title="Открыть заявку в личном кабинете РКФ Онлайн"
            >
              <span>№ {app.barcode}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* 3. Название документа и ссылка на штрихкод */}
        <div className="hidden sm:block min-w-0 pr-2">
          <div className="text-charcoal-800 font-medium text-[13px] leading-tight">
            {docTitle}
          </div>
          <a
            href={getRkfApplicationUrl(app.barcode)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-mono text-xs text-charcoal-700 hover:text-camel-800 font-medium hover:underline mt-0.5"
            title="Открыть заявку в личном кабинете РКФ Онлайн"
          >
            <span>№ {app.barcode}</span>
            <ExternalLink className="w-3 h-3 text-camel-700 opacity-80" />
          </a>
        </div>

        {/* 4. Статус заявки и дата (чистая типографика со статусным индикатором) */}
        <div className="flex flex-col items-end justify-center shrink-0 text-right">
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isReady
                  ? 'bg-emerald-600 ring-2 ring-emerald-600/20'
                  : isRejected
                  ? 'bg-rose-600 ring-2 ring-rose-600/20'
                  : 'bg-amber-600 ring-2 ring-amber-600/20'
              }`}
            />
            <span
              className={`text-xs font-semibold tracking-tight whitespace-nowrap ${
                isReady
                  ? 'text-emerald-900'
                  : isRejected
                  ? 'text-rose-900 font-bold'
                  : 'text-amber-900'
              }`}
            >
              {app.currentStatus}
            </span>
          </div>
          <span className="font-mono text-xs text-charcoal-600 font-medium mt-0.5 whitespace-nowrap">
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
