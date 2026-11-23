import { useState, useMemo } from 'react';
import type { TrackerApplication, ApplicationFilter } from './trackerTypes';
import { TrackerApplicationRow } from './TrackerApplicationRow';
import ToolbarSearch from '../../components/toolbar/ToolbarSearch';

interface TrackerApplicationsProps {
  applications: TrackerApplication[];
  onToggleReceived: (barcode: string) => void;
  receivedSet: Set<string>;
}

export function TrackerApplications({
  applications,
  onToggleReceived,
  receivedSet,
}: TrackerApplicationsProps) {
  const [filter, setFilter] = useState<ApplicationFilter>('all');
  const [query, setQuery] = useState('');
  const [expandedBarcode, setExpandedBarcode] = useState<string | null>(null);

  const totalCount = applications.length;
  const activeCount = useMemo(
    () => applications.filter((a) => a.statusGroup === 'active').length,
    [applications]
  );
  const readyCount = useMemo(
    () => applications.filter((a) => a.statusGroup === 'ready' && !receivedSet.has(a.barcode)).length,
    [applications, receivedSet]
  );
  const collectedCount = useMemo(
    () => applications.filter((a) => a.statusGroup === 'ready' && receivedSet.has(a.barcode)).length,
    [applications, receivedSet]
  );

  const filteredApps = useMemo(() => {
    const q = query.toLowerCase().trim();
    return applications.filter((app) => {
      const isCollected = receivedSet.has(app.barcode);
      let matchFilter = true;
      if (filter === 'active') matchFilter = app.statusGroup === 'active';
      else if (filter === 'to_pickup') matchFilter = app.statusGroup === 'ready' && !isCollected;
      else if (filter === 'collected') matchFilter = app.statusGroup === 'ready' && isCollected;

      if (!matchFilter) return false;
      if (!q) return true;

      return (
        app.dogName.toLowerCase().includes(q) ||
        app.documentName.toLowerCase().includes(q) ||
        app.barcode.includes(q) ||
        (app.pedigreeNumber && app.pedigreeNumber.includes(q))
      );
    });
  }, [applications, filter, query, receivedSet]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Unified Single-Row Toolbar (Matching ShowCalendarToolbar & EventsToolbar) */}
      <div className="flex items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Поиск по кличке собаки, титулу или номеру заявки..."
          width="280px"
        />

        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filter === 'all' ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
        >
          Все ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filter === 'active' ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
        >
          В обработке ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('to_pickup')}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filter === 'to_pickup' ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
        >
          Готовы к выдаче ({readyCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('collected')}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filter === 'collected' ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
        >
          Забрано ({collectedCount})
        </button>
      </div>

      {/* 2. Monolithic Table Card */}
      <div className="cs-glass-card bg-white rounded-2xl overflow-hidden">
        {/* Table Header Bar (matching ShowCalendarMonthList header) */}
        <div className="relative flex min-h-10 items-center justify-between gap-1.5 border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3 sm:px-4 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-charcoal-700">
              Реестр заявок РКФ Онлайн
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-sand-200/80 text-charcoal-700">
              {filteredApps.length}
            </span>
          </div>
          <span className="text-[11px] text-charcoal-500 font-medium hidden sm:inline">
            Кликните по строке для просмотра истории
          </span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-500">
            Заявок по выбранным параметрам не найдено
          </div>
        ) : (
          <div className="divide-y divide-sand-200/60">
            {filteredApps.map((app) => (
              <TrackerApplicationRow
                key={app.barcode}
                app={app}
                isCollected={receivedSet.has(app.barcode)}
                isOpen={expandedBarcode === app.barcode}
                onToggleReceived={onToggleReceived}
                onToggleAccordion={() =>
                  setExpandedBarcode(expandedBarcode === app.barcode ? null : app.barcode)
                }
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
