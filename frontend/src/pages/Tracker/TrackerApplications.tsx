import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { TrackerApplication, ApplicationFilter } from './trackerTypes';
import { TrackerApplicationRow } from './TrackerApplicationRow';

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
    <div className="space-y-4">
      {/* 1. Monolithic Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="cs-glass-card p-3 sm:p-3.5 rounded-2xl border border-old-money-200/80 bg-white/95">
          <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">Всего заявок</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-charcoal-900 mt-0.5">{totalCount}</div>
        </div>
        <div className="cs-glass-card p-3 sm:p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/40">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">В обработке</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-900 mt-0.5">{activeCount}</div>
        </div>
        <div className="cs-glass-card p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/40">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">К получению</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-900 mt-0.5">{readyCount}</div>
        </div>
        <div className="cs-glass-card p-3 sm:p-3.5 rounded-2xl border border-old-money-200/80 bg-white/95">
          <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">Забрано</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-charcoal-800 mt-0.5">{collectedCount}</div>
        </div>
      </div>

      {/* 2. Filter Pills + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all' ? 'cs-glass-pill-active' : 'cs-glass-pill'
            }`}
          >
            Все ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'active' ? 'cs-glass-pill-active' : 'cs-glass-pill'
            }`}
          >
            В обработке ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('to_pickup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'to_pickup' ? 'cs-glass-pill-active' : 'cs-glass-pill'
            }`}
          >
            К получению ({readyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('collected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'collected' ? 'cs-glass-pill-active' : 'cs-glass-pill'
            }`}
          >
            Забрано ({collectedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по кличке, номеру, треку..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-old-money-200/90 bg-white/95 text-charcoal-900 focus:border-camel-600 focus:ring-1 focus:ring-camel-600 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 3. Monolithic Glass Table */}
      <div className="cs-glass-card bg-white/95 rounded-2xl overflow-hidden shadow-sm border border-old-money-200/80">
        {filteredApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-500">
            Заявок по выбранным параметрам не найдено
          </div>
        ) : (
          <div className="divide-y divide-old-money-100/70">
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
